import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB

export async function POST(
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

  const { base64, pageCount } = await req.json() as { base64: string; pageCount?: number };
  if (!base64) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });

  // Rough size check (base64 is ~4/3 of binary)
  const approxBytes = base64.length * 0.75;
  if (approxBytes > MAX_BYTES) {
    return NextResponse.json({ error: `Fichier trop volumineux (max 15 Mo, reçu ~${Math.round(approxBytes / 1024 / 1024)} Mo)` }, { status: 413 });
  }

  await prisma.formation.update({
    where: { id },
    data: { sessionSlidesBase64: base64, sessionCurrentPage: 1 },
  });

  return NextResponse.json({ ok: true, pageCount: pageCount ?? null });
}

export async function DELETE(
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

  await prisma.formation.update({ where: { id }, data: { sessionSlidesBase64: null, sessionCurrentPage: 1 } });
  return NextResponse.json({ ok: true });
}
