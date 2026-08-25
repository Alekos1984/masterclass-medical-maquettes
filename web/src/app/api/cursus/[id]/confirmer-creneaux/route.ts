import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseSlots, patchSlot } from "@/lib/cursus";
import { sendEmail, emailConfirmationCreneaux, emailNotificationReponseCreneau } from "@/lib/brevo";

// POST : portail public — un enseignant confirme ou décline les créneaux qui lui ont été
// proposés. Un email récapitulatif part sur l'adresse saisie (garde-fou anti-usurpation :
// le titulaire réel de l'adresse est informé même si quelqu'un d'autre a rempli le formulaire),
// et une notification part vers le coordinateur.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json() as {
    email?: string;
    reponses?: { journeeId: string; slotId: string; statut: "CONFIRME" | "DECLINE" }[];
  };
  const email = body.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  if (!Array.isArray(body.reponses) || body.reponses.length === 0) {
    return NextResponse.json({ error: "Aucune réponse à enregistrer" }, { status: 400 });
  }

  const cursus = await prisma.cursus.findUnique({
    where: { id },
    include: {
      coordinateur: { include: { user: { select: { name: true, email: true } } } },
      enseignants: true,
      journees: { orderBy: { date: "asc" } },
    },
  });
  if (!cursus) return NextResponse.json({ error: "Enseignement introuvable" }, { status: 404 });

  const enseignant = cursus.enseignants.find((e) => e.role !== "SECRETAIRE" && e.email.toLowerCase() === email);
  if (!enseignant) return NextResponse.json({ error: "Aucun créneau proposé à cette adresse pour ce DU" }, { status: 404 });

  const recap: { titre: string; dateStr: string; heureDebut: string; heureFin: string; statut: "CONFIRME" | "DECLINE" }[] = [];

  for (const rep of body.reponses) {
    if (rep.statut !== "CONFIRME" && rep.statut !== "DECLINE") continue;
    const journee = cursus.journees.find((j) => j.id === rep.journeeId);
    if (!journee) continue;
    const slot = parseSlots(journee.programme).find((s) => s.slotId === rep.slotId);
    if (!slot || slot.enseignantId !== enseignant.id) continue; // ignore toute tentative sur le créneau d'un autre

    const ok = await patchSlot(rep.journeeId, rep.slotId, { confirmationStatut: rep.statut });
    if (ok) {
      recap.push({
        titre: slot.titre, dateStr: journee.date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
        heureDebut: slot.heureDebut, heureFin: slot.heureFin, statut: rep.statut,
      });
    }
  }

  if (recap.length === 0) return NextResponse.json({ error: "Aucun créneau valide à enregistrer" }, { status: 400 });

  const recapHtml = recap
    .map((r) => `${r.statut === "CONFIRME" ? "✅" : "❌"} <strong>${r.titre}</strong> — ${r.dateStr}, ${r.heureDebut}–${r.heureFin} (${r.statut === "CONFIRME" ? "confirmé" : "décliné"})`)
    .join("<br/>");

  try {
    await sendEmail({
      to: [{ email: enseignant.email, name: enseignant.nom ?? undefined }],
      subject: `Récapitulatif de votre réponse — ${cursus.titre}`,
      htmlContent: emailConfirmationCreneaux({ nom: enseignant.nom ?? enseignant.email, cursusTitre: cursus.titre, recapHtml }),
    });
  } catch (e) {
    console.error("[confirmer-creneaux] échec envoi email enseignant", enseignant.email, e);
  }

  const coordinateurEmail = cursus.contactEmail || cursus.coordinateur.user?.email;
  if (coordinateurEmail) {
    try {
      await sendEmail({
        to: [{ email: coordinateurEmail }],
        subject: `Réponse de ${enseignant.nom ?? enseignant.email} — ${cursus.titre}`,
        htmlContent: emailNotificationReponseCreneau({ enseignantNom: enseignant.nom ?? enseignant.email, cursusTitre: cursus.titre, recapHtml }),
      });
    } catch (e) {
      console.error("[confirmer-creneaux] échec envoi email coordinateur", coordinateurEmail, e);
    }
  }

  return NextResponse.json({ ok: true, recap });
}
