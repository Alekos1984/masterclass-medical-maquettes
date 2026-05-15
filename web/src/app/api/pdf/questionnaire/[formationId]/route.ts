import { NextRequest } from "next/server";
import React from "react";
import { renderPdf, pdfResponse } from "@/lib/pdf/render";
import { getCompanySettings, getFormationData } from "@/lib/pdf/db-helpers";
import { QuestionnairePdf } from "@/lib/pdf/templates/questionnaire";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ formationId: string }> }
) {
  const { formationId } = await params;

  const [company, data] = await Promise.all([
    getCompanySettings(),
    getFormationData(formationId),
  ]);

  if (!data) return new Response("Formation introuvable", { status: 404 });

  const buffer = await renderPdf(
    React.createElement(QuestionnairePdf, {
      company,
      formation: data.formation,
    })
  );

  return pdfResponse(buffer, `questionnaire-${formationId}.pdf`);
}
