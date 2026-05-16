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

// ─── Shared style helpers ─────────────────────────────────────────────────────

function baseLayout(content: string) {
  return `
    <div style="font-family:'Helvetica Neue',sans-serif;max-width:580px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e8e8;">
      <div style="background:#0F0F0F;padding:20px 28px;display:flex;align-items:center;gap:10px;">
        <div style="width:28px;height:28px;border-radius:7px;background:#C8102E;display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:white;">M</div>
        <span style="font-size:15px;font-weight:800;color:white;">Masterclass Médical</span>
      </div>
      <div style="padding:28px;">
        ${content}
        <hr style="border:none;border-top:1px solid #f0f0f0;margin:24px 0;"/>
        <p style="font-size:12px;color:#999;margin:0;">Masterclass Médical · plateforme de formation médicale continue<br/>
        <a href="https://masterclassmedical.fr" style="color:#C8102E;">masterclassmedical.fr</a></p>
      </div>
    </div>
  `;
}

function ctaButton(href: string, label: string) {
  return `<p style="text-align:center;margin:24px 0;">
    <a href="${href}" style="background:#C8102E;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
      ${label}
    </a>
  </p>`;
}

// ─── Templates ────────────────────────────────────────────────────────────────

export function emailBienvenueParticipant(data: { nom: string }) {
  return baseLayout(`
    <h2 style="color:#0F0F0F;margin-top:0;">Bienvenue sur Masterclass Médical 🎉</h2>
    <p>Bonjour ${data.nom},</p>
    <p>Votre compte participant a été créé avec succès. Vous pouvez maintenant vous inscrire aux formations médicales disponibles sur la plateforme.</p>
    <p>Depuis votre espace personnel, vous retrouverez :</p>
    <ul style="color:#444;line-height:1.8;">
      <li>📋 Vos inscriptions et documents associés</li>
      <li>🎓 Vos attestations de formation</li>
      <li>⭐ Vos questionnaires de satisfaction</li>
    </ul>
    ${ctaButton("https://masterclassmedical.fr/participant/dashboard", "Accéder à mon espace")}
    <p>À très bientôt,<br/><strong>L'équipe Masterclass Médical</strong></p>
  `);
}

export function emailBienvenueFormateur(data: { nom: string }) {
  return baseLayout(`
    <h2 style="color:#0F0F0F;margin-top:0;">Bienvenue, formateur Masterclass Médical 🩺</h2>
    <p>Bonjour Dr. ${data.nom},</p>
    <p>Votre compte formateur a été créé. Vous pouvez dès maintenant créer vos formations et gérer vos participants.</p>
    <p>Depuis votre tableau de bord :</p>
    <ul style="color:#444;line-height:1.8;">
      <li>📚 Créez et publiez vos formations</li>
      <li>👥 Gérez vos participants et émargements</li>
      <li>📄 Générez tous vos documents (PV, bilan, certificat…)</li>
    </ul>
    ${ctaButton("https://masterclassmedical.fr/formateur/dashboard", "Accéder à mon tableau de bord")}
    <p>À très bientôt,<br/><strong>L'équipe Masterclass Médical</strong></p>
  `);
}

export function emailConfirmationInscription(data: {
  participantNom: string;
  formationTitre: string;
  formationDate: string;
  formationLieu: string;
  montant: string;
  conventionUrl?: string;
}) {
  return baseLayout(`
    <h2 style="color:#0F0F0F;margin-top:0;">Inscription confirmée ✅</h2>
    <p>Bonjour ${data.participantNom},</p>
    <p>Votre inscription à <strong>${data.formationTitre}</strong> est confirmée.</p>
    <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:4px 0;">📅 <strong>Date :</strong> ${data.formationDate}</p>
      <p style="margin:4px 0;">📍 <strong>Lieu :</strong> ${data.formationLieu}</p>
      <p style="margin:4px 0;">💳 <strong>Montant réglé :</strong> ${data.montant} HT</p>
    </div>
    ${data.conventionUrl ? `<p>📄 <a href="${data.conventionUrl}" style="color:#C8102E;">Télécharger votre convention de formation</a></p>` : ""}
    ${ctaButton("https://masterclassmedical.fr/participant/dashboard", "Voir mon espace")}
    <p>À très bientôt,<br/><strong>L'équipe Masterclass Médical</strong></p>
  `);
}

