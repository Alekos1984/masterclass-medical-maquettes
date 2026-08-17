import { getOpenAI } from "./openai";

export type JourneeProposee = {
  date: string; // "YYYY-MM-DD"
  heureDebut: string; // "09:00"
  heureFin: string; // "18:00"
  modaliteSession: "PRESENTIEL" | "VIRTUEL" | "MIXTE";
  commentaire: string; // ex : "Jeudi fin de mois, hors vacances zone C"
  slots: { heureDebut: string; heureFin: string; titre: string; type: string }[];
};

// ─── Garde-fou jour de semaine ────────────────────────────────────────────────
// Les LLM calculent parfois mal le jour de la semaine d'une date future (ex : ils
// visent "jeudi" mais proposent en réalité un vendredi ou un samedi). On demande
// donc au modèle d'annoncer explicitement le jour de semaine visé pour chaque date,
// puis on vérifie nous-mêmes en code : si ça ne correspond pas, on cherche une date
// très proche (± 2 jours) qui, elle, tombe bien sur ce jour-là ; sinon on écarte la
// proposition plutôt que de laisser passer une date fausse.

const JOURS_FR = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

function jourSemaineDe(dateStr: string): string {
  return JOURS_FR[new Date(`${dateStr}T12:00:00Z`).getUTCDay()];
}

function normaliserJour(s: string): string {
  return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function decalerDate(dateStr: string, jours: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + jours);
  return d.toISOString().slice(0, 10);
}

/**
 * Si le jour de semaine annoncé par le modèle ("jourSemaine") ne correspond pas à la
 * date proposée, cherche une date à ±1/±2 jours qui corresponde, en évitant les dates
 * déjà utilisées. Retourne null si aucune correction fiable n'est trouvée (la
 * proposition est alors écartée par l'appelant).
 */
function corrigerDateSelonJourAnnonce(date: string, jourAnnonce: string | undefined, datesExclues: Set<string>): string | null {
  if (!jourAnnonce) return date; // pas d'annonce à vérifier, on fait confiance à la date
  const attendu = normaliserJour(jourAnnonce);
  if (!JOURS_FR.some((j) => j === attendu)) return date; // annonce non reconnue, on ignore le garde-fou
  if (normaliserJour(jourSemaineDe(date)) === attendu) return date; // cohérent, rien à faire

  for (const decalage of [-1, 1, -2, 2]) {
    const candidate = decalerDate(date, decalage);
    if (datesExclues.has(candidate)) continue;
    if (normaliserJour(jourSemaineDe(candidate)) === attendu) return candidate;
  }
  return null; // aucune date proche ne correspond au jour annoncé — proposition écartée
}

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
- Chaque journée : "date" (YYYY-MM-DD), "jourSemaine" (le jour de la semaine visé, en toutes lettres et en minuscules, ex "jeudi" — CALCULE-le toi-même à partir de "date" et vérifie que les deux sont cohérents avant de répondre, c'est un point sur lequel tu te trompes souvent), "heureDebut", "heureFin" (HH:MM), "modaliteSession" ("PRESENTIEL" par défaut, sauf indication contraire), "commentaire" court (jour de semaine + justification du choix).
- Si une pause est demandée (ex : 13h-14h), découpe chaque journée en "slots" : bloc matin (type "cours", titre "Session du matin — à compléter"), pause (type "pause", titre "Pause déjeuner"), bloc après-midi (type "cours", titre "Session de l'après-midi — à compléter"). Sinon, un seul slot couvrant la journée.
- Ne propose JAMAIS une date déjà utilisée : ${contexte.datesExistantes.length > 0 ? contexte.datesExistantes.join(", ") : "aucune"}.
- Maximum 30 journées.
Retourne UNIQUEMENT un JSON : { "journees": [{ "date": "...", "jourSemaine": "...", "heureDebut": "...", "heureFin": "...", "modaliteSession": "...", "commentaire": "...", "slots": [...] }] }`,
      },
      {
        role: "user",
        content: `Cursus : "${contexte.cursusTitre}"
Consigne : ${consigne}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as { journees?: (JourneeProposee & { jourSemaine?: string })[] };
  const existantes = new Set(contexte.datesExistantes);
  const aujourd = new Date().toISOString().slice(0, 10);

  const resultat: JourneeProposee[] = [];
  for (const j of (parsed.journees ?? []).slice(0, 30)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(j.date)) continue;

    const dateCorrigee = corrigerDateSelonJourAnnonce(j.date, j.jourSemaine, existantes);
    if (dateCorrigee === null) continue; // jour de semaine annoncé incohérent, aucune date proche ne convient
    if (dateCorrigee <= aujourd || existantes.has(dateCorrigee)) continue;

    existantes.add(dateCorrigee); // évite qu'une autre proposition du même lot retombe sur cette date
    resultat.push({
      date: dateCorrigee,
      heureDebut: j.heureDebut || "09:00",
      heureFin: j.heureFin || "17:00",
      modaliteSession: ["PRESENTIEL", "VIRTUEL", "MIXTE"].includes(j.modaliteSession) ? j.modaliteSession : "PRESENTIEL",
      commentaire: dateCorrigee !== j.date ? `${j.commentaire ?? ""} (date corrigée automatiquement)`.trim() : j.commentaire ?? "",
      slots: Array.isArray(j.slots) ? j.slots : [],
    });
  }
  return resultat;
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
- Renseigne "date" (YYYY-MM-DD) et "journeeExistante": null.
- Renseigne aussi "jourSemaine" (le jour de la semaine visé, en toutes lettres et en minuscules, ex "jeudi") — CALCULE-le toi-même à partir de "date" et vérifie la cohérence entre les deux avant de répondre, c'est un point sur lequel tu te trompes souvent.`}

