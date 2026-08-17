import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCursusAccess, peutGerer, parseSlots, patchSlot } from "@/lib/cursus";
import { sendEmail, emailMessageCoordination } from "@/lib/brevo";

// POST : envoie (via la plateforme) une proposition de créneau à un enseignant,
// et marque les créneaux concernés comme "proposés" pour suivi dans l'onglet Équipe.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });
  if (!peutGerer(role)) return NextResponse.json({ error: "Réservé au coordinateur ou à la secrétaire pédagogique" }, { status: 403 });

  const body = await req.json() as {
    enseignantId?: string; subject?: string; message?: string;
    slots?: { journeeId: string; slotId: string }[];
  };
  const enseignant = cursus.enseignants.find((e) => e.id === body.enseignantId);
  if (!enseignant) return NextResponse.json({ error: "Enseignant introuvable" }, { status: 404 });
  if (!body.subject?.trim() || !body.message?.trim()) return NextResponse.json({ error: "Sujet et message requis" }, { status: 400 });
  if (!Array.isArray(body.slots) || body.slots.length === 0) return NextResponse.json({ error: "Aucun créneau sélectionné" }, { status: 400 });

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://masterclassmedicale.com";
  const lienConfirmation = `${baseUrl}/cursus/confirmation/${cursus.id}`;

  await sendEmail({
    to: [{ email: enseignant.email, name: enseignant.nom ?? undefined }],
    subject: body.subject.trim(),
    htmlContent: emailMessageCoordination({ corps: body.message.trim(), lienConfirmation }),
  });

  let marques = 0;
  for (const ref of body.slots) {
    const journee = cursus.journees.find((j) => j.id === ref.journeeId);
    if (!journee) continue;
    const slot = parseSlots(journee.programme).find((s) => s.slotId === ref.slotId);
    if (!slot || slot.enseignantId !== enseignant.id) continue; // évite de marquer le créneau d'un autre
    const ok = await patchSlot(ref.journeeId, ref.slotId, {
      confirmationStatut: "PROPOSE",
      confirmationDemandeAt: new Date().toISOString(),
    });
    if (ok) marques++;
  }

  return NextResponse.json({ ok: true, marques });
}
