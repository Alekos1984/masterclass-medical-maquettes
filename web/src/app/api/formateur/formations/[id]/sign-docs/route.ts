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

  const profil = await prisma.formateurProfile.findUnique({ where: { userId: session.user.id } });
  if (!profil) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const formation = await prisma.formation.findUnique({ where: { id }, select: { formateurId: true } });
  if (!formation || formation.formateurId !== profil.id) {
    return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });
  }

  const { docs } = await req.json() as { docs: Array<"pv" | "bilan" | "certificat"> | "all" };
  const list = docs === "all" ? ["pv", "bilan", "certificat"] : docs;
  const now = new Date();
  const data: Record<string, unknown> = {};
  if (list.includes("pv")) { data.pvSigne = true; data.pvSigneAt = now; }
  if (list.includes("bilan")) { data.bilanSigne = true; data.bilanSigneAt = now; }
  if (list.includes("certificat")) { data.certificatSigne = true; data.certificatSigneAt = now; }

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
    },
  });

  return NextResponse.json(updated);
}
