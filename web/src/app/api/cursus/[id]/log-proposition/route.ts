import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess, peutGerer } from "@/lib/cursus";

// POST : journalise dans l'onglet Messages qu'une proposition de créneau a été
// copiée (pour envoi manuel) — le cas "envoyée via la plateforme" est journalisé
// directement par /api/cursus/[id]/proposer-creneau. Pas d'email envoyé ici, pour
// ne pas notifier toute l'équipe à chaque copie.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });
  if (!peutGerer(role)) return NextResponse.json({ error: "Réservé au coordinateur ou à la secrétaire pédagogique" }, { status: 403 });

  const body = await req.json() as { enseignantId?: string; mode?: "envoye" | "copie"; message?: string };
  const enseignant = cursus.enseignants.find((e) => e.id === body.enseignantId);
  if (!enseignant) return NextResponse.json({ error: "Enseignant introuvable" }, { status: 404 });
  if (!body.message?.trim()) return NextResponse.json({ error: "Message vide" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true } });
  const label = body.mode === "envoye" ? "📧 Proposition envoyée" : "📋 Message copié";

  const message = await prisma.cursusMessage.create({
    data: {
      cursusId: id,
      auteurEmail: user?.email ?? "—",
      auteurNom: user?.name ?? "—",
      texte: `${label} à ${enseignant.nom ?? enseignant.email} (${enseignant.email}) :\n\n${body.message.trim().slice(0, 4000)}`,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
