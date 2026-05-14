"use client";

import { useState } from "react";

type FilterType = "Toutes (4)" | "Masterclass" | "Atelier" | "Visible" | "Masqué";

const formations = [
  {
    date: "15 novembre 2026 · Lyon",
    title: "Cardiologie interventionnelle — Techniques avancées 2026",
    meta: "Marriott Lyon · Masterclass · 7h",
    visible: true,
    participants: 12,
    note: null,
    statut: "À venir",
    statutColor: "#e65100",
    review: null,
    tags: ["Coronarographie", "Stenting", "Revascularisation"],
    type: "Masterclass",
  },
  {
    date: "14 juin 2026 · Toulouse",
    title: "Stenting coronarien avancé — Techniques complexes",
    meta: "Novotel Wilson · Masterclass · 7h",
    visible: true,
    participants: 14,
    note: 4.9,
    statut: "Terminée",
    statutColor: "#2e7d32",
    review: { stars: "★★★★★", text: "\"Excellente formation, très pratique et bien structurée.\" — Dr. B." },
    tags: ["Stenting", "Lésions complexes", "Bifurcations"],
    type: "Masterclass",
  },
  {
    date: "18 mars 2026 · Paris",
    title: "Coronarographie diagnostique — Pratiques avancées",
    meta: "Hôtel Marriott Paris Rive Gauche · Masterclass · 7h",
    visible: true,
    participants: 15,
    note: 4.8,
    statut: "Terminée",
    statutColor: "#2e7d32",
    review: { stars: "★★★★★", text: "\"Formateur passionné, cas cliniques très pertinents.\" — Dr. M." },
    tags: ["Coronarographie", "Diagnostic", "Cas cliniques"],
    type: "Masterclass",
  },
  {
    date: "10 octobre 2025 · Lyon",
    title: "Urgences cardiologiques — Atelier simulation",
    meta: "Hôtel Radisson Blu Lyon · Atelier · 4h",
    visible: false,
    participants: 7,
    note: 4.7,
    statut: "Terminée",
    statutColor: "#2e7d32",
    review: null,
    tags: ["Urgences", "Simulation"],
    type: "Atelier",
  },
];

