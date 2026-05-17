import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    select: { id: true, formationId: true, formation: { select: { formateurId: true } } },
  });
  if (
    !inscription ||
    inscription.formationId !== formationId ||
    inscription.formation.formateurId !== profil.id
  ) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const now = new Date();
  await prisma.inscription.update({
    where: { id: inscriptionId },
    data: { convocationSignee: true, convocationSigneeAt: now },
  });

  return NextResponse.json({ convocationSignee: true, convocationSigneeAt: now.toISOString() });
}
