import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST : accepter l'invitation (nécessite un compte formateur connecté)
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Connectez-vous d'abord" }, { status: 401 });

  const { token } = await params;
  const enseignant = await prisma.cursusEnseignant.findUnique({
    where: { inviteToken: token },
    include: { cursus: { select: { id: true, titre: true } } },
  });
  if (!enseignant) return NextResponse.json({ error: "Invitation introuvable ou expirée" }, { status: 404 });

  const profile = await prisma.formateurProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!profile) return NextResponse.json({ error: "Un compte formateur est requis pour enseigner" }, { status: 403 });

  await prisma.cursusEnseignant.update({
    where: { id: enseignant.id },
    data: { formateurId: profile.id, statut: "ACCEPTE" },
  });

  return NextResponse.json({ cursusId: enseignant.cursus.id });
}

// GET : infos de l'invitation (pour la page publique)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const enseignant = await prisma.cursusEnseignant.findUnique({
    where: { inviteToken: token },
    include: {
      cursus: {
        select: {
          titre: true, annee: true, specialite: true,
          coordinateur: { include: { user: { select: { name: true } } } },
          journees: { select: { date: true }, orderBy: { date: "asc" } },
        },
      },
    },
  });
  if (!enseignant) return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 });

  return NextResponse.json({
    email: enseignant.email,
    nom: enseignant.nom,
    statut: enseignant.statut,
    cursusTitre: enseignant.cursus.titre,
    annee: enseignant.cursus.annee,
    coordinateurNom: enseignant.cursus.coordinateur.user?.name ?? "—",
    nbJournees: enseignant.cursus.journees.length,
  });
}
