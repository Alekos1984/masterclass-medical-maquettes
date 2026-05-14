"use client";

import { useState } from "react";

type FormationRow = {
  id: string;
  titre: string;
  date: string; // ISO string
  lieuVille: string | null;
  lieuNom: string | null;
  statut: string;
  placesTotal: number;
  participantsCount: number;
  noteMoyenne: string | null;
  dureeHeures: number;
  niveau: string;
  portfolioVisible: boolean;
};

type FilterType = "Toutes" | "Visible" | "Masqué";

function statutLabel(statut: string): { label: string; color: string } {
  switch (statut) {
    case "PUBLIEE":
      return { label: "Publiée", color: "#1565c0" };
    case "COMPLETE":
      return { label: "Complète", color: "#2e7d32" };
    case "ANNULEE":
      return { label: "Annulée", color: "#c62828" };
    case "BROUILLON":
      return { label: "Brouillon", color: "#e65100" };
    case "SALLE_CONFIRMEE":
      return { label: "Salle confirmée", color: "#e65100" };
    case "EN_ATTENTE_SALLE":
      return { label: "En attente salle", color: "#e65100" };
    default:
      return { label: statut, color: "var(--gray)" };
  }
}

function formatDateDisplay(isoDate: string): string {
  const d = new Date(isoDate);
  const now = new Date();
  const year = d.getFullYear();
  const label = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
  const ville = "";
  return label;
}

interface Props {
  formations: FormationRow[];
  initials: string;
}

export default function PortfolioClient({ formations, initials }: Props) {
  const [filter, setFilter] = useState<FilterType>("Toutes");
  const [year, setYear] = useState("Toutes les années");
  const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>(
    Object.fromEntries(formations.map((f) => [f.id, f.portfolioVisible]))
  );

  const years = Array.from(
    new Set(formations.map((f) => new Date(f.date).getFullYear()))
  ).sort((a, b) => b - a);

  const filtered = formations.filter((f) => {
    if (filter === "Visible" && !visibilityMap[f.id]) return false;
    if (filter === "Masqué" && visibilityMap[f.id]) return false;
    if (year !== "Toutes les années" && new Date(f.date).getFullYear() !== Number(year))
      return false;
    return true;
  });

  return (
    <>
      {/* FILTERS */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {(["Toutes", "Visible", "Masqué"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 14px",
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              border: `1.5px solid ${filter === f ? "var(--red)" : "#E0E0E0"}`,
              background: filter === f ? "var(--red)" : "white",
              color: filter === f ? "white" : "var(--gray)",
              fontFamily: "inherit",
            }}
          >
            {f === "Toutes" ? `Toutes (${formations.length})` : f}
          </button>
        ))}
        {years.length > 0 && (
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{
              border: "1.5px solid #E0E0E0",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 12,
              fontFamily: "inherit",
              outline: "none",
              background: "white",
              marginLeft: "auto",
            }}
          >
            <option>Toutes les années</option>
            {years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            background: "white",
            border: "1.5px dashed #E0E0E0",
            borderRadius: 14,
            padding: "48px 40px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gray)" }}>
            Aucune formation ne correspond à ce filtre.
          </div>
        </div>
      ) : (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          {filtered.map((f) => {
            const isVisible = visibilityMap[f.id];
            const { label, color } = statutLabel(f.statut);
            const dateStr = new Intl.DateTimeFormat("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(f.date));
            return (
              <div
                key={f.id}
                style={{
                  background: "white",
                  border: "1px solid #E0E0E0",
                  borderRadius: 14,
                  overflow: "hidden",
                  opacity: isVisible ? 1 : 0.75,
                }}
              >
                <div
                  style={{
                    padding: "16px 18px 12px",
                    borderBottom: "1px solid #EBEBEB",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                      color: "var(--red)",
                      marginBottom: 4,
                    }}
                  >
                    {dateStr}
                    {f.lieuVille ? ` · ${f.lieuVille}` : ""}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      letterSpacing: -0.2,
                      marginBottom: 3,
                    }}
                  >
                    {f.titre}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--gray)" }}>
                    {f.lieuNom ? `${f.lieuNom} · ` : ""}
                    {f.dureeHeures}h
                    {f.niveau ? ` · ${f.niveau}` : ""}
                  </div>
                </div>
                <div style={{ padding: "14px 18px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 12,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() =>
                        setVisibilityMap((prev) => ({
                          ...prev,
                          [f.id]: !prev[f.id],
                        }))
                      }
                      style={{ accentColor: "var(--red)" }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        color: isVisible ? "var(--black)" : "var(--gray)",
                      }}
                    >
                      {isVisible
                        ? "Visible sur ma page publique"
                        : "Non visible (masqué)"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3,1fr)",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    {[
                      {
                        val: f.participantsCount.toString(),
                        label: "Participants",
                        color: undefined,
                        small: false,
                      },
                      {
                        val: f.noteMoyenne ?? "—",
                        label: "Note moy.",
                        color: f.noteMoyenne ? "#ffc107" : undefined,
                        small: false,
                      },
                      {
                        val: label,
                        label: "Statut",
                        color,
                        small: true,
                      },
                    ].map((s, j) => (
                      <div
                        key={j}
                        style={{
                          textAlign: "center",
                          background: "var(--off-white)",
                          borderRadius: 8,
                          padding: "8px 4px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: s.small ? 11 : 16,
                            fontWeight: 800,
                            color: s.color || "var(--black)",
                          }}
                        >
                          {s.val}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--gray)",
                            marginTop: 1,
                          }}
                        >
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                  {!isVisible && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--gray)",
                        marginBottom: 12,
                      }}
                    >
                      Formation masquée du profil public.
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      style={{
                        flex: 1,
                        textAlign: "center",
                        padding: 7,
                        border: "1.5px solid #E0E0E0",
                        borderRadius: 7,
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--gray)",
                        cursor: "pointer",
                        background: "white",
                        fontFamily: "inherit",
                      }}
                    >
                      Voir détail
                    </button>
                    <button
                      style={{
                        flex: 1,
                        textAlign: "center",
                        padding: 7,
                        border: "1.5px solid #E0E0E0",
                        borderRadius: 7,
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--gray)",
                        cursor: "pointer",
                        background: "white",
                        fontFamily: "inherit",
                      }}
                    >
                      {isVisible ? "↓ Bilan PDF" : "Rendre visible"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
