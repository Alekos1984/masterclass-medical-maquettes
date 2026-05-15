"use client";

import Link from "next/link";

type FormationItem = {
  id: string;
  slug: string;
  titre: string;
  specialite: string;
  niveau: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  dureeHeures: number;
  lieuVille: string;
  lieuNom: string;
  placesTotal: number;
  placesRestantes: number;
  prixHT: number;
  gratuite: boolean;
};

type ProfilData = {
  id: string;
  nom: string;
  specialite: string;
  ville: string;
  bio: string;
  experienceAns: number;
  publications: number;
  linkedinUrl: string;
  researchgateUrl: string;
  pubmedUrl: string;
  formations: FormationItem[];
};

type Props = {
  profil: ProfilData;
};

const NIVEAUX: Record<string, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  expert: "Expert",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function FormateurPublicClient({ profil }: Props) {
  const initials = getInitials(profil.nom);

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
      <div
        style={{
          background: "linear-gradient(135deg, #080810 0%, #1a0408 60%, #0a1018 100%)",
          padding: "56px 40px 48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(200,16,46,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(200,16,46,0.05) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 320,
            height: 320,
            background: "radial-gradient(circle, rgba(200,16,46,0.15) 0%, transparent 65%)",
          }}
        />

        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            position: "relative",
            zIndex: 2,
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 40,
            alignItems: "center",
          }}
        >
          {/* Left — identity */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
              {/* Avatar */}
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #C8102E, #9b0c23)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  fontWeight: 800,
                  color: "white",
                  flexShrink: 0,
                  border: "3px solid rgba(200,16,46,0.4)",
                }}
              >
                {initials}
              </div>
              <div>
                <h1
                  style={{
                    fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
                    fontWeight: 800,
                    color: "white",
                    margin: 0,
                    letterSpacing: -0.5,
                    lineHeight: 1.1,
                  }}
                >
                  {profil.nom}
                </h1>
                {profil.specialite && (
                  <div style={{ fontSize: 14, color: "#ff8a96", marginTop: 4, fontWeight: 600 }}>
                    {profil.specialite}
                  </div>
                )}
                {profil.ville && (
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                    📍 {profil.ville}
                  </div>
                )}
              </div>
            </div>

            {/* Social badges */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {profil.linkedinUrl && (
                <a
                  href={profil.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "rgba(0,119,181,0.2)",
                    border: "1px solid rgba(0,119,181,0.4)",
                    borderRadius: 20,
                    padding: "5px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#6bb8e8",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  LinkedIn
                </a>
              )}
              {profil.researchgateUrl && (
                <a
                  href={profil.researchgateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "rgba(0,204,136,0.15)",
                    border: "1px solid rgba(0,204,136,0.35)",
                    borderRadius: 20,
                    padding: "5px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#4ddcaa",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  ResearchGate
                </a>
              )}
              {profil.pubmedUrl && (
                <a
                  href={profil.pubmedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "rgba(51,102,204,0.15)",
                    border: "1px solid rgba(51,102,204,0.35)",
                    borderRadius: 20,
                    padding: "5px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#88aaee",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  PubMed
                </a>
              )}
            </div>
          </div>

          {/* Right — stats */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {[
              {
                val: profil.experienceAns > 0 ? `${profil.experienceAns} ans` : "—",
                label: "Expérience",
              },
              {
                val: profil.publications > 0 ? String(profil.publications) : "—",
                label: "Publications",
              },
              {
                val: String(profil.formations.length),
                label: "Formations",
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: "14px 20px",
                  textAlign: "center",
                  minWidth: 130,
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "white",
                    letterSpacing: -0.8,
                    lineHeight: 1,
                  }}
                >
                  {s.val}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.35)",
                    marginTop: 4,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}

            <a
              href="#formations"
              style={{
                background: "#C8102E",
                color: "white",
                borderRadius: 10,
                padding: "10px 18px",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
                textAlign: "center",
                display: "block",
                marginTop: 4,
              }}
            >
              Voir ses formations ↓
            </a>
          </div>
        </div>
      </div>

      {/* BIO */}
      {profil.bio && (
        <section
          style={{
            background: "white",
            padding: "48px 40px",
            borderBottom: "1px solid #F0F0F0",
          }}
        >
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#111",
                marginBottom: 16,
                letterSpacing: -0.3,
              }}
            >
              À propos
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "#444",
                lineHeight: 1.75,
                margin: 0,
                whiteSpace: "pre-line",
              }}
            >
              {profil.bio}
            </p>
          </div>
        </section>
      )}

      {/* FORMATIONS */}
      <section
        id="formations"
        style={{
          background: "#F8F8FA",
          flex: 1,
          padding: "48px 40px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#111",
              marginBottom: 28,
              letterSpacing: -0.5,
            }}
          >
            Formations disponibles
          </h2>

          {profil.formations.length === 0 ? (
            <div
              style={{
                background: "white",
                border: "1.5px dashed #E0E0E0",
                borderRadius: 14,
                padding: "60px 40px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 14 }}>🎓</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "#111" }}>
                Aucune formation disponible actuellement
              </div>
              <div style={{ fontSize: 13, color: "#888", maxWidth: 380, margin: "0 auto" }}>
                Ce formateur n&apos;a pas encore publié de formation. Revenez plus tard.
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 20,
              }}
            >
              {profil.formations.map((f) => {
                const placesRestantes = f.placesRestantes;
                const placesLabel =
                  placesRestantes === 0
                    ? "Complet"
                    : placesRestantes <= 3
                    ? `${placesRestantes} place${placesRestantes > 1 ? "s" : ""} restante${placesRestantes > 1 ? "s" : ""}`
                    : `${placesRestantes} places restantes`;
                const placesColor =
                  placesRestantes === 0
                    ? "#C8102E"
                    : placesRestantes <= 3
                    ? "#f97316"
                    : "#888";

                return (
                  <div
                    key={f.id}
                    style={{
                      background: "white",
                      borderRadius: 14,
                      border: "1.5px solid #EBEBEB",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      transition: "box-shadow 0.2s",
                    }}
                  >
                    {/* Card header */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, #080810, #1a0408)",
                        padding: "16px 18px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: "#ff8a96",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: 0.8,
                          marginBottom: 6,
                        }}
                      >
                        🩺 {f.specialite}
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: "white",
                          lineHeight: 1.3,
                        }}
                      >
                        {f.titre}
                      </div>
                    </div>

                    {/* Card body */}
                    <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ fontSize: 13, color: "#444" }}>
                          📅 {f.date}
                          {f.heureDebut && (
                            <span style={{ color: "#888", marginLeft: 6 }}>
                              {f.heureDebut}{f.heureFin ? ` – ${f.heureFin}` : ""}
                            </span>
                          )}
                        </div>
                        {(f.lieuVille || f.lieuNom) && (
                          <div style={{ fontSize: 13, color: "#444" }}>
                            📍 {f.lieuNom ? `${f.lieuNom}, ` : ""}{f.lieuVille}
                          </div>
                        )}
                        <div style={{ fontSize: 13, color: "#444" }}>
                          ⏱ {f.dureeHeures}h · 🎓 {NIVEAUX[f.niveau] ?? f.niveau}
                        </div>
                      </div>

                      {/* Footer row */}
                      <div
                        style={{
                          marginTop: "auto",
                          paddingTop: 12,
                          borderTop: "1px solid #F0F0F0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 16, color: "#111" }}>
                            {f.gratuite ? "Gratuit" : `${f.prixHT.toLocaleString("fr-FR")} € HT`}
                          </div>
                          <div style={{ fontSize: 11, color: placesColor, fontWeight: 600, marginTop: 2 }}>
                            {placesLabel}
                          </div>
                        </div>
                        <Link
                          href={`/formations/${f.slug}`}
                          style={{
                            background: placesRestantes === 0 ? "#ddd" : "#C8102E",
                            color: placesRestantes === 0 ? "#888" : "white",
                            borderRadius: 8,
                            padding: "8px 16px",
                            fontSize: 13,
                            fontWeight: 700,
                            textDecoration: "none",
                            pointerEvents: placesRestantes === 0 ? "none" : "auto",
                          }}
                        >
                          S&apos;inscrire →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0F0F0F", padding: "24px 40px" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                background: "#C8102E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 800,
                color: "white",
              }}
            >
              M
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>Masterclass Médical</span>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <Link
              href="/auth/inscription/formateur"
              style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}
            >
              Devenir formateur
            </Link>
            <a href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
              CGU
            </a>
            <a
              href="mailto:contact@masterclassmedical.fr"
              style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
