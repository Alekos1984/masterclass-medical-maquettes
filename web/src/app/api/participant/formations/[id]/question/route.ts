import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;

  const profil = await prisma.participantProfile.findUnique({ where: { userId: session.user.id } });
  if (!profil) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  // Verify participant is enrolled and confirmed
  const inscription = await prisma.inscription.findFirst({
    where: { formationId: id, participantId: profil.id, statut: "CONFIRMEE" },
  });
  if (!inscription) return NextResponse.json({ error: "Inscription introuvable" }, { status: 404 });

  const { texte } = await req.json() as { texte: string };
  if (!texte || texte.trim().length < 3) {
    return NextResponse.json({ error: "Question trop courte" }, { status: 400 });
  }

  const question = await prisma.question.create({
    data: { formationId: id, participantId: profil.id, texte: texte.trim() },
    select: { id: true, texte: true, createdAt: true },
  });

  return NextResponse.json(question);
}
