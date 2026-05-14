const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

interface SendEmailParams {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  replyTo?: { email: string; name?: string };
}

export async function sendEmail(params: SendEmailParams) {
  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME ?? "Masterclass Médical",
        email: process.env.BREVO_SENDER_EMAIL!,
      },
      ...params,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Brevo error: ${response.status} — ${error}`);
  }

  return response.json();
}

// ─── Templates ────────────────────────────────────────────────────────────────

export function emailConfirmationInscription(data: {
  participantNom: string;
  formationTitre: string;
  formationDate: string;
  formationLieu: string;
  montant: string;
  conventionUrl?: string;
}) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
      <h2 style="color:#C8102E;">Inscription confirmée ✅</h2>
      <p>Bonjour ${data.participantNom},</p>
      <p>Votre inscription à <strong>${data.formationTitre}</strong> est confirmée.</p>
      <ul>
        <li>📅 Date : ${data.formationDate}</li>
        <li>📍 Lieu : ${data.formationLieu}</li>
        <li>💳 Montant réglé : ${data.montant} HT</li>
      </ul>
      ${data.conventionUrl ? `<p><a href="${data.conventionUrl}">Télécharger votre convention de formation</a></p>` : ""}
      <p>À très bientôt,<br/>L'équipe Masterclass Médical</p>
    </div>
  `;
}

export function emailRappelFormation(data: {
  participantNom: string;
  formationTitre: string;
  formationDate: string;
  formationLieu: string;
  emargementUrl: string;
}) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
      <h2 style="color:#C8102E;">Rappel — votre formation demain 📅</h2>
      <p>Bonjour ${data.participantNom},</p>
      <p>Votre formation <strong>${data.formationTitre}</strong> a lieu demain.</p>
      <ul>
        <li>📅 ${data.formationDate}</li>
        <li>📍 ${data.formationLieu}</li>
      </ul>
      <p>
        <a href="${data.emargementUrl}" style="background:#C8102E;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Confirmer ma présence
        </a>
      </p>
    </div>
  `;
}

export function emailVirementEffectue(data: {
  formateurNom: string;
  formationTitre: string;
  montantNet: string;
  iban: string;
}) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
      <h2 style="color:#C8102E;">Virement effectué 💳</h2>
      <p>Bonjour ${data.formateurNom},</p>
      <p>Le virement pour la formation <strong>${data.formationTitre}</strong> a été effectué.</p>
      <ul>
        <li>Montant net : <strong>${data.montantNet} HT</strong></li>
        <li>IBAN : ${data.iban}</li>
      </ul>
      <p>Merci pour votre confiance,<br/>L'équipe Masterclass Médical</p>
    </div>
  `;
}
