"use client";

import Link from "next/link";
import { useState } from "react";

type Formation = {
  slug: string;
  title: string;
  specialty: string;
  format: string;
  duration: string;
  formateur: string;
  formateurInitials: string;
  formateurSpec: string;
  avatarGradient: string;
  date: string;
  city: string;
  venue: string;
  level: string;
  price: number;
  places: number;
  placesMax: number;
  rating: number;
  reviews: number;
  urgent?: boolean;
};

const FORMATIONS: Formation[] = [
  {
    slug: "cardiologie-interventionnelle-techniques-avancees-2026",
    title: "Cardiologie interventionnelle — Techniques avancées 2026",
    specialty: "Cardiologie",
    format: "Masterclass",
    duration: "7h",
    formateur: "Dr. Pierre Dumont",
    formateurInitials: "PD",
    formateurSpec: "Cardiologue interventionnel · CHU Lyon",
    avatarGradient: "linear-gradient(135deg,#C8102E,#ff6b7a)",
    date: "15 novembre 2026",
    city: "Lyon",
    venue: "Marriott",
    level: "intermédiaire",
    price: 450,
    places: 3,
    placesMax: 15,
    rating: 4.9,
    reviews: 28,
    urgent: true,
  },
  {
    slug: "echocardiographie-transthoracique-cas-cliniques",
    title: "Échocardiographie transthoracique — Cas cliniques avancés",
    specialty: "Cardiologie",
    format: "Atelier pratique",
    duration: "4h",
    formateur: "Dr. Sophie Bernard",
    formateurInitials: "SB",
    formateurSpec: "Cardiologue · CHU Paris-Necker",
    avatarGradient: "linear-gradient(135deg,#1565c0,#42a5f5)",
    date: "3 décembre 2026",
    city: "Paris",
    venue: "Hôtel Lutetia",
    level: "avancé",
    price: 320,
    places: 9,
    placesMax: 15,
    rating: 4.8,
    reviews: 15,
  },
  {
    slug: "insuffisance-cardiaque-avancee-symposium-2027",
    title: "Insuffisance cardiaque avancée — Symposium multi-intervenants 2027",
    specialty: "Cardiologie",
    format: "Symposium",
    duration: "2 jours",
    formateur: "Dr. Marc Lefebvre + 3 intervenants",
    formateurInitials: "ML",
    formateurSpec: "Cardiologue · CHU Bordeaux",
    avatarGradient: "linear-gradient(135deg,#2e7d32,#66bb6a)",
    date: "20–21 janvier 2027",
    city: "Bordeaux",
    venue: "Palais des Congrès",
    level: "expert",
    price: 780,
    places: 14,
    placesMax: 20,
    rating: 5.0,
    reviews: 8,
  },
  {
    slug: "rythmologie-clinique-arythmies-urgences",
    title: "Rythmologie clinique — Arythmies et prise en charge en urgence",
    specialty: "Cardiologie",
    format: "Masterclass",
    duration: "7h",
    formateur: "Dr. Anne Chartier",
    formateurInitials: "AC",
    formateurSpec: "Rythmologue · CHU Marseille",
    avatarGradient: "linear-gradient(135deg,#6a1b9a,#ab47bc)",
    date: "8 février 2027",
    city: "Marseille",
    venue: "Intercontinental",
    level: "intermédiaire",
    price: 390,
    places: 12,
    placesMax: 15,
    rating: 4.7,
    reviews: 22,
  },
  {
    slug: "neurologie-sclerose-en-plaques-nouvelles-therapeutiques",
    title: "Sclérose en plaques — Nouvelles thérapeutiques 2026",
    specialty: "Neurologie",
    format: "Masterclass",
    duration: "7h",
    formateur: "Dr. Claire Moreau",
    formateurInitials: "CM",
    formateurSpec: "Neurologue · CHU Toulouse",
    avatarGradient: "linear-gradient(135deg,#0277bd,#29b6f6)",
    date: "22 novembre 2026",
    city: "Toulouse",
    venue: "Hôtel Crowne Plaza",
    level: "avancé",
    price: 420,
    places: 6,
    placesMax: 12,
    rating: 4.8,
    reviews: 11,
  },
  {
    slug: "oncologie-immunotherapie-pratique-clinique",
    title: "Immunothérapie en oncologie — Pratique clinique 2027",
    specialty: "Oncologie",
    format: "Masterclass",
    duration: "7h",
    formateur: "Dr. Julien Fabre",
    formateurInitials: "JF",
    formateurSpec: "Oncologue médical · Institut Curie",
    avatarGradient: "linear-gradient(135deg,#e65100,#ff8f00)",
    date: "12 mars 2027",
    city: "Paris",
    venue: "Institut Curie, Amphithéâtre",
    level: "intermédiaire",
    price: 490,
    places: 10,
    placesMax: 20,
    rating: 4.9,
    reviews: 19,
  },
];

