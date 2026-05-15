"use client";

import { useState } from "react";
import Link from "next/link";

type FormationData = {
  id: string;
  slug: string;
  titre: string;
  specialite: string;
  niveau: string;
  date: string;
  lieuVille: string | null;
  lieuNom: string | null;
  placesTotal: number;
  placesRestantes: number;
  prixHT: number;
  formateurNom: string;
  formateurSpec: string | null;
};

type Props = {
  formations: FormationData[];
};

const NIVEAUX: Record<string, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  expert: "Expert",
};

export default function CatalogueClient({ formations }: Props) {
  const [search, setSearch] = useState("");
  const [specialiteFilter, setSpecialiteFilter] = useState("Toutes");

  const specialites = Array.from(new Set(formations.map((f) => f.specialite))).sort();

  const filtered = formations.filter((f) => {
    const matchSearch =
      search === "" ||
      f.titre.toLowerCase().includes(search.toLowerCase()) ||
      f.specialite.toLowerCase().includes(search.toLowerCase()) ||
      (f.lieuVille ?? "").toLowerCase().includes(search.toLowerCase());
    const matchSpec = specialiteFilter === "Toutes" || f.specialite === specialiteFilter;
    return matchSearch && matchSpec;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* NAV */}
      <nav className="public-nav" style={{ position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" className="public-nav-logo">
          <div className="public-nav-logo-mark">M</div>
          <span className="public-nav-logo-name">Masterclass Médical</span>
        </Link>
        <div className="public-nav-links">
          <Link href="/formations" className="public-nav-link" style={{ color: "white" }}>Formations</Link>
          <Link href="/#comment" className="public-nav-link">Comment ça marche</Link>
          <Link href="/auth/inscription/formateur" className="public-nav-link">Devenir formateur</Link>
        </div>
        <Link href="/auth/inscription/formateur" className="public-nav-cta">Organiser une formation</Link>
      </nav>

      {/* HERO */}
      <div className="catalogue-header">
        <div className="catalogue-header-inner">
          <h1>
            Catalogue des{" "}
            <span className="serif">masterclasses</span>
          </h1>
          <p>Des formations médicales premium organisées par des experts, partout en France.</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="catalogue-filters">
        <div className="search-box" style={{ flex: 1, maxWidth: 360 }}>
          <span>🔍</span>
          <input
            placeholder="Rechercher une formation, spécialité, ville…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={specialiteFilter}
          onChange={(e) => setSpecialiteFilter(e.target.value)}
        >
          <option value="Toutes">Toutes les spécialités</option>
          {specialites.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div style={{ marginLeft: "auto", fontSize: 13, color: "var(--gray)" }}>
          {filtered.length} formation{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* GRID */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 40px", color: "var(--gray)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 8 }}>Aucune formation trouvée</div>
          <p>Essayez de modifier vos critères de recherche.</p>
          <button
            className="btn-primary"
            style={{ marginTop: 24, display: "inline-block" }}
            onClick={() => { setSearch(""); setSpecialiteFilter("Toutes"); }}
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="catalogue-grid">
          {filtered.map((f) => {
            const placesLabel =
              f.placesRestantes === 0
                ? "Complet"
                : f.placesRestantes <= 3
                ? `${f.placesRestantes} place${f.placesRestantes > 1 ? "s" : ""} restante${f.placesRestantes > 1 ? "s" : ""}`
                : `${f.placesRestantes} places restantes`;
            const placesColor =
              f.placesRestantes === 0
                ? "var(--red)"
                : f.placesRestantes <= 3
                ? "#f97316"
                : "var(--gray)";
            const initials = f.formateurNom
              .split(" ")
              .filter((w) => w.length > 1)
              .slice(0, 2)
              .map((w) => w[0].toUpperCase())
              .join("");

            return (
              <Link key={f.id} href={`/formations/${f.slug}`} className="formation-card">
                <div className="formation-card-img">
                  <span className="formation-card-specialty">🩺 {f.specialite}</span>
                </div>
                <div className="formation-card-body">
                  <div className="formation-card-title">{f.titre}</div>
                  <div className="formation-card-formateur">
                    <div className="formation-card-av">{initials}</div>
                    <div>
                      <div className="formation-card-av-name">{f.formateurNom}</div>
                      {f.formateurSpec && (
                        <div style={{ fontSize: 10, color: "var(--gray)" }}>{f.formateurSpec}</div>
                      )}
                    </div>
                  </div>
                  <div className="formation-card-meta">
                    <span>📅 {f.date}</span>
                    {f.lieuVille && <span>📍 {f.lieuNom ? `${f.lieuNom}, ` : ""}{f.lieuVille}</span>}
                    <span>🎓 {NIVEAUX[f.niveau] ?? f.niveau}</span>
                  </div>
                  <div className="formation-card-footer">
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{f.prixHT.toLocaleString("fr-FR")} € HT</div>
                    <div style={{ fontSize: 11, color: placesColor, fontWeight: 600 }}>{placesLabel}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ background: "#0F0F0F", padding: "24px 40px", marginTop: "auto" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: "#C8102E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white" }}>M</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>Masterclass Médical</span>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/auth/inscription/formateur" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Devenir formateur</Link>
            <a href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>CGU</a>
            <a href="mailto:contact@masterclassmedical.fr" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
