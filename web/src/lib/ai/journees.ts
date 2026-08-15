import { getOpenAI } from "./openai";

export type JourneeProposee = {
  date: string; // "YYYY-MM-DD"
  heureDebut: string; // "09:00"
  heureFin: string; // "18:00"
  modaliteSession: "PRESENTIEL" | "VIRTUEL" | "MIXTE";
  commentaire: string; // ex : "Jeudi fin de mois, hors vacances zone C"
  slots: { heureDebut: string; heureFin: string; titre: string; type: string }[];
};

/**
 * Génère une proposition de calendrier de journées d'enseignement
 * à partir d'une consigne en langage naturel.
 */
export async function genererJournees(
  consigne: string,
  contexte: { cursusTitre: string; datesExistantes: string[] }
): Promise<JourneeProposee[]> {
  const openai = getOpenAI();
  const aujourdhui = new Date().toISOString().slice(0, 10);

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Tu es l'assistant de planification d'un coordinateur d'enseignement universitaire médical (DU/DIU) en France.
Tu génères un calendrier de journées d'enseignement à partir d'une consigne en langage naturel.

RÈGLES :
- Nous sommes le ${aujourdhui}. Toutes les dates proposées doivent être STRICTEMENT futures.
- Respecte scrupuleusement les contraintes : jours de semaine demandés, jours consécutifs ("couples" jeudi+vendredi = même semaine), position dans le mois (début/fin), nombre de journées ou de couples, période de départ, horaires.
- Si la consigne exclut les vacances scolaires, évite les périodes de vacances scolaires françaises de la zone indiquée (zone C = Paris/Créteil/Versailles si "région parisienne"). Utilise le calendrier scolaire officiel français à ta connaissance ; en cas d'incertitude sur une date, choisis une semaine clairement hors vacances et signale l'incertitude dans "commentaire".
- Évite aussi les jours fériés français (1er/11 novembre, 25 décembre, 1er janvier, lundi de Pâques, 1er/8 mai, Ascension, lundi de Pentecôte, 14 juillet, 15 août, 1er novembre).
- Chaque journée : "date" (YYYY-MM-DD), "heureDebut", "heureFin" (HH:MM), "modaliteSession" ("PRESENTIEL" par défaut, sauf indication contraire), "commentaire" court (jour de semaine + justification du choix).
- Si une pause est demandée (ex : 13h-14h), découpe chaque journée en "slots" : bloc matin (type "cours", titre "Session du matin — à compléter"), pause (type "pause", titre "Pause déjeuner"), bloc après-midi (type "cours", titre "Session de l'après-midi — à compléter"). Sinon, un seul slot couvrant la journée.
- Ne propose JAMAIS une date déjà utilisée : ${contexte.datesExistantes.length > 0 ? contexte.datesExistantes.join(", ") : "aucune"}.
- Maximum 30 journées.
Retourne UNIQUEMENT un JSON : { "journees": [{ "date": "...", "heureDebut": "...", "heureFin": "...", "modaliteSession": "...", "commentaire": "...", "slots": [...] }] }`,
      },
      {
        role: "user",
        content: `Cursus : "${contexte.cursusTitre}"
Consigne : ${consigne}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as { journees?: JourneeProposee[] };
  const existantes = new Set(contexte.datesExistantes);
  const aujourd = new Date().toISOString().slice(0, 10);

  return (parsed.journees ?? [])
    .filter((j) => /^\d{4}-\d{2}-\d{2}$/.test(j.date) && j.date > aujourd && !existantes.has(j.date))
    .slice(0, 30)
    .map((j) => ({
      date: j.date,
      heureDebut: j.heureDebut || "09:00",
      heureFin: j.heureFin || "17:00",
      modaliteSession: ["PRESENTIEL", "VIRTUEL", "MIXTE"].includes(j.modaliteSession) ? j.modaliteSession : "PRESENTIEL",
      commentaire: j.commentaire ?? "",
      slots: Array.isArray(j.slots) ? j.slots : [],
    }));
}

// ─── Digitalisation d'un programme existant (PDF/Word/Excel de l'année passée) ─

export type JourneeDigitalisee = {
  journeeExistante: number | null; // index 1-based dans les journées existantes fournies
  date: string | null;
  heureDebut: string;
  heureFin: string;
  commentaire: string;
  slots: { heureDebut: string; heureFin: string; titre: string; type: string; intervenant: string | null }[];
};