const SPECIALTIES = ["Toutes", "Cardiologie", "Neurologie", "Oncologie", "Chirurgie", "Rhumatologie", "Médecine interne", "Pédiatrie"];
const CITIES = ["Toutes les villes", "Paris", "Lyon", "Bordeaux", "Marseille", "Toulouse", "Lille"];

export default function CataloguePage() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("Toutes");
  const [city, setCity] = useState("Toutes les villes");

  const filtered = FORMATIONS.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      f.title.toLowerCase().includes(q) ||
      f.specialty.toLowerCase().includes(q) ||
      f.formateur.toLowerCase().includes(q);
    const matchSpecialty = specialty === "Toutes" || f.specialty === specialty;
    const matchCity = city === "Toutes les villes" || f.city === city;
    return matchSearch && matchSpecialty && matchCity;
  });

  return (
    <>
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

      {/* HERO SEARCH */}
      <div style={{
        background: "linear-gradient(135deg, #080810 0%, #1a0408 50%, #0a1018 100%)",
        padding: "56px 40px 48px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Grid overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(200,16,46,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(200,16,46,0.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />
        {/* Glow */}
        <div style={{
          position: "absolute",
          top: -60,
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 400,
          background: "radial-gradient(ellipse, rgba(200,16,46,0.14) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 2, textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(200,16,46,0.8)", marginBottom: 12 }}>
            Catalogue · {FORMATIONS.length} formations disponibles
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)", fontWeight: 800, color: "white", lineHeight: 1.1, letterSpacing: -1, marginBottom: 8 }}>
            Trouvez votre{" "}
            <span style={{ fontFamily: "var(--font-serif, 'Instrument Serif', serif)", fontStyle: "italic", fontWeight: 400, color: "#ff8a96" }}>
              prochaine masterclass
            </span>
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 32 }}>
            Des formations médicales premium organisées par des experts, partout en France.
          </p>

          {/* Search box */}
          <div style={{
            background: "white",
            borderRadius: 16,
            padding: "6px 6px 6px 20px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
            marginBottom: 20,
          }}>
            <span style={{ fontSize: 18, flexShrink: 0, color: "#6A6A6A" }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Spécialité, thématique, formateur…"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 15,
                fontFamily: "inherit",
                color: "#0F0F0F",
                background: "transparent",
              }}
            />
            <div style={{ width: 1, height: 28, background: "#EBEBEB", flexShrink: 0 }} />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: 14,
                fontFamily: "inherit",
                color: "#0F0F0F",
                background: "transparent",
                padding: "0 12px",
                minWidth: 140,
                cursor: "pointer",
              }}
            >
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <button
              onClick={() => {}}
              style={{
                background: "#C8102E",
                color: "white",
                border: "none",
                borderRadius: 12,
                padding: "12px 24px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              Rechercher
            </button>
          </div>

          {/* Quick filters */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {SPECIALTIES.map((s) => (
              <button
                key={s}
                onClick={() => setSpecialty(s === "Toutes" ? "Toutes" : s)}
                style={{
                  background: specialty === s || (s === "Toutes" && specialty === "Toutes")
                    ? "rgba(200,16,46,0.18)"
                    : "rgba(255,255,255,0.08)",
                  border: `1px solid ${specialty === s || (s === "Toutes" && specialty === "Toutes") ? "rgba(200,16,46,0.35)" : "rgba(255,255,255,0.14)"}`,
                  color: specialty === s || (s === "Toutes" && specialty === "Toutes")
                    ? "#ff8a96"
                    : "rgba(255,255,255,0.65)",
                  padding: "5px 14px",
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FILTERS BAR + RESULTS */}
      <div className="catalogue-filters">
        <span style={{ fontSize: 14, color: "#6A6A6A" }}>
          <strong style={{ color: "#0F0F0F" }}>{filtered.length} formation{filtered.length !== 1 ? "s" : ""}</strong> trouvée{filtered.length !== 1 ? "s" : ""}
        </span>
        <select
          className="filter-select"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
        >
          {SPECIALTIES.map((s) => <option key={s} value={s}>{s === "Toutes" ? "Toutes les spécialités" : s}</option>)}
        </select>
        <select
          className="filter-select"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input
          type="text"
          className="filter-input"
          placeholder="Rechercher une formation…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="filter-count" style={{ marginLeft: "auto" }}>
          {filtered.length} / {FORMATIONS.length} formations
        </span>
      </div>

      {/* GRID */}
      <div className="catalogue-grid">
        {filtered.map((f) => {
          const fillPct = Math.round(((f.placesMax - f.places) / f.placesMax) * 100);
          return (
            <Link key={f.slug} href={`/formations/${f.slug}`} className="formation-card">
              <div className="formation-card-img">
                <span className="formation-card-specialty">{f.specialty}</span>
              </div>
              <div className="formation-card-body">
                {/* Badges */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 100, background: "#F9F7F4", color: "#6A6A6A" }}>
                    {f.format} · {f.duration}
                  </span>
                  {f.urgent ? (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 100, background: "#fff3e0", color: "#e65100" }}>
                      ⚡ {f.places} places restantes
                    </span>
                  ) : (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 100, background: "#e8f5e9", color: "#2e7d32" }}>
                      Places disponibles
                    </span>
                  )}
                </div>

                <div className="formation-card-title">{f.title}</div>

                <div className="formation-card-formateur">
                  <div className="formation-card-av" style={{ background: f.avatarGradient }}>
                    {f.formateurInitials}
                  </div>
                  <span className="formation-card-av-name">{f.formateur}</span>
                </div>

                <div className="formation-card-meta">
                  <span>📅 {f.date}</span>
                  <span>📍 {f.city} · {f.venue}</span>
                  <span>🎓 Niveau {f.level}</span>
                </div>

                {/* Jauge */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ background: "#EBEBEB", borderRadius: 100, height: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 100, background: "#C8102E", width: `${fillPct}%` }} />
                  </div>
                  <div style={{ fontSize: 10, color: "#6A6A6A", marginTop: 3, textAlign: "right" }}>
                    {f.placesMax - f.places} / {f.placesMax} inscrits
                  </div>
                </div>

                <div className="formation-card-footer">
                  <div>
                    <div className="formation-card-price">{f.price} € <span style={{ fontSize: 12, fontWeight: 400, color: "#6A6A6A" }}>HT</span></div>
                    <div style={{ fontSize: 11, color: "#6A6A6A" }}>Exonéré TVA</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>⭐ {f.rating}</span>
                    <span style={{ fontSize: 11, color: "#6A6A6A" }}>({f.reviews})</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 0", color: "#6A6A6A" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Aucune formation trouvée</div>
            <div style={{ fontSize: 14 }}>Essayez d&apos;autres critères de recherche.</div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#0F0F0F", padding: "24px 40px" }}>
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
    </>
  );
}
