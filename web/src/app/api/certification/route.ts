import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getOrCreateCompte(userId: string) {
  const existing = await prisma.certificationCompte.findUnique({ where: { userId } });
  if (existing) return existing;

  // Pré-remplir la spécialité depuis le profil formateur ou participant
  const [formateur, participant] = await Promise.all([
    prisma.formateurProfile.findUnique({ where: { userId }, select: { specialite: true } }),
    prisma.participantProfile.findUnique({ where: { userId }, select: { specialite: true } }),
  ]);
  return prisma.certificationCompte.create({
    data: { userId, specialite: formateur?.specialite ?? participant?.specialite ?? null },
  });
}

/**
 * Synchronise les justificatifs "plateforme" : pour chaque formation certifiante
 * terminée à laquelle l'utilisateur a participé (présence émargée), un
 * justificatif est créé automatiquement, pointant vers son attestation PDF.
 */
async function syncJustificatifsPlateforme(userId: string, compteId: string) {
  const participant = await prisma.participantProfile.findUnique({ where: { userId }, select: { id: true } });
  if (!participant) return;

  const inscriptions = await prisma.inscription.findMany({
    where: {
      participantId: participant.id,
      statut: "CONFIRMEE",
      formation: {
        certifBlocCode: { not: null },
        sessionEndedAt: { not: null },
      },
      emargements: { some: { OR: [{ presentMatin: true }, { presentApresMidi: true }] } },
    },
    select: {
      id: true,
      formation: {
        select: { id: true, titre: true, date: true, certifBlocCode: true, certifActionTitre: true },
      },
    },
  });

  for (const insc of inscriptions) {
    const f = insc.formation;
    if (!f.certifBlocCode) continue;
    await prisma.certificationJustificatif.upsert({
      where: { compteId_formationId: { compteId, formationId: f.id } },
      update: {},
      create: {
        compteId,
        blocCode: f.certifBlocCode,
        actionTitre: f.certifActionTitre ?? f.titre,
        typeDocument: "Attestation de participation",
        url: `/api/pdf/attestation/${insc.id}`,
        source: "PLATEFORME",
        formationId: f.id,
        dateAction: f.date,
      },
    });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const compte = await getOrCreateCompte(session.user.id);
  await syncJustificatifsPlateforme(session.user.id, compte.id);

  const [blocs, justificatifs] = await Promise.all([
    prisma.certificationBloc.findMany({
      orderBy: { ordre: "asc" },
      include: {
        actions: {
          where: { OR: [{ specialite: null }, { specialite: compte.specialite ?? "__none__" }] },
        },
      },
    }),
    prisma.certificationJustificatif.findMany({
      where: { compteId: compte.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, blocCode: true, actionTitre: true, typeDocument: true,
        fichierNom: true, url: true, source: true, formationId: true,
        dateAction: true, createdAt: true, fichierBase64: true,
      },
    }),
  ]);

  return NextResponse.json({
    compte: { specialite: compte.specialite, anneeDES: compte.anneeDES },
    blocs: blocs.map((b) => ({ ...b, exemples: b.exemples ?? [], justificatifs: b.justificatifs ?? [] })),
    justificatifs: justificatifs.map((j) => ({
      id: j.id,
      blocCode: j.blocCode,
      actionTitre: j.actionTitre,
      typeDocument: j.typeDocument,
      fichierNom: j.fichierNom,
      hasFichier: !!j.fichierBase64,
      url: j.url,
      source: j.source,
      formationId: j.formationId,
      dateAction: j.dateAction?.toISOString() ?? null,
      createdAt: j.createdAt.toISOString(),
    })),
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json() as { specialite?: string; anneeDES?: number | null };
  const data: Record<string, unknown> = {};
  if (body.specialite !== undefined) data.specialite = body.specialite || null;
  if (body.anneeDES !== undefined) {
    if (body.anneeDES !== null && (body.anneeDES < 1950 || body.anneeDES > new Date().getFullYear() + 1)) {
      return NextResponse.json({ error: "Année de DES invalide" }, { status: 400 });
    }
    data.anneeDES = body.anneeDES;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour" }, { status: 400 });
  }

  const compte = await getOrCreateCompte(session.user.id);
  const updated = await prisma.certificationCompte.update({
    where: { id: compte.id },
    data,
    select: { specialite: true, anneeDES: true },
  });
  return NextResponse.json(updated);
}
