import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess, parseSlots } from "@/lib/cursus";
import { sendEmail, emailInvitationEnseignant } from "@/lib/brevo";

// PATCH : toggle co-coordinateur ou relance d'invitation
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; eid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, eid } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });
  if (role !== "COORDINATEUR") return NextResponse.json({ error: "Réservé au coordinateur" }, { status: 403 });

  const enseignant = await prisma.cursusEnseignant.findFirst({ where: { id: eid, cursusId: id } });
  if (!enseignant) return NextResponse.json({ error: "Enseignant introuvable" }, { status: 404 });

  const body = await req.json();

  if (body.action === "relancer") {
    const baseUrl = process.env.NEXTAUTH_URL ?? "https://masterclassmedicale.com";
    const inviteUrl = enseignant.formateurId
      ? `${baseUrl}/formateur/coordination/${id}`
      : `${baseUrl}/cursus/invitation/${enseignant.inviteToken}`;
    await sendEmail({
      to: [{ email: enseignant.email, name: enseignant.nom ?? undefined }],
      subject: `Rappel : invitation à enseigner — ${cursus.titre}`,
      htmlContent: emailInvitationEnseignant({
        nom: enseignant.nom ?? "cher·e collègue",
        cursusTitre: cursus.titre,
        coordinateurNom: cursus.coordinateur.user?.name ?? "Le coordinateur",
        inviteUrl,
        dejaInscrit: !!enseignant.formateurId,
      }),
    });
    return NextResponse.json({ ok: true });
  }

  if (body.coCoordinateur !== undefined) {
    await prisma.cursusEnseignant.update({ where: { id: eid }, data: { coCoordinateur: !!body.coCoordinateur } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Aucune action" }, { status: 400 });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; eid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, eid } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });
  if (role !== "COORDINATEUR") return NextResponse.json({ error: "Réservé au coordinateur" }, { status: 403 });

  // Désaffecter ses créneaux avant de le retirer
  for (const j of cursus.journees) {
    const slots = parseSlots(j.programme);
    if (slots.some((s) => s.enseignantId === eid)) {
      await prisma.formation.update({
        where: { id: j.id },
        data: { programme: slots.map((s) => (s.enseignantId === eid ? { ...s, enseignantId: null } : s)) },
      });
    }
  }
  await prisma.cursusEnseignant.delete({ where: { id: eid } });
  return NextResponse.json({ ok: true });
}
