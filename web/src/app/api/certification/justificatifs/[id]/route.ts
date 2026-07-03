import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const justificatif = await prisma.certificationJustificatif.findUnique({
    where: { id },
    select: { fichierBase64: true, fichierNom: true, compte: { select: { userId: true } } },
  });
  if (!justificatif || justificatif.compte.userId !== session.user.id) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  if (!justificatif.fichierBase64) {
    return NextResponse.json({ error: "Aucun fichier attaché" }, { status: 404 });
  }

  const buffer = Buffer.from(justificatif.fichierBase64, "base64");
  const nom = justificatif.fichierNom ?? "justificatif";
  const ext = nom.split(".").pop()?.toLowerCase() ?? "";
  const contentType =
    ext === "pdf" ? "application/pdf"
    : ext === "png" ? "image/png"
    : ext === "jpg" || ext === "jpeg" ? "image/jpeg"
    : "application/octet-stream";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(nom)}"`,
    },
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const justificatif = await prisma.certificationJustificatif.findUnique({
    where: { id },
    select: { source: true, compte: { select: { userId: true } } },
  });
  if (!justificatif || justificatif.compte.userId !== session.user.id) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  if (justificatif.source === "PLATEFORME") {
    return NextResponse.json({ error: "Ce justificatif est généré automatiquement par la plateforme et ne peut pas être supprimé." }, { status: 400 });
  }

  await prisma.certificationJustificatif.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
