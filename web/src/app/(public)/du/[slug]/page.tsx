import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseSlots } from "@/lib/cursus";
import DuPublicClient from "./DuPublicClient";

export const dynamic = "force-dynamic";

export default async function DuPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cursus = await prisma.cursus.findUnique({
    where: { slug },
    include: {
      coordinateur: { include: { user: { select: { name: true } } } },
      enseignants: { where: { statut: "ACCEPTE" } },
      journees: { orderBy: { date: "asc" } },
    },
  });
  if (!cursus || !cursus.publique || cursus.statut !== "PUBLIE") notFound();

  const enseignantsById = new Map(cursus.enseignants.map((e) => [e.id, e.nom ?? e.email]));

  return (
    <DuPublicClient
      cursus={{
        id: cursus.id,
        titre: cursus.titre,
        annee: cursus.annee,
        specialite: cursus.specialite,
        description: cursus.description,
        coordinateurNom: cursus.coordinateur.user?.name ?? "—",
        inscriptionMode: cursus.inscriptionMode,
        prixHT: cursus.prixHT ? Number(cursus.prixHT) : null,
        lieuNom: cursus.lieuNom,
        lieuVille: cursus.lieuVille,
        prerequis: cursus.prerequis,
        publicVise: cursus.publicVise,
        enseignants: cursus.enseignants.map((e) => e.nom ?? e.email),
        journees: cursus.journees.map((j) => ({
          date: j.date.toISOString(),
          heureDebut: j.heureDebut,
          heureFin: j.heureFin,
          modalite: j.modaliteSession ?? "PRESENTIEL",
          slots: parseSlots(j.programme).map((s) => ({
            heureDebut: s.heureDebut, heureFin: s.heureFin, titre: s.titre, type: s.type,
            enseignantNom: s.enseignantId ? enseignantsById.get(s.enseignantId) ?? null : null,
            lieuNom: s.lieuNom ?? null, salle: s.salle ?? null, enVisio: s.enVisio,
          })),
        })),
      }}
    />
  );
}
