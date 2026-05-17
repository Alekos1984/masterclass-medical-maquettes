"use client";

import Link from "next/link";
import { useState } from "react";

export default function AdminDemandeSallePage() {
  const [devisValidated, setDevisValidated] = useState(false);
  const [transmitted, setTransmitted] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [methods, setMethods] = useState({ email: true, dashboard: true, phone: false });

  function handleValidate() {
    setDevisValidated(true);
  }

  function handleSendEmail() {
    setEmailSent(true);
  }

  function handleTransmit() {
    setTimeout(() => {
      setShowSuccess(true);
      setTransmitted(true);
    }, 1200);
  }

  function toggleMethod(key: "email" | "dashboard" | "phone") {
    setMethods((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/admin/demandes" className="topbar-back">← Retour</Link>
          <div className="topbar-sep"></div>
          <span className="topbar-title">Traitement demande · DR-2026-0041</span>
        </div>
        <div className="topbar-right">
          <span className="pill pill-orange">Contacté — devis en attente</span>
        </div>
      </div>

      <div className="content">

        {/* SLA BANNER */}
        <div className="sla-banner sla-banner-urgent">
          <div className="sla-banner-icon">⚠️</div>
          <div className="sla-banner-text">
            <strong>SLA critique — Il reste 20 heures</strong> avant expiration du délai de 72h garanti au formateur.
            Le devis doit être transmis avant demain 14h00.
          </div>
          <div className="sla-progress">
            <div className="sla-bar-big">
              <div className="sla-fill-big" style={{ width: "85%", background: "#c62828" }}></div>
            </div>
            <span className="sla-label" style={{ color: "#c62828" }}>20h restantes</span>
          </div>
        </div>

        {/* PAGE HEADER */}
        <div style={{ marginBottom: 24 }}>
          <div className="page-eyebrow">Demande de salle #DR-2026-0041</div>
          <div className="page-title-lg">Hôtel Lutetia — Paris 6e</div>
          <div className="page-meta">
            <span>Reçue le 24 avril 2026 à 09h14</span>
            <span className="page-meta-sep"></span>
            <span>Formation : Échocardiographie transthoracique</span>
            <span className="page-meta-sep"></span>
            <span>Dr. Pierre Dumont · Cardiologue · Lyon</span>
          </div>
        </div>

        {/* GRID: LEFT + RIGHT */}
        <div className="page-grid-detail">

          {/* COLONNE GAUCHE */}
          <div>

            {/* DEMANDE FORMATEUR */}
            <div className="card card-mb">
              <div className="card-header" style={{ borderBottom: "1px solid var(--light-gray)", paddingBottom: 12 }}>
                <div>
                  <div className="card-title">Demande du formateur</div>
                  <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 2 }}>
                    Informations saisies lors de la création de la formation
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <div className="formateur-mini">
                  <div className="formateur-avatar">PD</div>
                  <div>
                    <div className="formateur-name">Dr. Pierre Dumont</div>
                    <div className="formateur-spec">Cardiologue interventionnel · CHU Lyon</div>
                    <div className="formateur-contact">pierre.dumont@chu-lyon.fr · 06 12 34 56 78</div>
                  </div>
                </div>
                <div className="info-row"><span className="info-key">Formation</span><span className="info-val">Échocardiographie transthoracique — Cas cliniques</span></div>
                <div className="info-row"><span className="info-key">Dates souhaitées</span><span className="info-val">3–4 décembre 2026 (flexibles ± 2 semaines)</span></div>
                <div className="info-row"><span className="info-key">Capacité</span><span className="info-val">10–25 personnes</span></div>
                <div className="info-row"><span className="info-key">Lieu souhaité</span><span className="info-val">Hôtel Lutetia, Paris 6e (préférence exprimée)</span></div>
                <div className="info-row"><span className="info-key">Équipements</span><span className="info-val">Vidéoprojecteur · Sono · Wi-Fi · Tableau blanc</span></div>
                <div className="info-row"><span className="info-key">Restauration</span><span className="info-val">Pause café matin + déjeuner</span></div>
                <div className="info-row"><span className="info-key">Notes</span><span className="info-val">Accessibilité PMR requise. Proximité métro souhaitée.</span></div>
              </div>
            </div>

            {/* ÉTABLISSEMENT */}
            <div className="card card-mb">
              <div className="card-header" style={{ borderBottom: "1px solid var(--light-gray)", paddingBottom: 12 }}>
                <div>
                  <div className="card-title">Établissement identifié</div>
                  <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 2 }}>Données Google Places · enrichi manuellement</div>
                </div>
                <span className="pill pill-green">✓ Trouvé</span>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{
                  border: "1px solid #E0E0E0", borderRadius: 12, overflow: "hidden", marginBottom: 14,
                }}>
                  <div style={{
                    width: "100%", height: 100, background: "linear-gradient(135deg, #e8eaf6, #c5cae9)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 600, color: "#5c6bc0", position: "relative",
                  }}>
                    📍 Hôtel Lutetia · 45 Boulevard Raspail, Paris 75006
                    <div style={{
                      position: "absolute", top: 8, right: 8, background: "white",
                      borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700, color: "#5c6bc0",
                    }}>Vue Maps</div>
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 3 }}>Hôtel Lutetia Paris</div>
                    <div style={{ fontSize: 12, color: "var(--gray)", marginBottom: 10 }}>
                      45 Boulevard Raspail, 75006 Paris · Salle Josephine Baker
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                      {["⭐ 4.7 / 5 (Google)", "🏛️ Palace 5 étoiles", "👥 Capacité : 10–80 pers.", "🚇 Sèvres-Babylone (3 min)", "🚗 Parking Lutetia", "♿ PMR accessible"].map((d) => (
                        <div key={d} style={{ fontSize: 11, color: "var(--gray)", display: "flex", alignItems: "center", gap: 4 }}>{d}</div>
                      ))}
                    </div>
                    <div style={{ background: "var(--off-white)", borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--gray)", marginBottom: 8 }}>
                        Contact événements
                      </div>
                      <div style={{ fontSize: 12, marginBottom: 6 }}>👤 Marie Lefranc — Responsable séminaires</div>
                      <div style={{ fontSize: 12, marginBottom: 6 }}>📧 m.lefranc@lutetia-paris.com</div>
                      <div style={{ fontSize: 12, marginBottom: 6 }}>📞 +33 1 49 54 46 00</div>
                      <div style={{ fontSize: 12 }}>🌐 lutetia-paris.com/seminaires</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* EMAIL DE DEMANDE */}
            <div className="card card-mb">
              <div className="card-header" style={{ borderBottom: "1px solid #E0E0E0", paddingBottom: 12 }}>
                <div>
                  <div className="card-title">Email de demande de devis</div>
                  <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 2 }}>Pré-rempli automatiquement · modifiable</div>
                </div>
                <span className="pill pill-green">✓ Pré-rempli</span>
              </div>
              <div style={{ padding: "14px 0", borderBottom: "1px solid #E0E0E0", display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  ["De", "devis@masterclassmedicale.com (équipe Masterclass Médical)"],
                  ["À", "m.lefranc@lutetia-paris.com"],
                  ["Cc", "pierre.dumont@chu-lyon.fr"],
                  ["Objet", "Demande de devis — Location salle séminaire médical — 3-4 décembre 2026 [REF:DR-2026-0041]"],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--gray)", minWidth: 60, flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: 12, color: "var(--black)" }}>{val}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "14px 0", borderBottom: "1px solid #E0E0E0" }}>
                <textarea
                  readOnly
                  style={{
                    width: "100%", border: "none", outline: "none", fontSize: 13,
                    fontFamily: "inherit", color: "var(--black)", lineHeight: 1.7,
                    resize: "none", minHeight: 180, background: "transparent",
                  }}
                  defaultValue={`Madame Lefranc,

Je me permets de vous contacter au nom de la plateforme Masterclass Médical pour une demande de devis concernant la location d'une salle de séminaire.

DÉTAILS DE L'ÉVÉNEMENT :
• Type : Formation médicale présentielle (masterclass)
• Dates souhaitées : 3 et/ou 4 décembre 2026 (flexibilité ± 2 semaines possible)
• Nombre de participants : 10 à 25 personnes
• Durée : 1 journée complète (08h30 – 17h30)

ÉQUIPEMENTS REQUIS :
✓ Vidéoprojecteur et écran
✓ Système de sonorisation et microphone
✓ Connexion Wi-Fi haut débit
✓ Tableau blanc ou paperboard
✓ Accessibilité PMR

Cordialement,
L'équipe Masterclass Médical`}
                />
              </div>
              <div style={{ paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--off-white)", margin: "0 -20px -18px", padding: "12px 20px", borderTop: "1px solid #E0E0E0" }}>
                <div style={{ fontSize: 11, color: "var(--gray)" }}>
                  🔑 ID : <span style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 5, padding: "2px 7px", fontSize: 10, fontWeight: 600, fontFamily: "monospace" }}>DR-2026-0041</span>
                </div>
                <button
                  className={emailSent ? "btn btn-green" : "btn btn-red"}
                  onClick={handleSendEmail}
                  style={{ fontSize: 13, padding: "9px 18px", borderRadius: 8 }}
                >
                  {emailSent ? "✓ Email envoyé" : "📤 Envoyer l'email"}
                </button>
              </div>
            </div>

            {/* RÉCEPTION DEVIS */}
            <div className="card card-mb">
              <div className="card-header" style={{ borderBottom: "1px solid var(--light-gray)", paddingBottom: 12 }}>
                <div>
                  <div className="card-title">Réception du devis</div>
                  <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 2 }}>Upload par l'hôtel ou l'admin</div>
                </div>
                <span className="pill pill-green">✓ Devis reçu</span>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ background: "#f1f8e9", border: "1.5px solid #c8e6c9", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 20 }}>📄</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#2e7d32" }}>Lutetia_Devis_Dec2026.pdf</div>
                      <div style={{ fontSize: 11, color: "#388e3c" }}>Reçu le 25 avril 2026 à 14h22 · Via lien upload · 234 Ko</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#1b5e20", marginBottom: 4 }}>1 850 € HT</div>
                  <div style={{ fontSize: 11, color: "#388e3c" }}>Location salle Josephine Baker (1j) + équipements + pause café + déjeuner</div>
                  <button className="btn btn-green" style={{ marginTop: 10 }}>👁️ Consulter le PDF</button>
                </div>
              </div>
            </div>

            {/* JOURNAL */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Journal des actions</span>
              </div>
              {[
                { color: "#2e7d32", action: "Devis reçu via lien upload", detail: "Lutetia_Devis_Dec2026.pdf · 1 850 € HT · Uploadé par l'hôtel", time: "25 avril 2026 · 14h22" },
                { color: "#1565c0", action: "Email de demande envoyé", detail: "Destinataire : m.lefranc@lutetia-paris.com · Objet : Demande devis [REF:DR-2026-0041]", time: "24 avril 2026 · 10h05" },
                { color: "#e65100", action: "Établissement identifié automatiquement", detail: "Hôtel Lutetia Paris — Contact enrichi depuis la base interne", time: "24 avril 2026 · 09h16" },
                { color: "var(--red)", action: "Demande reçue", detail: "Dr. Pierre Dumont · Paris · 10–25 personnes · 3–4 déc. 2026", time: "24 avril 2026 · 09h14" },
              ].map((j) => (
                <div key={j.action} className="journal-item">
                  <div className="journal-dot" style={{ background: j.color }}></div>
                  <div>
                    <div className="journal-action">{j.action}</div>
                    <div className="journal-detail">{j.detail}</div>
                    <div className="journal-time">{j.time}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* COLONNE DROITE */}
          <div>

            {/* WORKFLOW */}
            <div className="card card-mb">
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Workflow de traitement</div>
              {[
                { num: "✓", cls: "step-done", title: "Demande reçue", time: "24 avr. 2026 · 09h14" },
                { num: "✓", cls: "step-done", title: "Établissement identifié", time: "24 avr. · 09h16 · Auto" },
                { num: "✓", cls: "step-done", title: "Email envoyé à l'hôtel", time: "24 avr. · 10h05" },
                { num: "✓", cls: "step-done", title: "Devis reçu", time: "25 avr. · 14h22 · Upload hôtel" },
                {
                  num: devisValidated ? "✓" : "5",
                  cls: devisValidated ? "step-done" : "step-active",
                  title: "Validation admin",
                  sub: devisValidated ? undefined : "Vérifier le devis et valider",
                },
                { num: "6", cls: "step-todo", title: "Transmission au formateur", sub: "Dashboard + email + appel" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="action-step">
                    <div className={`action-step-num ${s.cls}`}>{s.num}</div>
                    <div>
                      <div className="action-step-title" style={{ color: !devisValidated && s.cls === "step-active" ? "var(--red)" : undefined }}>
                        {s.title}
                      </div>
                      {s.sub && <div className="action-step-sub">{s.sub}</div>}
                      {s.time && <div className="action-step-time">{s.time}</div>}
                    </div>
                  </div>
                  {i < 5 && <div className="step-connector"></div>}
                </div>
              ))}
            </div>

            {/* VALIDATION */}
            <div className="card card-mb">
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Validation du devis</div>
              <div style={{ background: "var(--off-white)", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
                {[
                  ["Salle + équipements", "1 650 € HT"],
                  ["Restauration (2 pauses + déj.)", "200 € HT"],
                  ["Frais gestion plateforme (10%)", "+ 185 € HT", "var(--red)"],
                  ["Total formateur", "2 035 € HT", "var(--red)", true],
                ].map(([label, val, color, bold]) => (
                  <div key={label as string} style={{
                    display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6,
                    ...(bold ? { paddingTop: 8, borderTop: "1px solid #E0E0E0", fontWeight: 700, marginBottom: 0 } : {}),
                  }}>
                    <span style={{ color: bold ? undefined : "var(--gray)" }}>{label}</span>
                    <span style={{ color: color as string | undefined }}>{val}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleValidate}
                style={{
                  width: "100%", background: devisValidated ? "#1b5e20" : "#2e7d32", color: "white",
                  border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit", marginBottom: 8,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {devisValidated ? "✓ Devis validé" : "✓ Valider ce devis"}
              </button>
              {!devisValidated && (
                <button style={{
                  width: "100%", background: "white", color: "#c62828",
                  border: "1.5px solid #ef9a9a", borderRadius: 10, padding: 10, fontSize: 13,
                  fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                }}>
                  ✗ Refuser et demander un nouveau devis
                </button>
              )}
            </div>

            {/* TRANSMISSION */}
            <div style={{ background: "linear-gradient(135deg, #0F0F0F, #1a0408)", borderRadius: 14, padding: "18px 20px", color: "white" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 14 }}>Transmission au formateur</div>
              {[
                { key: "email" as const, icon: "📧", label: "Email automatique", sub: "Via Brevo · Devis en PJ · Immédiat" },
                { key: "dashboard" as const, icon: "📊", label: "Dashboard formateur", sub: "Notification + devis visible dans l'espace" },
                { key: "phone" as const, icon: "📞", label: "Appel téléphonique", sub: "06 12 34 56 78 · Script affiché" },
              ].map((m) => (
                <div
                  key={m.key}
                  onClick={() => toggleMethod(m.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                    background: methods[m.key] ? "rgba(200,16,46,0.12)" : "rgba(255,255,255,0.07)",
                    borderRadius: 8, marginBottom: 8, cursor: "pointer",
                    border: methods[m.key] ? "1.5px solid rgba(200,16,46,0.5)" : "1.5px solid transparent",
                  }}
                >
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "white" }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{m.sub}</div>
                  </div>
                  <div style={{
                    marginLeft: "auto", width: 18, height: 18, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10,
                    background: methods[m.key] ? "var(--red)" : "transparent",
                    border: methods[m.key] ? "none" : "2px solid rgba(255,255,255,0.2)",
                    color: "white", fontWeight: 700,
                  }}>
                    {methods[m.key] ? "✓" : ""}
                  </div>
                </div>
              ))}
              <button
                disabled={!devisValidated}
                onClick={handleTransmit}
                style={{
                  width: "100%", background: devisValidated ? "var(--red)" : "#555",
                  color: "white", border: "none", borderRadius: 10, padding: 12,
                  fontSize: 14, fontWeight: 700, cursor: devisValidated ? "pointer" : "not-allowed",
                  fontFamily: "inherit", marginTop: 12, display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8,
                }}
              >
                🚀 Valider et transmettre au formateur
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ background: "white", borderRadius: 20, padding: 36, maxWidth: 440, width: "90%", textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Devis transmis au formateur !</div>
            <div style={{ fontSize: 13, color: "var(--gray)", lineHeight: 1.6, marginBottom: 24 }}>
              Le Dr. Pierre Dumont a reçu le devis de l'Hôtel Lutetia (1 850 € HT + 185 € frais gestion).<br /><br />
              <strong>Actions effectuées :</strong><br />
              ✓ Notification dans le dashboard formateur<br />
              ✓ Email envoyé via Brevo avec devis en PJ<br />
              ✓ Statut mis à jour : <em>Devis reçu</em>
            </div>
            <Link href="/admin/dashboard" style={{
              background: "var(--black)", color: "white", border: "none", borderRadius: 10,
              padding: "12px 28px", fontSize: 14, fontWeight: 700, textDecoration: "none", display: "inline-block",
            }}>
              Retour au dashboard →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
