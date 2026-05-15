import { NextRequest } from "next/server";
import React from "react";
import { renderPdf, pdfResponse } from "@/lib/pdf/render";
import { getCompanySettings, getFormationData } from "@/lib/pdf/db-helpers";
import { ProgrammePdf } from "@/lib/pdf/templates/programme";

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
    React.createElement(ProgrammePdf, {
      company,
      formateur: data.formateur,
      formation: data.formation,
    })
  );

  return pdfResponse(buffer, `programme-${formationId}.pdf`);
}
