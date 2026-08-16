import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET : détail d'un modèle (pour l'appliquer à la création d'un nouveau DU)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const profile = await prisma.formateurProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!profile) return NextResponse.json({ error: "Profil formateur introuvable" }, { status: 404 });

  const { id } = await params;
  const template = await prisma.cursusTemplate.findFirst({ where: { id, formateurId: profile.id } });
  if (!template) return NextResponse.json({ error: "Modèle introuvable" }, { status: 404 });

  return NextResponse.json({ template });
}

// DELETE : supprime un modèle
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const profile = await prisma.formateurProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!profile) return NextResponse.json({ error: "Profil formateur introuvable" }, { status: 404 });

  const { id } = await params;
  const template = await prisma.cursusTemplate.findFirst({ where: { id, formateurId: profile.id }, select: { id: true } });
  if (!template) return NextResponse.json({ error: "Modèle introuvable" }, { status: 404 });

  await prisma.cursusTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
