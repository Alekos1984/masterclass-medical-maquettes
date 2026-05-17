import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeInscriptionSeal } from "@/lib/pdf/seal";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: inscriptionId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const inscription = await prisma.inscription.findUnique({
    where: { id: inscriptionId },
    select: {
      id: true,
      statut: true,
      conventionSignee: true,
      conventionSigneeAt: true,
      conventionParticipantSigneeAt: true,
      participant: { select: { userId: true } },
    },
  });

  if (!inscription || inscription.participant.userId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }
  if (inscription.statut !== "CONFIRMEE") {
    return NextResponse.json({ error: "Inscription non confirmée" }, { status: 400 });
  }
  if (!inscription.conventionSignee) {
    return NextResponse.json({ error: "Le formateur n'a pas encore signé" }, { status: 400 });
  }
  if (inscription.conventionParticipantSigneeAt) {
    return NextResponse.json({ ok: true, alreadySigned: true });
  }

  const now = new Date();
  const formateurAt = inscription.conventionSigneeAt!.toISOString();
  const seal = computeInscriptionSeal(inscriptionId, "convention", formateurAt, now.toISOString());

  await prisma.inscription.update({
    where: { id: inscriptionId },
    data: {
      conventionParticipantSigneeAt: now,
      conventionSeal: seal,
    },
  });

  return NextResponse.json({ ok: true, signedAt: now.toISOString() });
}
