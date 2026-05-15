import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PUBLISHABLE = ["BROUILLON", "EN_ATTENTE_SALLE", "SALLE_CONFIRMEE"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { statut } = body;

  // Verify ownership
  const profil = await prisma.formateurProfile.findUnique({ where: { userId: session.user.id } });
  if (!profil) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const formation = await prisma.formation.findUnique({ where: { id }, select: { formateurId: true, statut: true } });
  if (!formation || formation.formateurId !== profil.id) {
    return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });
  }

  if (statut === "PUBLIEE" && !PUBLISHABLE.includes(formation.statut)) {
    return NextResponse.json({ error: "Statut actuel ne permet pas la publication" }, { status: 400 });
  }

  const updated = await prisma.formation.update({
    where: { id },
    data: { statut },
    select: { id: true, statut: true },
  });

  return NextResponse.json(updated);
}
