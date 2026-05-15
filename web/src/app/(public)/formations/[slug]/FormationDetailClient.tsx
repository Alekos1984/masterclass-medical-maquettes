"use client";

import Link from "next/link";
import { useState } from "react";

export type FormationData = {
  id: string;
  slug: string;
  titre: string;
  specialite: string;
  niveau: string;
  description: string;
  date: string;
  dateShort: string;
  heureDebut: string;
  heureFin: string;
  dureeHeures: number;
  placesTotal: number;
  placesRestantes: number;
  placesReserved: number;
  prixHT: number;
  gratuite: boolean;
  lieuVille: string;
  lieuNom: string;
  lieuSalle: string;
  lieuAdresse: string;
  objectifs: string[];
  programme: { time: string; title: string; description?: string; type?: string }[];
  formateurInitials: string;
  formateurName: string;
  formateurSpec: string;
  formateurBio: string;
  formateurExperience: number;
  formateurPublications: number;
  formateurFormations: number;
  linkedinUrl: string;
  researchgateUrl: string;
  pubmedUrl: string;
};

type Tab = "programme" | "formateur" | "lieu" | "infos";

function getTypeCss(type?: string): string {
  if (!type) return "type-cours";
  const t = type.toLowerCase();
  if (t === "atelier") return "type-atelier";
  if (t === "pause") return "type-pause";
  if (t === "cours") return "type-cours";
  return "type-cours";
}

