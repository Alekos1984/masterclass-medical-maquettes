import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import RemboursementsClient from "./RemboursementsClient";

export default async function AdminRemboursementsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const remboursements = await prisma.remboursement.findMany({
    include: {
      inscription: {
        include: {
          formation: true,
          participant: { include: { user: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const enAttenteCount = remboursements.filter((r) => r.statut === "EN_ATTENTE").length;

  const rows = remboursements.map((r) => ({
    id: r.id,
    participantNom: r.inscription.participant.user.name ?? r.inscription.participant.user.email ?? "—",
    email: r.inscription.participant.user.email ?? null,
    formationTitre: r.inscription.formation.titre,
    formationVille: r.inscription.formation.lieuVille ?? null,
    dateFormation: r.inscription.formation.date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
    motif: r.motif,
    montant: `${Number(r.montant).toLocaleString("fr-FR")} €`,
    dateDemande: r.dateDemande.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
    eligible: r.eligible,
    statut: r.statut,
  }));

  return <RemboursementsClient remboursements={rows} enAttenteCount={enAttenteCount} />;
}
