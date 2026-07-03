// Certification périodique — types partagés et règles de calcul de période
// Cadre : ordonnance n° 2021-961 du 19 juillet 2021 (art. L.4022-1 CSP et suivants)

export const CERTIF_BLOC_CODES = ["COGNITIF", "QUALITE", "RELATION", "SANTE"] as const;
export type CertifBlocCode = (typeof CERTIF_BLOC_CODES)[number];

export type CertifBloc = {
  code: string;
  ordre: number;
  titre: string;
  description: string;
  emoji: string;
  couleur: string;
  actionsRequises: number;
  exemples: string[];
  justificatifs: string[];
  actions: CertifActionRef[];
};

export type CertifActionRef = {
  id: string;
  blocCode: string;
  specialite: string | null;
  titre: string;
  description: string | null;
  typeJustificatif: string | null;
};

export type CertifJustificatif = {
  id: string;
  blocCode: string;
  actionTitre: string;
  typeDocument: string | null;
  fichierNom: string | null;
  hasFichier: boolean;
  url: string | null;
  source: string; // "UPLOAD" | "PLATEFORME"
  formationId: string | null;
  dateAction: string | null;
  createdAt: string;
};

export type CertifPeriode = {
  debut: number;
  fin: number;
  dureeAnnees: number;
  premierePeriodeTransitoire: boolean; // médecins déjà en exercice au 01/01/2023
};

/**
 * Calcule la période de certification en cours.
 * - Professionnels en exercice avant le 01/01/2023 : première période
 *   transitoire de 9 ans → 2023-2031 (art. 3 de l'ordonnance).
 * - Entrée en exercice à partir de 2023 : période de 6 ans à compter
 *   de l'année de validation du DES.
 */
export function calculerPeriode(anneeDES: number): CertifPeriode {
  if (anneeDES < 2023) {
    return { debut: 2023, fin: 2032, dureeAnnees: 9, premierePeriodeTransitoire: true };
  }
  return { debut: anneeDES, fin: anneeDES + 6, dureeAnnees: 6, premierePeriodeTransitoire: false };
}

/** Progression 0..1 dans la période en cours. */
export function progressionPeriode(periode: CertifPeriode, now = new Date()): number {
  const debut = new Date(periode.debut, 0, 1).getTime();
  const fin = new Date(periode.fin, 0, 1).getTime();
  return Math.min(1, Math.max(0, (now.getTime() - debut) / (fin - debut)));
}
