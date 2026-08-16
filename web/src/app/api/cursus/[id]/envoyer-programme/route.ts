import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess, parseSlots, peutGerer } from "@/lib/cursus";
import { sendEmail, emailProgrammeCursus } from "@/lib/brevo";

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

  const { inclureEtudiants } = await req.json().catch(() => ({ inclureEtudiants: false }));

  // Construire le programme HTML
  const enseignantsById = new Map(cursus.enseignants.map((e) => [e.id, e.nom ?? e.email]));
  let programmeHtml = "";
  for (const j of cursus.journees) {
    const dateStr = j.date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    programmeHtml += `<p style="font-size:14px;font-weight:700;color:#0F0F0F;margin:18px 0 6px;">📅 ${dateStr} (${j.heureDebut}–${j.heureFin})${j.modaliteSession === "VIRTUEL" ? " · Visioconférence" : j.modaliteSession === "MIXTE" ? " · Mixte" : ""}</p>`;
    programmeHtml += `<table style="width:100%;border-collapse:collapse;font-size:12px;color:#444;">`;
    for (const s of parseSlots(j.programme)) {
      const prof = s.enseignantId ? enseignantsById.get(s.enseignantId) ?? "—" : "—";
      programmeHtml += `<tr style="border-bottom:1px solid #f0f0f0;">
        <td style="padding:5px 8px;white-space:nowrap;color:#999;">${s.heureDebut}–${s.heureFin}</td>
        <td style="padding:5px 8px;font-weight:600;">${s.titre}</td>
        <td style="padding:5px 8px;color:#C8102E;white-space:nowrap;">${s.type === "pause" ? "" : prof}</td>
      </tr>`;
    }
    programmeHtml += `</table>`;
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://masterclassmedicale.com";
  const pdfUrl = `${baseUrl}/api/pdf/cursus-programme/${id}`;

  const destinataires = new Map<string, string>();
  for (const e of cursus.enseignants) destinataires.set(e.email, e.nom ?? "");
  if (cursus.coordinateur.user?.email) destinataires.set(cursus.coordinateur.user.email, cursus.coordinateur.user.name ?? "");

  if (inclureEtudiants) {
    const inscriptions = await prisma.inscription.findMany({
      where: { formationId: { in: cursus.journees.map((j) => j.id) }, statut: "CONFIRMEE" },
      include: { participant: { include: { user: { select: { email: true, name: true } } } } },
      distinct: ["participantId"],
    });
    for (const insc of inscriptions) {
      const email = insc.participant.user?.email;
      if (email) destinataires.set(email, insc.participant.user?.name ?? "");
    }
  }

  let envoyes = 0;
  for (const [email, nom] of destinataires) {
    try {
      await sendEmail({
        to: [{ email, name: nom || undefined }],
        subject: `📅 Programme — ${cursus.titre}${cursus.annee ? ` (${cursus.annee})` : ""}`,
        htmlContent: emailProgrammeCursus({
          nom: nom || "cher·e collègue",
          cursusTitre: cursus.titre,
          programmeHtml,
          pdfUrl,
        }),
      });
      envoyes++;
    } catch { /* continue */ }
  }

  return NextResponse.json({ envoyes, total: destinataires.size });
}