export async function digitaliserProgramme(
  texteDoc: string,
  consigne: string,
  contexte: {
    cursusTitre: string;
    annee: string | null;
    journeesExistantes: { index: number; date: string; heureDebut: string; heureFin: string; nbSlots: number }[];
    enseignants: string[];
    datesExistantes: string[];
  }
): Promise<JourneeDigitalisee[]> {
  const openai = getOpenAI();
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const aJournees = contexte.journeesExistantes.length > 0;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Tu es l'assistant d'un coordinateur d'enseignement universitaire médical (DU/DIU) en France.
On te fournit le PROGRAMME D'UNE ANNÉE PRÉCÉDENTE (extrait d'un PDF, Word ou Excel, mise en forme dégradée possible).
Ta mission : le DIGITALISER pour l'édition ${contexte.annee ?? "suivante"} du cursus "${contexte.cursusTitre}".

ANALYSE DU DOCUMENT :
- Repère chaque journée/module d'enseignement et ses créneaux : horaires (début-fin), titre du cours, intervenant (nom de l'enseignant, avec ou sans titre Dr/Pr), pauses.
- Si les horaires d'un créneau sont absents, déduis-les de la durée ou répartis équitablement dans la journée.
- Déduplique les en-têtes/pieds de page répétés.
- Types : "cours" | "atelier" | "cas_clinique" | "evaluation" | "pause" | "autre".

${aJournees
  ? `POSITIONNEMENT — le cursus a DÉJÀ des journées planifiées, tu dois y répartir le contenu :
${contexte.journeesExistantes.map((j) => `  ${j.index}. ${j.date} (${j.heureDebut}-${j.heureFin})${j.nbSlots > 0 ? ` — contient déjà ${j.nbSlots} créneau(x) qui seront REMPLACÉS` : ""}`).join("\n")}
- Associe les journées du document aux journées existantes DANS L'ORDRE CHRONOLOGIQUE (journée 1 du document → journée existante 1, etc.).
- Renseigne "journeeExistante" avec l'index correspondant, "date" à null.
- Adapte les horaires des créneaux à la plage horaire de la journée cible.
- S'il y a PLUS de journées dans le document que de journées existantes, ajoute les surplus avec "journeeExistante": null et une "date" future plausible (même jour de semaine, à la suite).`
  : `POSITIONNEMENT — aucune journée n'est encore planifiée :
- Propose des dates FUTURES (après ${aujourdhui}) en transposant le calendrier du document à l'année ${contexte.annee ?? "suivante"} : mêmes mois, mêmes jours de semaine, hors dates déjà prises (${contexte.datesExistantes.join(", ") || "aucune"}).
- Renseigne "date" (YYYY-MM-DD) et "journeeExistante": null.`}

INTERVENANTS :
- Recopie le nom de l'intervenant de chaque créneau dans "intervenant" (null si absent ou si pause).
- Équipe pédagogique actuelle pour référence : ${contexte.enseignants.join(", ") || "aucune"}.

Retourne UNIQUEMENT un JSON :
{ "journees": [{ "journeeExistante": 1|null, "date": "YYYY-MM-DD"|null, "heureDebut": "HH:MM", "heureFin": "HH:MM", "commentaire": "…", "slots": [{ "heureDebut": "HH:MM", "heureFin": "HH:MM", "titre": "…", "type": "…", "intervenant": "…"|null }] }] }`,
      },
      {
        role: "user",
        content: `${consigne ? `Consignes complémentaires : ${consigne}\n\n` : ""}DOCUMENT :\n${texteDoc}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as { journees?: JourneeDigitalisee[] };
  return (parsed.journees ?? []).slice(0, 40).map((j) => ({
    journeeExistante: typeof j.journeeExistante === "number" ? j.journeeExistante : null,
    date: j.date && /^\d{4}-\d{2}-\d{2}$/.test(j.date) ? j.date : null,
    heureDebut: j.heureDebut || "09:00",
    heureFin: j.heureFin || "17:00",
    commentaire: j.commentaire ?? "",
    slots: (Array.isArray(j.slots) ? j.slots : []).map((s) => ({
      heureDebut: s.heureDebut || "",
      heureFin: s.heureFin || "",
      titre: s.titre || "",
      type: s.type || "cours",
      intervenant: s.intervenant || null,
    })),
  }));
}
