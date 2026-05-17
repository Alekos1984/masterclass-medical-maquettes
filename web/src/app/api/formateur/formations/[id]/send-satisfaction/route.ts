import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/brevo";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as { baseUrl?: string };
  const baseUrl = body.baseUrl ?? process.env.NEXTAUTH_URL ?? "https://masterclassmedicale.com";

  const profil = await prisma.formateurProfile.findUnique({ where: { userId: session.user.id } });
  if (!profil) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const formation = await prisma.formation.findFirst({
    where: { id, formateurId: profil.id },
    include: {
      inscriptions: {
        include: {
          participant: { include: { user: { select: { name: true, email: true } } } },
        },
        where: { statut: "CONFIRMEE" },
      },
    },
  });

  if (!formation) return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });

  const dateFormatted = formation.date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const lieu = formation.lieuNom ? `${formation.lieuVille} · ${formation.lieuNom}` : formation.lieuVille ?? "Lieu à confirmer";

  let sent = 0;
  const errors: string[] = [];

  for (const insc of formation.inscriptions) {
    const participantEmail = insc.participant.user.email;
    if (!participantEmail) continue;

    const participantNom = insc.participant.user.name ?? "Participant";
    const satisfactionUrl = `${baseUrl}/satisfaction/${insc.id}`;

    try {
      await sendEmail({
        to: [{ email: participantEmail, name: participantNom }],
        subject: `Questionnaire de satisfaction — ${formation.titre}`,
        htmlContent: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
            <h2 style="color:#C8102E;">Votre avis compte 🌟</h2>
            <p>Bonjour ${participantNom},</p>
            <p>Merci d'avoir participé à la formation <strong>${formation.titre}</strong>. Nous espérons que cette journée vous a été bénéfique.</p>
            <ul>
              <li>📅 ${dateFormatted}</li>
              <li>📍 ${lieu}</li>
            </ul>
            <p>Votre retour est précieux pour nous aider à améliorer nos formations. Cela ne prend que 2 minutes.</p>
            <p style="text-align:center;margin:24px 0;">
              <a href="${satisfactionUrl}" style="background:#C8102E;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
                📝 Remplir le questionnaire
              </a>
            </p>
            <p style="font-size:12px;color:#999;">Vos réponses sont anonymes et confidentielles</p>
            <p>Merci pour votre confiance,<br/>L'équipe Masterclass Médical</p>
          </div>
        `,
      });
      sent++;
    } catch (e) {
      errors.push(participantEmail);
    }
  }

  return NextResponse.json({ sent, errors, total: formation.inscriptions.length });
}
