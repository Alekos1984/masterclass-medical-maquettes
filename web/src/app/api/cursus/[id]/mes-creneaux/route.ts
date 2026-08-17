import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseSlots } from "@/lib/cursus";

// GET : portail public (sans connexion) — un enseignant retrouve ses créneaux proposés
// pour ce DU à partir de son email, afin de les confirmer ou décliner.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!email || !email.includes("@")) return NextResponse.json({ error: "Email invalide" }, { status: 400 });

  const cursus = await prisma.cursus.findUnique({
    where: { id },
    include: { enseignants: true, journees: { orderBy: { date: "asc" } } },
  });
  if (!cursus) return NextResponse.json({ error: "Enseignement introuvable" }, { status: 404 });

  const enseignant = cursus.enseignants.find((e) => e.role !== "SECRETAIRE" && e.email.toLowerCase() === email);
  if (!enseignant) return NextResponse.json({ found: false });

  const creneaux = cursus.journees.flatMap((j) =>
    parseSlots(j.programme)
      .filter((s) => s.enseignantId === enseignant.id)
      .map((s) => ({
        journeeId: j.id,
        slotId: s.slotId,
        titre: s.titre,
        heureDebut: s.heureDebut,
        heureFin: s.heureFin,
        dateStr: j.date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
        lieu: s.enVisio
          ? "Visioconférence"
          : [s.lieuNom || j.lieuNom, s.salle ? `salle ${s.salle}` : null].filter(Boolean).join(" — ") || null,
        statut: s.confirmationStatut ?? null,
      }))
  );

  return NextResponse.json({
    found: true,
    enseignantNom: enseignant.nom ?? enseignant.email,
    cursusTitre: cursus.titre,
    cursusAnnee: cursus.annee,
    creneaux,
  });
}
