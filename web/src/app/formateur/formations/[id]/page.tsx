"use client";

import { useState } from "react";
import Link from "next/link";

const participants = [
  { name: "Dr. Sophie Bernard", role: "Cardiologue · Paris", date: "18 oct.", paiement: "Payé", convention: "Signée" },
  { name: "Dr. Marc Lefebvre", role: "Cardiologue · Lille", date: "20 oct.", paiement: "Payé", convention: "Signée" },
  { name: "Dr. Anne Chartier", role: "Rythmologue · Marseille", date: "22 oct.", paiement: "Payé", convention: "En attente" },
  { name: "Dr. Thomas Moreau", role: "Médecin interne · Bordeaux", date: "24 oct.", paiement: "Payé", convention: "Signée" },
  { name: "Dr. Isabelle Petit", role: "Cardiologue · Lyon", date: "25 oct.", paiement: "Payé", convention: "Signée" },
  { name: "Dr. Pierre Martin", role: "Cardiologue · Nantes", date: "26 oct.", paiement: "Payé", convention: "Signée" },
  { name: "Dr. Claire Dupont", role: "Cardiologue · Strasbourg", date: "28 oct.", paiement: "Payé", convention: "Signée" },
  { name: "Dr. Nicolas Roy", role: "Médecin · Toulouse", date: "2 nov.", paiement: "Payé", convention: "Signée" },
  { name: "Dr. Émilie Blanc", role: "Cardiologue · Rennes", date: "4 nov.", paiement: "Payé", convention: "Signée" },
  { name: "Dr. Julien Noir", role: "Cardiologue · Montpellier", date: "6 nov.", paiement: "Payé", convention: "Signée" },
  { name: "Dr. Sarah Cohen", role: "Cardiologue · Nice", date: "8 nov.", paiement: "Payé", convention: "Signée" },
  { name: "Dr. Antoine Lebrun", role: "Médecin · Grenoble", date: "10 nov.", paiement: "Payé", convention: "En attente" },
];

const TABS = [
  { key: "inscrits", label: "👥 Inscrits (12)" },
  { key: "documents", label: "📄 Documents" },
  { key: "emargement", label: "✍️ Émargement" },
  { key: "evaluations", label: "⭐ Évaluations" },
  { key: "infos", label: "ℹ️ Informations" },
];

type DocItem = { icon: string; name: string; status: string; dl?: string; ready: boolean };

const commDocs: DocItem[] = [
  { icon: "🌐", name: "Landing page publique", status: "✓ En ligne · masterclassmedical.fr/…", dl: "🔗", ready: true },
  { icon: "📄", name: "Affiche A4 PDF", status: "✓ Générée · 1,2 Mo", dl: "↓", ready: true },
  { icon: "📄", name: "Affiche A3 PDF", status: "✓ Générée · 1,8 Mo", dl: "↓", ready: true },
  { icon: "📑", name: "Flyer A5 PDF", status: "✓ Générée · 0,8 Mo", dl: "↓", ready: true },
  { icon: "🖼️", name: "Visuel LinkedIn", status: "✓ PNG 1200×628px", dl: "↓", ready: true },
  { icon: "🖼️", name: "Visuel réseaux sociaux", status: "✓ PNG carré + story", dl: "↓", ready: true },
];

const pedaDocs: DocItem[] = [
  { icon: "📋", name: "Programme officiel PDF", status: "✓ Format réglementaire", dl: "↓", ready: true },
  { icon: "✍️", name: "Feuille d'émargement", status: "✓ Numérique initialisé", dl: "↓", ready: true },
  { icon: "📜", name: "Conventions de formation", status: "✓ 12 signées · 2 en attente", dl: "↓", ready: true },
  { icon: "🧳", name: "Kit formateur", status: "✓ Envoyé le 8 nov. 2026", dl: "↓", ready: true },
];

const postDocs: DocItem[] = [
  { icon: "📄", name: "Feuille de présence certifiée", status: "⏳ Générée après émargement", ready: false },
  { icon: "📋", name: "PV de formation", status: "⏳ Généré après émargement", ready: false },
  { icon: "🎓", name: "Attestations participants", status: "⏳ Envoyées J+1", ready: false },
  { icon: "📊", name: "Bilan pédagogique", status: "⏳ Disponible J+3", ready: false },
];

