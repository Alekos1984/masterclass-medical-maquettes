import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import AdminFormationDetailClient from "./AdminFormationDetailClient";

export default async function AdminFormationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const { id } = await params;

  const formation = await prisma.formation.findUnique({
    where: { id },
    include: {
      formateur: { include: { user: { select: { name: true, email: true } } } },
      inscriptions: {
        include: {
          participant: { include: { user: { select: { name: true, email: true } } } },
          paiement: { select: { id: true, numeroFacture: true, statut: true } },
          emargements: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      satisfactions: { select: { id: true } },
      emargements: { select: { id: true } },
    },
  });

  if (!formation) {
    notFound();
  }

  const data = {
    id: formation.id,
    titre: formation.titre,
    statut: formation.statut,
    date: formation.date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
    lieuVille: formation.lieuVille ?? null,
    placesTotal: formation.placesTotal,
    placesRestantes: formation.placesRestantes,
    formateurNom: formation.formateur.user.name ?? formation.formateur.user.email ?? "—",
    formateurEmail: formation.formateur.user.email ?? "—",
    nbSatisfactions: formation.satisfactions.length,
    nbEmargements: formation.emargements.length,
    inscriptions: formation.inscriptions.map((ins) => ({
      id: ins.id,
      statut: ins.statut,
      participantNom: ins.participant.user.name ?? ins.participant.user.email ?? "—",
      participantEmail: ins.participant.user.email ?? "—",
      paiement: ins.paiement
        ? { id: ins.paiement.id, numeroFacture: ins.paiement.numeroFacture, statut: ins.paiement.statut }
        : null,
      nbEmargements: ins.emargements.length,
    })),
  };

  return <AdminFormationDetailClient formation={data} />;
}
