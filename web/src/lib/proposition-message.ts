// Génère le message-type de proposition de créneau envoyé aux enseignants —
// utilisé à la fois par le bouton "Proposer" (un enseignant) et par l'export en masse.

import { detecterGenre, extrairePrenom } from "./genre-prenom";

export type PropositionCreneau = { titre: string; dateStr: string; heureDebut: string; heureFin: string };
export type RegistreMessage = "vouvoiement" | "tutoiement";

function cherChere(genre: "M" | "F" | null): string {
  if (genre === "M") return "Cher";
  if (genre === "F") return "Chère";
  return "Cher·ère";
}

export function genererMessagePropositionCreneau(params: {
  enseignantNom: string; // nom brut ("Prénom NOM"), pour en déduire le prénom/genre
  enseignantNomCivilite: string; // ex : "Dr. Marie Lefèvre" — utilisé en vouvoiement
  cursusTitre: string;
  cursusAnnee: string | null;
  coordinateurNom: string;
  creneaux: PropositionCreneau[];
  registre?: RegistreMessage;
}): string {
  const { enseignantNom, enseignantNomCivilite, cursusTitre, cursusAnnee, coordinateurNom, creneaux, registre = "vouvoiement" } = params;
  const anneeTxt = cursusAnnee ? ` pour la session ${cursusAnnee}` : "";
  const genre = detecterGenre(extrairePrenom(enseignantNom));
  const tutoiement = registre === "tutoiement";

  const salutation = `${cherChere(genre)} ${tutoiement ? extrairePrenom(enseignantNom) : enseignantNomCivilite},`;
  const ligneCreneau = (c: PropositionCreneau) => `${c.titre} — le ${c.dateStr} à ${c.heureDebut}–${c.heureFin}`;

  const corpsCours = tutoiement
    ? creneaux.length === 1
      ? `Accepterais-tu de faire le cours « ${creneaux[0].titre} » le ${creneaux[0].dateStr} à ${creneaux[0].heureDebut}–${creneaux[0].heureFin} ?`
      : `Accepterais-tu de faire les cours suivants ?\n${creneaux.map((c) => `- ${ligneCreneau(c)}`).join("\n")}`
    : creneaux.length === 1
      ? `Accepteriez-vous de faire le cours « ${creneaux[0].titre} » le ${creneaux[0].dateStr} à ${creneaux[0].heureDebut}–${creneaux[0].heureFin} ?`
      : `Accepteriez-vous de faire les cours suivants ?\n${creneaux.map((c) => `- ${ligneCreneau(c)}`).join("\n")}`;

  return [
    salutation,
    ``,
    tutoiement ? `J'espère que tu vas bien,` : `J'espère que vous allez bien,`,
    ``,
    tutoiement
      ? `Le DU ${cursusTitre} redémarre${anneeTxt} et nous serions honorés que tu puisses y participer de nouveau.`
      : `Le DU ${cursusTitre} redémarre${anneeTxt} et nous serions honorés si vous pouviez y participer de nouveau.`,
    ``,
    corpsCours,
    ``,
    `Un immense merci par avance,`,
    ``,
    tutoiement ? `Bien à toi,` : `Bien à vous,`,
    coordinateurNom,
  ].join("\n");
}
