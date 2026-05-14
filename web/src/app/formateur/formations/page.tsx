"use client";

import { useState } from "react";
import Link from "next/link";

const formations = [
  {
    id: "1",
    colorBar: "#C8102E",
    status: "Publiée",
    statusClass: "pill-green",
    format: "Masterclass · 7h",
    title: "Cardiologie interventionnelle — Techniques avancées 2026",
    price: "450 €",
    gaugePct: 80,
    gaugeText: "12/15",
    meta: [
      { icon: "📅", text: "15 novembre 2026" },
      { icon: "📍", text: "Lyon · Marriott, Salle Rhône" },
      { icon: "⭐", text: "Note moy. —" },
      { icon: "⚡", text: "3 places restantes", green: true },
    ],
    docs: [
      { label: "✓ Landing page", ready: true },
      { label: "✓ Affiche A4", ready: true },
      { label: "✓ Programme PDF", ready: true },
      { label: "✓ Émargement prêt", ready: true },
      { label: "✓ Conventions (12)", ready: true },
    ],
    actions: [
      { label: "Voir le détail", href: "/formateur/formations/1", primary: false },
      { label: "✍️ Ouvrir émargement", href: "/formateur/emargement", primary: true },
    ],
    borderColor: undefined,
    opacity: 1,
    tab: "publie",
  },
  {
    id: "2",
    colorBar: "#e65100",
    status: "⚠ Action requise — Devis reçu",
    statusClass: "pill-orange",
    format: "Atelier · 4h",
    title: "Échocardiographie transthoracique — Cas cliniques avancés",
    price: "320 €",
    gaugePct: 0,
    gaugeText: "0/15",
    meta: [
      { icon: "📅", text: "3 décembre 2026" },
      { icon: "📍", text: "Paris · Hôtel Lutetia" },
      { icon: "💰", text: "Devis : 1 850 € HT — expire dans 5 jours", orange: true },
    ],
    docs: [
      { label: "⏳ Landing page (en attente paiement)", ready: false },
      { label: "⏳ Documents (en attente paiement)", ready: false },
    ],
    actions: [
      { label: "Voir le détail", href: "/formateur/formations/2", primary: false },
      { label: "💰 Valider le devis", href: "#", primary: true, orange: true },
    ],
    borderColor: "#ffe082",
    opacity: 1,
    tab: "encours",
  },
  {
    id: "3",
    colorBar: "#9e9e9e",
    status: "Brouillon",
    statusClass: "pill-gray",
    format: "Masterclass · 7h",
    title: "Insuffisance cardiaque — Prise en charge avancée",
    price: "— €",
    priceGray: true,
    gaugePct: null,
    gaugeText: null,
    meta: [
      { icon: "📅", text: "Mars 2027 (estimé)" },
      { icon: "📍", text: "Bordeaux · À confirmer" },
      { text: "Contenu pédagogique manquant", gray: true },
    ],
    stepLabel: "Étape 3 / 6",
    progressPct: 40,
    progressColor: "#9e9e9e",
    docs: [
      { label: "○ Informations ✓", ready: false },
      { label: "○ Lieu ✓", ready: false },
      { label: "○ Contenu ✗", ready: false },
      { label: "○ Réglementaire —", ready: false },
    ],
    actions: [
      { label: "Supprimer", href: "#", primary: false },
      { label: "Continuer →", href: "/formateur/formations/new", primary: true },
    ],
    borderColor: undefined,
    opacity: 1,
    tab: "brouillon",
  },
  {
    id: "4",
    colorBar: "#1565c0",
    status: "Terminée · Archivée",
    statusClass: "pill-blue",
    format: "Masterclass · 7h",
    title: "Stenting coronarien avancé — Toulouse 2026",
    price: "420 €",
    gaugePct: 93,
    gaugeText: "14/15",
    gaugeColor: "#1565c0",
    meta: [
      { icon: "📅", text: "14 juin 2026" },
      { icon: "📍", text: "Toulouse · Novotel Wilson" },
      { icon: "⭐", text: "Note : 4.9 / 5", green: true },
      { icon: "💰", text: "Revenus : 4 704 € HT nets", blue: true },
    ],
    docs: [
      { label: "✓ Feuille présence certifiée", ready: true },
      { label: "✓ PV de formation", ready: true },
      { label: "✓ 14 attestations envoyées", ready: true },
      { label: "✓ Bilan pédagogique", ready: true },
    ],
    actions: [
      { label: "Voir portfolio", href: "/formateur/portfolio", primary: false },
      { label: "Voir le détail", href: "/formateur/formations/4", primary: false },
    ],
    borderColor: undefined,
    opacity: 0.8,
    tab: "termine",
  },
];

const TABS = [
  { key: "all", label: "Toutes (4)" },
  { key: "encours", label: "En cours (2)" },
  { key: "publie", label: "Publiées (1)" },
  { key: "termine", label: "Terminées (1)" },
  { key: "brouillon", label: "Brouillons (1)" },
];

