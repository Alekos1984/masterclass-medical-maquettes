import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess } from "@/lib/cursus";

// GET : liste des étudiants du cursus + leurs notes pour ce module
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; mid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, mid } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus || role !== "COORDINATEUR") return NextResponse.json({ error: "Réservé au coordinateur" }, { status: 403 });

  const mod = await prisma.cursusValidationModule.findFirst({ where: { id: mid, cursusId: id } });
  if (!mod) return NextResponse.json({ error: "Module introuvable" }, { status: 404 });

  const journeeIds = cursus.journees.map((j) => j.id);
  const inscriptions = await prisma.inscription.findMany({
    where: { formationId: { in: journeeIds }, statut: "CONFIRMEE" },
    select: { participantId: true, participant: { include: { user: { select: { name: true, email: true } } } } },
    distinct: ["participantId"],
    orderBy: { participant: { user: { name: "asc" } } },
  });
  const notes = await prisma.cursusNote.findMany({ where: { moduleId: mid } });
  const notesById = new Map(notes.map((n) => [n.participantId, n]));

  return NextResponse.json({
    module: {
      id: mod.id, intitule: mod.intitule, type: mod.type, noteMax: mod.noteMax,
      seuilValidation: mod.seuilValidation, cloture: mod.cloture,
      clotureAt: mod.clotureAt?.toISOString() ?? null,
      clotureExportUrl: mod.clotureExportUrl,
    },
    lignes: inscriptions.map((i) => ({
      participantId: i.participantId,
      nom: i.participant.user?.name ?? "—",
      email: i.participant.user?.email ?? "—",
      note: notesById.get(i.participantId)?.note ?? null,
      commentaire: notesById.get(i.participantId)?.commentaire ?? "",
    })),
  });
}

// PATCH : upsert d'une note + journalisation dans l'historique (anti-effacement)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; mid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, mid } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus || role !== "COORDINATEUR") return NextResponse.json({ error: "Réservé au coordinateur" }, { status: 403 });

  const mod = await prisma.cursusValidationModule.findFirst({ where: { id: mid, cursusId: id } });
  if (!mod) return NextResponse.json({ error: "Module introuvable" }, { status: 404 });
  if (mod.cloture) return NextResponse.json({ error: "Module clôturé — modification impossible" }, { status: 409 });

  const body = await req.json() as {
    action?: "cloturer" | "editer";
    intitule?: string; type?: string; dateEpreuve?: string | null; infos?: string;
    coefficient?: number; noteMax?: number; seuilValidation?: number | null;
    participantId?: string; note?: number | null; commentaire?: string;
  };

  // Édition des méta d'un module
  if (body.action === "editer") {
    const data: Record<string, unknown> = {};
    if (body.intitule !== undefined) data.intitule = body.intitule.trim();
    if (body.type !== undefined) data.type = body.type;
    if (body.dateEpreuve !== undefined) data.dateEpreuve = body.dateEpreuve ? new Date(body.dateEpreuve) : null;
    if (body.infos !== undefined) data.infos = body.infos || null;
    if (body.coefficient !== undefined) data.coefficient = Number(body.coefficient);
    if (body.noteMax !== undefined) data.noteMax = Number(body.noteMax);
    if (body.seuilValidation !== undefined) data.seuilValidation = body.seuilValidation === null ? null : Number(body.seuilValidation);
    await prisma.cursusValidationModule.update({ where: { id: mid }, data });
    return NextResponse.json({ ok: true });
  }

  // Clôture (irréversible côté UI) — l'export PDF s'attache ensuite via clotureExportUrl
  if (body.action === "cloturer") {
    await prisma.cursusValidationModule.update({
      where: { id: mid },
      data: { cloture: true, clotureAt: new Date(), clotureExportUrl: `/api/pdf/cursus-notation/${mid}` },
    });
    return NextResponse.json({ ok: true, exportUrl: `/api/pdf/cursus-notation/${mid}` });
  }

  // Saisie d'une note (autosave)
  if (!body.participantId) return NextResponse.json({ error: "participantId requis" }, { status: 400 });
  if (body.note != null && (body.note < 0 || body.note > mod.noteMax)) {
    return NextResponse.json({ error: `Note hors barème (0–${mod.noteMax})` }, { status: 400 });
  }

  const existant = await prisma.cursusNote.findUnique({
    where: { moduleId_participantId: { moduleId: mid, participantId: body.participantId } },
  });

  const nouvellesDonnees = {
    note: body.note === null ? null : body.note != null ? Number(body.note) : existant?.note ?? null,
    commentaire: body.commentaire !== undefined ? (body.commentaire ?? "") : (existant?.commentaire ?? ""),
    saisiParUserId: session.user.id,
  };

  await prisma.$transaction([
    existant
      ? prisma.cursusNote.update({ where: { id: existant.id }, data: nouvellesDonnees })
      : prisma.cursusNote.create({ data: { moduleId: mid, participantId: body.participantId, ...nouvellesDonnees } }),
    prisma.cursusNoteHistorique.create({
      data: {
        moduleId: mid, participantId: body.participantId,
        noteAvant: existant?.note ?? null,
        noteApres: nouvellesDonnees.note,
        commentaireAvant: existant?.commentaire ?? null,
        commentaireApres: nouvellesDonnees.commentaire,
        parUserId: session.user.id,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

// DELETE : supprime un module (uniquement s'il n'est pas clôturé)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; mid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, mid } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus || role !== "COORDINATEUR") return NextResponse.json({ error: "Réservé au coordinateur" }, { status: 403 });

  const mod = await prisma.cursusValidationModule.findFirst({ where: { id: mid, cursusId: id } });
  if (!mod) return NextResponse.json({ error: "Module introuvable" }, { status: 404 });
  if (mod.cloture) return NextResponse.json({ error: "Module clôturé — suppression impossible" }, { status: 409 });

  await prisma.cursusValidationModule.delete({ where: { id: mid } });
  return NextResponse.json({ ok: true });
}