export default function FormationDetailClient({ formation }: { formation: FormationData }) {
  const [activeTab, setActiveTab] = useState<Tab>("programme");

  const fillPct = Math.round((formation.placesReserved / formation.placesTotal) * 100);
  const hours = `${formation.heureDebut}–${formation.heureFin}`;
  const venue = formation.lieuNom || "Lieu en cours de confirmation";
  const descriptionText =
    formation.description || "Une formation médicale de qualité animée par des experts.";
  const coiText =
    "Aucun lien d'intérêt déclaré en rapport avec le contenu de cette formation.";

  const formateurStats = [
    {
      val: String(formation.formateurFormations),
      label: "Formations",
    },
    {
      val: formation.formateurExperience ? String(formation.formateurExperience) : "—",
      label: "Ans d'expérience",
    },
    {
      val: formation.formateurPublications ? String(formation.formateurPublications) : "—",
      label: "Publications",
    },
  ];

  const infos = [
    { icon: "📄", title: "Attestation", val: "Envoyée sous 24h", sub: "PDF nominatif envoyé par email après la formation" },
    { icon: "💳", title: "Paiement", val: "Sécurisé en ligne", sub: "Carte bancaire via Stripe · Facture PDF immédiate" },
    { icon: "❌", title: "Annulation", val: "Remboursement J-14", sub: "Remboursement intégral si annulation 14 jours avant" },
    { icon: "🎯", title: "Public cible", val: "Médecins spécialistes", sub: `Niveau ${formation.niveau} · RPPS recommandé` },
    { icon: "📋", title: "Convention", val: "Signature électronique", sub: "Convention de formation envoyée via YouSign" },
    { icon: "🍽️", title: "Restauration", val: "Incluse", sub: "Pause café matin + déjeuner pris en charge" },
  ];

  const docs = [
    "Convention de formation",
    "Facture participant PDF",
    "Programme officiel PDF",
    "Attestation de participation",
    "Questionnaire de satisfaction",
  ];

  return (
    <>
      {/* NAV */}
      <nav style={{
        background: "#0F0F0F",
        padding: "0 40px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#C8102E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "white" }}>M</div>
          <span style={{ fontSize: "1rem", fontWeight: 800, color: "white" }}>Masterclass Médical</span>
        </Link>
        <Link href="/formations" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
          ← Catalogue des formations
        </Link>
      </nav>

      {/* HERO */}
      <div style={{
        background: "linear-gradient(135deg, #080810 0%, #1a0408 50%, #0a1018 100%)",
        padding: "48px 40px 0",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Grid overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(200,16,46,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(200,16,46,0.055) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />
        {/* Glow */}
        <div style={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 440,
          height: 440,
          background: "radial-gradient(circle, rgba(200,16,46,0.18) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "1fr 320px", gap: 40, alignItems: "start" }}>
          {/* Left */}
          <div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
              Formations → {formation.specialite}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              <span style={{ padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: "rgba(200,16,46,0.15)", border: "1px solid rgba(200,16,46,0.35)", color: "#ff8a96" }}>
                {formation.specialite}
              </span>
              <span style={{ padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.65)" }}>
                📅 {formation.date}
              </span>
              {formation.placesRestantes <= 3 && (
                <span style={{ padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: "rgba(46,204,113,0.12)", border: "1px solid rgba(46,204,113,0.3)", color: "#7fe5a0" }}>
                  ● {formation.placesRestantes} places restantes
                </span>
              )}
            </div>
            <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 800, color: "white", lineHeight: 1.1, letterSpacing: -1, marginBottom: 12 }}>
              {formation.titre}<br />
              <span style={{ fontFamily: "var(--font-serif, 'Instrument Serif', serif)", fontStyle: "italic", fontWeight: 400, color: "#ff8a96" }}>
                {formation.specialite}
              </span>
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.48)", lineHeight: 1.7, marginBottom: 24, maxWidth: 500 }}>
              {descriptionText}
            </p>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
                🕐 <strong style={{ color: "white", fontWeight: 600 }}>{formation.dureeHeures}h</strong> · Journée
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
                📍 <strong style={{ color: "white", fontWeight: 600 }}>{formation.lieuVille || "Lieu à confirmer"}</strong> · {venue}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
                👥 <strong style={{ color: "white", fontWeight: 600 }}>{formation.placesTotal} max</strong> · Format premium
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
                🎓 Niveau <strong style={{ color: "white", fontWeight: 600 }}>{formation.niveau}</strong>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #C8102E, #ff6b7a)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "white", flexShrink: 0 }}>
                {formation.formateurInitials}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{formation.formateurName}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{formation.formateurSpec}</div>
              </div>
            </div>
          </div>

          {/* Hero Card */}
          <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#0F0F0F", letterSpacing: -1, marginBottom: 2 }}>
              {formation.gratuite ? "Gratuit" : `${formation.prixHT} €`}{" "}
              {!formation.gratuite && <span style={{ fontSize: 14, fontWeight: 400, color: "#6A6A6A", letterSpacing: 0 }}>HT / participant</span>}
            </div>
            <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 14 }}>Exonéré de TVA (art. 261-4-4° CGI)</div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                <span style={{ color: "#6A6A6A" }}>Places réservées</span>
                <span style={{ fontWeight: 700, color: "#0F0F0F" }}>{formation.placesReserved} / {formation.placesTotal}</span>
              </div>
              <div style={{ background: "#EBEBEB", borderRadius: 100, height: 5, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 100, background: "linear-gradient(90deg, #C8102E, #E8394A)", width: `${fillPct}%` }} />
              </div>
              {formation.placesRestantes <= 5 && (
                <div style={{ fontSize: 11, color: "#C8102E", fontWeight: 600, marginTop: 4 }}>
                  ⚡ Plus que {formation.placesRestantes} places disponibles
                </div>
              )}
            </div>
            <Link
              href="/auth/inscription/participant"
              style={{
                display: "block",
                width: "100%",
                background: "#C8102E",
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: 13,
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "inherit",
                marginBottom: 8,
                boxShadow: "0 4px 14px rgba(200,16,46,0.3)",
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              S&apos;inscrire maintenant →
            </Link>
            <button style={{
              width: "100%",
              background: "transparent",
              color: "#6A6A6A",
              border: "1.5px solid #E0E0E0",
              borderRadius: 10,
              padding: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}>
              Poser une question
            </button>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #EBEBEB" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6A6A6A", marginBottom: 6 }}>
                📅 <span><strong style={{ color: "#0F0F0F" }}>{formation.dateShort}</strong> · {hours}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6A6A6A", marginBottom: 6 }}>
                📍 <span>{formation.lieuVille} · <strong style={{ color: "#0F0F0F" }}>{venue}{formation.lieuSalle ? `, ${formation.lieuSalle}` : ""}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6A6A6A", marginBottom: 6 }}>
                🍽️ <span>Pause café + <strong style={{ color: "#0F0F0F" }}>déjeuner inclus</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6A6A6A" }}>
                📄 <span><strong style={{ color: "#0F0F0F" }}>Attestation</strong> envoyée sous 24h</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 10, paddingTop: 10, borderTop: "1px solid #EBEBEB", textAlign: "center" }}>
              🔒 Paiement sécurisé · Remboursement J-14
            </div>
          </div>
        </div>
      </div>

      {/* TABS BAR */}
      <div style={{ background: "white", borderBottom: "1px solid #E0E0E0", position: "sticky", top: 64, zIndex: 90 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px", display: "flex" }}>
          {(["programme", "formateur", "lieu", "infos"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "16px 20px",
                fontSize: 14,
                fontWeight: 600,
                color: activeTab === tab ? "#0F0F0F" : "#6A6A6A",
                cursor: "pointer",
                background: "none",
                border: "none",
                borderBottom: `3px solid ${activeTab === tab ? "#C8102E" : "transparent"}`,
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                userSelect: "none",
              } as React.CSSProperties}
            >
              {tab === "programme" ? "Programme" : tab === "formateur" ? "Formateur" : tab === "lieu" ? "Lieu" : "Infos pratiques"}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 40, paddingTop: 40, paddingBottom: 60 }}>
          <div>
            {/* PROGRAMME TAB */}
            {activeTab === "programme" && (
              <div>
                <div className="section-eyebrow">Contenu</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0F0F0F", letterSpacing: -0.3, marginBottom: 16 }}>Présentation &amp; objectifs</div>
                <p style={{ fontSize: 14, color: "#6A6A6A", lineHeight: 1.75, marginBottom: 16 }}>
                  {descriptionText}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
                  {formation.objectifs.length > 0 ? (
                    formation.objectifs.map((obj, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 16px", background: "#F9F7F4", borderRadius: 12, borderLeft: "3px solid #C8102E" }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#C8102E", color: "white", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                          {i + 1}
                        </div>
                        <div style={{ fontSize: 13, color: "#0F0F0F", lineHeight: 1.55, fontWeight: 500 }}>{obj}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: 13, color: "#6A6A6A", padding: "13px 16px", background: "#F9F7F4", borderRadius: 12 }}>
                      Les objectifs de cette formation seront publiés prochainement.
                    </div>
                  )}
                </div>

                <div style={{ height: 1, background: "#EBEBEB", margin: "28px 0" }} />
                <div className="section-eyebrow">Déroulé</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0F0F0F", letterSpacing: -0.3, marginBottom: 16 }}>Programme de la journée</div>
                <div>
                  {formation.programme.length > 0 ? (
                    formation.programme.map((slot, i) => {
                      const typeCss = getTypeCss(slot.type);
                      return (
                        <div key={i} style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: i < formation.programme.length - 1 ? "1px solid #EBEBEB" : "none" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#C8102E", minWidth: 100, flexShrink: 0, paddingTop: 2 }}>{slot.time}</div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F0F0F", marginBottom: 3 }}>{slot.title}</div>
                            {slot.description && <div style={{ fontSize: 13, color: "#6A6A6A", lineHeight: 1.5 }}>{slot.description}</div>}
                            {slot.type && (
                              <span style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: 100,
                                marginTop: 5,
                                display: "inline-block",
                                ...(typeCss === "type-cours" ? { background: "#e3f2fd", color: "#1565c0" } :
                                  typeCss === "type-atelier" ? { background: "#fce4ec", color: "#880e4f" } :
                                  typeCss === "type-pause" ? { background: "#f3e5f5", color: "#6a1b9a" } :
                                  { background: "#e8f5e9", color: "#1b5e20" }),
                              }}>
                                {slot.type}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ fontSize: 13, color: "#6A6A6A", padding: "16px 0" }}>
                      Le programme sera publié prochainement.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FORMATEUR TAB */}
            {activeTab === "formateur" && (
              <div>
                <div className="section-eyebrow">Votre formateur</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0F0F0F", letterSpacing: -0.3, marginBottom: 16 }}>Qui anime cette masterclass ?</div>
                <div style={{ background: "#F9F7F4", borderRadius: 16, padding: 24, marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #C8102E, #ff6b7a)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22, color: "white", flexShrink: 0 }}>
                      {formation.formateurInitials}
                    </div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: "#0F0F0F", marginBottom: 2 }}>{formation.formateurName}</div>
                      <div style={{ fontSize: 13, color: "#6A6A6A" }}>{formation.formateurSpec}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 20, marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #E0E0E0" }}>
                    {formateurStats.map((stat) => (
                      <div key={stat.label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#0F0F0F" }}>{stat.val}</div>
                        <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 1 }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 13, color: "#6A6A6A", lineHeight: 1.65 }}>
                    {formation.formateurBio || "Biographie du formateur à venir."}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    {formation.linkedinUrl && (
                      <a href={formation.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: "#0F0F0F", border: "1px solid #E0E0E0", borderRadius: 8, padding: "5px 10px", textDecoration: "none" }}>🔗 LinkedIn</a>
                    )}
                    {formation.researchgateUrl && (
                      <a href={formation.researchgateUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: "#0F0F0F", border: "1px solid #E0E0E0", borderRadius: 8, padding: "5px 10px", textDecoration: "none" }}>🔬 ResearchGate</a>
                    )}
                    {formation.pubmedUrl && (
                      <a href={formation.pubmedUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: "#0F0F0F", border: "1px solid #E0E0E0", borderRadius: 8, padding: "5px 10px", textDecoration: "none" }}>📚 PubMed</a>
                    )}
                  </div>
                </div>

                <div style={{ height: 1, background: "#EBEBEB", margin: "28px 0" }} />
                <div className="section-eyebrow">Transparence</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0F0F0F", letterSpacing: -0.3, marginBottom: 16 }}>Déclaration de conflits d&apos;intérêt</div>
                <div style={{ background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: 12, padding: "14px 18px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#795548", marginBottom: 6 }}>ℹ️ Liens d&apos;intérêt</div>
                  <div style={{ fontSize: 13, color: "#795548", lineHeight: 1.6 }}>{coiText}</div>
                </div>
              </div>
            )}

            {/* LIEU TAB */}
            {activeTab === "lieu" && (
              <div>
                <div className="section-eyebrow">Lieu de la formation</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0F0F0F", letterSpacing: -0.3, marginBottom: 16 }}>Où se déroule la masterclass ?</div>
                <div style={{ border: "1px solid #E0E0E0", borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
                  <div style={{ width: "100%", height: 160, background: "linear-gradient(135deg, #e8eaf6, #c5cae9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#5c6bc0", fontSize: 13, fontWeight: 600 }}>
                    📍 {venue} · Vue carte interactive
                  </div>
                  <div style={{ padding: 18 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0F0F0F", marginBottom: 3 }}>{venue}</div>
                    <div style={{ fontSize: 13, color: "#6A6A6A", marginBottom: 10 }}>
                      {formation.lieuAdresse ? `${formation.lieuAdresse} · ` : ""}{formation.lieuSalle || "Salle à confirmer"}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(["📶 Wi-Fi haut débit", "🎤 Sono & micro", "📽️ Vidéoprojecteur", "🍽️ Restauration incluse"]).map((feat) => (
                        <span key={feat} style={{ fontSize: 12, color: "#6A6A6A", background: "#F9F7F4", border: "1px solid #EBEBEB", borderRadius: 6, padding: "3px 9px" }}>{feat}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, background: "#EBEBEB", margin: "28px 0" }} />
                <div className="section-eyebrow">Accès</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0F0F0F", letterSpacing: -0.3, marginBottom: 16 }}>Comment venir ?</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { icon: "🚇", title: "Transports", val: formation.lieuVille || "Voir carte", sub: "Accès facile en transports en commun" },
                    { icon: "🚗", title: "Parking", val: "Parking à proximité", sub: "Plusieurs parkings disponibles" },
                  ].map((t) => (
                    <div key={t.title} style={{ background: "#F9F7F4", borderRadius: 12, padding: 14 }}>
                      <div style={{ fontSize: 18, marginBottom: 6 }}>{t.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#6A6A6A", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>{t.title}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0F0F0F" }}>{t.val}</div>
                      <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 2, lineHeight: 1.4 }}>{t.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INFOS TAB */}
            {activeTab === "infos" && (
              <div>
                <div className="section-eyebrow">Tout ce qu&apos;il faut savoir</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0F0F0F", letterSpacing: -0.3, marginBottom: 16 }}>Informations pratiques</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {infos.map((info) => (
                    <div key={info.title} style={{ background: "#F9F7F4", borderRadius: 12, padding: 14 }}>
                      <div style={{ fontSize: 18, marginBottom: 6 }}>{info.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#6A6A6A", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>{info.title}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0F0F0F" }}>{info.val}</div>
                      <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 2, lineHeight: 1.4 }}>{info.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div style={{ position: "sticky", top: 120 }}>
            <div style={{ background: "white", border: "1.5px solid #E0E0E0", borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#0F0F0F", letterSpacing: -1, marginBottom: 2 }}>
                {formation.gratuite ? "Gratuit" : `${formation.prixHT} €`}{" "}
                {!formation.gratuite && <span style={{ fontSize: 13, fontWeight: 400, color: "#6A6A6A", letterSpacing: 0 }}>HT</span>}
              </div>
              <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 12 }}>Exonéré de TVA (art. 261-4-4° CGI)</div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: "#6A6A6A" }}>Places réservées</span>
                  <span style={{ fontWeight: 700, color: "#0F0F0F" }}>{formation.placesReserved} / {formation.placesTotal}</span>
                </div>
                <div style={{ background: "#EBEBEB", borderRadius: 100, height: 5, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 100, background: "linear-gradient(90deg, #C8102E, #E8394A)", width: `${fillPct}%` }} />
                </div>
                {formation.placesRestantes <= 5 && (
                  <div style={{ fontSize: 11, color: "#C8102E", fontWeight: 600, marginTop: 4 }}>
                    ⚡ Plus que {formation.placesRestantes} places disponibles
                  </div>
                )}
              </div>
              <Link
                href="/auth/inscription/participant"
                style={{
                  display: "block",
                  width: "100%",
                  background: "#C8102E",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  padding: 13,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  marginBottom: 8,
                  boxShadow: "0 4px 14px rgba(200,16,46,0.3)",
                  textAlign: "center",
                  textDecoration: "none",
                }}
              >
                S&apos;inscrire maintenant →
              </Link>
              <button style={{ width: "100%", background: "transparent", color: "#6A6A6A", border: "1.5px solid #E0E0E0", borderRadius: 10, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Poser une question
              </button>
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #EBEBEB" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6A6A6A", marginBottom: 6 }}>
                  📅 <span><strong style={{ color: "#0F0F0F" }}>{formation.dateShort}</strong> · {hours}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6A6A6A", marginBottom: 6 }}>
                  📍 <span>{formation.lieuVille} · <strong style={{ color: "#0F0F0F" }}>{venue}</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6A6A6A", marginBottom: 6 }}>
                  🍽️ <span>Pause café + <strong style={{ color: "#0F0F0F" }}>déjeuner inclus</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6A6A6A" }}>
                  📄 <span><strong style={{ color: "#0F0F0F" }}>Attestation</strong> envoyée sous 24h</span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 10, paddingTop: 10, borderTop: "1px solid #EBEBEB", textAlign: "center" }}>
                🔒 Paiement sécurisé · Remboursement J-14
              </div>
            </div>

            <div style={{ background: "#F9F7F4", borderRadius: 14, padding: 18, marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6A6A6A", marginBottom: 10 }}>Documents remis</div>
              {docs.map((doc) => (
                <div key={doc} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#0F0F0F", marginBottom: 7 }}>
                  <span style={{ color: "#2e7d32", fontSize: 14 }}>✓</span> {doc}
                </div>
              ))}
            </div>

            <div style={{ background: "#F9F7F4", borderRadius: 14, padding: 16, marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6A6A6A", marginBottom: 8 }}>Partager cette formation</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {["LinkedIn", "Copier", "Email"].map((btn) => (
                  <button key={btn} style={{ flex: 1, padding: 8, borderRadius: 8, border: "1.5px solid #E0E0E0", background: "white", fontSize: 11, fontWeight: 600, color: "#6A6A6A", cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>
                    {btn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#0F0F0F", padding: "28px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: "#C8102E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white" }}>M</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>Masterclass Médical</span>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/formations" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Catalogue des formations</Link>
            <Link href="/auth/inscription/formateur" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Devenir formateur</Link>
            <a href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>CGU</a>
            <a href="mailto:contact@masterclassmedical.fr" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
}
