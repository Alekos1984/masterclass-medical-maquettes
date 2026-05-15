import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUTS = ["BROUILLON", "EN_ATTENTE_SALLE", "SALLE_CONFIRMEE", "PUBLIEE", "COMPLETE", "ANNULEE"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { statut } = body;

  if (!statut || !VALID_STATUTS.includes(statut)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const formation = await prisma.formation.update({
    where: { id },
    data: { statut },
    select: { id: true, statut: true },
  });

  return NextResponse.json(formation);
}
