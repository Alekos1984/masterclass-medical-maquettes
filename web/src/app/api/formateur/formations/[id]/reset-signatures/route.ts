import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;

  const profil = await prisma.formateurProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profil) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const formation = await prisma.formation.findUnique({
    where: { id },
    select: { formateurId: true },
  });
  if (!formation || formation.formateurId !== profil.id) {
    return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });
  }

  await prisma.formation.update({
    where: { id },
    data: {
      pvSigne: false,
      pvSigneAt: null,
      bilanSigne: false,
      bilanSigneAt: null,
      certificatSigne: false,
      certificatSigneAt: null,
      emargementSigne: false,
      emargementSigneAt: null,
      signatureFormateurSnap: null,
    },
  });

  return NextResponse.json({ ok: true });
}
