import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess, type CursusSlot, peutGerer } from "@/lib/cursus";
import { sendEmail, emailChangementJourneeCursus } from "@/lib/brevo";

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

  const journee = await prisma.formation.findFirst({
    where: { id: fid, cursusId: id },
    select: { id: true, date: true, heureDebut: true, heureFin: true, lieuNom: true, lieuVille: true, modaliteSession: true, visioUrl: true },
  });
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
      lieuNom: s.lieuNom || null,
      salle: s.salle || null,
      enVisio: !!s.enVisio,
    }));
    data.programme = slots;
  }

  const changementSignificatif =
    (data.date !== undefined && (data.date as Date).getTime() !== journee.date.getTime()) ||
    (data.heureDebut !== undefined && data.heureDebut !== journee.heureDebut) ||
    (data.heureFin !== undefined && data.heureFin !== journee.heureFin) ||
    (data.lieuNom !== undefined && data.lieuNom !== journee.lieuNom) ||
    (data.lieuVille !== undefined && data.lieuVille !== journee.lieuVille);

  const updated = await prisma.formation.update({ where: { id: fid }, data });

  if (changementSignificatif && updated.date.getTime() > Date.now()) {
    notifierChangementJournee(id, updated).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}

async function notifierChangementJournee(
  cursusId: string,
  journee: { id: string; date: Date; heureDebut: string; heureFin: string; lieuNom: string | null; lieuVille: string | null; modaliteSession: string | null; visioUrl: string | null }
) {
  const cursus = await prisma.cursus.findUnique({ where: { id: cursusId }, select: { titre: true } });
  if (!cursus) return;

  const inscriptions = await prisma.inscription.findMany({
    where: { formationId: journee.id, statut: "CONFIRMEE" },
    include: { participant: { include: { user: { select: { name: true, email: true } } } } },
  });
  if (inscriptions.length === 0) return;

  const dateStr = journee.date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const lieu = journee.modaliteSession === "VIRTUEL"
    ? (journee.visioUrl ? `Visioconférence — ${journee.visioUrl}` : "Visioconférence")
    : [journee.lieuNom, journee.lieuVille].filter(Boolean).join(", ") || "Lieu à confirmer";

  for (const insc of inscriptions) {
    const email = insc.participant.user?.email;
    if (!email) continue;
    try {
      await sendEmail({
        to: [{ email, name: insc.participant.user?.name ?? undefined }],
        subject: `📅 Changement pour votre cours — ${cursus.titre}`,
        htmlContent: emailChangementJourneeCursus({
          nom: insc.participant.user?.name ?? "cher·e participant·e",
          cursusTitre: cursus.titre,
          dateStr,
          heureDebut: journee.heureDebut,
          heureFin: journee.heureFin,
          lieu,
        }),
      });
    } catch { /* notification best-effort */ }
  }
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
