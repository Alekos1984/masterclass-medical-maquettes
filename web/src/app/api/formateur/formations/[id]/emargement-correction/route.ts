import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;

  const profil = await prisma.formateurProfile.findUnique({ where: { userId: session.user.id } });
  if (!profil) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  // Ownership check
  const formation = await prisma.formation.findUnique({ where: { id }, select: { formateurId: true } });
  if (!formation || formation.formateurId !== profil.id) {
    return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });
  }

  const { emargementId, presentMatin, presentApresMidi, justification } = await req.json() as {
    emargementId: string;
    presentMatin: boolean;
    presentApresMidi: boolean;
    justification: string;
  };

  // Validate justification
  if (!justification || justification.trim().length < 10) {
    return NextResponse.json({ error: "La justification doit comporter au moins 10 caractères" }, { status: 400 });
  }

  // Verify emargement belongs to this formation
  const emargement = await prisma.emargement.findUnique({
    where: { id: emargementId },
    select: { formationId: true },
  });

  if (!emargement || emargement.formationId !== id) {
    return NextResponse.json({ error: "Émargement introuvable" }, { status: 404 });
  }

  const updated = await prisma.emargement.update({
    where: { id: emargementId },
    data: {
      correctionPresence: true,
      correctionJustification: justification.trim(),
      presentMatin,
      presentApresMidi,
    },
    select: {
      id: true,
      presentMatin: true,
      presentApresMidi: true,
      correctionPresence: true,
      correctionJustification: true,
    },
  });

  return NextResponse.json(updated);
}
