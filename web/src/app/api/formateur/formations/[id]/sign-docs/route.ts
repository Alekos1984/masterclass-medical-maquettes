import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const profil = await prisma.formateurProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, signatureBase64: true },
  });
  if (!profil) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const formation = await prisma.formation.findUnique({
    where: { id },
    select: { formateurId: true, signatureFormateurSnap: true },
  });
  if (!formation || formation.formateurId !== profil.id) {
    return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });
  }

  const body = await req.json() as {
    docs: Array<"pv" | "bilan" | "certificat" | "emargement"> | "all";
    signatureBase64?: string;
  };
  const { docs, signatureBase64: signatureFromBody } = body;

  // Resolve signature: from request > from profile > existing snap
  const resolvedSignature =
    signatureFromBody ||
    profil.signatureBase64 ||
    formation.signatureFormateurSnap ||
    null;

  const list = docs === "all" ? ["pv", "bilan", "certificat"] : docs;
  const now = new Date();
  const data: Record<string, unknown> = {};
  if (list.includes("pv")) { data.pvSigne = true; data.pvSigneAt = now; }
  if (list.includes("bilan")) { data.bilanSigne = true; data.bilanSigneAt = now; }
  if (list.includes("certificat")) { data.certificatSigne = true; data.certificatSigneAt = now; }
  if (list.includes("emargement")) { data.emargementSigne = true; data.emargementSigneAt = now; }

  // Always save signature snapshot if we have one
  if (resolvedSignature) {
    data.signatureFormateurSnap = resolvedSignature;
    // Also save back to profile for future use
    if (!profil.signatureBase64 && resolvedSignature) {
      await prisma.formateurProfile.update({
        where: { id: profil.id },
        data: { signatureBase64: resolvedSignature },
      });
    }
  }

  const updated = await prisma.formation.update({
    where: { id },
    data,
    select: {
      pvSigne: true,
      pvSigneAt: true,
      bilanSigne: true,
      bilanSigneAt: true,
      certificatSigne: true,
      certificatSigneAt: true,
      emargementSigne: true,
      emargementSigneAt: true,
      signatureFormateurSnap: true,
    },
  });

  return NextResponse.json({
    ...updated,
    pvSigneAt: updated.pvSigneAt?.toISOString() ?? null,
    bilanSigneAt: updated.bilanSigneAt?.toISOString() ?? null,
    certificatSigneAt: updated.certificatSigneAt?.toISOString() ?? null,
    emargementSigneAt: updated.emargementSigneAt?.toISOString() ?? null,
  });
}
