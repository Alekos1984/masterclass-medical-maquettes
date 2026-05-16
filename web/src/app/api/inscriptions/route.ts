import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { COMMISSION_RATE } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (session.user.role !== "PARTICIPANT") {
    return NextResponse.json({ error: "Réservé aux participants" }, { status: 403 });
  }

  const { formationId } = await req.json();
  if (!formationId) {
    return NextResponse.json({ error: "formationId manquant" }, { status: 400 });
  }

  // Vérifier que le profil participant existe
  const profil = await prisma.participantProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profil) {
    return NextResponse.json({ error: "PROFIL_MANQUANT" }, { status: 422 });
  }

  // Vérifier que la formation existe et est publiée
  const formation = await prisma.formation.findUnique({
    where: { id: formationId },
    select: { id: true, prixHT: true, gratuite: true, statut: true, placesTotal: true, _count: { select: { inscriptions: true } } },
  });
  if (!formation || formation.statut !== "PUBLIEE") {
    return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });
  }

  // Vérifier les places disponibles
  if (formation._count.inscriptions >= formation.placesTotal) {
    return NextResponse.json({ error: "Plus de places disponibles" }, { status: 409 });
  }

  const montantHT = formation.gratuite ? 0 : Number(formation.prixHT);
  const commission = Math.round(montantHT * COMMISSION_RATE * 100) / 100;
  const netFormateur = Math.round((montantHT - commission) * 100) / 100;

  // Créer ou récupérer l'inscription existante
  const inscription = await prisma.inscription.upsert({
    where: { participantId_formationId: { participantId: profil.id, formationId } },
    create: {
      participantId: profil.id,
      formationId,
      montantHT,
      commission,
      netFormateur,
    },
    update: {}, // ne rien modifier si déjà existante
  });

  return NextResponse.json({ inscriptionId: inscription.id });
}
