import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess, parseSlots, computeAlertes } from "@/lib/cursus";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { cursus, role, enseignant } = await getCursusAccess(id, session.user.id);
  if (!cursus || !role) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });

  const [alertes, ressources, messages, echanges, inscriptionsCount, prospects] = await Promise.all([
    computeAlertes(id),
    prisma.ressource.findMany({
      where: { formationId: { in: cursus.journees.map((j) => j.id) }, slotId: { not: null } },
      select: { id: true, formationId: true, slotId: true, nom: true, taille: true, createdAt: true },
    }),
    prisma.cursusMessage.findMany({ where: { cursusId: id }, orderBy: { createdAt: "asc" }, take: 200 }),
    prisma.cursusEchange.findMany({ where: { cursusId: id }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.inscription.groupBy({
      by: ["participantId"],
      where: { formationId: { in: cursus.journees.map((j) => j.id) }, statut: "CONFIRMEE" },
    }),
    role === "COORDINATEUR"
      ? prisma.cursusProspect.findMany({ where: { cursusId: id }, orderBy: [{ statut: "asc" }, { createdAt: "desc" }] })
      : Promise.resolve([]),
  ]);

  return NextResponse.json({
    role,
    monEnseignantId: enseignant?.id ?? null,
    cursus: {
      id: cursus.id, slug: cursus.slug, titre: cursus.titre, description: cursus.description,
      specialite: cursus.specialite, annee: cursus.annee, publique: cursus.publique, statut: cursus.statut,
      inscriptionMode: cursus.inscriptionMode, prixHT: cursus.prixHT ? Number(cursus.prixHT) : null,
      lieuNom: cursus.lieuNom, lieuAdresse: cursus.lieuAdresse, lieuVille: cursus.lieuVille,
      certifBlocCode: cursus.certifBlocCode, certifActionTitre: cursus.certifActionTitre,
      emargementMode: cursus.emargementMode,
      orgNom: cursus.orgNom, orgLogoBase64: cursus.orgLogoBase64, masquerMM: cursus.masquerMM,
      coordinateurNom: cursus.coordinateur.user?.name ?? "—",
    },
    journees: cursus.journees.map((j) => ({
      id: j.id, date: j.date.toISOString(), heureDebut: j.heureDebut, heureFin: j.heureFin,
      modaliteSession: j.modaliteSession ?? "PRESENTIEL", visioUrl: j.visioUrl,
      lieuNom: j.lieuNom, lieuVille: j.lieuVille,
      sessionStatus: j.sessionStatus,
      slots: parseSlots(j.programme),
    })),
    enseignants: cursus.enseignants.map((e) => ({
      id: e.id, email: e.email, nom: e.nom, phone: e.phone, fonction: e.fonction,
      statut: e.statut, coCoordinateur: e.coCoordinateur,
    })),
    supports: ressources,
    messages,
    echanges,
    prospects,
    nbEtudiants: inscriptionsCount.length,
    alertes,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });
  if (role !== "COORDINATEUR") return NextResponse.json({ error: "Réservé au coordinateur" }, { status: 403 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of ["titre", "description", "specialite", "annee", "lieuNom", "lieuAdresse", "lieuVille", "certifActionTitre"] as const) {
    if (body[k] !== undefined) data[k] = body[k] || null;
  }
  if (body.titre !== undefined && !body.titre?.trim()) delete data.titre;
  if (body.publique !== undefined) data.publique = !!body.publique;
  if (body.statut !== undefined && ["BROUILLON", "PUBLIE", "ARCHIVE"].includes(body.statut)) data.statut = body.statut;
  if (body.inscriptionMode !== undefined && ["IMPORT", "PAYANT"].includes(body.inscriptionMode)) data.inscriptionMode = body.inscriptionMode;
  if (body.prixHT !== undefined) data.prixHT = body.prixHT ? parseFloat(body.prixHT) : null;
  if (body.certifBlocCode !== undefined) data.certifBlocCode = body.certifBlocCode || null;
  if (body.emargementMode !== undefined && ["PAR_COURS", "DEMI_JOURNEE", "JOUR"].includes(body.emargementMode)) {
    data.emargementMode = body.emargementMode;
  }
  if (body.orgNom !== undefined) data.orgNom = body.orgNom || null;
  if (body.orgLogoBase64 !== undefined) data.orgLogoBase64 = body.orgLogoBase64 || null;
  if (body.masquerMM !== undefined) data.masquerMM = !!body.masquerMM;

  const updated = await prisma.cursus.update({ where: { id }, data, select: { id: true, statut: true } });

  // Propager la certification et le statut aux journées (machinerie formations)
  if (body.certifBlocCode !== undefined || body.certifActionTitre !== undefined || body.statut !== undefined) {
    const c = await prisma.cursus.findUnique({ where: { id }, select: { certifBlocCode: true, certifActionTitre: true, titre: true, statut: true } });
    await prisma.formation.updateMany({
      where: { cursusId: id },
      data: {
        certifBlocCode: c?.certifBlocCode ?? null,
        certifActionTitre: c?.certifBlocCode ? (c.certifActionTitre ?? c.titre) : null,
        ...(body.statut !== undefined ? { statut: c?.statut === "PUBLIE" ? "PUBLIEE" : "BROUILLON" } : {}),
      },
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });
  if (role !== "COORDINATEUR") return NextResponse.json({ error: "Réservé au coordinateur" }, { status: 403 });

  const journeeIds = cursus.journees.map((j) => j.id);
  const confirmees = await prisma.inscription.count({ where: { formationId: { in: journeeIds }, statut: "CONFIRMEE" } });
  if (confirmees > 0 && cursus.statut !== "ARCHIVE") {
    return NextResponse.json({ error: "Des étudiants sont inscrits : archivez d'abord le cursus." }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.emargement.deleteMany({ where: { formationId: { in: journeeIds } } }),
    prisma.satisfactionReponse.deleteMany({ where: { formationId: { in: journeeIds } } }),
    prisma.question.deleteMany({ where: { formationId: { in: journeeIds } } }),
    prisma.ressource.deleteMany({ where: { formationId: { in: journeeIds } } }),
    prisma.inscription.deleteMany({ where: { formationId: { in: journeeIds } } }),
    prisma.demandeSalle.deleteMany({ where: { formationId: { in: journeeIds } } }),
    prisma.formation.deleteMany({ where: { cursusId: id } }),
    prisma.cursus.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
