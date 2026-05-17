import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ formationId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { formationId } = await params;

  const formation = await prisma.formation.findUnique({
    where: { id: formationId },
    select: {
      sessionStatus: true,
      sessionCurrentPage: true,
      sessionSlidesBase64: true,
      modaliteSession: true,
      titre: true,
      description: true,
      objectifs: true,
      programme: true,
      ressources: {
        orderBy: { createdAt: "asc" },
        select: { id: true, nom: true, url: true, taille: true, fileBase64: false },
      },
      _count: { select: { questions: { where: { lue: false } } } },
    },
  });

  if (!formation) return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });

  return NextResponse.json({
    sessionStatus: formation.sessionStatus,
    currentPage: formation.sessionCurrentPage ?? 1,
    hasSlides: !!formation.sessionSlidesBase64,
    modaliteSession: formation.modaliteSession ?? "PRESENTIEL",
    titre: formation.titre,
    description: formation.description,
    objectifs: formation.objectifs,
    programme: formation.programme,
    ressources: formation.ressources,
    pendingQuestions: formation._count.questions,
  });
}
