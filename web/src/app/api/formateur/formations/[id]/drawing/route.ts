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

  const formation = await prisma.formation.findFirst({
    where: { id, formateurId: profil.id },
    select: { id: true },
  });
  if (!formation) return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });

  const { drawingData } = await req.json() as { drawingData: string | null };

  await prisma.formation.update({
    where: { id },
    data: { sessionDrawingData: drawingData },
  });

  return NextResponse.json({ ok: true });
}
