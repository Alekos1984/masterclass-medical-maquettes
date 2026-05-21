import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import DemandeDetailClient from "./DemandeDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminDemandeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/auth/login");

  const { id } = await params;

  const demande = await prisma.demandeSalle.findUnique({
    where: { id },
    include: {
      formation: {
        include: {
          formateur: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
      },
    },
  });

  if (!demande) notFound();

  const f = demande.formation;
  const fmt = f.formateur;

  return (
    <DemandeDetailClient
      demande={{
        id: demande.id,
        statut: demande.statut,
        hotelNom: demande.hotelNom,
        hotelEmail: demande.hotelEmail,
        hotelPhone: demande.hotelPhone,
        emailEnvoye: demande.emailEnvoye,
        dateContact: demande.dateContact?.toISOString() ?? null,
        devisHT: demande.devisHT ? Number(demande.devisHT) : null,
        fraisGestion: demande.fraisGestion ? Number(demande.fraisGestion) : null,
        totalHT: demande.totalHT ? Number(demande.totalHT) : null,
        devisUrl: demande.devisUrl,
        dateDevis: demande.dateDevis?.toISOString() ?? null,
        notes: demande.notes,
        createdAt: demande.createdAt.toISOString(),
        formation: {
          id: f.id,
          titre: f.titre,
          date: f.date.toISOString(),
          heureDebut: f.heureDebut,
          heureFin: f.heureFin,
          placesTotal: f.placesTotal,
          lieuVille: f.lieuVille,
          lieuNom: f.lieuNom,
          specialite: f.specialite,
          formateurNom: fmt.user.name ?? fmt.user.email ?? "—",
          formateurEmail: fmt.user.email ?? "—",
          formateurSpec: fmt.specialite ?? "—",
          formateurPhone: fmt.phone ?? null,
          formateurVille: fmt.ville ?? null,
        },
      }}
    />
  );
}
