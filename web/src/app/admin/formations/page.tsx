import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import FormationsClient from "./FormationsClient";

export default async function AdminFormationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const [formations, inscriptionsCount] = await Promise.all([
    prisma.formation.findMany({
      include: {
        formateur: { include: { user: true } },
        demandeSalle: { select: { id: true, statut: true, hotelNom: true } },
        _count: { select: { inscriptions: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.inscription.count(),
  ]);

  const data = formations.map((f) => ({
    id: f.id,
    titre: f.titre,
    lieuVille: f.lieuVille ?? null,
    formateurNom: f.formateur.user.name ?? f.formateur.user.email ?? "—",
    formateurSpec: f.formateur.specialite ?? "—",
    date: f.date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
    placesTotal: f.placesTotal,
    placesRestantes: f.placesRestantes,
    inscrits: f._count.inscriptions,
    statut: f.statut,
    demandeSalle: f.demandeSalle
      ? { id: f.demandeSalle.id, statut: f.demandeSalle.statut, hotelNom: f.demandeSalle.hotelNom }
      : null,
  }));

  return <FormationsClient formations={data} totalInscriptions={inscriptionsCount} />;
}
