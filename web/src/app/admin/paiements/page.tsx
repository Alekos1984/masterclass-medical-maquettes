import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PaiementsClient from "./PaiementsClient";

export default async function AdminPaiementsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const [inscriptions, abonnements, abonnementsActifsCount] = await Promise.all([
    prisma.inscription.findMany({
      where: { statut: "CONFIRMEE" },
      include: {
        formation: true,
        participant: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.formateurProfile.findMany({
      where: { statutAbonnement: { not: "INACTIF" } },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.formateurProfile.count({ where: { statutAbonnement: "ACTIF" } }),
  ]);

  const inscriptionRows = inscriptions.map((i) => ({
    id: i.id,
    participantNom: i.participant.user.name ?? i.participant.user.email ?? "—",
    formationTitre: i.formation.titre,
    formationVille: i.formation.lieuVille ?? null,
    montantHT: `${Number(i.montantHT).toLocaleString("fr-FR")} €`,
    commission: `${Number(i.commission).toLocaleString("fr-FR")} €`,
    date: i.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
  }));

  const abonnementRows = abonnements.map((f) => {
    const statut =
      f.statutAbonnement === "ACTIF"
        ? { label: "Actif", pillClass: "pill-green" }
        : f.statutAbonnement === "SUSPENDU"
        ? { label: "⚠ Impayé", pillClass: "pill-red" }
        : f.statutAbonnement === "RESILIE"
        ? { label: "Résilié", pillClass: "pill-gray" }
        : { label: "Inactif", pillClass: "pill-gray" };
    return {
      id: f.id,
      formateurNom: f.user.name ?? f.user.email ?? "—",
      email: f.user.email ?? "—",
      statut: statut.label,
      pillClass: statut.pillClass,
    };
  });

  return (
    <PaiementsClient
      inscriptions={inscriptionRows}
      abonnements={abonnementRows}
      inscriptionsCount={inscriptions.length}
      abonnementsActifs={abonnementsActifsCount}
    />
  );
}
