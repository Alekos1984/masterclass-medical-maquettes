import { NextRequest } from "next/server";
import React from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderPdf, pdfResponse } from "@/lib/pdf/render";
import { getCompanySettings } from "@/lib/pdf/db-helpers";
import { AssiduitePdf } from "@/lib/pdf/templates/assiduite";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cursusId: string; participantId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Non autorisé", { status: 401 });

  const { cursusId, participantId } = await params;
  const [company, cursus, participant] = await Promise.all([
    getCompanySettings(),
    prisma.cursus.findUnique({
      where: { id: cursusId },
      include: {
        coordinateur: { include: { user: { select: { name: true } } } },
        journees: { orderBy: { date: "asc" }, select: { id: true, date: true } },
      },
    }),
    prisma.participantProfile.findUnique({
      where: { id: participantId },
      include: { user: { select: { name: true, id: true } } },
    }),
  ]);
  if (!cursus || !participant) return new Response("Introuvable", { status: 404 });

  // Accès : l'étudiant lui-même, ou le coordinateur du cursus
  const profile = await prisma.formateurProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  const estCoordinateur = profile?.id === cursus.coordinateurId;
  const estEtudiant = participant.user?.id === session.user.id;
  if (!estCoordinateur && !estEtudiant && session.user.role !== "ADMIN") {
    return new Response("Non autorisé", { status: 403 });
  }

  const emargements = await prisma.emargement.findMany({
    where: {
      formationId: { in: cursus.journees.map((j) => j.id) },
      inscription: { participantId },
    },
    select: { formationId: true, presentMatin: true, presentApresMidi: true },
  });
  const parJournee = new Map(emargements.map((e) => [e.formationId, e]));

  const journees = cursus.journees.map((j) => {
    const e = parJournee.get(j.id);
    return {
      dateStr: j.date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      matin: e?.presentMatin ?? false,
      apresMidi: e?.presentApresMidi ?? false,
    };
  });
  const demiJournees = journees.length * 2;
  const presences = journees.reduce((s, j) => s + (j.matin ? 1 : 0) + (j.apresMidi ? 1 : 0), 0);

  const buffer = await renderPdf(
    React.createElement(AssiduitePdf, {
      company,
      data: {
        etudiantNom: participant.user?.name ?? "—",
        cursusTitre: cursus.titre,
        annee: cursus.annee,
        coordinateurNom: cursus.coordinateur.user?.name ?? "—",
        journees,
        tauxPresence: demiJournees > 0 ? Math.round((presences / demiJournees) * 100) : 0,
      },
    })
  );
  return pdfResponse(buffer, `assiduite-${cursus.slug}.pdf`);
}
