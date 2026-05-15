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
      emargements: { select: { id: true } },
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
    inscriptions: formation.inscriptions.map((i) => ({
      id: i.id,
      createdAt: i.createdAt.toISOString(),
      statut: i.statut,
      conventionSignee: i.conventionSignee,
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
  };

  return <FormateurDetailClient formation={data} />;
}
