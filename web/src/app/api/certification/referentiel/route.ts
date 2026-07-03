import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const blocs = await prisma.certificationBloc.findMany({
    orderBy: { ordre: "asc" },
    include: { actions: true },
  });

  return NextResponse.json({
    blocs: blocs.map((b) => ({
      code: b.code,
      ordre: b.ordre,
      titre: b.titre,
      emoji: b.emoji,
      couleur: b.couleur,
      exemples: b.exemples ?? [],
      actions: b.actions,
    })),
  });
}
