import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCursusAccess, rematchIntervenants, peutGerer } from "@/lib/cursus";

// POST : relance le rattachement automatique des intervenants détectés
// aux enseignants actuellement dans l'équipe. Idempotent.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });
  if (!peutGerer(role)) return NextResponse.json({ error: "Réservé au coordinateur ou à la secrétaire pédagogique" }, { status: 403 });

  const result = await rematchIntervenants(id);
  return NextResponse.json(result);
}
