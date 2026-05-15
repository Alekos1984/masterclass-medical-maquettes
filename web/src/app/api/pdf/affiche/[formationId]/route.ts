import { NextRequest } from "next/server";
import React from "react";
import { renderPdf, pdfResponse } from "@/lib/pdf/render";
import { getCompanySettings, getFormationData } from "@/lib/pdf/db-helpers";
import { AffichePdf } from "@/lib/pdf/templates/affiche";
import { genererMarketing } from "@/lib/ai/marketing";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ formationId: string }> }
) {
  const { formationId } = await params;
  const useAI = req.nextUrl.searchParams.get("ai") !== "false";

  const [company, data] = await Promise.all([
    getCompanySettings(),
    getFormationData(formationId),
  ]);

  if (!data) return new Response("Formation introuvable", { status: 404 });

  let marketingText;
  if (useAI && process.env.OPENAI_API_KEY) {
    const { formation, formateur } = data;
    const marketing = await genererMarketing(
      formation.titre,
      formation.specialite,
      formation.description,
      formation.objectifs,
      formateur.nom,
      formation.date,
      formation.lieuVille,
      formation.prixHT
    );
    marketingText = { headline: marketing.headline, accroche: marketing.accroche };
  }

  const registrationUrl = `${process.env.NEXTAUTH_URL ?? "https://masterclassmedical.fr"}/formations/${data.formation.id}`;

  const buffer = await renderPdf(
    React.createElement(AffichePdf, {
      company,
      formateur: data.formateur,
      formation: data.formation,
      marketingText,
      registrationUrl,
    })
  );

  return pdfResponse(buffer, `affiche-${formationId}.pdf`);
}
