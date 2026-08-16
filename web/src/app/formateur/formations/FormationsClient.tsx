"use client";

import { useState } from "react";
import Link from "next/link";
import { StatutFormation } from "@/generated/prisma/enums";

type FormationItem = {
  id: string;
  titre: string;
  statut: string;
  date: string;
  lieuVille: string | null;
  prixHT: string;
  placesTotal: number;
  placesRestantes: number;
  inscriptionsCount: number;
  dureeHeures: number;
};

function statutLabel(statut: string): { label: string; className: string; colorBar: string } {
  switch (statut) {
    case StatutFormation.PUBLIEE:
      return { label: "Publiée", className: "pill-green", colorBar: "#C8102E" };
    case StatutFormation.COMPLETE:
      return { label: "Complète", className: "pill-blue", colorBar: "#1565c0" };
    case StatutFormation.ANNULEE:
      return { label: "Annulée", className: "pill-gray", colorBar: "#9e9e9e" };
    case StatutFormation.BROUILLON:
      return { label: "Brouillon", className: "pill-gray", colorBar: "#9e9e9e" };
    default:
      return { label: statut, className: "pill-gray", colorBar: "#9e9e9e" };
  }
}

function tabForStatut(statut: string): string {
  switch (statut) {
    case StatutFormation.PUBLIEE:
      return "publie";
    case StatutFormation.BROUILLON:
      return "brouillon";
    case StatutFormation.COMPLETE:
    case StatutFormation.ANNULEE:
      return "termine";
    default:
      return "all";
  }
}

type CoursDU = {
  formationId: string; slotId: string; date: string; heureDebut: string; heureFin: string;
  titre: string; cursusId: string; cursusTitre: string; cursusAnnee: string | null;
  role: "COORDINATEUR" | "ENSEIGNANT"; lieu: string | null; type: string;
};

