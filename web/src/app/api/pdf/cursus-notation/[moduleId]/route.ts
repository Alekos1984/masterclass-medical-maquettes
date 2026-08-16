import { NextRequest } from "next/server";
import React from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderPdf, pdfResponse } from "@/lib/pdf/render";
import { getCompanySettings } from "@/lib/pdf/db-helpers";
import { NotationPdf } from "@/lib/pdf/templates/notation";

// Accessible uniquement au coordinateur du cursus (ou admin)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Non autorisé", { status: 401 });

  const { moduleId } = await params;
  const mod = await prisma.cursusValidationModule.findUnique({
    where: { id: moduleId },
    include: {
      cursus: { include: { coordinateur: { include: { user: { select: { name: true } } } } } },
      notes: true,
    },
  });
  if (!mod) return new Response("Module introuvable", { status: 404 });

  const profile = await prisma.formateurProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  const estCoord = profile?.id === mod.cursus.coordinateurId;
  if (!estCoord && session.user.role !== "ADMIN") return new Response("Non autorisé", { status: 403 });

  const journees = await prisma.formation.findMany({ where: { cursusId: mod.cursusId }, select: { id: true } });
  const inscriptions = await prisma.inscription.findMany({
    where: { formationId: { in: journees.map((j) => j.id) }, statut: "CONFIRMEE" },
    select: { participantId: true, participant: { include: { user: { select: { name: true, email: true } } } } },
    distinct: ["participantId"],
    orderBy: { participant: { user: { name: "asc" } } },
  });
  const notesById = new Map(mod.notes.map((n) => [n.participantId, n]));

  const [company] = await Promise.all([getCompanySettings()]);
  const buffer = await renderPdf(
    React.createElement(NotationPdf, {
      company,
      data: {
        cursusTitre: mod.cursus.titre,
        cursusAnnee: mod.cursus.annee,
        moduleIntitule: mod.intitule,
        moduleType: mod.type,
        dateEpreuve: mod.dateEpreuve?.toISOString() ?? null,
        noteMax: mod.noteMax,
        seuilValidation: mod.seuilValidation,
        coordinateurNom: mod.cursus.coordinateur.user?.name ?? "—",
        clotureAt: (mod.clotureAt ?? new Date()).toISOString(),
        lignes: inscriptions.map((i) => {
          const n = notesById.get(i.participantId);
          return {
            nom: i.participant.user?.name ?? "—",
            email: i.participant.user?.email ?? "—",
            note: n?.note ?? null,
            commentaire: n?.commentaire ?? "",
          };
        }),
      },
    })
  );
  return pdfResponse(buffer, `notation-${mod.intitule.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`);
}
