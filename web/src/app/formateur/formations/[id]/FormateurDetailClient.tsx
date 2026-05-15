"use client";

import { useState } from "react";
import Link from "next/link";
import { StatutFormation } from "@/generated/prisma/enums";
import VoiceInputButton from "@/components/VoiceInputButton";

type Inscription = {
  id: string;
  createdAt: string;
  statut: string;
  conventionSignee: boolean;
  paiementId: string | null;
  participant: {
    name: string;
    email: string;
    specialite: string | null;
    ville: string | null;
  };
};

type ProgrammeSlot = {
  time: string;
  title: string;
  description?: string;
  type?: string;
};

type FormationDetail = {
  id: string;
  titre: string;
  specialite: string;
  niveau: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  dureeHeures: number;
  placesTotal: number;
  placesRestantes: number;
  lieuVille: string | null;
  lieuNom: string | null;
  prixHT: number;
  gratuite: boolean;
  statut: string;
  description: string;
  objectifs: string[];
  programme: ProgrammeSlot[];
  satisfactionsCount: number;
  emargementsCount: number;
  inscriptions: Inscription[];
  demandeSalle: { statut: string; notes: string | null } | null;
};

function PillStatus({ status }: { status: string }) {
  if (status === "CONFIRMEE" || status === "Payé" || status === "Signée")
    return <span className="pill pill-green">{status === "CONFIRMEE" ? "Payé" : status}</span>;
  if (status === "EN_ATTENTE_PAIEMENT" || status === "En attente")
    return <span className="pill pill-orange">En attente</span>;
  return <span className="pill pill-gray">{status}</span>;
}