export default function FormationsClient({
  formations,
  coursDU = [],
  stats,
}: {
  formations: FormationItem[];
  coursDU?: CoursDU[];
  stats: { total: number; inscriptionsTotal: number; revenus: number };
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = formations.filter((f) => {
    const matchTab = activeTab === "all" || tabForStatut(f.statut) === activeTab;
    const matchSearch = f.titre.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const publiees = formations.filter((f) => f.statut === StatutFormation.PUBLIEE).length;
  const brouillons = formations.filter((f) => f.statut === StatutFormation.BROUILLON).length;
  const terminees = formations.filter(
    (f) => f.statut === StatutFormation.COMPLETE || f.statut === StatutFormation.ANNULEE
  ).length;

  const TABS = [
    { key: "all", label: `Toutes (${formations.length})` },
    { key: "publie", label: `Publiées (${publiees})` },
    { key: "termine", label: `Terminées (${terminees})` },
    { key: "brouillon", label: `Brouillons (${brouillons})` },
  ];

  const revenusFormatted =
    stats.revenus.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";

  return (
    <>
      {/* MES COURS DE DU (créneaux dans un cursus coordonné) */}
      {coursDU.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6A6A6A", marginBottom: 10 }}>
            🎓 Mes cours dans un DU ({coursDU.length})
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
            {coursDU.map((c) => {
              const dateStr = new Date(c.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
              return (
                <Link key={`${c.formationId}-${c.slotId}`} href={`/formateur/coordination/${c.cursusId}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ background: "white", borderRadius: 12, border: "1px solid #E0E0E0", padding: "14px 16px", cursor: "pointer", transition: "border-color .15s" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#1565c0", marginBottom: 6 }}>
                      → {c.cursusTitre}{c.cursusAnnee ? ` · ${c.cursusAnnee}` : ""}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0F0F0F", marginBottom: 4, lineHeight: 1.35 }}>{c.titre}</div>
                    <div style={{ fontSize: 12, color: "#6A6A6A" }}>
                      📅 {dateStr} · {c.heureDebut}–{c.heureFin}
                      {c.lieu && <> · 📍 {c.lieu}</>}
                    </div>
                    {c.role === "COORDINATEUR" && (
                      <div style={{ marginTop: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, background: "#fff5f6", color: "#C8102E", padding: "2px 8px", borderRadius: 100 }}>Coordinateur</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

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
          { val: String(stats.total), label: "Total formations" },
          { val: String(publiees), label: "Publiées", red: publiees > 0 },
          { val: String(stats.inscriptionsTotal), label: "Participants cumulés" },
          { val: revenusFormatted, label: "Revenus HT nets", small: true },
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
                color: "#0F0F0F",
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
      </div>

      {/* FORMATION CARDS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length === 0 ? (
          <div
            style={{
              background: "white",
              border: "1px solid #E0E0E0",
              borderRadius: 14,
              textAlign: "center",
              padding: "60px 20px",
              color: "#6A6A6A",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 14 }}>🎓</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: "#0F0F0F" }}>
              {search ? "Aucune formation ne correspond à votre recherche" : "Aucune formation pour l'instant"}
            </div>
            <div style={{ fontSize: 13, marginBottom: 20 }}>
              {search ? "Essayez un autre mot-clé." : "Créez votre première formation et commencez à accueillir des participants."}
            </div>
            {!search && (
              <Link href="/formateur/formations/new" className="btn-new">
                + Créer ma première formation
              </Link>
            )}
          </div>
        ) : (
          filtered.map((f) => {
            const { label, className, colorBar } = statutLabel(f.statut);
            const inscrits = f.inscriptionsCount;
            const gaugePct = f.placesTotal > 0 ? Math.round((inscrits / f.placesTotal) * 100) : null;
            const dateFormatted = new Intl.DateTimeFormat("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(new Date(f.date));

            return (
              <div
                key={f.id}
                style={{
                  background: "white",
                  border: "1.5px solid #E0E0E0",
                  borderRadius: 14,
                  overflow: "hidden",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
              >
                {/* CARD TOP */}
                <div style={{ padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div
                    style={{
                      width: 4,
                      borderRadius: 100,
                      background: colorBar,
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
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span className={`pill ${className}`}>{label}</span>
                          <span style={{ fontSize: 11, color: "#6A6A6A" }}>
                            {f.dureeHeures}h
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: "#0F0F0F",
                            letterSpacing: "-0.3px",
                          }}
                        >
                          {f.titre}
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
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#0F0F0F" }}>
                          {f.prixHT}{" "}
                          <span style={{ fontSize: 12, fontWeight: 400, color: "#6A6A6A" }}>HT</span>
                        </div>
                        {gaugePct !== null && (
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
                                  background: colorBar,
                                  width: `${gaugePct}%`,
                                }}
                              />
                            </div>
                            <span style={{ fontSize: 11, color: "#6A6A6A" }}>
                              {inscrits}/{f.placesTotal}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* META */}
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" as const }}>
                      <span style={{ fontSize: 12, color: "#6A6A6A", display: "flex", alignItems: "center", gap: 4 }}>
                        📅 {dateFormatted}
                      </span>
                      {f.lieuVille && (
                        <span style={{ fontSize: 12, color: "#6A6A6A", display: "flex", alignItems: "center", gap: 4 }}>
                          📍 {f.lieuVille}
                        </span>
                      )}
                      {f.placesRestantes > 0 && f.statut === StatutFormation.PUBLIEE && (
                        <span style={{ fontSize: 12, color: "#2e7d32", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                          ⚡ {f.placesRestantes} place{f.placesRestantes > 1 ? "s" : ""} restante{f.placesRestantes > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
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
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    <Link
                      href={`/formateur/formations/${f.id}`}
                      style={{
                        border: "1.5px solid #E0E0E0",
                        background: "white",
                        borderRadius: 7,
                        padding: "5px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        textDecoration: "none",
                        color: "#0F0F0F",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      Voir le détail
                    </Link>
                    {f.statut === StatutFormation.PUBLIEE && (
                      <Link
                        href={`/formateur/emargement/${f.id}`}
                        style={{
                          border: "1.5px solid #C8102E",
                          background: "#C8102E",
                          borderRadius: 7,
                          padding: "5px 12px",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          textDecoration: "none",
                          color: "white",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        ✍️ Émargement
                      </Link>
                    )}
                    {f.statut === StatutFormation.BROUILLON && (
                      <Link
                        href={`/formateur/formations/new`}
                        style={{
                          border: "1.5px solid #C8102E",
                          background: "#C8102E",
                          borderRadius: 7,
                          padding: "5px 12px",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          textDecoration: "none",
                          color: "white",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        Continuer →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
