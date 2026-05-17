import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const profil = await prisma.formateurProfile.findUnique({ where: { userId: session.user.id } });
  if (!profil) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const formation = await prisma.formation.findFirst({ where: { id, formateurId: profil.id }, select: { id: true } });
  if (!formation) return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });

  const questions = await prisma.question.findMany({
    where: { formationId: id },
    include: { participant: { include: { user: { select: { name: true } } } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(questions.map((q) => ({
    id: q.id,
    texte: q.texte,
    lue: q.lue,
    createdAt: q.createdAt.toISOString(),
    participantName: q.participant.user.name ?? "Participant",
  })));
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const profil = await prisma.formateurProfile.findUnique({ where: { userId: session.user.id } });
  if (!profil) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const formation = await prisma.formation.findFirst({ where: { id, formateurId: profil.id }, select: { id: true } });
  if (!formation) return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });

  const { questionId, lue } = await req.json() as { questionId: string; lue: boolean };
  await prisma.question.update({ where: { id: questionId }, data: { lue } });
  return NextResponse.json({ ok: true });
}
