import { NextRequest } from "next/server";
import React from "react";
import { renderPdf, pdfResponse } from "@/lib/pdf/render";
import { getCompanySettings, getFormationData } from "@/lib/pdf/db-helpers";
import { PvFormationPdf } from "@/lib/pdf/templates/pv-formation";
import { prisma } from "@/lib/prisma";
import type { EmargementData } from "@/lib/pdf/shared/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ formationId: string; emargementId: string }> }
) {
  const { formationId, emargementId } = await params;

  const [company, data, emargement, allEmargements] = await Promise.all([
    getCompanySettings(),
    getFormationData(formationId),
    prisma.emargement.findUnique({
      where: { id: emargementId },
      include: {
        inscription: {
          include: {
            participant: {
              include: { user: { select: { name: true, email: true } } },
            },
          },
        },
      },
    }),
    prisma.emargement.findMany({
      where: { formationId },
      include: {
        inscription: {
          include: { participant: { include: { user: true } } },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  if (!data) return new Response("Formation introuvable", { status: 404 });
  if (!emargement) return new Response("Émargement introuvable", { status: 404 });

  const emargementsData: EmargementData[] = allEmargements.map((e) => ({
    participant: {
      nom: e.inscription.participant.user.name ?? "Participant",
      titre: e.inscription.participant.titre,
      specialite: e.inscription.participant.specialite,
      rpps: e.inscription.participant.rpps,
      email: e.inscription.participant.user.email,
    },
    presentMatin: e.presentMatin,
    presentApresMidi: e.presentApresMidi,
    signatureMatin: e.signatureMatin?.toISOString() ?? null,
    signatureApresMidi: e.signatureApresMidi?.toISOString() ?? null,
  }));

  // Load participant signature
  const participantProfile = emargement.inscription.participant;
  const participantSignatureBase64 = emargement.pvParticipantSignatureBase64 ?? null;
  const participantNomComplet = participantProfile.user.name ?? "Participant";
  const pvParticipantSignedAt = emargement.pvParticipantSignedAt?.toISOString() ?? null;

  const buffer = await renderPdf(
    React.createElement(PvFormationPdf, {
      company,
      formateur: data.formateur,
      formation: data.formation,
      emargements: emargementsData,
      participantSignatureBase64,
      participantNomComplet,
      pvParticipantSignedAt,
    })
  );

  return pdfResponse(buffer, `pv-${formationId}-${emargementId}.pdf`);
}
