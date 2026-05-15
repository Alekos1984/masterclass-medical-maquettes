import { NextRequest } from "next/server";
import React from "react";
import { renderPdf, pdfResponse } from "@/lib/pdf/render";
import { getCompanySettings, getFormationData } from "@/lib/pdf/db-helpers";
import { FeuillePresencePdf } from "@/lib/pdf/templates/feuille-presence";
import { prisma } from "@/lib/prisma";
import type { EmargementData } from "@/lib/pdf/shared/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ formationId: string }> }
) {
  const { formationId } = await params;

  const [company, data, emargements] = await Promise.all([
    getCompanySettings(),
    getFormationData(formationId),
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

  const emargementsData: EmargementData[] = emargements.map((e) => ({
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

  const buffer = await renderPdf(
    React.createElement(FeuillePresencePdf, {
      company,
      formateur: data.formateur,
      formation: data.formation,
      emargements: emargementsData,
    })
  );

  return pdfResponse(buffer, `presence-${formationId}.pdf`);
}
