import { NextRequest } from "next/server";
import React from "react";
import QRCode from "qrcode";
import { auth } from "@/lib/auth";
import { renderPdf, pdfResponse } from "@/lib/pdf/render";
import { getCompanySettings, getFormationData } from "@/lib/pdf/db-helpers";
import { AffichePdf } from "@/lib/pdf/templates/affiche";

const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function validateImageBase64(dataUrl: string): boolean {
  if (!dataUrl.startsWith("data:image/")) return false;
  const mimeMatch = dataUrl.match(/^data:(image\/[a-z]+);base64,/);
  if (!mimeMatch || !ALLOWED_MIME.has(mimeMatch[1])) return false;
  if (dataUrl.length > MAX_IMAGE_BYTES) return false;
  const b64 = dataUrl.split(",")[1];
  if (!b64) return false;
  const buf = Buffer.from(b64.slice(0, 16), "base64");
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true;
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return true;
  return false;
}

async function buildAffiche(
  data: NonNullable<Awaited<ReturnType<typeof getFormationData>>>,
  company: Awaited<ReturnType<typeof getCompanySettings>>,
  opts: { titre?: string; description?: string; infoPratiques?: string; imageBase64?: string | null; couleur?: string | null }
) {
  const registrationUrl = `${process.env.NEXTAUTH_URL ?? "https://masterclassmedical.fr"}/formations/${data.formation.id}`;

  const qrCodeDataUrl = await QRCode.toDataURL(registrationUrl, {
    width: 200,
    margin: 1,
    color: { dark: "#0F0F0F", light: "#FFFFFF" },
  });

  const formation = {
    ...data.formation,
    ...(opts.titre ? { titre: opts.titre } : {}),
    ...(opts.description ? { description: opts.description } : {}),
  };

  return renderPdf(
    React.createElement(AffichePdf, {
      company,
      formateur: data.formateur,
      formation,
      registrationUrl,
      imageBase64: opts.imageBase64 ?? null,
      infoPratiques: opts.infoPratiques ?? null,
      couleur: opts.couleur ?? "red",
      qrCodeDataUrl,
    })
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ formationId: string }> }
) {
  const { formationId } = await params;
  try {
    const [company, data] = await Promise.all([getCompanySettings(), getFormationData(formationId)]);
    if (!data) return new Response("Formation introuvable", { status: 404 });
    const buffer = await buildAffiche(data, company, {});
    return pdfResponse(buffer, `affiche-${formationId}.pdf`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[affiche GET]", msg);
    return new Response(`Erreur génération PDF : ${msg}`, { status: 500 });
  }
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

  const { titre, description, infoPratiques, imageBase64, couleur } = body as {
    titre?: string;
    description?: string;
    infoPratiques?: string;
    imageBase64?: string;
    couleur?: string;
  };

  if (imageBase64) {
    if (!validateImageBase64(imageBase64)) {
      return new Response("Image invalide (JPEG, PNG, WEBP uniquement, max 6 Mo)", { status: 422 });
    }
  }

  try {
    const [company, data] = await Promise.all([getCompanySettings(), getFormationData(formationId)]);
    if (!data) return new Response("Formation introuvable", { status: 404 });

    const buffer = await buildAffiche(data, company, { titre, description, infoPratiques, imageBase64, couleur });
    return pdfResponse(buffer, `affiche-${formationId}.pdf`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[affiche POST]", msg);
    return new Response(`Erreur génération PDF : ${msg}`, { status: 500 });
  }
}
