import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cursusSlugify, uniqueCursusSlug, computeAlertes } from "@/lib/cursus";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const [profile, user] = await Promise.all([
    prisma.formateurProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true } }),
  ]);
  if (!profile) return NextResponse.json({ error: "Profil formateur introuvable" }, { status: 404 });

  const [coordonnes, memberships] = await Promise.all([
    prisma.cursus.findMany({
      where: { coordinateurId: profile.id },
      include: { journees: { select: { id: true, date: true } }, enseignants: { select: { id: true, statut: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.cursusEnseignant.findMany({
      where: { OR: [{ formateurId: profile.id }, { email: user?.email ?? "__none__" }] },
      include: {
        cursus: {
          include: { journees: { select: { id: true, date: true } }, coordinateur: { include: { user: { select: { name: true } } } } },
        },
      },
    }),
  ]);

  // Tableau de bord multi-DU : alertes, échéance de notation, taux de remplissage — pour chaque DU coordonné.
  const coordonnesEnrichis = await Promise.all(
    coordonnes.map(async (c) => {
      const [alertes, prochainModule, nbEtudiants] = await Promise.all([
        computeAlertes(c.id),
        prisma.cursusValidationModule.findFirst({
          where: { cursusId: c.id, cloture: false, dateEpreuve: { not: null } },
          orderBy: { dateEpreuve: "asc" },
          select: { intitule: true, dateEpreuve: true },
        }),
        prisma.inscription.findMany({
          where: { formationId: { in: c.journees.map((j) => j.id) }, statut: "CONFIRMEE" },
          distinct: ["participantId"],
          select: { participantId: true },
        }).then((r) => r.length),
      ]);

      const nbAlertes = alertes
        ? alertes.creneauxSansEnseignant.length + alertes.supportsManquants.length + alertes.conflits.length + alertes.invitationsEnAttente.length
        : 0;

      return {
        id: c.id, titre: c.titre, statut: c.statut, annee: c.annee, publique: c.publique,
        nbJournees: c.journees.length,
        nbEnseignants: c.enseignants.length,
        enAttente: c.enseignants.filter((e) => e.statut === "EN_ATTENTE").length,
        prochaineDate: c.journees.map((j) => j.date).filter((d) => d >= new Date()).sort((a, b) => a.getTime() - b.getTime())[0] ?? null,
        nbAlertes,
        prochaineEcheanceNotation: prochainModule ? { intitule: prochainModule.intitule, date: prochainModule.dateEpreuve } : null,
        nbEtudiants,
        capaciteMax: c.capaciteMax,
        tauxRemplissage: c.capaciteMax ? Math.round((nbEtudiants / c.capaciteMax) * 100) : null,
      };
    })
  );

  return NextResponse.json({
    coordonnes: coordonnesEnrichis,
    enseignes: memberships
      .filter((m) => m.cursus.coordinateurId !== profile.id)
      .map((m) => ({
        id: m.cursus.id, titre: m.cursus.titre, statut: m.cursus.statut, annee: m.cursus.annee,
        coordinateurNom: m.cursus.coordinateur.user?.name ?? "—",
        nbJournees: m.cursus.journees.length,
        invitationEnAttente: m.statut === "EN_ATTENTE",
        inviteToken: m.statut === "EN_ATTENTE" ? m.inviteToken : null,
      })),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const profile = await prisma.formateurProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!profile) return NextResponse.json({ error: "Profil formateur introuvable" }, { status: 404 });

  const body = await req.json();
  const { titre, description, specialite, annee, publique, inscriptionMode, prixHT, lieuNom, lieuAdresse, lieuVille, certifBlocCode, certifActionTitre, templateId } = body;
  if (!titre?.trim()) return NextResponse.json({ error: "Titre obligatoire" }, { status: 400 });

  const template = templateId
    ? await prisma.cursusTemplate.findFirst({ where: { id: templateId, formateurId: profile.id } })
    : null;

  const slug = await uniqueCursusSlug(cursusSlugify(titre));
  const cursus = await prisma.cursus.create({
    data: {
      slug,
      titre: titre.trim(),
      description: description ?? "",
      specialite: specialite ?? "",
      annee: annee || null,
      publique: !!publique,
      inscriptionMode: inscriptionMode === "PAYANT" ? "PAYANT" : "IMPORT",
      prixHT: inscriptionMode === "PAYANT" && prixHT ? parseFloat(prixHT) : null,
      lieuNom: lieuNom || null,
      lieuAdresse: lieuAdresse || null,
      lieuVille: lieuVille || null,
      certifBlocCode: certifBlocCode || template?.certifBlocCode || null,
      certifActionTitre: (certifBlocCode || template?.certifBlocCode) ? (certifActionTitre || template?.certifActionTitre || null) : null,
      coordinateurId: profile.id,
      ...(template
        ? {
            emargementMode: template.emargementMode,
            organisateursTexte: template.organisateursTexte,
            contactNom: template.contactNom,
            contactEmail: template.contactEmail,
            contactTelephone: template.contactTelephone,
            templateOrigineId: template.id,
          }
        : {}),
    },
    select: { id: true },
  });

  if (template?.modulesValidation && Array.isArray(template.modulesValidation)) {
    const modules = template.modulesValidation as { type: string; intitule: string; infos: string | null; coefficient: number; noteMax: number; seuilValidation: number | null }[];
    await prisma.cursusValidationModule.createMany({
      data: modules.map((m) => ({
        cursusId: cursus.id,
        type: m.type, intitule: m.intitule, infos: m.infos, coefficient: m.coefficient,
        noteMax: m.noteMax, seuilValidation: m.seuilValidation,
      })),
    });
  }

  return NextResponse.json({ id: cursus.id }, { status: 201 });
}
