import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess } from "@/lib/cursus";

// GET : liste les modules de validation + notes agrégées
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });
  if (role !== "COORDINATEUR") return NextResponse.json({ error: "Réservé au coordinateur" }, { status: 403 });

  const modules = await prisma.cursusValidationModule.findMany({
    where: { cursusId: id },
    include: { notes: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    modules: modules.map((m) => ({
      id: m.id, type: m.type, intitule: m.intitule,
      dateEpreuve: m.dateEpreuve?.toISOString() ?? null,
      infos: m.infos, coefficient: m.coefficient, noteMax: m.noteMax,
      seuilValidation: m.seuilValidation,
      cloture: m.cloture, clotureAt: m.clotureAt?.toISOString() ?? null,
      clotureExportUrl: m.clotureExportUrl,
      nbNotesSaisies: m.notes.filter((n) => n.note !== null).length,
      nbNotesTotal: m.notes.length,
    })),
  });
}

// POST : crée un module
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });
  if (role !== "COORDINATEUR") return NextResponse.json({ error: "Réservé au coordinateur" }, { status: 403 });

  const { type, intitule, dateEpreuve, infos, coefficient, noteMax, seuilValidation } = await req.json();
  if (!type || !intitule?.trim()) return NextResponse.json({ error: "Type et intitulé requis" }, { status: 400 });

  const mod = await prisma.cursusValidationModule.create({
    data: {
      cursusId: id,
      type, intitule: intitule.trim(),
      dateEpreuve: dateEpreuve ? new Date(dateEpreuve) : null,
      infos: infos ?? null,
      coefficient: coefficient ? Number(coefficient) : 1,
      noteMax: noteMax ? Number(noteMax) : 20,
      seuilValidation: seuilValidation ? Number(seuilValidation) : null,
    },
    select: { id: true },
  });
  return NextResponse.json({ id: mod.id }, { status: 201 });
}
