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

  const formation = await prisma.formation.findUnique({
    where: { id },
    select: { formateurId: true, date: true },
  });
  if (!formation || formation.formateurId !== profil.id) {
    return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });
  }

  const { inscriptionId, presentMatin, presentApresMidi } = await req.json() as {
    inscriptionId: string;
    presentMatin: boolean;
    presentApresMidi: boolean;
  };

  // Verify inscription belongs to this formation
  const inscription = await prisma.inscription.findUnique({
    where: { id: inscriptionId },
    select: { formationId: true },
  });
  if (!inscription || inscription.formationId !== id) {
    return NextResponse.json({ error: "Inscription introuvable" }, { status: 404 });
  }

  const now = new Date();

  // Upsert emargement — also set signatureMatin/signatureApresMidi so the
  // timestamp survives a page reload (otherwise it shows "—")
  const emargement = await prisma.emargement.upsert({
    where: { formationId_inscriptionId: { formationId: id, inscriptionId } },
    create: {
      formationId: id,
      inscriptionId,
      tokenExpire: new Date(formation.date.getTime() + 48 * 60 * 60 * 1000),
      presentMatin,
      presentApresMidi,
      signatureMatin: presentMatin ? now : null,
      signatureApresMidi: presentApresMidi ? now : null,
      correctionPresence: true,
      correctionJustification: "Présence marquée manuellement par le formateur.",
    },
    update: {
      presentMatin,
      presentApresMidi,
      signatureMatin: presentMatin ? now : undefined,
      signatureApresMidi: presentApresMidi ? now : undefined,
      correctionPresence: true,
      correctionJustification: "Présence marquée manuellement par le formateur.",
    },
    select: { id: true, presentMatin: true, presentApresMidi: true, signatureMatin: true, signatureApresMidi: true },
  });

  return NextResponse.json(emargement);
}
