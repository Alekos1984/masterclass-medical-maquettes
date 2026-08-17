// Génère le message-type de proposition de créneau envoyé aux enseignants —
// utilisé à la fois par le bouton "Proposer" (un enseignant) et par l'export en masse.

export type PropositionCreneau = { titre: string; dateStr: string; heureDebut: string; heureFin: string };

export function genererMessagePropositionCreneau(params: {
  enseignantNomCivilite: string;
  cursusTitre: string;
  cursusAnnee: string | null;
  coordinateurNom: string;
  creneaux: PropositionCreneau[];
}): string {
  const { enseignantNomCivilite, cursusTitre, cursusAnnee, coordinateurNom, creneaux } = params;
  const anneeTxt = cursusAnnee ? ` pour la session ${cursusAnnee}` : "";
  const ligneCreneau = (c: PropositionCreneau) => `${c.titre} — le ${c.dateStr} à ${c.heureDebut}–${c.heureFin}`;
  const corpsCours = creneaux.length === 1
    ? `Accepteriez-vous de faire le cours « ${creneaux[0].titre} » le ${creneaux[0].dateStr} à ${creneaux[0].heureDebut}–${creneaux[0].heureFin} ?`
    : `Accepteriez-vous de faire les cours suivants ?\n${creneaux.map((c) => `- ${ligneCreneau(c)}`).join("\n")}`;
  return [
    `Cher·ère ${enseignantNomCivilite},`,
    ``,
    `J'espère que vous allez bien,`,
    ``,
    `Le DU ${cursusTitre} redémarre${anneeTxt} et nous serions honorés si vous pouviez y participer de nouveau.`,
    ``,
    corpsCours,
    ``,
    `Un immense merci par avance,`,
    ``,
    `Bien à vous,`,
    coordinateurNom,
  ].join("\n");
}