export default function FormateurPortfolioPage() {
  const [filter, setFilter] = useState<FilterType>("Toutes (4)");
  const [year, setYear] = useState("Toutes les années");
  const [visibilityMap, setVisibilityMap] = useState<Record<number, boolean>>(
    Object.fromEntries(formations.map((f, i) => [i, f.visible]))
  );

  const filtered = formations.filter((f, i) => {
    if (filter === "Masterclass" && f.type !== "Masterclass") return false;
    if (filter === "Atelier" && f.type !== "Atelier") return false;
    if (filter === "Visible" && !visibilityMap[i]) return false;
    if (filter === "Masqué" && visibilityMap[i]) return false;
    if (year === "2026" && !f.date.includes("2026")) return false;
    if (year === "2025" && !f.date.includes("2025")) return false;
    return true;
  });

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Portfolio pédagogique</div>
        <button style={{
          background: "white", border: "1.5px solid #E0E0E0", borderRadius: 8,
          padding: "8px 16px", fontSize: 13, fontWeight: 700, color: "var(--gray)",
          cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6,
        }}>
          📤 Exporter PDF
        </button>
      </div>

      <div className="content">

        {/* HERO */}
        <div style={{
          background: "linear-gradient(135deg,#080810,#1a0408)", borderRadius: 16,
          padding: "28px 32px", marginBottom: 24,
          display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "center",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -40, right: -40, width: 200, height: 200,
            background: "radial-gradient(circle,rgba(200,16,46,0.15) 0%,transparent 65%)",
          }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "white", letterSpacing: -0.5, marginBottom: 4 }}>
              Portfolio de <em style={{ fontFamily: "Georgia, serif", fontWeight: 400, color: "#ff8a96" }}>Dr. Pierre Dumont</em>
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
              Cardiologue interventionnel · CHU de Lyon-Sud · Depuis 2022 sur la plateforme
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              {[
                { val: "4", label: "Formations" },
                { val: "48", label: "Participants" },
                { val: "4.9", label: "Note moy." },
                { val: "96%", label: "Recommandation" },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "white", letterSpacing: -0.8 }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12, padding: "16px 18px", textAlign: "center", minWidth: 180,
            position: "relative", zIndex: 1,
          }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Page publique</div>
            <div style={{ fontSize: 11, color: "#ff8a96", fontFamily: "monospace", marginBottom: 10 }}>
              masterclassmedical.fr/dr-dumont
            </div>
            <button style={{
              background: "var(--red)", color: "white", border: "none", borderRadius: 7,
              padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}>
              Voir ma page →
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          {(["Toutes (4)", "Masterclass", "Atelier", "Visible", "Masqué"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                cursor: "pointer", border: `1.5px solid ${filter === f ? "var(--red)" : "#E0E0E0"}`,
                background: filter === f ? "var(--red)" : "white",
                color: filter === f ? "white" : "var(--gray)",
                fontFamily: "inherit",
              }}
            >
              {f}
            </button>
          ))}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{
              border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "6px 12px",
              fontSize: 12, fontFamily: "inherit", outline: "none", background: "white",
              marginLeft: "auto",
            }}
          >
            <option>Toutes les années</option>
            <option>2026</option>
            <option>2025</option>
          </select>
        </div>

        {/* GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {filtered.map((f, i) => {
            const idx = formations.indexOf(f);
            const isVisible = visibilityMap[idx];
            return (
              <div
                key={i}
                style={{
                  background: "white", border: "1px solid #E0E0E0", borderRadius: 14,
                  overflow: "hidden", opacity: isVisible ? 1 : 0.75,
                  transition: "border-color 0.15s",
                }}
              >
                <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid #EBEBEB" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--red)", marginBottom: 4 }}>{f.date}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: -0.2, marginBottom: 3 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: "var(--gray)" }}>{f.meta}</div>
                </div>
                <div style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => setVisibilityMap((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                      style={{ accentColor: "var(--red)" }}
                    />
                    <span style={{ fontSize: 11, color: isVisible ? "var(--black)" : "var(--gray)" }}>
                      {isVisible ? "Visible sur ma page publique" : "Non visible (masqué)"}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
                    {[
                      { val: f.participants.toString(), label: "Participants" },
                      { val: f.note ? f.note.toString() : "—", label: "Note moy.", color: "#ffc107" },
                      { val: f.statut, label: "Statut", color: f.statutColor, small: true },
                    ].map((s, j) => (
                      <div key={j} style={{ textAlign: "center", background: "var(--off-white)", borderRadius: 8, padding: "8px 4px" }}>
                        <div style={{ fontSize: s.small ? 12 : 16, fontWeight: 800, color: s.color || "var(--black)" }}>{s.val}</div>
                        <div style={{ fontSize: 10, color: "var(--gray)", marginTop: 1 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {f.review && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ color: "#ffc107", fontSize: 12 }}>{f.review.stars}</div>
                      <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 3 }}>{f.review.text}</div>
                    </div>
                  )}
                  {!f.review && !isVisible && (
                    <div style={{ fontSize: 11, color: "var(--gray)", marginBottom: 12 }}>Formation masquée du profil public.</div>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                    {f.tags.map((t, j) => (
                      <span key={j} style={{
                        fontSize: 10, background: "var(--off-white)", border: "1px solid #EBEBEB",
                        borderRadius: 5, padding: "2px 7px", color: "var(--gray)",
                      }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={{
                      flex: 1, textAlign: "center", padding: 7, border: "1.5px solid #E0E0E0",
                      borderRadius: 7, fontSize: 11, fontWeight: 600, color: "var(--gray)",
                      cursor: "pointer", background: "white", fontFamily: "inherit",
                    }}>
                      Voir détail
                    </button>
                    <button style={{
                      flex: 1, textAlign: "center", padding: 7, border: "1.5px solid #E0E0E0",
                      borderRadius: 7, fontSize: 11, fontWeight: 600, color: "var(--gray)",
                      cursor: "pointer", background: "white", fontFamily: "inherit",
                    }}>
                      {isVisible ? "↓ Bilan PDF" : "Rendre visible"}
                    </button>
                    {f.note && (
                      <button style={{
                        flex: 1, textAlign: "center", padding: 7, border: "1.5px solid #E0E0E0",
                        borderRadius: 7, fontSize: 11, fontWeight: 600, color: "var(--gray)",
                        cursor: "pointer", background: "white", fontFamily: "inherit",
                      }}>
                        ↓ Livret
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