const infoRows = [
  { key: "Titre", val: "Cardiologie interventionnelle — Techniques avancées 2026" },
  { key: "Thématique", val: "Cardiologie" },
  { key: "Format", val: "Masterclass · 7 heures" },
  { key: "Date", val: "15 novembre 2026" },
  { key: "Lieu", val: "Marriott Lyon, Salle Rhône" },
  { key: "Participants", val: "Max 15 · Min 8" },
  { key: "Prix HT", val: "450 €" },
  { key: "Niveau", val: "Intermédiaire" },
  { key: "Public cible", val: "Médecins spécialistes" },
  { key: "COI", val: "Liens déclarés (Medtronic, Abbott)" },
];

const salleRows = [
  { key: "Établissement", val: "Marriott Lyon Cité Int." },
  { key: "Devis salle HT", val: "1 200 €" },
  { key: "Frais gestion (10%)", val: "120 €" },
  { key: "Total payé HT", val: "1 320 €", bold: true },
  { key: "Statut", val: "Payé", pill: "pill-green" },
];

function PillStatus({ status }: { status: string }) {
  if (status === "Payé") return <span className="pill pill-green">Payé</span>;
  if (status === "En attente") return <span className="pill pill-orange">En attente</span>;
  if (status === "Signée") return <span className="pill pill-green">Signée</span>;
  return <span className="pill pill-gray">{status}</span>;
}

