import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess, parseSlots } from "@/lib/cursus";
import { sendEmail, emailEchangeCours, emailEchangeDecide } from "@/lib/brevo";

function slotLabel(date: Date, titre: string, heureDebut: string) {
  return `${date.toLocaleDateString("fr-FR")} ${heureDebut} — ${titre}`;
}

// POST : proposer un échange (le proposant cède slotA à l'autre et reprend slotB)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { cursus, role, enseignant } = await getCursusAccess(id, session.user.id);
  if (!cursus || !role) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });
  if (!enseignant) return NextResponse.json({ error: "Vous n'êtes pas enseignant de ce cursus" }, { status: 403 });

  const { journeeAId, slotIdA, journeeBId, slotIdB } = await req.json();

  const [journeeA, journeeB] = await Promise.all([
    prisma.formation.findFirst({ where: { id: journeeAId, cursusId: id } }),
    prisma.formation.findFirst({ where: { id: journeeBId, cursusId: id } }),
  ]);
  if (!journeeA || !journeeB) return NextResponse.json({ error: "Journée introuvable" }, { status: 404 });

  const slotA = parseSlots(journeeA.programme).find((s) => s.slotId === slotIdA);
  const slotB = parseSlots(journeeB.programme).find((s) => s.slotId === slotIdB);
  if (!slotA || !slotB) return NextResponse.json({ error: "Créneau introuvable" }, { status: 404 });
  if (slotA.enseignantId !== enseignant.id) {
    return NextResponse.json({ error: "Vous ne pouvez échanger que vos propres créneaux" }, { status: 403 });
  }
  if (!slotB.enseignantId || slotB.enseignantId === enseignant.id) {
    return NextResponse.json({ error: "Le créneau cible doit être affecté à un autre enseignant" }, { status: 400 });
  }

  const echange = await prisma.cursusEchange.create({
    data: {
      cursusId: id,
      deEnseignantId: enseignant.id,
      versEnseignantId: slotB.enseignantId,
      journeeAId, slotIdA, journeeBId, slotIdB,
    },
  });

  const cible = cursus.enseignants.find((e) => e.id === slotB.enseignantId);
  if (cible) {
    const baseUrl = process.env.NEXTAUTH_URL ?? "https://masterclassmedicale.com";
    sendEmail({
      to: [{ email: cible.email, name: cible.nom ?? undefined }],
      subject: `🔄 Proposition d'échange de cours — ${cursus.titre}`,
      htmlContent: emailEchangeCours({
        nom: cible.nom ?? "cher·e collègue",
        cursusTitre: cursus.titre,
        proposantNom: enseignant.nom ?? enseignant.email,
        slotA: slotLabel(journeeA.date, slotA.titre, slotA.heureDebut),
        slotB: slotLabel(journeeB.date, slotB.titre, slotB.heureDebut),
        actionUrl: `${baseUrl}/formateur/coordination/${id}`,
      }),
    }).catch(() => {});
  }

  return NextResponse.json(echange, { status: 201 });
}

// PATCH : accepter ou refuser un échange (réservé à l'enseignant sollicité)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { cursus, role, enseignant } = await getCursusAccess(id, session.user.id);
  if (!cursus || !role) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });

  const { echangeId, decision } = await req.json() as { echangeId: string; decision: "ACCEPTE" | "REFUSE" };
  const echange = await prisma.cursusEchange.findFirst({ where: { id: echangeId, cursusId: id } });
  if (!echange || echange.statut !== "EN_ATTENTE") {
    return NextResponse.json({ error: "Échange introuvable ou déjà traité" }, { status: 404 });
  }
  if (!enseignant || echange.versEnseignantId !== enseignant.id) {
    return NextResponse.json({ error: "Seul l'enseignant sollicité peut décider" }, { status: 403 });
  }

  const [journeeA, journeeB] = await Promise.all([
    prisma.formation.findUnique({ where: { id: echange.journeeAId } }),
    prisma.formation.findUnique({ where: { id: echange.journeeBId } }),
  ]);
  if (!journeeA || !journeeB) return NextResponse.json({ error: "Journée introuvable" }, { status: 404 });

  const slotsA = parseSlots(journeeA.programme);
  const slotsB = parseSlots(journeeB.programme);
  const slotA = slotsA.find((s) => s.slotId === echange.slotIdA);
  const slotB = slotsB.find((s) => s.slotId === echange.slotIdB);

  if (decision === "ACCEPTE") {
    if (!slotA || !slotB || slotA.enseignantId !== echange.deEnseignantId || slotB.enseignantId !== echange.versEnseignantId) {
      await prisma.cursusEchange.update({ where: { id: echangeId }, data: { statut: "REFUSE", decideAt: new Date() } });
      return NextResponse.json({ error: "Le programme a changé depuis la proposition — échange annulé" }, { status: 409 });
    }
    // Swap des affectations → le programme se met à jour automatiquement
    const newA = slotsA.map((s) => (s.slotId === echange.slotIdA ? { ...s, enseignantId: echange.versEnseignantId } : s));
    const newB = slotsB.map((s) => (s.slotId === echange.slotIdB ? { ...s, enseignantId: echange.deEnseignantId } : s));
    await prisma.$transaction([
      prisma.formation.update({ where: { id: journeeA.id }, data: { programme: newA } }),
      ...(journeeA.id === journeeB.id
        ? [prisma.formation.update({
            where: { id: journeeA.id },
            data: { programme: newA.map((s) => (s.slotId === echange.slotIdB ? { ...s, enseignantId: echange.deEnseignantId } : s)) },
          })]
        : [prisma.formation.update({ where: { id: journeeB.id }, data: { programme: newB } })]),
      prisma.cursusEchange.update({ where: { id: echangeId }, data: { statut: "ACCEPTE", decideAt: new Date() } }),
    ]);
  } else {
    await prisma.cursusEchange.update({ where: { id: echangeId }, data: { statut: "REFUSE", decideAt: new Date() } });
  }

  // Notifier le proposant + le coordinateur
  const proposant = cursus.enseignants.find((e) => e.id === echange.deEnseignantId);
  const notifies = [
    proposant ? { email: proposant.email, nom: proposant.nom ?? "" } : null,
    cursus.coordinateur.user?.email ? { email: cursus.coordinateur.user.email, nom: cursus.coordinateur.user.name ?? "" } : null,
  ].filter(Boolean) as { email: string; nom: string }[];

  for (const dest of notifies) {
    sendEmail({
      to: [{ email: dest.email, name: dest.nom || undefined }],
      subject: `Échange ${decision === "ACCEPTE" ? "accepté ✅" : "refusé"} — ${cursus.titre}`,
      htmlContent: emailEchangeDecide({
        nom: dest.nom || "cher·e collègue",
        cursusTitre: cursus.titre,
        accepte: decision === "ACCEPTE",
        slotA: slotA ? slotLabel(journeeA.date, slotA.titre, slotA.heureDebut) : "créneau",
        slotB: slotB ? slotLabel(journeeB.date, slotB.titre, slotB.heureDebut) : "créneau",
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true, statut: decision });
}
