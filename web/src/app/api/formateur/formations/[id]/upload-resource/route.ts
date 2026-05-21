import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB per resource

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

  const { nom, base64, url, taille } = await req.json() as {
    nom: string;
    base64?: string;
    url?: string;
    taille?: number;
  };

  if (!nom) return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  if (!base64 && !url) return NextResponse.json({ error: "Fichier ou URL requis" }, { status: 400 });

  if (base64) {
    const approxBytes = base64.length * 0.75;
    if (approxBytes > MAX_BYTES) {
      return NextResponse.json({ error: `Fichier trop volumineux (max 10 Mo)` }, { status: 413 });
    }
  }

  const ressource = await prisma.ressource.create({
    data: { formationId: id, nom, fileBase64: base64 ?? null, url: url ?? null, taille: taille ?? null },
    select: { id: true, nom: true, url: true, taille: true, createdAt: true },
  });

  return NextResponse.json(ressource);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const profil = await prisma.formateurProfile.findUnique({ where: { userId: session.user.id } });
  if (!profil) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const { ressourceId } = await req.json() as { ressourceId: string };
  const r = await prisma.ressource.findUnique({ where: { id: ressourceId }, select: { formationId: true } });
  if (!r || r.formationId !== id) return NextResponse.json({ error: "Ressource introuvable" }, { status: 404 });

  await prisma.ressource.delete({ where: { id: ressourceId } });
  return NextResponse.json({ ok: true });
}
