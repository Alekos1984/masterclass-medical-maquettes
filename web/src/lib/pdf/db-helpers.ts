import { prisma } from "@/lib/prisma";
import type {
  CompanyData,
  FormateurData,
  FormationData,
  ParticipantData,
  ProgrammeItem,
} from "./shared/types";

export async function getCompanySettings(): Promise<CompanyData> {
  const settings = await prisma.companySettings.findUnique({ where: { id: "singleton" } });
  return {
    raisonSociale: settings?.raisonSociale ?? "Masterclass Medical",
    siret: settings?.siret,
    numeroDeclaration: settings?.numeroDeclaration,
    adresse: settings?.adresse,
    codePostal: settings?.codePostal,
    ville: settings?.ville,
    phone: settings?.phone,
    email: settings?.email,
    representantLegal: settings?.representantLegal,
    siteWeb: settings?.siteWeb,
  };
}

export async function getFormationData(formationId: string): Promise<{
  formation: FormationData;
  formateur: FormateurData;
} | null> {
  const f = await prisma.formation.findUnique({
    where: { id: formationId },
    include: {
      formateur: {
        include: { user: true },
      },
    },
  });
  if (!f) return null;

  const profil = f.formateur;
  const formateurNomComplet = `${profil.titre ? profil.titre + " " : ""}${profil.user?.name ?? ""}`.trim();

  return {
    formation: {
      id: f.id,
      titre: f.titre,
      specialite: f.specialite,
      description: f.description,
      objectifs: (f.objectifs as unknown as string[]) ?? [],
      programme: (f.programme as unknown as ProgrammeItem[]) ?? [],
      date: f.date.toISOString(),
      heureDebut: f.heureDebut,
      heureFin: f.heureFin,
      dureeHeures: f.dureeHeures,
      lieuNom: f.lieuNom,
      lieuAdresse: f.lieuAdresse,
      lieuVille: f.lieuVille,
      lieuSalle: f.lieuSalle,
      placesTotal: f.placesTotal,
      placesRestantes: f.placesRestantes,
      prixHT: Number(f.prixHT),
      exonerationTVA: f.exonerationTVA,
      niveau: f.niveau,
      sessionStartedAt: f.sessionStartedAt?.toISOString() ?? null,
      sessionEndedAt: f.sessionEndedAt?.toISOString() ?? null,
      formateurNomComplet,
      pvSigne: f.pvSigne,
      pvSigneAt: f.pvSigneAt?.toISOString() ?? null,
      pvObjectifsAtteints: (f.pvContent as Record<string, string> | null)?.objectifsAtteints ?? null,
      pvObservations: (f.pvContent as Record<string, string> | null)?.observations ?? null,
      pvAcquis: (f.pvContent as Record<string, string> | null)?.acquis ?? null,
      bilanSigne: f.bilanSigne,
      bilanSigneAt: f.bilanSigneAt?.toISOString() ?? null,
      bilanResume: (f.bilanContent as Record<string, string> | null)?.resume ?? null,
      bilanRecommandations: (f.bilanContent as Record<string, string> | null)?.recommandations ?? null,
      bilanPointsForts: (f.bilanContent as Record<string, string> | null)?.pointsForts ?? null,
      certificatSigne: f.certificatSigne,
      certificatSigneAt: f.certificatSigneAt?.toISOString() ?? null,
    },
    formateur: {
      nom: f.formateur.user.name ?? "Formateur",
      titre: f.formateur.titre,
      specialite: f.formateur.specialite,
      rpps: f.formateur.rpps,
      email: f.formateur.user.email,
      phone: f.formateur.phone,
      siret: f.formateur.siret,
      raisonSociale: f.formateur.raisonSociale,
    },
  };
}

export async function getInscriptionData(inscriptionId: string) {
  return prisma.inscription.findUnique({
    where: { id: inscriptionId },
    include: {
      participant: { include: { user: true } },
      formation: {
        include: { formateur: { include: { user: true } } },
      },
      paiement: true,
      satisfaction: true,
      emargements: true,
    },
  });
}

export function mapParticipant(p: {
  user: { name: string | null; email: string };
  titre?: string | null;
  specialite?: string | null;
  rpps?: string | null;
  adresse?: string | null;
  codePostal?: string | null;
  ville?: string | null;
}): ParticipantData {
  return {
    nom: p.user.name ?? "Participant",
    titre: p.titre,
    specialite: p.specialite,
    rpps: p.rpps,
    email: p.user.email,
    adresse: p.adresse,
    codePostal: p.codePostal,
    ville: p.ville,
  };
}
