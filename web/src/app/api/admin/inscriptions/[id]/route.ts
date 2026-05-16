import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatutInscription } from "@/generated/prisma/enums";
import { sendEmail, emailConfirmationInscription, emailNouvelleInscription, emailInscriptionAnnulee } from "@/lib/brevo";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json() as { statut: string; motif?: string };
  const { statut, motif } = body;

  const VALID: string[] = Object.values(StatutInscription);
  if (!VALID.includes(statut)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }
  const statutEnum = statut as StatutInscription;

  const inscription = await prisma.inscription.findUnique({
    where: { id },
    include: {
      participant: { include: { user: { select: { name: true, email: true } } } },
      formation: {
        include: {
          formateur: { include: { user: { select: { name: true, email: true } } } },
        },
      },
      paiement: { select: { montantHT: true } },
    },
  });

  if (!inscription) return NextResponse.json({ error: "Inscription introuvable" }, { status: 404 });

  const updated = await prisma.inscription.update({
    where: { id },
    data: { statut: statutEnum },
    select: { id: true, statut: true },
  });

  const participantNom = inscription.participant.user.name ?? "Participant";
  const participantEmail = inscription.participant.user.email;
  const f = inscription.formation;
  const dateFormatted = f.date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const lieu = f.lieuNom ? `${f.lieuVille ?? ""} · ${f.lieuNom}` : f.lieuVille ?? "Lieu à confirmer";
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://masterclassmedical.fr";

  if (statutEnum === StatutInscription.CONFIRMEE) {
    const montant = inscription.paiement
      ? `${Number(inscription.paiement.montantHT).toLocaleString("fr-FR")} €`
      : "—";

    sendEmail({
      to: [{ email: participantEmail, name: participantNom }],
      subject: `Inscription confirmée — ${f.titre}`,
      htmlContent: emailConfirmationInscription({
        participantNom,
        formationTitre: f.titre,
        formationDate: dateFormatted,
        formationLieu: lieu,
        montant,
        conventionUrl: `${baseUrl}/api/pdf/convention/${id}`,
      }),
    }).catch(() => {});

    const formateurEmail = f.formateur.user.email;
    if (formateurEmail) {
      sendEmail({
        to: [{ email: formateurEmail, name: f.formateur.user.name ?? "Formateur" }],
        subject: `Nouvelle inscription — ${f.titre}`,
        htmlContent: emailNouvelleInscription({
          formateurNom: f.formateur.user.name ?? "Formateur",
          participantNom,
          formationTitre: f.titre,
          formationDate: dateFormatted,
          formationId: f.id,
        }),
      }).catch(() => {});
    }
  }

  if (statutEnum === StatutInscription.ANNULEE) {
    sendEmail({
      to: [{ email: participantEmail, name: participantNom }],
      subject: `Inscription annulée — ${f.titre}`,
      htmlContent: emailInscriptionAnnulee({
        participantNom,
        formationTitre: f.titre,
        formationDate: dateFormatted,
        motif,
      }),
    }).catch(() => {});
  }

  return NextResponse.json(updated);
}
