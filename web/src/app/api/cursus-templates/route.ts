import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess, peutGerer } from "@/lib/cursus";

// GET : liste des modèles de DU du formateur connecté (pour "Partir d'un modèle" à la création)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const profile = await prisma.formateurProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!profile) return NextResponse.json({ templates: [] });

  const templates = await prisma.cursusTemplate.findMany({
    where: { formateurId: profile.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, nom: true, specialite: true, description: true, createdAt: true },
  });
  return NextResponse.json({ templates });
}

// POST : "Enregistrer comme modèle" — capture la structure d'un cursus existant
// (comité, contact, émargement, blocs de validation) sans les notes ni les dates.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const profile = await prisma.formateurProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!profile) return NextResponse.json({ error: "Profil formateur introuvable" }, { status: 404 });

  const body = await req.json();
  const { cursusId, nom } = body as { cursusId?: string; nom?: string };
  if (!cursusId || !nom?.trim()) return NextResponse.json({ error: "cursusId et nom requis" }, { status: 400 });

  const { cursus, role } = await getCursusAccess(cursusId, session.user.id);
  if (!cursus || !peutGerer(role)) return NextResponse.json({ error: "Réservé au coordinateur ou à la secrétaire pédagogique" }, { status: 403 });

  const modules = await prisma.cursusValidationModule.findMany({
    where: { cursusId },
    select: { type: true, intitule: true, infos: true, coefficient: true, noteMax: true, seuilValidation: true },
    orderBy: { createdAt: "asc" },
  });

  const template = await prisma.cursusTemplate.create({
    data: {
      formateurId: profile.id,
      nom: nom.trim(),
      specialite: cursus.specialite || null,
      description: cursus.description || null,
      emargementMode: cursus.emargementMode,
      organisateursTexte: cursus.organisateursTexte,
      contactNom: cursus.contactNom,
      contactEmail: cursus.contactEmail,
      contactTelephone: cursus.contactTelephone,
      certifBlocCode: cursus.certifBlocCode,
      certifActionTitre: cursus.certifActionTitre,
      modulesValidation: modules,
    },
    select: { id: true },
  });

  return NextResponse.json({ id: template.id }, { status: 201 });
}
