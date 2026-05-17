import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Serve a specific resource file for download
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ formationId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { formationId } = await params;
  const ressourceId = req.nextUrl.searchParams.get("id");

  if (!ressourceId) {
    // Return list (no file content for listing)
    const ressources = await prisma.ressource.findMany({
      where: { formationId },
      select: { id: true, nom: true, url: true, taille: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(ressources);
  }

  const r = await prisma.ressource.findUnique({
    where: { id: ressourceId },
    select: { formationId: true, nom: true, fileBase64: true, url: true },
  });

  if (!r || r.formationId !== formationId) {
    return NextResponse.json({ error: "Ressource introuvable" }, { status: 404 });
  }

  if (r.url) return NextResponse.redirect(r.url);
  if (!r.fileBase64) return NextResponse.json({ error: "Fichier manquant" }, { status: 404 });

  const binary = Buffer.from(r.fileBase64, "base64");
  return new NextResponse(binary, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(r.nom)}"`,
    },
  });
}
