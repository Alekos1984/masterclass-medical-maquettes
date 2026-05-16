import { NextRequest } from "next/server";
import React from "react";
import { renderPdf, pdfResponse } from "@/lib/pdf/render";
import { getCompanySettings, getFormationData } from "@/lib/pdf/db-helpers";
import { BilanPedagogiquePdf } from "@/lib/pdf/templates/bilan-pedagogique";
import { computeDocSeal } from "@/lib/pdf/seal";
import { lockPdf } from "@/lib/pdf/encrypt";
import { genererBilan } from "@/lib/ai/bilan";
import { prisma } from "@/lib/prisma";
import type { SatisfactionData } from "@/lib/pdf/shared/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ formationId: string }> }
) {
  const { formationId } = await params;
  const useAI = req.nextUrl.searchParams.get("ai") !== "false";

  const [company, data, satisfactions] = await Promise.all([
    getCompanySettings(),
    getFormationData(formationId),
    prisma.satisfactionReponse.findMany({ where: { formationId } }),
  ]);

  if (!data) return new Response("Formation introuvable", { status: 404 });

  if (data.formation.bilanSigne && data.formation.bilanSigneAt) {
    data.formation.documentSeal = computeDocSeal(formationId, "bilan", data.formation.bilanSigneAt);
  }

  const reponsesData: SatisfactionData[] = satisfactions.map((s) => ({
    noteContenu: s.noteContenu,
    noteFormateur: s.noteFormateur,
    noteOrganisation: s.noteOrganisation,
    noteSupport: s.noteSupport,
    noteGlobal: s.noteGlobal,
    objectifsAtteints: s.objectifsAtteints,
    recommanderait: s.recommanderait,
    pointsForts: s.pointsForts,
    pointsAmelioration: s.pointsAmelioration,
    commentaireLibre: s.commentaireLibre,
  }));

  let texteAnalyse;
  if (useAI && process.env.OPENAI_API_KEY) {
    texteAnalyse = await genererBilan(
      data.formation.titre,
      data.formation.objectifs,
      reponsesData
    );
  }

  let buffer = await renderPdf(
    React.createElement(BilanPedagogiquePdf, {
      company,
      formateur: data.formateur,
      formation: data.formation,
      reponses: reponsesData,
      texteAnalyse,
    })
  );

  if (data.formation.bilanSigne) {
    buffer = await lockPdf(buffer);
  }

  return pdfResponse(buffer, `bilan-${formationId}.pdf`);
}
