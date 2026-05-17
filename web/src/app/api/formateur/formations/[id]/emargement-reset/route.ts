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

  const formation = await prisma.formation.findUnique({ where: { id }, select: { formateurId: true } });
  if (!formation || formation.formateurId !== profil.id) {
    return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });
  }

  const { emargementId } = await req.json() as { emargementId: string };

  const emargement = await prisma.emargement.findUnique({
    where: { id: emargementId },
    select: { formationId: true, pvParticipantSignedAt: true },
  });

  if (!emargement || emargement.formationId !== id) {
    return NextResponse.json({ error: "Émargement introuvable" }, { status: 404 });
  }

  if (emargement.pvParticipantSignedAt) {
    return NextResponse.json({ error: "Impossible d'annuler : le participant a déjà signé le PV" }, { status: 400 });
  }

  const updated = await prisma.emargement.update({
    where: { id: emargementId },
    data: {
      presentMatin: false,
      presentApresMidi: false,
      signatureMatin: null,
      signatureApresMidi: null,
      correctionPresence: true,
      correctionJustification: "Présence annulée par le formateur.",
    },
    select: { id: true, presentMatin: true, presentApresMidi: true },
  });

  return NextResponse.json(updated);
}
