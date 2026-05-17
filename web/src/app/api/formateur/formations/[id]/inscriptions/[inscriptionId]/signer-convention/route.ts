import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeInscriptionSeal } from "@/lib/pdf/seal";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; inscriptionId: string }> }
) {
  const { id: formationId, inscriptionId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const profil = await prisma.formateurProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profil) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const inscription = await prisma.inscription.findUnique({
    where: { id: inscriptionId },
    select: {
      id: true,
      formationId: true,
      conventionParticipantSigneeAt: true,
      formation: { select: { formateurId: true } },
    },
  });
  if (
    !inscription ||
    inscription.formationId !== formationId ||
    inscription.formation.formateurId !== profil.id
  ) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const now = new Date();
  const participantAt = inscription.conventionParticipantSigneeAt?.toISOString();

  const seal = participantAt
    ? computeInscriptionSeal(inscriptionId, "convention", now.toISOString(), participantAt)
    : null;

  await prisma.inscription.update({
    where: { id: inscriptionId },
    data: {
      conventionSignee: true,
      conventionSigneeAt: now,
      ...(seal ? { conventionSeal: seal } : {}),
    },
  });

  return NextResponse.json({ conventionSignee: true, conventionSigneeAt: now.toISOString() });
}
