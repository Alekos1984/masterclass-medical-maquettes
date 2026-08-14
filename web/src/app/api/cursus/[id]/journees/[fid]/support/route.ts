import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess, parseSlots } from "@/lib/cursus";

const MAX_BYTES = 15 * 1024 * 1024; // 15 Mo (PPT/PDF)

// POST : charger un support sur un créneau (enseignant affecté ou coordinateur)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, fid } = await params;
  const { cursus, role, enseignant } = await getCursusAccess(id, session.user.id);
  if (!cursus || !role) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });

  const journee = await prisma.formation.findFirst({ where: { id: fid, cursusId: id } });
  if (!journee) return NextResponse.json({ error: "Journée introuvable" }, { status: 404 });

  const { slotId, nom, base64, taille } = await req.json();
  if (!slotId || !nom || !base64) return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
  if (base64.length * 0.75 > MAX_BYTES) return NextResponse.json({ error: "Fichier trop volumineux (max 15 Mo)" }, { status: 413 });

  const slot = parseSlots(journee.programme).find((s) => s.slotId === slotId);
  if (!slot) return NextResponse.json({ error: "Créneau introuvable" }, { status: 404 });
  if (role !== "COORDINATEUR" && slot.enseignantId !== enseignant?.id) {
    return NextResponse.json({ error: "Vous ne pouvez charger un support que sur vos propres créneaux" }, { status: 403 });
  }

  // Remplace le support existant du créneau
  await prisma.ressource.deleteMany({ where: { formationId: fid, slotId } });
  const ressource = await prisma.ressource.create({
    data: { formationId: fid, slotId, nom, fileBase64: base64, taille: taille ?? null },
    select: { id: true, nom: true, taille: true, slotId: true, formationId: true, createdAt: true },
  });

  return NextResponse.json(ressource, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, fid } = await params;
  const { cursus, role, enseignant } = await getCursusAccess(id, session.user.id);
  if (!cursus || !role) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });

  const { slotId } = await req.json();
  const journee = await prisma.formation.findFirst({ where: { id: fid, cursusId: id } });
  if (!journee) return NextResponse.json({ error: "Journée introuvable" }, { status: 404 });

  const slot = parseSlots(journee.programme).find((s) => s.slotId === slotId);
  if (role !== "COORDINATEUR" && slot?.enseignantId !== enseignant?.id) {
    return NextResponse.json({ error: "Non autorisé sur ce créneau" }, { status: 403 });
  }

  await prisma.ressource.deleteMany({ where: { formationId: fid, slotId } });
  return NextResponse.json({ ok: true });
}
