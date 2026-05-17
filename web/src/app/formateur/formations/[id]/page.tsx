import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FormateurDetailClient from "./FormateurDetailClient";

export default async function FormateurDetailFormationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const profil = await prisma.formateurProfile.findUnique({
    where: { userId: session.user.id },
  });

  const formation = await prisma.formation.findFirst({
    where: { id, formateurId: profil?.id ?? "" },
    include: {
      inscriptions: {
        include: {
          participant: { include: { user: { select: { name: true, email: true } } } },
          paiement: { select: { id: true, numeroFacture: true, statut: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      satisfactions: { select: { id: true } },
      emargements: {
        select: {
          id: true,
          inscriptionId: true,
          presentMatin: true,
          presentApresMidi: true,
          pvParticipantSignedAt: true,
          correctionJustification: true,
          inscription: {
            select: {
              participant: {
                select: { user: { select: { name: true } } },
              },
            },
          },
        },
      },
      demandeSalle: true,
    },
  });

  if (!formation) notFound();

  const data = {
    id: formation.id,
    titre: formation.titre,
    specialite: formation.specialite,
    niveau: formation.niveau,
    date: formation.date.toISOString(),
    heureDebut: formation.heureDebut,
    heureFin: formation.heureFin,
    dureeHeures: formation.dureeHeures,
    placesTotal: formation.placesTotal,
    placesRestantes: formation.placesRestantes,
    lieuVille: formation.lieuVille ?? null,
    lieuNom: formation.lieuNom ?? null,
    prixHT: Number(formation.prixHT),
    gratuite: formation.gratuite,
    statut: formation.statut,
    description: formation.description ?? "",
    objectifs: formation.objectifs as string[],
    programme: formation.programme as { time: string; title: string; description?: string; type?: string }[],
    satisfactionsCount: formation.satisfactions.length,
    emargementsCount: formation.emargements.length,
    emargements: formation.emargements.map((e) => ({
      id: e.id,
      inscriptionId: e.inscriptionId,
      participantName: e.inscription.participant.user.name ?? "Anonyme",
      presentMatin: e.presentMatin,
      presentApresMidi: e.presentApresMidi,
      pvParticipantSignedAt: e.pvParticipantSignedAt?.toISOString() ?? null,
      correctionJustification: e.correctionJustification ?? null,
    })),
    emargementSigne: formation.emargementSigne ?? false,
    emargementSigneAt: formation.emargementSigneAt?.toISOString() ?? null,
    inscriptions: formation.inscriptions.map((i) => ({
      id: i.id,
      createdAt: i.createdAt.toISOString(),
      statut: i.statut,
      convocationSignee: i.convocationSignee,
      convocationSigneeAt: i.convocationSigneeAt?.toISOString() ?? null,
      convocationAccuseAt: i.convocationAccuseAt?.toISOString() ?? null,
      conventionSignee: i.conventionSignee,
      conventionSigneeAt: i.conventionSigneeAt?.toISOString() ?? null,
      conventionParticipantSigneeAt: i.conventionParticipantSigneeAt?.toISOString() ?? null,
      conventionSeal: i.conventionSeal ?? null,
      paiementId: i.paiement?.id ?? null,
      participant: {
        name: i.participant.user.name ?? "Anonyme",
        email: i.participant.user.email ?? "",
        specialite: i.participant.specialite ?? null,
        ville: i.participant.ville ?? null,
      },
    })),
    demandeSalle: formation.demandeSalle
      ? { statut: formation.demandeSalle.statut, notes: formation.demandeSalle.notes ?? null }
      : null,
    publicCible: formation.publicCible ?? "",
    restauration: formation.restauration ?? "",
    formatFormation: formation.formatFormation ?? "",
    minParticipants: formation.minParticipants ?? 8,
    equipements: (formation.equipements as string[]) ?? [],
    sessionStatus: formation.sessionStatus ?? null,
    sessionLog: (formation.sessionLog as { type: string; time: string }[] | null) ?? null,
    sessionStartedAt: formation.sessionStartedAt?.toISOString() ?? null,
    sessionEndedAt: formation.sessionEndedAt?.toISOString() ?? null,
    pvSigne: formation.pvSigne ?? false,
    pvSigneAt: formation.pvSigneAt?.toISOString() ?? null,
    bilanSigne: formation.bilanSigne ?? false,
    bilanSigneAt: formation.bilanSigneAt?.toISOString() ?? null,
    certificatSigne: formation.certificatSigne ?? false,
    certificatSigneAt: formation.certificatSigneAt?.toISOString() ?? null,
    afficheParams: (formation.afficheParams ?? null) as Record<string, string> | null,
  };

  return <FormateurDetailClient formation={data} />;
}
