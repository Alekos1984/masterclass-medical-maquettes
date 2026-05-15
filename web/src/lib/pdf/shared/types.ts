export interface CompanyData {
  raisonSociale: string;
  siret?: string | null;
  numeroDeclaration?: string | null;
  adresse?: string | null;
  codePostal?: string | null;
  ville?: string | null;
  phone?: string | null;
  email?: string | null;
  representantLegal?: string | null;
  siteWeb?: string | null;
}

export interface FormateurData {
  nom: string;
  titre?: string | null;
  specialite?: string | null;
  rpps?: string | null;
  email: string;
  phone?: string | null;
  siret?: string | null;
  raisonSociale?: string | null;
}

export interface ParticipantData {
  nom: string;
  titre?: string | null;
  specialite?: string | null;
  rpps?: string | null;
  email: string;
  adresse?: string | null;
  codePostal?: string | null;
  ville?: string | null;
}

export interface FormationData {
  id: string;
  titre: string;
  specialite: string;
  description: string;
  objectifs: string[];
  programme: ProgrammeItem[];
  date: string; // "2025-09-15"
  heureDebut: string;
  heureFin: string;
  dureeHeures: number;
  lieuNom?: string | null;
  lieuAdresse?: string | null;
  lieuVille?: string | null;
  lieuSalle?: string | null;
  placesTotal: number;
  placesRestantes: number;
  prixHT: number;
  exonerationTVA: boolean;
  niveau: string;
  sessionStartedAt?: string | null;
  sessionEndedAt?: string | null;
  signatureFormateurBase64?: string | null;
  formateurNomComplet?: string | null;
  pvSigne?: boolean;
  pvSigneAt?: string | null;
  bilanSigne?: boolean;
  bilanSigneAt?: string | null;
  certificatSigne?: boolean;
  certificatSigneAt?: string | null;
}

export interface ProgrammeItem {
  heure: string;
  titre: string;
  description?: string;
  type: "cours" | "atelier" | "pause" | "evaluation" | "autre";
}

export interface InscriptionData {
  id: string;
  montantHT: number;
  createdAt: string;
  statut: string;
}

export interface PaiementData {
  id: string;
  numeroFacture?: string | null;
  montantHT: number;
  datePaiement?: string | null;
  type: string;
}

export interface EmargementData {
  participant: ParticipantData;
  presentMatin: boolean;
  presentApresMidi: boolean;
  signatureMatin?: string | null;
  signatureApresMidi?: string | null;
}

export interface SatisfactionData {
  noteContenu?: number | null;
  noteFormateur?: number | null;
  noteOrganisation?: number | null;
  noteSupport?: number | null;
  noteGlobal?: number | null;
  objectifsAtteints?: boolean | null;
  recommanderait?: boolean | null;
  pointsForts?: string | null;
  pointsAmelioration?: string | null;
  commentaireLibre?: string | null;
}
