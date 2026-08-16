import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess, type CursusSlot, peutGerer } from "@/lib/cursus";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, fid } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });
  if (!peutGerer(role)) return NextResponse.json({ error: "Réservé au coordinateur ou à la secrétaire pédagogique" }, { status: 403 });

  const journee = await prisma.formation.findFirst({ where: { id: fid, cursusId: id }, select: { id: true } });
  if (!journee) return NextResponse.json({ error: "Journée introuvable" }, { status: 404 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.date !== undefined) data.date = new Date(body.date);
  if (body.heureDebut !== undefined) data.heureDebut = body.heureDebut;
  if (body.heureFin !== undefined) data.heureFin = body.heureFin;
  if (body.modaliteSession !== undefined) data.modaliteSession = body.modaliteSession;
  if (body.visioUrl !== undefined) data.visioUrl = body.visioUrl || null;
  if (body.lieuNom !== undefined) data.lieuNom = body.lieuNom || null;
  if (body.lieuAdresse !== undefined) data.lieuAdresse = body.lieuAdresse || null;
  if (body.lieuVille !== undefined) data.lieuVille = body.lieuVille || null;
  if (body.titre !== undefined && body.titre?.trim()) data.titre = body.titre.trim();
  if (body.slots !== undefined) {
    const slots = (body.slots as CursusSlot[]).map((s, i) => ({
      slotId: s.slotId || `slot-${Date.now()}-${i}`,
      heureDebut: s.heureDebut ?? "",
      heureFin: s.heureFin ?? "",
      titre: s.titre ?? "",
      description: s.description ?? "",
      type: s.type ?? "cours",
      enseignantId: s.enseignantId ?? null,
      // Un enseignant affecté vide toujours l'intervenantRaw (nom brut de digitalisation)
      intervenantRaw: s.enseignantId ? null : (s.intervenantRaw ?? null),
    }));
    data.programme = slots;
  }

  await prisma.formation.update({ where: { id: fid }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; fid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, fid } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });
  if (!peutGerer(role)) return NextResponse.json({ error: "Réservé au coordinateur ou à la secrétaire pédagogique" }, { status: 403 });

  const journee = await prisma.formation.findFirst({ where: { id: fid, cursusId: id }, select: { id: true } });
  if (!journee) return NextResponse.json({ error: "Journée introuvable" }, { status: 404 });

  await prisma.$transaction([
    prisma.emargement.deleteMany({ where: { formationId: fid } }),
    prisma.satisfactionReponse.deleteMany({ where: { formationId: fid } }),
    prisma.question.deleteMany({ where: { formationId: fid } }),
    prisma.ressource.deleteMany({ where: { formationId: fid } }),
    prisma.inscription.deleteMany({ where: { formationId: fid } }),
    prisma.formation.delete({ where: { id: fid } }),
  ]);

  return NextResponse.json({ ok: true });
}