export default function FormateurDetailFormationPage() {
  const [activeTab, setActiveTab] = useState("inscrits");

  const cardStyle = {
    background: "white",
    border: "1px solid #E0E0E0",
    borderRadius: 12,
    padding: "18px 20px",
    marginBottom: 16,
  };

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/formateur/formations"
            style={{ fontSize: 13, color: "#6A6A6A", textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}
          >
            ← Mes formations
          </Link>
          <div style={{ width: 1, height: 18, background: "#E0E0E0" }} />
          <div className="topbar-title">Cardiologie interventionnelle — Lyon 2026</div>
        </div>
        <div className="topbar-right">
          <span className="pill pill-green">Publiée</span>
          <button
            style={{
              background: "white",
              color: "#6A6A6A",
              border: "1.5px solid #E0E0E0",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Modifier
          </button>
          <Link
            href="/formateur/emargement"
            style={{
              background: "#C8102E",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              textDecoration: "none",
            }}
          >
            ✍️ Émargement
          </Link>
        </div>
      </div>

      <div className="content">
        {/* HERO */}
        <div
          style={{
            background: "linear-gradient(135deg, #080810, #1a0408)",
            borderRadius: 16,
            padding: "24px 28px",
            marginBottom: 20,
            position: "relative" as const,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute" as const,
              top: -40,
              right: -40,
              width: 200,
              height: 200,
              background: "radial-gradient(circle, rgba(200,16,46,0.18) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{ fontSize: 20, fontWeight: 800, color: "white", letterSpacing: "-0.5px", marginBottom: 6 }}
          >
            Cardiologie interventionnelle — Techniques avancées 2026
          </div>
          <div
            style={{ display: "flex", gap: 16, flexWrap: "wrap" as const, marginBottom: 16 }}
          >
            {[
              "📅 15 novembre 2026",
              "📍 Lyon · Marriott, Salle Rhône",
              "🕐 7h · Masterclass",
              "🎓 Niveau intermédiaire",
            ].map((m, i) => (
              <span key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 5 }}>
                {m}
              </span>
            ))}
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}
          >
            {[
              { val: "12", label: "Inscrits / 15" },
              { val: "3", label: "Places restantes" },
              { val: "5 400 €", label: "Revenus bruts HT", small: true },
              { val: "20j", label: "Avant la formation" },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: s.small ? 16 : 20,
                    fontWeight: 800,
                    color: "white",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {s.val}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TABS BAR */}
        <div
          style={{
            background: "white",
            border: "1px solid #E0E0E0",
            borderRadius: 12,
            padding: 3,
            display: "flex",
            gap: 2,
            marginBottom: 20,
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 600,
                color: activeTab === tab.key ? "white" : "#6A6A6A",
                background: activeTab === tab.key ? "#C8102E" : "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "center" as const,
                fontFamily: "inherit",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* PANEL: INSCRITS */}
        {activeTab === "inscrits" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <div style={cardStyle}>
              <div className="card-header">
                <span className="card-title">Liste des participants</span>
                <button
                  style={{
                    background: "white",
                    color: "#6A6A6A",
                    border: "1.5px solid #E0E0E0",
                    borderRadius: 8,
                    padding: "5px 10px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  📥 Exporter CSV
                </button>
              </div>
              {/* Jauge */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span>Places occupées</span>
                  <span style={{ fontWeight: 700 }}>12 / 15</span>
                </div>
                <div style={{ background: "#EBEBEB", borderRadius: 100, height: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 100, background: "#C8102E", width: "80%" }} />
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Participant</th>
                    <th>Inscription</th>
                    <th>Paiement</th>
                    <th>Convention</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, i) => (
                    <tr key={i}>
                      <td>
                        <div className="td-name">{p.name}</div>
                        <div className="td-sub">{p.role}</div>
                      </td>
                      <td>{p.date}</td>
                      <td><PillStatus status={p.paiement} /></td>
                      <td><PillStatus status={p.convention} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              {/* Résumé financier */}
              <div style={cardStyle}>
                <div className="card-header">
                  <span className="card-title">Résumé financier</span>
                </div>
                {[
                  { key: "Prix unitaire HT", val: "450 €" },
                  { key: "Inscrits payés", val: "12" },
                  { key: "Revenus bruts HT", val: "5 400 €" },
                  { key: "Commission (20%)", val: "− 1 080 €", red: true },
                  { key: "Revenus nets HT", val: "4 320 €", green: true, big: true },
                ].map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "7px 0",
                      borderBottom: i < 4 ? "1px solid #EBEBEB" : "none",
                      fontSize: 12,
                    }}
                  >
                    <span style={{ color: "#6A6A6A" }}>{r.key}</span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: r.red ? "#C8102E" : r.green ? "#2e7d32" : "#0F0F0F",
                        fontSize: r.big ? 15 : 12,
                      }}
                    >
                      {r.val}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 12px",
                    background: "#e8f5e9",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#2e7d32",
                  }}
                >
                  Versement estimé sous 7 jours après la formation.
                </div>
              </div>
              {/* Kit formateur */}
              <div style={cardStyle}>
                <div className="card-header">
                  <span className="card-title">Kit formateur J-7</span>
                </div>
                <div style={{ fontSize: 13, color: "#6A6A6A", marginBottom: 10 }}>
                  Envoyé automatiquement le{" "}
                  <strong style={{ color: "#0F0F0F" }}>8 novembre 2026</strong>
                </div>
                <div style={{ fontSize: 12, color: "#2e7d32", lineHeight: 1.8 }}>
                  ✓ Liste nominative<br />
                  ✓ Adresse et plan d&apos;accès<br />
                  ✓ Contacts Marriott<br />
                  ✓ Feuille d&apos;émargement PDF backup
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL: DOCUMENTS */}
        {activeTab === "documents" && (
          <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 12, padding: "18px 20px" }}>
            <div className="card-header">
              <span className="card-title">Documents générés automatiquement</span>
            </div>
            <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 14 }}>
              Tous les documents ont été générés après validation du devis le 1er octobre 2026.
            </div>
            {[
              { title: "Communication", docs: commDocs },
              { title: "Pédagogiques & administratifs", docs: pedaDocs },
              { title: "Post-formation (J+1)", docs: postDocs },
            ].map((section, si) => (
              <div key={si} style={{ marginBottom: si < 2 ? 20 : 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#6A6A6A",
                    textTransform: "uppercase" as const,
                    letterSpacing: 0.8,
                    marginBottom: 10,
                  }}
                >
                  {section.title}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {section.docs.map((doc, di) => (
                    <div
                      key={di}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        border: `1.5px solid ${doc.ready ? "#c8e6c9" : "#E0E0E0"}`,
                        borderRadius: 9,
                        cursor: "pointer",
                        transition: "border-color 0.15s",
                      }}
                    >
                      <div style={{ fontSize: 18, flexShrink: 0 }}>{doc.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#0F0F0F" }}>{doc.name}</div>
                        <div style={{ fontSize: 10, marginTop: 1, color: doc.ready ? "#2e7d32" : "#6A6A6A" }}>
                          {doc.status}
                        </div>
                      </div>
                      {doc.dl && (
                        <div style={{ marginLeft: "auto", fontSize: 12, color: "#6A6A6A" }}>{doc.dl}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PANEL: EMARGEMENT */}
        {activeTab === "emargement" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <div style={cardStyle}>
              <div className="card-header">
                <span className="card-title">Statut émargement</span>
              </div>
              <div
                style={{
                  background: "#fff8e1",
                  border: "1.5px solid #ffe082",
                  borderRadius: 10,
                  padding: "14px 16px",
                  marginBottom: 16,
                  fontSize: 13,
                  color: "#795548",
                }}
              >
                <strong>Session non ouverte.</strong> Vous pourrez ouvrir l&apos;émargement le jour de la formation. Chaque participant recevra un lien unique sécurisé par email.
              </div>
              {[
                { val: "12", label: "Participants à émarger" },
                { val: "0", label: "Présences confirmées" },
              ].map((badge, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    background: "#F9F7F4",
                    borderRadius: 10,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#0F0F0F" }}>{badge.val}</div>
                    <div style={{ fontSize: 12, color: "#6A6A6A" }}>{badge.label}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 16 }}>
                <Link
                  href="/formateur/emargement"
                  style={{
                    background: "#C8102E",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    padding: "12px 16px",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                  }}
                >
                  ✍️ Ouvrir la session d&apos;émargement
                </Link>
                <div style={{ fontSize: 11, color: "#6A6A6A", textAlign: "center" as const, marginTop: 6 }}>
                  Disponible le jour de la formation · 15 novembre 2026
                </div>
              </div>
            </div>
            <div style={cardStyle}>
              <div className="card-header">
                <span className="card-title">Comment ça marche</span>
              </div>
              <div style={{ fontSize: 13, color: "#6A6A6A", lineHeight: 1.7 }}>
                <strong style={{ color: "#0F0F0F" }}>1.</strong> Ouvrez la session le matin<br />
                <strong style={{ color: "#0F0F0F" }}>2.</strong> Chaque participant reçoit un lien unique<br />
                <strong style={{ color: "#0F0F0F" }}>3.</strong> Il clique et confirme sa présence<br />
                <strong style={{ color: "#0F0F0F" }}>4.</strong> Vous suivez en temps réel<br />
                <strong style={{ color: "#0F0F0F" }}>5.</strong> Clôturez en fin de journée<br />
                <strong style={{ color: "#0F0F0F" }}>6.</strong> Feuille de présence certifiée générée
              </div>
            </div>
          </div>
        )}

        {/* PANEL: EVALUATIONS */}
        {activeTab === "evaluations" && (
          <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ textAlign: "center" as const, padding: "40px 20px", color: "#6A6A6A" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0F0F0F", marginBottom: 6 }}>
                Les évaluations seront disponibles après la formation
              </div>
              <div style={{ fontSize: 13 }}>
                Les participants reçoivent le questionnaire de satisfaction automatiquement à J+1. La synthèse sera disponible ici à J+3.
              </div>
            </div>
          </div>
        )}

        {/* PANEL: INFOS */}
        {activeTab === "infos" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={cardStyle}>
              <div className="card-header">
                <span className="card-title">Informations générales</span>
                <button
                  style={{
                    background: "white",
                    color: "#6A6A6A",
                    border: "1.5px solid #E0E0E0",
                    borderRadius: 8,
                    padding: "5px 10px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Modifier
                </button>
              </div>
              {infoRows.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "7px 0",
                    borderBottom: i < infoRows.length - 1 ? "1px solid #EBEBEB" : "none",
                    fontSize: 12,
                    gap: 12,
                  }}
                >
                  <span style={{ color: "#6A6A6A", flexShrink: 0 }}>{r.key}</span>
                  <span style={{ fontWeight: 600, color: "#0F0F0F", textAlign: "right" as const, lineHeight: 1.4 }}>{r.val}</span>
                </div>
              ))}
            </div>
            <div style={cardStyle}>
              <div className="card-header">
                <span className="card-title">Frais de salle</span>
              </div>
              {salleRows.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "7px 0",
                    borderBottom: i < salleRows.length - 1 ? "1px solid #EBEBEB" : "none",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "#6A6A6A" }}>{r.key}</span>
                  <span style={{ fontWeight: r.bold ? 800 : 600, color: "#0F0F0F" }}>
                    {r.pill ? (
                      <span className={`pill ${r.pill}`}>{r.val}</span>
                    ) : (
                      r.val
                    )}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: 14 }}>
                <button
                  style={{
                    background: "white",
                    color: "#6A6A6A",
                    border: "1.5px solid #E0E0E0",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  📄 Voir la facture salle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
