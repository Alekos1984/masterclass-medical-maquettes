import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_BYTES = 10 * 1024 * 1024; // 10 Mo

type Piece = { nom: string; base64: string; taille: number | null };

// POST : dépôt public d'une candidature (CV + lettre de motivation) sur un DU publié.
// Aucune connexion requise — crée/complète une ligne dans la liste d'attente du coordinateur.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cursus = await prisma.cursus.findUnique({ where: { id }, select: { id: true, publique: true, statut: true } });
  if (!cursus || !cursus.publique || cursus.statut !== "PUBLIE") {
    return NextResponse.json({ error: "Enseignement introuvable" }, { status: 404 });
  }

  const body = await req.json() as {
    nom?: string; prenom?: string; email?: string; phone?: string;
    cv?: Piece; lettre?: Piece;
  };
  const email = body.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  if (!body.nom?.trim() || !body.prenom?.trim()) return NextResponse.json({ error: "Nom et prénom requis" }, { status: 400 });
  for (const piece of [body.cv, body.lettre]) {
    if (piece && piece.base64.length * 0.75 > MAX_BYTES) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 10 Mo)" }, { status: 413 });
    }
  }

  const existant = await prisma.cursusProspect.findUnique({
    where: { cursusId_email: { cursusId: id, email } },
  });

  const piecesJointes = {
    ...(existant?.piecesJointes as Record<string, Piece> | null ?? {}),
    ...(body.cv ? { cv: body.cv } : {}),
    ...(body.lettre ? { lettre: body.lettre } : {}),
  };

  if (existant) {
    await prisma.cursusProspect.update({
      where: { id: existant.id },
      data: {
        nom: body.nom.trim(), prenom: body.prenom.trim(),
        phone: body.phone?.trim() || existant.phone,
        piecesJointes,
      },
    });
  } else {
    await prisma.cursusProspect.create({
      data: {
        cursusId: id, email,
        nom: body.nom.trim(), prenom: body.prenom.trim(),
        phone: body.phone?.trim() || null,
        piecesJointes,
      },
    });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