export default function FormateurDetailClient({ formation }: { formation: FormationDetail }) {
  const [activeTab, setActiveTab] = useState("inscrits");
  const [statut, setStatut] = useState(formation.statut);
  const [publishing, setPublishing] = useState(false);

  // Modifier tab state
  const [descriptionText, setDescriptionText] = useState(formation.description ?? "");
  const [objectifsText, setObjectifsText] = useState((formation.objectifs ?? []).join("\n"));
  const [programmeText, setProgrammeText] = useState(
    (formation.programme ?? [])
      .map((s) => `${s.time} | ${s.title} | ${s.description ?? ""} | ${s.type ?? "Cours magistral"}`)
      .join("\n")
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [reformulerLoading, setReformulerLoading] = useState<string | null>(null);

  async function patchFormation(payload: Record<string, unknown>) {
    const res = await fetch(`/api/formateur/formations/${formation.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Erreur lors de la sauvegarde");
  }

  async function saveDescription() {
    setSaving("description");
    try {
      await patchFormation({ description: descriptionText });
    } catch {
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(null);
    }
  }

  async function saveObjectifs() {
    setSaving("objectifs");
    try {
      const objectifs = objectifsText.split("\n").filter(Boolean);
      await patchFormation({ objectifs });
    } catch {
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(null);
    }
  }

  async function saveProgramme() {
    setSaving("programme");
    try {
      const programme = programmeText
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const parts = line.split(" | ");
          return {
            time: parts[0]?.trim() ?? "",
            title: parts[1]?.trim() ?? "",
            description: parts[2]?.trim() ?? "",
            type: parts[3]?.trim() ?? "Cours magistral",
          };
        });
      await patchFormation({ programme });
    } catch {
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(null);
    }
  }

  async function reformuler(type: "description" | "objectifs" | "programme", texte: string, setter: (v: string) => void) {
    setReformulerLoading(type);
    try {
      const res = await fetch("/api/ai/reformuler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texte, type }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setter(data.texte ?? texte);
    } catch {
      alert("Erreur lors de la reformulation.");
    } finally {
      setReformulerLoading(null);
    }
  }

  async function genererObjectifsIA() {
    setAiLoading("objectifs");
    try {
      const res = await fetch("/api/ai/objectifs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: formation.titre,
          specialite: formation.specialite,
          objectifsRaw: objectifsText,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const lines: string[] = Array.isArray(data) ? data : Array.isArray(data.objectifs) ? data.objectifs : [];
      setObjectifsText(lines.join("\n"));
    } catch {
      alert("Erreur lors de la génération IA.");
    } finally {
      setAiLoading(null);
    }
  }

  async function genererProgrammeIA() {
    setAiLoading("programme");
    try {
      const objectifs = objectifsText.split("\n").filter(Boolean);
      const res = await fetch("/api/ai/programme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: formation.titre,
          specialite: formation.specialite,
          dureeHeures: formation.dureeHeures,
          description: descriptionText,
          objectifs,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const slots: ProgrammeSlot[] = Array.isArray(data) ? data : Array.isArray(data.programme) ? data.programme : [];
      const text = slots
        .map((s) => `${s.time} | ${s.title} | ${s.description ?? ""} | ${s.type ?? "Cours magistral"}`)
        .join("\n");
      setProgrammeText(text);
    } catch {
      alert("Erreur lors de la génération IA.");
    } finally {
      setAiLoading(null);
    }
  }

  async function publierFormation() {
    setPublishing(true);
    try {
      const res = await fetch(`/api/formateur/formations/${formation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: "PUBLIEE" }),
      });
      if (res.ok) setStatut("PUBLIEE");
      else alert("Erreur lors de la publication.");
    } finally {
      setPublishing(false);
    }
  }

  const inscrits = formation.inscriptions.length;
  const dateFormatted = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(formation.date));

  const revenusHT = formation.inscriptions
    .filter((i) => i.statut === "CONFIRMEE")
    .reduce((sum, i) => sum + formation.prixHT, 0);

  const isPubilee = statut === StatutFormation.PUBLIEE;
  const canPublish = ["BROUILLON", "EN_ATTENTE_SALLE", "SALLE_CONFIRMEE"].includes(statut);

  const TABS = [
    { key: "inscrits", label: `👥 Inscrits (${inscrits})` },
    { key: "documents", label: "📄 Documents" },
    { key: "emargement", label: "✍️ Émargement" },
    { key: "evaluations", label: "⭐ Évaluations" },
    { key: "infos", label: "ℹ️ Informations" },
    { key: "modifier", label: "✏️ Modifier" },
  ];

  const cardStyle = {
    background: "white",
    border: "1px solid #E0E0E0",
    borderRadius: 12,
    padding: "18px 20px",
    marginBottom: 16,
  };

  function statutPill(statut: string) {
    switch (statut) {
      case StatutFormation.PUBLIEE: return <span className="pill pill-green">Publiée</span>;
      case StatutFormation.BROUILLON: return <span className="pill pill-gray">Brouillon</span>;
      case StatutFormation.COMPLETE: return <span className="pill pill-blue">Complète</span>;
      case StatutFormation.ANNULEE: return <span className="pill pill-gray">Annulée</span>;
      default: return <span className="pill pill-gray">{statut}</span>;
    }
  }

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
          <div className="topbar-title">{formation.titre}</div>
        </div>
        <div className="topbar-right">
          {statutPill(statut)}
          {isPubilee && (
            <>
              <Link
                href={`/formateur/formations/${formation.id}/live`}
                style={{
                  background: "#0F0F0F", color: "white", border: "none", borderRadius: 8,
                  padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  fontFamily: "inherit", display: "inline-flex", alignItems: "center",
                  gap: 6, textDecoration: "none",
                }}
              >
                ▶ Lancer la formation
              </Link>
              <Link
                href={`/formateur/emargement/${formation.id}`}
                style={{
                  background: "#C8102E", color: "white", border: "none", borderRadius: 8,
                  padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  fontFamily: "inherit", display: "inline-flex", alignItems: "center",
                  gap: 6, textDecoration: "none",
                }}
              >
                ✍️ Émargement
              </Link>
            </>
          )}
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
              position: "absolute" as const, top: -40, right: -40,
              width: 200, height: 200,
              background: "radial-gradient(circle, rgba(200,16,46,0.18) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ fontSize: 20, fontWeight: 800, color: "white", letterSpacing: "-0.5px", marginBottom: 6 }}>
            {formation.titre}
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" as const, marginBottom: 16 }}>
            {[
              `📅 ${dateFormatted}`,
              formation.lieuNom
                ? `📍 ${formation.lieuVille} · ${formation.lieuNom}`
                : formation.lieuVille
                ? `📍 ${formation.lieuVille}`
                : "📍 Lieu en cours de confirmation",
              `🕐 ${formation.dureeHeures}h`,
              `🎓 Niveau ${formation.niveau}`,
            ].map((m, i) => (
              <span key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 5 }}>
                {m}
              </span>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { val: String(inscrits), label: `Inscrits / ${formation.placesTotal}` },
              { val: String(formation.placesRestantes), label: "Places restantes" },
              { val: formation.gratuite ? "Gratuit" : `${revenusHT.toLocaleString("fr-FR")} €`, label: "Revenus bruts HT", small: revenusHT > 9999 },
              {
                val: (() => {
                  const diff = Math.ceil((new Date(formation.date).getTime() - Date.now()) / 86400000);
                  return diff > 0 ? `${diff}j` : diff === 0 ? "Aujourd'hui" : "Passée";
                })(),
                label: "Avant la formation",
              },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: s.small ? 16 : 20, fontWeight: 800, color: "white", letterSpacing: "-0.5px" }}>
                  {s.val}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TABS BAR */}
        <div
          style={{
            background: "white", border: "1px solid #E0E0E0", borderRadius: 12,
            padding: 3, display: "flex", gap: 2, marginBottom: 20,
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                color: activeTab === tab.key ? "white" : "#6A6A6A",
                background: activeTab === tab.key ? "#C8102E" : "transparent",
                border: "none", cursor: "pointer", textAlign: "center" as const,
                fontFamily: "inherit", transition: "background 0.15s, color 0.15s",
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
                {inscrits > 0 && (
                  <button
                    style={{
                      background: "white", color: "#6A6A6A", border: "1.5px solid #E0E0E0",
                      borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    📥 Exporter CSV
                  </button>
                )}
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span>Places occupées</span>
                  <span style={{ fontWeight: 700 }}>{inscrits} / {formation.placesTotal}</span>
                </div>
                <div style={{ background: "#EBEBEB", borderRadius: 100, height: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 100, background: "#C8102E", width: `${formation.placesTotal > 0 ? Math.round((inscrits / formation.placesTotal) * 100) : 0}%` }} />
                </div>
              </div>
              {inscrits === 0 ? (
                <div style={{ padding: "32px 0", textAlign: "center" as const, color: "#6A6A6A" }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>👥</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0F0F0F", marginBottom: 4 }}>
                    Aucun participant inscrit
                  </div>
                  <div style={{ fontSize: 12 }}>
                    {formation.statut === "BROUILLON"
                      ? "Les inscriptions ouvrent après la publication de la formation."
                      : "Les participants apparaîtront ici après leur inscription."}
                  </div>
                </div>
              ) : (
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
                    {formation.inscriptions.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="td-name">{p.participant.name}</div>
                          <div className="td-sub">
                            {[p.participant.specialite, p.participant.ville].filter(Boolean).join(" · ") || p.participant.email}
                          </div>
                        </td>
                        <td>{new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(p.createdAt))}</td>
                        <td><PillStatus status={p.statut} /></td>
                        <td><PillStatus status={p.conventionSignee ? "Signée" : "En attente"} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div>
              <div style={cardStyle}>
                <div className="card-header">
                  <span className="card-title">Résumé financier</span>
                </div>
                {[
                  { key: "Prix unitaire HT", val: formation.gratuite ? "Gratuit" : `${formation.prixHT.toLocaleString("fr-FR")} €` },
                  { key: "Inscrits payés", val: String(formation.inscriptions.filter((i) => i.statut === "CONFIRMEE").length) },
                  { key: "Revenus bruts HT", val: formation.gratuite ? "—" : `${revenusHT.toLocaleString("fr-FR")} €` },
                  { key: "Commission (20%)", val: formation.gratuite ? "—" : `− ${Math.round(revenusHT * 0.2).toLocaleString("fr-FR")} €`, red: !formation.gratuite },
                  { key: "Revenus nets HT", val: formation.gratuite ? "—" : `${Math.round(revenusHT * 0.8).toLocaleString("fr-FR")} €`, green: !formation.gratuite, big: true },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < 4 ? "1px solid #EBEBEB" : "none", fontSize: 12 }}>
                    <span style={{ color: "#6A6A6A" }}>{r.key}</span>
                    <span style={{ fontWeight: 600, color: (r as { red?: boolean }).red ? "#C8102E" : (r as { green?: boolean }).green ? "#2e7d32" : "#0F0F0F", fontSize: (r as { big?: boolean }).big ? 15 : 12 }}>
                      {r.val}
                    </span>
                  </div>
                ))}
                <div style={{ marginTop: 12, padding: "10px 12px", background: "#e8f5e9", borderRadius: 8, fontSize: 12, color: "#2e7d32" }}>
                  Versement estimé sous 7 jours après la formation.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL: DOCUMENTS */}
        {activeTab === "documents" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Avant la formation */}
            <div style={cardStyle}>
              <div className="card-header">
                <span className="card-title">Avant la formation</span>
                <span style={{ fontSize: 11, color: "#6A6A6A" }}>Disponibles dès maintenant</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { icon: "📄", label: "Programme officiel", href: `/api/pdf/programme/${formation.id}`, sub: "Format Qualiopi" },
                  { icon: "🖼️", label: "Affiche A4", href: `/api/pdf/affiche/${formation.id}?ai=true`, sub: "Accroche générée par IA" },
                  { icon: "📝", label: "Questionnaire satisfaction", href: `/api/pdf/questionnaire/${formation.id}`, sub: "À imprimer le jour J" },
                ].map((doc) => (
                  <a
                    key={doc.href}
                    href={doc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                      border: "1.5px solid #E0E0E0", borderRadius: 10, textDecoration: "none",
                      color: "#0F0F0F", transition: "border-color 0.15s, background 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C8102E"; e.currentTarget.style.background = "#fff5f6"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E0E0E0"; e.currentTarget.style.background = "white"; }}
                  >
                    <span style={{ fontSize: 20 }}>{doc.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{doc.label}</div>
                      {doc.sub && <div style={{ fontSize: 10, color: "#6A6A6A", marginTop: 1 }}>{doc.sub}</div>}
                    </div>
                    <span style={{ fontSize: 11, color: "#C8102E", fontWeight: 700 }}>PDF ↗</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Après la formation */}
            <div style={cardStyle}>
              <div className="card-header">
                <span className="card-title">Après la formation</span>
                <span style={{ fontSize: 11, color: "#6A6A6A" }}>
                  {formation.emargementsCount > 0 ? `${formation.emargementsCount} émargements` : "Disponibles après émargement"}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { icon: "✅", label: "Feuille de présence", href: `/api/pdf/feuille-presence/${formation.id}`, sub: "Certifiée demi-journée" },
                  { icon: "📋", label: "PV de formation", href: `/api/pdf/pv-formation/${formation.id}`, sub: "Procès-verbal de clôture" },
                  { icon: "📜", label: "Certificat de réalisation", href: `/api/pdf/certificat-realisation/${formation.id}`, sub: "Art. L6353-1 Code du travail" },
                  { icon: "📊", label: "Bilan pédagogique", href: `/api/pdf/bilan/${formation.id}?ai=true`, sub: formation.satisfactionsCount > 0 ? `${formation.satisfactionsCount} réponses · Analyse IA` : "Disponible J+3" },
                ].map((doc) => (
                  <a
                    key={doc.href}
                    href={doc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                      border: "1.5px solid #E0E0E0", borderRadius: 10, textDecoration: "none",
                      color: "#0F0F0F", transition: "border-color 0.15s, background 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C8102E"; e.currentTarget.style.background = "#fff5f6"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E0E0E0"; e.currentTarget.style.background = "white"; }}
                  >
                    <span style={{ fontSize: 20 }}>{doc.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{doc.label}</div>
                      {doc.sub && <div style={{ fontSize: 10, color: "#6A6A6A", marginTop: 1 }}>{doc.sub}</div>}
                    </div>
                    <span style={{ fontSize: 11, color: "#C8102E", fontWeight: 700 }}>PDF ↗</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Par participant */}
            {formation.inscriptions.length > 0 && (
              <div style={cardStyle}>
                <div className="card-header">
                  <span className="card-title">Documents par participant</span>
                  <span style={{ fontSize: 11, color: "#6A6A6A" }}>Convention · Convocation · Attestation · Facture</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Participant</th>
                      <th>Statut</th>
                      <th>Documents</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formation.inscriptions.map((insc) => (
                      <tr key={insc.id}>
                        <td>
                          <div className="td-name">{insc.participant.name}</div>
                          <div className="td-sub">{insc.participant.email}</div>
                        </td>
                        <td><PillStatus status={insc.statut} /></td>
                        <td>
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const }}>
                            <a href={`/api/pdf/convocation/${insc.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: 11, padding: "4px 8px" }}>Convocation</a>
                            <a href={`/api/pdf/convention/${insc.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: 11, padding: "4px 8px" }}>Convention</a>
                            {insc.statut === "CONFIRMEE" && (
                              <a href={`/api/pdf/attestation/${insc.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: 11, padding: "4px 8px" }}>Attestation</a>
                            )}
                            {insc.paiementId && (
                              <a href={`/api/pdf/facture/${insc.paiementId}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: 11, padding: "4px 8px" }}>Facture</a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PANEL: EMARGEMENT */}
        {activeTab === "emargement" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <div style={cardStyle}>
              <div className="card-header">
                <span className="card-title">Statut émargement</span>
              </div>
              <div style={{ background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: 10, padding: "14px 16px", marginBottom: 16, fontSize: 13, color: "#795548" }}>
                <strong>Session non ouverte.</strong> Vous pourrez ouvrir l&apos;émargement le jour de la formation. Chaque participant recevra un lien unique sécurisé par email.
              </div>
              {[
                { val: String(inscrits), label: "Participants à émarger" },
                { val: "0", label: "Présences confirmées" },
              ].map((badge, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#F9F7F4", borderRadius: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#0F0F0F" }}>{badge.val}</div>
                    <div style={{ fontSize: 12, color: "#6A6A6A" }}>{badge.label}</div>
                  </div>
                </div>
              ))}
              {isPubilee && (
                <div style={{ marginTop: 16 }}>
                  <Link
                    href={`/formateur/emargement/${formation.id}`}
                    style={{ background: "#C8102E", color: "white", border: "none", borderRadius: 8, padding: "12px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
                  >
                    ✍️ Ouvrir la session d&apos;émargement
                  </Link>
                  <div style={{ fontSize: 11, color: "#6A6A6A", textAlign: "center" as const, marginTop: 6 }}>
                    Disponible le jour de la formation · {dateFormatted}
                  </div>
                </div>
              )}
            </div>
            <div style={cardStyle}>
              <div className="card-header"><span className="card-title">Comment ça marche</span></div>
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

        {/* PANEL: MODIFIER */}
        {activeTab === "modifier" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Description */}
            <div style={cardStyle}>
              <div className="card-header">
                <span className="card-title">Description</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <VoiceInputButton onTranscript={(t) => setDescriptionText((prev) => prev ? prev + " " + t : t)} />
                  <button
                    className="btn btn-ghost"
                    onClick={() => reformuler("description", descriptionText, setDescriptionText)}
                    disabled={reformulerLoading === "description" || !descriptionText}
                  >
                    {reformulerLoading === "description" ? "Reformulation…" : "✨ Reformuler avec l'IA"}
                  </button>
                </div>
              </div>
              <textarea
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                rows={5}
                style={{
                  width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 8,
                  padding: "10px 12px", fontSize: 13, fontFamily: "inherit",
                  resize: "vertical", marginBottom: 10, boxSizing: "border-box",
                  outline: "none",
                }}
                placeholder="Décrivez votre formation..."
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="btn btn-red"
                  onClick={saveDescription}
                  disabled={saving === "description"}
                >
                  {saving === "description" ? "Sauvegarde…" : "💾 Sauvegarder"}
                </button>
              </div>
            </div>

            {/* Objectifs */}
            <div style={cardStyle}>
              <div className="card-header">
                <span className="card-title">Objectifs pédagogiques</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <VoiceInputButton onTranscript={(t) => setObjectifsText((prev) => prev ? prev + "\n" + t : t)} />
                  <button
                    className="btn btn-ghost"
                    onClick={() => reformuler("objectifs", objectifsText, setObjectifsText)}
                    disabled={reformulerLoading === "objectifs" || !objectifsText}
                  >
                    {reformulerLoading === "objectifs" ? "Reformulation…" : "✨ Reformuler avec l'IA"}
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={genererObjectifsIA}
                    disabled={aiLoading === "objectifs"}
                  >
                    {aiLoading === "objectifs" ? "Génération…" : "✨ Générer avec l'IA"}
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 8 }}>
                Un objectif par ligne
              </div>
              <textarea
                value={objectifsText}
                onChange={(e) => setObjectifsText(e.target.value)}
                rows={6}
                style={{
                  width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 8,
                  padding: "10px 12px", fontSize: 13, fontFamily: "inherit",
                  resize: "vertical", marginBottom: 10, boxSizing: "border-box",
                  outline: "none",
                }}
                placeholder="Ex: Maîtriser les gestes de premiers secours&#10;Connaître les protocoles d'urgence"
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="btn btn-red"
                  onClick={saveObjectifs}
                  disabled={saving === "objectifs"}
                >
                  {saving === "objectifs" ? "Sauvegarde…" : "💾 Sauvegarder"}
                </button>
              </div>
            </div>

            {/* Programme */}
            <div style={cardStyle}>
              <div className="card-header">
                <span className="card-title">Programme</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <VoiceInputButton onTranscript={(t) => setProgrammeText((prev) => prev ? prev + "\n" + t : t)} />
                  <button
                    className="btn btn-ghost"
                    onClick={() => reformuler("programme", programmeText, setProgrammeText)}
                    disabled={reformulerLoading === "programme" || !programmeText}
                  >
                    {reformulerLoading === "programme" ? "Reformulation…" : "✨ Reformuler avec l'IA"}
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={genererProgrammeIA}
                    disabled={aiLoading === "programme"}
                  >
                    {aiLoading === "programme" ? "Génération…" : "✨ Générer le programme IA"}
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 8 }}>
                Format : <code>HH:MM–HH:MM | Titre | Description | Type</code> — une ligne par créneau
              </div>
              <textarea
                value={programmeText}
                onChange={(e) => setProgrammeText(e.target.value)}
                rows={8}
                style={{
                  width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 8,
                  padding: "10px 12px", fontSize: 12, fontFamily: "monospace",
                  resize: "vertical", marginBottom: 10, boxSizing: "border-box",
                  outline: "none",
                }}
                placeholder="08:30–09:00 | Accueil et introduction | Présentation des participants | Cours magistral"
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="btn btn-red"
                  onClick={saveProgramme}
                  disabled={saving === "programme"}
                >
                  {saving === "programme" ? "Sauvegarde…" : "💾 Sauvegarder"}
                </button>
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
                {canPublish && (
                  <button
                    onClick={publierFormation}
                    disabled={publishing}
                    style={{
                      background: "#C8102E", color: "white", border: "none", borderRadius: 8,
                      padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
                      fontFamily: "inherit", opacity: publishing ? 0.7 : 1,
                    }}
                  >
                    {publishing ? "Publication…" : "🚀 Publier la formation"}
                  </button>
                )}
                {isPubilee && (
                  <span className="pill pill-green" style={{ fontSize: 11 }}>✓ Publiée</span>
                )}
              </div>
              {[
                { key: "Titre", val: formation.titre },
                { key: "Thématique", val: formation.specialite || "—" },
                { key: "Durée", val: `${formation.dureeHeures}h` },
                { key: "Date", val: dateFormatted },
                { key: "Lieu", val: formation.lieuNom ? `${formation.lieuVille} · ${formation.lieuNom}` : formation.lieuVille ?? "En cours de confirmation" },
                { key: "Participants", val: `Max ${formation.placesTotal}` },
                { key: "Prix HT", val: formation.gratuite ? "Gratuit" : `${formation.prixHT.toLocaleString("fr-FR")} €` },
                { key: "Niveau", val: formation.niveau },
              ].map((r, i, arr) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid #EBEBEB" : "none", fontSize: 12, gap: 12 }}>
                  <span style={{ color: "#6A6A6A", flexShrink: 0 }}>{r.key}</span>
                  <span style={{ fontWeight: 600, color: "#0F0F0F", textAlign: "right" as const, lineHeight: 1.4 }}>{r.val}</span>
                </div>
              ))}
            </div>
            <div style={cardStyle}>
              <div className="card-header">
                <span className="card-title">Demande de salle</span>
              </div>
              {formation.demandeSalle ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #EBEBEB", fontSize: 12 }}>
                    <span style={{ color: "#6A6A6A" }}>Statut</span>
                    <span style={{ fontWeight: 600, color: formation.demandeSalle.statut === "EN_ATTENTE" ? "#795548" : "#2e7d32" }}>
                      {formation.demandeSalle.statut === "EN_ATTENTE" ? "En attente" : formation.demandeSalle.statut}
                    </span>
                  </div>
                  {formation.demandeSalle.notes && (
                    <div style={{ marginTop: 10, padding: "10px 12px", background: "#F9F7F4", borderRadius: 8, fontSize: 12, color: "#444", lineHeight: 1.7, whiteSpace: "pre-line" as const }}>
                      {formation.demandeSalle.notes}
                    </div>
                  )}
                  <div style={{ marginTop: 12, padding: "10px 12px", background: "#fff8e1", borderRadius: 8, fontSize: 12, color: "#795548" }}>
                    Notre équipe vous contactera sous 72h avec un devis de salle.
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "#6A6A6A" }}>Aucune demande de salle associée.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
