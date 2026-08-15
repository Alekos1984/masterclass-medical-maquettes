import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess } from "@/lib/cursus";
import { genererJournees } from "@/lib/ai/journees";

// POST : propose un calendrier de journées à partir d'une consigne
// (aucune création en base — le coordinateur valide ensuite ligne par ligne)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });
  if (role !== "COORDINATEUR") return NextResponse.json({ error: "Réservé au coordinateur" }, { status: 403 });

  const { consigne } = await req.json();
  if (!consigne?.trim()) return NextResponse.json({ error: "Décrivez le calendrier souhaité" }, { status: 400 });

  try {
    const journees = await genererJournees(consigne.trim().slice(0, 2000), {
      cursusTitre: cursus.titre,
      datesExistantes: cursus.journees.map((j) => j.date.toISOString().slice(0, 10)),
    });

    // Info non bloquante : dates qui tombent le même jour qu'un AUTRE cursus
    // du même coordinateur (avoir plusieurs DU le même jour est permis —
    // le coordinateur n'est pas forcément présent partout).
    if (journees.length > 0) {
      const dates = journees.map((j) => new Date(j.date + "T00:00:00Z"));
      const min = new Date(Math.min(...dates.map((d) => d.getTime())));
      const max = new Date(Math.max(...dates.map((d) => d.getTime())) + 24 * 3600 * 1000);
      const autres = await prisma.formation.findMany({
        where: {
          cursusId: { not: id },
          cursus: { coordinateurId: cursus.coordinateurId },
          date: { gte: min, lte: max },
        },
        select: { date: true, cursus: { select: { titre: true } } },
      });
      const parDate = new Map<string, string[]>();
      for (const f of autres) {
        const k = f.date.toISOString().slice(0, 10);
        (parDate.get(k) ?? parDate.set(k, []).get(k)!).push(f.cursus?.titre ?? "autre cursus");
      }
      for (const j of journees as (typeof journees[number] & { chevauchement?: string })[]) {
        const c = parDate.get(j.date);
        if (c?.length) j.chevauchement = c.join(", ");
      }
    }

    return NextResponse.json({ journees });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la génération. Réessayez." }, { status: 502 });
  }
}
