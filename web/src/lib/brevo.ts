const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

interface SendEmailParams {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  replyTo?: { email: string; name?: string };
  attachment?: { name: string; content: string }[]; // content = base64
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
        <a href="https://masterclassmedicale.com" style="color:#C8102E;">masterclassmedicale.com</a></p>
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
    ${ctaButton("https://masterclassmedicale.com/participant/dashboard", "Accéder à mon espace")}
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
    ${ctaButton("https://masterclassmedicale.com/formateur/dashboard", "Accéder à mon tableau de bord")}
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
    ${ctaButton("https://masterclassmedicale.com/participant/dashboard", "Voir mon espace")}
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
    ${ctaButton(`https://masterclassmedicale.com/formateur/formations/${data.formationId}`, "Voir la formation")}
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
    ${ctaButton("https://masterclassmedicale.com/participant/dashboard", "Mon espace")}
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
    <p>Si vous pensez qu'il s'agit d'une erreur, contactez-nous à <a href="mailto:contact@masterclassmedicale.com" style="color:#C8102E;">contact@masterclassmedicale.com</a>.</p>
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

// ─── Coordination d'enseignement (DU) ─────────────────────────────────────────

export function emailInvitationEnseignant(data: {
  nom: string; cursusTitre: string; coordinateurNom: string; inviteUrl: string; dejaInscrit: boolean;
}) {
  return baseLayout(`
    <h2 style="font-size:19px;color:#0F0F0F;margin:0 0 12px;">Vous êtes invité·e comme enseignant·e 🧑‍🏫</h2>
    <p style="font-size:14px;color:#444;line-height:1.6;">Bonjour ${data.nom},</p>
    <p style="font-size:14px;color:#444;line-height:1.6;">
      <strong>${data.coordinateurNom}</strong> vous a ajouté·e à l'équipe pédagogique de
      « <strong>${data.cursusTitre}</strong> » sur Masterclass Médical.</p>
    <p style="font-size:14px;color:#444;line-height:1.6;">
      ${data.dejaInscrit
        ? "Connectez-vous pour consulter vos enseignements, charger vos supports et échanger avec les autres intervenants."
        : "Créez votre compte formateur (gratuit) pour consulter vos enseignements, charger vos supports et échanger avec les autres intervenants."}</p>
    ${ctaButton(data.inviteUrl, data.dejaInscrit ? "Voir mes enseignements" : "Accepter l'invitation")}
  `);
}

export function emailRappelEnseignement(data: {
  nom: string; cursusTitre: string; delaiLabel: string; dateStr: string; creneaux: string; lieu: string;
}) {
  return baseLayout(`
    <h2 style="font-size:19px;color:#0F0F0F;margin:0 0 12px;">Rappel : enseignement ${data.delaiLabel} ⏰</h2>
    <p style="font-size:14px;color:#444;line-height:1.6;">Bonjour ${data.nom},</p>
    <p style="font-size:14px;color:#444;line-height:1.6;">
      Vous intervenez <strong>${data.dateStr}</strong> dans le cadre de « <strong>${data.cursusTitre}</strong> ».</p>
    <div style="background:#f9f7f4;border-radius:8px;padding:14px 18px;font-size:13px;color:#444;line-height:1.7;">
      ${data.creneaux}<br/>📍 ${data.lieu}
    </div>
    <p style="font-size:13px;color:#999;line-height:1.6;margin-top:14px;">
      L'invitation agenda (.ics) est jointe à ce message. Pensez à vérifier que votre support de cours est bien chargé.</p>
  `);
}

export function emailEchangeCours(data: {
  nom: string; cursusTitre: string; proposantNom: string; slotA: string; slotB: string; actionUrl: string;
}) {
  return baseLayout(`
    <h2 style="font-size:19px;color:#0F0F0F;margin:0 0 12px;">Proposition d'échange de cours 🔄</h2>
    <p style="font-size:14px;color:#444;line-height:1.6;">Bonjour ${data.nom},</p>
    <p style="font-size:14px;color:#444;line-height:1.6;">
      <strong>${data.proposantNom}</strong> vous propose un échange dans « <strong>${data.cursusTitre}</strong> » :</p>
    <div style="background:#f9f7f4;border-radius:8px;padding:14px 18px;font-size:13px;color:#444;line-height:1.7;">
      Il/elle reprend : <strong>${data.slotB}</strong><br/>Vous reprenez : <strong>${data.slotA}</strong>
    </div>
    ${ctaButton(data.actionUrl, "Accepter ou refuser")}
  `);
}

export function emailEchangeDecide(data: {
  nom: string; cursusTitre: string; accepte: boolean; slotA: string; slotB: string;
}) {
  return baseLayout(`
    <h2 style="font-size:19px;color:#0F0F0F;margin:0 0 12px;">Échange ${data.accepte ? "accepté ✅" : "refusé ❌"}</h2>
    <p style="font-size:14px;color:#444;line-height:1.6;">Bonjour ${data.nom},</p>
    <p style="font-size:14px;color:#444;line-height:1.6;">
      L'échange proposé dans « <strong>${data.cursusTitre}</strong> » (${data.slotA} ⇄ ${data.slotB})
      a été <strong>${data.accepte ? "accepté — le programme a été mis à jour automatiquement" : "refusé"}</strong>.</p>
  `);
}

export function emailNouveauMessageCursus(data: {
  nom: string; cursusTitre: string; auteurNom: string; extrait: string; url: string;
}) {
  return baseLayout(`
    <h2 style="font-size:19px;color:#0F0F0F;margin:0 0 12px;">Nouveau message — ${data.cursusTitre} 💬</h2>
    <p style="font-size:14px;color:#444;line-height:1.6;">Bonjour ${data.nom},</p>
    <p style="font-size:14px;color:#444;line-height:1.6;"><strong>${data.auteurNom}</strong> a écrit :</p>
    <div style="background:#f9f7f4;border-radius:8px;padding:14px 18px;font-size:13px;color:#444;font-style:italic;">« ${data.extrait} »</div>
    ${ctaButton(data.url, "Répondre")}
  `);
}

export function emailProgrammeCursus(data: {
  nom: string; cursusTitre: string; programmeHtml: string; pdfUrl: string;
}) {
  return baseLayout(`
    <h2 style="font-size:19px;color:#0F0F0F;margin:0 0 12px;">Programme — ${data.cursusTitre} 📅</h2>
    <p style="font-size:14px;color:#444;line-height:1.6;">Bonjour ${data.nom},</p>
    <p style="font-size:14px;color:#444;line-height:1.6;">Voici le programme complet :</p>
    ${data.programmeHtml}
    ${ctaButton(data.pdfUrl, "Télécharger le programme PDF")}
  `);
}

export function emailCompteEtudiantCursus(data: {
  nom: string; cursusTitre: string; email: string; motDePasse: string; loginUrl: string;
}) {
  return baseLayout(`
    <h2 style="font-size:19px;color:#0F0F0F;margin:0 0 12px;">Bienvenue — ${data.cursusTitre} 🎓</h2>
    <p style="font-size:14px;color:#444;line-height:1.6;">Bonjour ${data.nom},</p>
    <p style="font-size:14px;color:#444;line-height:1.6;">
      Vous avez été inscrit·e à « <strong>${data.cursusTitre}</strong> » sur Masterclass Médical.
      Votre compte donne accès aux supports, aux sessions en direct, à l'émargement et à vos attestations.</p>
    <div style="background:#f9f7f4;border-radius:8px;padding:14px 18px;font-size:13px;color:#444;line-height:1.8;">
      Identifiant : <strong>${data.email}</strong><br/>
      Mot de passe provisoire : <strong>${data.motDePasse}</strong>
    </div>
    <p style="font-size:12px;color:#999;margin-top:10px;">Modifiez ce mot de passe dès votre première connexion (Mon profil).</p>
    ${ctaButton(data.loginUrl, "Me connecter")}
  `);
}

export function emailRappelEtudiantCursus(data: {
  nom: string; cursusTitre: string; delaiLabel: string; dateStr: string; heureDebut: string; heureFin: string; lieu: string;
}) {
  return baseLayout(`
    <h2 style="font-size:19px;color:#0F0F0F;margin:0 0 12px;">Rappel : cours ${data.delaiLabel} 📅</h2>
    <p style="font-size:14px;color:#444;line-height:1.6;">Bonjour ${data.nom},</p>
    <p style="font-size:14px;color:#444;line-height:1.6;">
      Vous avez un cours de « <strong>${data.cursusTitre}</strong> » <strong>${data.dateStr}</strong>.</p>
    <div style="background:#f9f7f4;border-radius:8px;padding:14px 18px;font-size:13px;color:#444;line-height:1.7;">
      🕐 ${data.heureDebut}–${data.heureFin}<br/>📍 ${data.lieu}
    </div>
    <p style="font-size:12px;color:#999;margin-top:10px;">L'invitation agenda (.ics) est jointe à ce message.</p>
  `);
}

export function emailChangementJourneeCursus(data: {
  nom: string; cursusTitre: string; dateStr: string; heureDebut: string; heureFin: string; lieu: string;
}) {
  return baseLayout(`
    <h2 style="font-size:19px;color:#0F0F0F;margin:0 0 12px;">Un cours a été modifié ⚠️</h2>
    <p style="font-size:14px;color:#444;line-height:1.6;">Bonjour ${data.nom},</p>
    <p style="font-size:14px;color:#444;line-height:1.6;">
      Les horaires ou le lieu d'un cours de « <strong>${data.cursusTitre}</strong> » ont changé :</p>
    <div style="background:#fff8e1;border-radius:8px;padding:14px 18px;font-size:13px;color:#5d4037;line-height:1.7;">
      📅 ${data.dateStr}<br/>🕐 ${data.heureDebut}–${data.heureFin}<br/>📍 ${data.lieu}
    </div>
    <p style="font-size:12px;color:#999;margin-top:10px;">Merci de noter la mise à jour dans votre agenda.</p>
  `);
}

export function emailResultatsDisponiblesCursus(data: {
  nom: string; cursusTitre: string; moduleIntitule: string; url: string;
}) {
  return baseLayout(`
    <h2 style="font-size:19px;color:#0F0F0F;margin:0 0 12px;">Vos résultats sont disponibles 📊</h2>
    <p style="font-size:14px;color:#444;line-height:1.6;">Bonjour ${data.nom},</p>
    <p style="font-size:14px;color:#444;line-height:1.6;">
      Votre résultat pour « <strong>${data.moduleIntitule}</strong> » (${data.cursusTitre}) est maintenant disponible.</p>
    ${ctaButton(data.url, "Voir mon résultat")}
  `);
}

// ─── Proposition et confirmation de créneaux (équipe pédagogique) ─────────────

/** Message libre rédigé (et modifiable) par le coordinateur — ex : proposition de créneau. */
export function emailMessageCoordination(data: { corps: string; lienConfirmation?: string }) {
  return baseLayout(`
    <p style="font-size:14px;color:#444;line-height:1.7;white-space:pre-wrap;">${data.corps.replace(/\n/g, "<br/>")}</p>
    ${data.lienConfirmation ? ctaButton(data.lienConfirmation, "Répondre en ligne") : ""}
  `);
}

export function emailConfirmationCreneaux(data: { nom: string; cursusTitre: string; recapHtml: string }) {
  return baseLayout(`
    <h2 style="font-size:19px;color:#0F0F0F;margin:0 0 12px;">Merci pour votre réponse ✅</h2>
    <p style="font-size:14px;color:#444;line-height:1.6;">Bonjour ${data.nom},</p>
    <p style="font-size:14px;color:#444;line-height:1.6;">
      Voici un récapitulatif de votre réponse concernant « <strong>${data.cursusTitre}</strong> » :</p>
    <div style="background:#f9f7f4;border-radius:8px;padding:14px 18px;font-size:13px;color:#444;line-height:1.8;">${data.recapHtml}</div>
    <p style="font-size:12px;color:#999;margin-top:14px;">
      Vous n'êtes pas à l'origine de cette réponse ou une erreur s'est glissée ? Contactez le coordinateur du DU au plus vite.</p>
  `);
}

export function emailNotificationReponseCreneau(data: { enseignantNom: string; cursusTitre: string; recapHtml: string }) {
  return baseLayout(`
    <h2 style="font-size:19px;color:#0F0F0F;margin:0 0 12px;">Réponse d'un enseignant 📩</h2>
    <p style="font-size:14px;color:#444;line-height:1.6;">
      <strong>${data.enseignantNom}</strong> vient de répondre à une proposition de créneau pour « <strong>${data.cursusTitre}</strong> » :</p>
    <div style="background:#f9f7f4;border-radius:8px;padding:14px 18px;font-size:13px;color:#444;line-height:1.8;">${data.recapHtml}</div>
  `);
}
