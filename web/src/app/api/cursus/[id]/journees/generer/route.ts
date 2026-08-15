import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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
    return NextResponse.json({ journees });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la génération. Réessayez." }, { status: 502 });
  }
}
