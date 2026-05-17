import { NextRequest } from "next/server";
import React from "react";
import { auth } from "@/lib/auth";
import { renderPdf, pdfResponse } from "@/lib/pdf/render";
import { getCompanySettings, getFormationData } from "@/lib/pdf/db-helpers";
import { AffichePdf } from "@/lib/pdf/templates/affiche";
import { genererMarketing } from "@/lib/ai/marketing";

const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB base64 ≈ 6 MB binary

function validateImageBase64(dataUrl: string): boolean {
  if (!dataUrl.startsWith("data:image/")) return false;
  const mimeMatch = dataUrl.match(/^data:(image\/[a-z]+);base64,/);
  if (!mimeMatch || !ALLOWED_MIME.has(mimeMatch[1])) return false;
  if (dataUrl.length > MAX_IMAGE_BYTES) return false;

  const b64 = dataUrl.split(",")[1];
  if (!b64) return false;
  const buf = Buffer.from(b64.slice(0, 16), "base64");

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  // PNG: 89 50 4E 47
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true;
  // WEBP: RIFF....WEBP
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return true;

  return false;
}

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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ formationId: string }> }
) {
  const { formationId } = await params;

  const session = await auth();
  if (!session?.user?.id) return new Response("Non authentifié", { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return new Response("Corps invalide", { status: 400 });

  const { titre, description, infoPratiques, imageBase64 } = body as {
    titre?: string;
    description?: string;
    infoPratiques?: string;
    imageBase64?: string;
  };

  // Validate image server-side
  if (imageBase64 !== undefined && imageBase64 !== null && imageBase64 !== "") {
    if (!validateImageBase64(imageBase64)) {
      return new Response("Image invalide ou format non supporté (JPEG, PNG, WEBP uniquement, max 6 Mo)", { status: 422 });
    }
  }

  const [company, data] = await Promise.all([
    getCompanySettings(),
    getFormationData(formationId),
  ]);

  if (!data) return new Response("Formation introuvable", { status: 404 });

  const formation = {
    ...data.formation,
    ...(titre ? { titre } : {}),
    ...(description ? { description } : {}),
  };

  const registrationUrl = `${process.env.NEXTAUTH_URL ?? "https://masterclassmedical.fr"}/formations/${data.formation.id}`;

  const buffer = await renderPdf(
    React.createElement(AffichePdf, {
      company,
      formateur: data.formateur,
      formation,
      registrationUrl,
      imageBase64: imageBase64 || null,
      infoPratiques: infoPratiques || null,
    })
  );

  return pdfResponse(buffer, `affiche-${formationId}.pdf`);
}