export default function FormateurFormationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = formations.filter((f) => {
    const matchTab = activeTab === "all" || f.tab === activeTab;
    const matchSearch = f.title.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="topbar-title">Mes formations</div>
        <div className="topbar-right">
          <Link href="/formateur/formations/new" className="btn-new">
            + Nouvelle formation
          </Link>
        </div>
      </div>

      <div className="content">
        {/* STATS ROW */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            { val: "4", label: "Total formations" },
            { val: "1", label: "Action requise", red: true },
            { val: "34", label: "Participants cumulés" },
            { val: "6 480 €", label: "Revenus HT nets", small: true },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: "white",
                border: "1px solid #E0E0E0",
                borderRadius: 10,
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  fontSize: s.small ? 18 : 22,
                  fontWeight: 800,
                  color: s.red ? "#C8102E" : "#0F0F0F",
                  letterSpacing: "-0.5px",
                }}
              >
                {s.val}
              </div>
              <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* FILTERS BAR */}
        <div
          style={{
            background: "white",
            border: "1px solid #E0E0E0",
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap" as const,
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 200,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#F9F7F4",
              border: "1.5px solid #E0E0E0",
              borderRadius: 8,
              padding: "7px 12px",
            }}
          >
            <span style={{ fontSize: 14 }}>🔍</span>
            <input
              type="text"
              placeholder="Rechercher une formation…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: 13,
                fontFamily: "inherit",
                background: "transparent",
                color: "#0F0F0F",
                flex: 1,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: 4,
              background: "#F9F7F4",
              borderRadius: 8,
              padding: 3,
            }}
          >
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap" as const,
                  background: activeTab === t.key ? "white" : "transparent",
                  color: activeTab === t.key ? "#0F0F0F" : "#6A6A6A",
                  boxShadow: activeTab === t.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <select
            style={{
              border: "1.5px solid #E0E0E0",
              borderRadius: 8,
              padding: "7px 12px",
              fontSize: 13,
              fontFamily: "inherit",
              color: "#0F0F0F",
              outline: "none",
              background: "white",
              cursor: "pointer",
            }}
          >
            <option>Trier : Date (récent)</option>
            <option>Trier : Date (ancien)</option>
            <option>Trier : Inscrits</option>
            <option>Trier : Revenus</option>
          </select>
        </div>

        {/* FORMATION CARDS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((f) => (
            <div
              key={f.id}
              style={{
                background: "white",
                border: `1.5px solid ${f.borderColor || "#E0E0E0"}`,
                borderRadius: 14,
                overflow: "hidden",
                opacity: f.opacity,
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
            >
              {/* CARD TOP */}
              <div style={{ padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div
                  style={{
                    width: 4,
                    borderRadius: 100,
                    background: f.colorBar,
                    flexShrink: 0,
                    alignSelf: "stretch",
                    minHeight: 60,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}
                      >
                        <span className={`pill ${f.statusClass}`}>{f.status}</span>
                        <span style={{ fontSize: 11, color: "#6A6A6A" }}>{f.format}</span>
                        {f.stepLabel && (
                          <span style={{ fontSize: 11, color: "#6A6A6A" }}>{f.stepLabel}</span>
                        )}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#0F0F0F", letterSpacing: "-0.3px" }}>
                        {f.title}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column" as const,
                        alignItems: "flex-end",
                        gap: 6,
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: f.priceGray ? "#9e9e9e" : "#0F0F0F",
                        }}
                      >
                        {f.price}{" "}
                        {!f.priceGray && (
                          <span style={{ fontSize: 12, fontWeight: 400, color: "#6A6A6A" }}>HT</span>
                        )}
                      </div>
                      {f.gaugePct !== null && f.gaugeText && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div
                            style={{
                              width: 80,
                              background: "#EBEBEB",
                              borderRadius: 100,
                              height: 4,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                borderRadius: 100,
                                background: f.gaugeColor || "#C8102E",
                                width: `${f.gaugePct}%`,
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 11, color: "#6A6A6A" }}>{f.gaugeText}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* META */}
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" as const, marginBottom: 10 }}>
                    {f.meta.map((m, mi) => (
                      <span
                        key={mi}
                        style={{
                          fontSize: 12,
                          color: m.green
                            ? "#2e7d32"
                            : m.orange
                            ? "#e65100"
                            : m.blue
                            ? "#1565c0"
                            : m.gray
                            ? "#6A6A6A"
                            : "#6A6A6A",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontWeight: m.green || m.orange || m.blue ? 600 : 400,
                        }}
                      >
                        {m.icon && <span>{m.icon}</span>}
                        {m.text}
                      </span>
                    ))}
                  </div>
                  {/* PROGRESS FOR DRAFT */}
                  {f.progressPct !== undefined && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 4 }}>Progression</div>
                      <div
                        style={{
                          background: "#EBEBEB",
                          borderRadius: 100,
                          height: 4,
                          overflow: "hidden",
                          width: 200,
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            background: f.progressColor || "#C8102E",
                            borderRadius: 100,
                            width: `${f.progressPct}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD BOTTOM */}
              <div
                style={{
                  padding: "10px 20px",
                  background: "#F9F7F4",
                  borderTop: "1px solid #EBEBEB",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap" as const,
                }}
              >
                {f.docs.map((d, di) => (
                  <span
                    key={di}
                    style={{
                      fontSize: 11,
                      color: d.ready ? "#2e7d32" : "#6A6A6A",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {d.label}
                  </span>
                ))}
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  {f.actions.map((a, ai) => (
                    <Link
                      key={ai}
                      href={a.href}
                      style={{
                        border: a.primary
                          ? `1.5px solid ${a.orange ? "#e65100" : "#C8102E"}`
                          : "1.5px solid #E0E0E0",
                        background: a.primary
                          ? a.orange
                            ? "#e65100"
                            : "#C8102E"
                          : "white",
                        borderRadius: 7,
                        padding: "5px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        textDecoration: "none",
                        color: a.primary ? "white" : "#0F0F0F",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        transition: "border-color 0.15s, color 0.15s, background 0.15s",
                      }}
                    >
                      {a.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            marginTop: 20,
          }}
        >
          <button
            style={{
              width: 34,
              height: 34,
              borderRadius: 7,
              border: "1.5px solid #C8102E",
              background: "#C8102E",
              fontSize: 13,
              fontWeight: 600,
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            1
          </button>
        </div>
      </div>
    </>
  );
}
