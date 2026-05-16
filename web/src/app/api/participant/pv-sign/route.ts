import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { emargementId, signatureBase64: signatureFromBody } = await req.json() as {
    emargementId: string;
    signatureBase64?: string;
  };

  const profil = await prisma.participantProfile.findUnique({ where: { userId: session.user.id } });
  if (!profil) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const emargement = await prisma.emargement.findUnique({
    where: { id: emargementId },
    include: {
      inscription: { select: { participantId: true } },
      formation: { select: { pvSigne: true } },
    },
  });

  if (!emargement) return NextResponse.json({ error: "Émargement introuvable" }, { status: 404 });

  if (emargement.inscription.participantId !== profil.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  if (!emargement.formation.pvSigne) {
    return NextResponse.json({ error: "Le formateur n'a pas encore signé le PV" }, { status: 400 });
  }

  // Resolve signature: from request body > from profile
  const resolvedSignature = signatureFromBody || profil.signatureBase64 || null;
  if (!resolvedSignature) {
    return NextResponse.json({ error: "Aucune signature disponible. Dessinez votre signature." }, { status: 400 });
  }

  // Save back to profile if not already set
  if (!profil.signatureBase64 && resolvedSignature) {
    await prisma.participantProfile.update({
      where: { id: profil.id },
      data: { signatureBase64: resolvedSignature },
    }).catch(() => {});
  }

  const now = new Date();
  const updated = await prisma.emargement.update({
    where: { id: emargementId },
    data: {
      pvParticipantSignedAt: now,
      pvParticipantSignatureBase64: resolvedSignature,
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
