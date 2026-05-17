import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const formation = await prisma.formation.findUnique({
    where: { id },
    select: { sessionSlidesBase64: true },
  });

  if (!formation?.sessionSlidesBase64) {
    return NextResponse.json({ error: "Aucun diaporama" }, { status: 404 });
  }

  const binary = Buffer.from(formation.sessionSlidesBase64, "base64");
  return new NextResponse(binary, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-cache",
    },
  });
}
