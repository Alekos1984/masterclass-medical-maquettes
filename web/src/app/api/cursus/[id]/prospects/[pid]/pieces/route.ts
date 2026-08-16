import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess, peutGerer } from "@/lib/cursus";

const MAX_BYTES = 10 * 1024 * 1024; // 10 Mo
const TYPES = ["cv", "lettre", "diplome"] as const;
type PieceType = (typeof TYPES)[number];
type Pieces = Partial<Record<PieceType, { nom: string; base64: string; taille: number | null }>>;

// POST : charger une pièce du dossier d'inscription (CV, lettre de motivation, diplôme)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, pid } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });
  if (!peutGerer(role)) return NextResponse.json({ error: "Réservé au coordinateur ou à la secrétaire pédagogique" }, { status: 403 });

  const prospect = await prisma.cursusProspect.findFirst({ where: { id: pid, cursusId: id } });
  if (!prospect) return NextResponse.json({ error: "Candidat introuvable" }, { status: 404 });

  const { type, nom, base64, taille } = await req.json() as { type?: string; nom?: string; base64?: string; taille?: number };
  if (!type || !TYPES.includes(type as PieceType)) return NextResponse.json({ error: "Type de pièce invalide" }, { status: 400 });
  if (!nom || !base64) return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
  if (base64.length * 0.75 > MAX_BYTES) return NextResponse.json({ error: "Fichier trop volumineux (max 10 Mo)" }, { status: 413 });

  const pieces: Pieces = { ...(prospect.piecesJointes as Pieces | null ?? {}) };
  pieces[type as PieceType] = { nom, base64, taille: taille ?? null };

  await prisma.cursusProspect.update({ where: { id: pid }, data: { piecesJointes: pieces } });
  return NextResponse.json({ ok: true, pieces });
}

// DELETE : retirer une pièce du dossier
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, pid } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });
  if (!peutGerer(role)) return NextResponse.json({ error: "Réservé au coordinateur ou à la secrétaire pédagogique" }, { status: 403 });

  const prospect = await prisma.cursusProspect.findFirst({ where: { id: pid, cursusId: id } });
  if (!prospect) return NextResponse.json({ error: "Candidat introuvable" }, { status: 404 });

  const { type } = await req.json() as { type?: string };
  if (!type || !TYPES.includes(type as PieceType)) return NextResponse.json({ error: "Type de pièce invalide" }, { status: 400 });

  const pieces: Pieces = { ...(prospect.piecesJointes as Pieces | null ?? {}) };
  delete pieces[type as PieceType];

  await prisma.cursusProspect.update({ where: { id: pid }, data: { piecesJointes: pieces } });
  return NextResponse.json({ ok: true, pieces });
}
