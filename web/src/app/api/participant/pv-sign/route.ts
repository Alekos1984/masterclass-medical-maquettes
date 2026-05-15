import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { emargementId } = await req.json() as { emargementId: string };

  const profil = await prisma.participantProfile.findUnique({ where: { userId: session.user.id } });
  if (!profil) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  // Load emargement with inscription and formation
  const emargement = await prisma.emargement.findUnique({
    where: { id: emargementId },
    include: {
      inscription: { select: { participantId: true } },
      formation: { select: { pvSigne: true } },
    },
  });

  if (!emargement) return NextResponse.json({ error: "Émargement introuvable" }, { status: 404 });

  // Verify the inscription belongs to this participant
  if (emargement.inscription.participantId !== profil.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  // Verify formateur has already signed the PV
  if (!emargement.formation.pvSigne) {
    return NextResponse.json({ error: "Le formateur n'a pas encore signé le PV" }, { status: 400 });
  }

  // Verify participant has a signature saved
  if (!profil.signatureBase64) {
    return NextResponse.json({ error: "Signez d'abord dans votre profil" }, { status: 400 });
  }

  const now = new Date();
  const updated = await prisma.emargement.update({
    where: { id: emargementId },
    data: {
      pvParticipantSignedAt: now,
      pvParticipantSignatureBase64: profil.signatureBase64,
    },
    select: {
      pvParticipantSignedAt: true,
      pvParticipantSignatureBase64: true,
    },
  });

  return NextResponse.json({
    pvParticipantSignedAt: updated.pvParticipantSignedAt?.toISOString() ?? null,
    pvParticipantSignatureBase64: updated.pvParticipantSignatureBase64,
  });
}
