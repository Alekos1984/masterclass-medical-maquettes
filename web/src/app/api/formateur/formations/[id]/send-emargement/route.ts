import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/brevo";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
    return NextResponse.json(
      { error: "Service email non configuré — ajoutez BREVO_API_KEY et BREVO_SENDER_EMAIL dans vos variables d'environnement." },
      { status: 503 }
    );
  }

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
          emargements: true,
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
    // Create emargement record if not exists
    let emg = insc.emargements[0];
    if (!emg) {
      emg = await prisma.emargement.create({
        data: {
          formationId: formation.id,
          inscriptionId: insc.id,
          tokenExpire: new Date(formation.date.getTime() + 48 * 60 * 60 * 1000),
        },
      });
    }

    const participantEmail = insc.participant.user.email;
    if (!participantEmail) continue;

    const emargementUrl = `${baseUrl}/emarger/${emg.token}`;
    const participantNom = insc.participant.user.name ?? "Participant";

    try {
      await sendEmail({
        to: [{ email: participantEmail, name: participantNom }],
        subject: `Émargement — ${formation.titre}`,
        htmlContent: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
            <h2 style="color:#C8102E;">Confirmez votre présence ✍️</h2>
            <p>Bonjour ${participantNom},</p>
            <p>Votre formation <strong>${formation.titre}</strong> a lieu aujourd'hui.</p>
            <ul>
              <li>📅 ${dateFormatted} · ${formation.heureDebut}–${formation.heureFin}</li>
              <li>📍 ${lieu}</li>
            </ul>
            <p>Cliquez sur le bouton ci-dessous pour confirmer votre présence :</p>
            <p style="text-align:center;margin:24px 0;">
              <a href="${emargementUrl}" style="background:#C8102E;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
                ✅ Confirmer ma présence
              </a>
            </p>
            <p style="font-size:12px;color:#999;">Lien unique et sécurisé · Valable 48h · Ne partagez pas ce lien</p>
            <p>À tout à l'heure,<br/>L'équipe Masterclass Médical</p>
          </div>
        `,
      });
      sent++;
    } catch (e) {
      errors.push(`${participantEmail} (${e instanceof Error ? e.message : String(e)})`);
    }
  }

  return NextResponse.json({ sent, errors, total: formation.inscriptions.length });
}
