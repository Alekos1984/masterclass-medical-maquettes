import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const {
    inscriptionId,
    noteGlobal,
    noteContenu,
    noteFormateur,
    noteOrganisation,
    noteSupport,
    objectifsAtteints,
    recommanderait,
    pointsForts,
    pointsAmelioration,
    commentaireLibre,
  } = await req.json() as {
    inscriptionId: string;
    noteGlobal: number;
    noteContenu: number;
    noteFormateur: number;
    noteOrganisation: number;
    noteSupport: number;
    objectifsAtteints: boolean;
    recommanderait: boolean;
    pointsForts?: string;
    pointsAmelioration?: string;
    commentaireLibre?: string;
  };

  // Verify the inscription belongs to the current user
  const profil = await prisma.participantProfile.findUnique({ where: { userId: session.user.id } });
  if (!profil) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const inscription = await prisma.inscription.findUnique({ where: { id: inscriptionId }, select: { participantId: true, formationId: true } });
  if (!inscription || inscription.participantId !== profil.id) {
    return NextResponse.json({ error: "Inscription introuvable" }, { status: 404 });
  }

  await prisma.satisfactionReponse.upsert({
    where: { inscriptionId },
    create: {
      inscriptionId,
      formationId: inscription.formationId,
      noteGlobal,
      noteContenu,
      noteFormateur,
      noteOrganisation,
      noteSupport,
      objectifsAtteints,
      recommanderait,
      pointsForts: pointsForts ?? null,
      pointsAmelioration: pointsAmelioration ?? null,
      commentaireLibre: commentaireLibre ?? null,
      completedAt: new Date(),
    },
    update: {
      noteGlobal,
      noteContenu,
      noteFormateur,
      noteOrganisation,
      noteSupport,
      objectifsAtteints,
      recommanderait,
      pointsForts: pointsForts ?? null,
      pointsAmelioration: pointsAmelioration ?? null,
      commentaireLibre: commentaireLibre ?? null,
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