INTERVENANTS :
- Recopie le nom de l'intervenant de chaque créneau dans "intervenant" (null si absent ou si pause).
- Équipe pédagogique actuelle pour référence : ${contexte.enseignants.join(", ") || "aucune"}.

Retourne UNIQUEMENT un JSON :
{ "journees": [{ "journeeExistante": 1|null, "date": "YYYY-MM-DD"|null, "jourSemaine": "…"|null, "heureDebut": "HH:MM", "heureFin": "HH:MM", "commentaire": "…", "slots": [{ "heureDebut": "HH:MM", "heureFin": "HH:MM", "titre": "…", "type": "…", "intervenant": "…"|null }] }] }`,
      },
      {
        role: "user",
        content: `${consigne ? `Consignes complémentaires : ${consigne}\n\n` : ""}DOCUMENT :\n${texteDoc}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as { journees?: (JourneeDigitalisee & { jourSemaine?: string })[] };
  const aujourd = new Date().toISOString().slice(0, 10);
  const existantes = new Set(contexte.datesExistantes);

  const resultat: JourneeDigitalisee[] = [];
  for (const j of (parsed.journees ?? []).slice(0, 40)) {
    let date: string | null = j.date && /^\d{4}-\d{2}-\d{2}$/.test(j.date) ? j.date : null;
    const journeeExistante = typeof j.journeeExistante === "number" ? j.journeeExistante : null;

    // Le garde-fou jour de semaine ne s'applique qu'aux nouvelles dates proposées
    // (une journée qui remplit un créneau existant garde la date déjà en base).
    if (journeeExistante === null && date) {
      const corrigee = corrigerDateSelonJourAnnonce(date, j.jourSemaine, existantes);
      if (corrigee === null || corrigee <= aujourd) {
        date = null; // date non fiable : mieux vaut la laisser vide (à saisir manuellement) qu'un jour faux
      } else {
        date = corrigee;
        existantes.add(corrigee);
      }
    }

    resultat.push({
      journeeExistante,
      date,
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
    });
  }
  return resultat;
}
