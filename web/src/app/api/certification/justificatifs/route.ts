import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CERTIF_BLOC_CODES } from "@/lib/certification";

const MAX_BYTES = 10 * 1024 * 1024; // 10 Mo

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const compte = await prisma.certificationCompte.findUnique({ where: { userId: session.user.id } });
  if (!compte) return NextResponse.json({ error: "Compte certification introuvable" }, { status: 404 });

  const { blocCode, actionTitre, typeDocument, fichierNom, fichierBase64, dateAction } = await req.json() as {
    blocCode: string;
    actionTitre: string;
    typeDocument?: string;
    fichierNom?: string;
    fichierBase64?: string;
    dateAction?: string;
  };

  if (!blocCode || !(CERTIF_BLOC_CODES as readonly string[]).includes(blocCode)) {
    return NextResponse.json({ error: "Bloc invalide" }, { status: 400 });
  }
  if (!actionTitre?.trim()) {
    return NextResponse.json({ error: "Intitulé de l'action requis" }, { status: 400 });
  }
  if (fichierBase64 && fichierBase64.length * 0.75 > MAX_BYTES) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 10 Mo)" }, { status: 413 });
  }

  const justificatif = await prisma.certificationJustificatif.create({
    data: {
      compteId: compte.id,
      blocCode,
      actionTitre: actionTitre.trim(),
      typeDocument: typeDocument?.trim() || null,
      fichierNom: fichierNom ?? null,
      fichierBase64: fichierBase64 ?? null,
      dateAction: dateAction ? new Date(dateAction) : null,
      source: "UPLOAD",
    },
    select: { id: true },
  });

  return NextResponse.json({ id: justificatif.id }, { status: 201 });
}