export function emailNouvelleInscription(data: {
  formateurNom: string;
  participantNom: string;
  formationTitre: string;
  formationDate: string;
  formationId: string;
}) {
  return baseLayout(`
    <h2 style="color:#0F0F0F;margin-top:0;">Nouvelle inscription 👤</h2>
    <p>Bonjour ${data.formateurNom},</p>
    <p><strong>${data.participantNom}</strong> vient de s'inscrire à votre formation :</p>
    <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:4px 0;font-weight:700;">${data.formationTitre}</p>
      <p style="margin:4px 0;color:#666;">📅 ${data.formationDate}</p>
    </div>
    ${ctaButton(`https://masterclassmedical.fr/formateur/formations/${data.formationId}`, "Voir la formation")}
    <p>Cordialement,<br/><strong>L'équipe Masterclass Médical</strong></p>
  `);
}

export function emailRappelFormation(data: {
  participantNom: string;
  formationTitre: string;
  formationDate: string;
  formationLieu: string;
  emargementUrl: string;
}) {
  return baseLayout(`
    <h2 style="color:#0F0F0F;margin-top:0;">Rappel — votre formation demain 📅</h2>
    <p>Bonjour ${data.participantNom},</p>
    <p>Votre formation <strong>${data.formationTitre}</strong> a lieu demain.</p>
    <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:4px 0;">📅 ${data.formationDate}</p>
      <p style="margin:4px 0;">📍 ${data.formationLieu}</p>
    </div>
    <p>Le jour J, vous recevrez un lien pour confirmer votre présence (émargement numérique).</p>
    ${ctaButton("https://masterclassmedical.fr/participant/dashboard", "Mon espace")}
    <p>À demain,<br/><strong>L'équipe Masterclass Médical</strong></p>
  `);
}

export function emailPVPretPourSignature(data: {
  participantNom: string;
  formationTitre: string;
  formationDate: string;
  pvUrl: string;
}) {
  return baseLayout(`
    <h2 style="color:#0F0F0F;margin-top:0;">Votre PV de formation est prêt ✍️</h2>
    <p>Bonjour ${data.participantNom},</p>
    <p>Le formateur a signé le procès-verbal de la formation <strong>${data.formationTitre}</strong> du ${data.formationDate}.</p>
    <p>Vous pouvez maintenant co-signer ce document depuis votre espace personnel :</p>
    ${ctaButton(data.pvUrl, "Signer le PV de formation")}
    <p style="font-size:12px;color:#999;">Ce document atteste officiellement de votre participation à la formation.</p>
    <p>Cordialement,<br/><strong>L'équipe Masterclass Médical</strong></p>
  `);
}

export function emailInscriptionAnnulee(data: {
  participantNom: string;
  formationTitre: string;
  formationDate: string;
  motif?: string;
}) {
  return baseLayout(`
    <h2 style="color:#0F0F0F;margin-top:0;">Inscription annulée</h2>
    <p>Bonjour ${data.participantNom},</p>
    <p>Votre inscription à la formation <strong>${data.formationTitre}</strong> du ${data.formationDate} a été annulée.</p>
    ${data.motif ? `<p><strong>Motif :</strong> ${data.motif}</p>` : ""}
    <p>Si vous pensez qu'il s'agit d'une erreur, contactez-nous à <a href="mailto:contact@masterclassmedical.fr" style="color:#C8102E;">contact@masterclassmedical.fr</a>.</p>
    <p>Cordialement,<br/><strong>L'équipe Masterclass Médical</strong></p>
  `);
}

export function emailAttestationDisponible(data: {
  participantNom: string;
  formationTitre: string;
  formationDate: string;
  dashboardUrl: string;
}) {
  return baseLayout(`
    <h2 style="color:#0F0F0F;margin-top:0;">Votre attestation est disponible 🎓</h2>
    <p>Bonjour ${data.participantNom},</p>
    <p>Votre attestation de participation à la formation <strong>${data.formationTitre}</strong> du ${data.formationDate} est disponible en téléchargement.</p>
    ${ctaButton(data.dashboardUrl, "Télécharger mon attestation")}
    <p>Cordialement,<br/><strong>L'équipe Masterclass Médical</strong></p>
  `);
}

export function emailVirementEffectue(data: {
  formateurNom: string;
  formationTitre: string;
  montantNet: string;
  iban: string;
}) {
  return baseLayout(`
    <h2 style="color:#0F0F0F;margin-top:0;">Virement effectué 💳</h2>
    <p>Bonjour ${data.formateurNom},</p>
    <p>Le virement pour la formation <strong>${data.formationTitre}</strong> a été effectué.</p>
    <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:4px 0;">💶 <strong>Montant net :</strong> ${data.montantNet} HT</p>
      <p style="margin:4px 0;">🏦 <strong>IBAN :</strong> ${data.iban}</p>
    </div>
    <p>Merci pour votre confiance,<br/><strong>L'équipe Masterclass Médical</strong></p>
  `);
}
