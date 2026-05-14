"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"formateur" | "participant">("formateur");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Email ou mot de passe incorrect.");
      } else {
        // Full page reload via server-side redirect page — reads actual role from session
        window.location.href = "/auth/redirect";
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* NAV */}
      <nav className="auth-nav">
        <Link href="/" className="auth-nav-logo">
          <div className="auth-nav-logo-mark">M</div>
          <span className="auth-nav-logo-name">Masterclass Médical</span>
        </Link>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,.45)" }}>
          Pas de compte ?{" "}
          <Link
            href="/auth/inscription/formateur"
            style={{ color: "#ff8a96", fontWeight: 600, textDecoration: "none" }}
          >
            S&apos;inscrire →
          </Link>
        </span>
      </nav>

      {/* SPLIT */}
      <div className="auth-split" style={{ flex: 1 }}>
        {/* LEFT */}
        <div className="auth-left">
          <div className="auth-glow" />
          <div className="auth-left-inner">
            <div className="auth-left-title">
              La plateforme de
              <br />
              <span className="serif">formation médicale</span>
              <br />
              indépendante.
            </div>
            <div className="auth-left-sub">
              De l&apos;idée à la formation réelle — logistique, documents, inscriptions,
              attestations. Tout automatisé.
            </div>
            <div className="auth-feature">
              <span className="auth-feature-icon">⚡</span>
              <div className="auth-feature-text">
                <strong>Documents réglementaires</strong> générés automatiquement
              </div>
            </div>
            <div className="auth-feature">
              <span className="auth-feature-icon">🏨</span>
              <div className="auth-feature-text">
                <strong>Devis de salle</strong> obtenu sous 72h partout en France
              </div>
            </div>
            <div className="auth-feature">
              <span className="auth-feature-icon">🤖</span>
              <div className="auth-feature-text">
                <strong>IA intégrée</strong> pour programme et objectifs pédagogiques
              </div>
            </div>
            <div className="auth-feature">
              <span className="auth-feature-icon">📄</span>
              <div className="auth-feature-text">
                <strong>Attestations et émargement</strong> numériques horodatés
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <div className="auth-form-box">
            <div className="auth-eyebrow">Connexion</div>
            <div className="auth-form-title">Bon retour 👋</div>
            <div className="auth-form-sub">
              Accédez à votre espace formateur ou participant.
            </div>

            {/* ROLE TABS */}
            <div className="auth-role-tabs">
              <div
                className={`auth-rtab${role === "formateur" ? " active" : ""}`}
                onClick={() => setRole("formateur")}
              >
                <div className="auth-rtab-icon">🎓</div>
                <div className="auth-rtab-label">Formateur</div>
                <div className="auth-rtab-sub">Gérez vos formations</div>
              </div>
              <div
                className={`auth-rtab${role === "participant" ? " active" : ""}`}
                onClick={() => setRole("participant")}
              >
                <div className="auth-rtab-icon">👤</div>
                <div className="auth-rtab-label">Participant</div>
                <div className="auth-rtab-sub">Vos inscriptions</div>
              </div>
            </div>

            {/* ERROR */}
            {error && <div className="auth-error">{error}</div>}

            {/* FIELDS */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="email">
                Email professionnel
              </label>
              <input
                id="email"
                type="email"
                className="auth-input"
                placeholder="nom@hopital.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="auth-field">
              <div className="auth-field-row">
                <label className="auth-label" htmlFor="pwd" style={{ marginBottom: 0 }}>
                  Mot de passe
                </label>
                <a href="#" className="auth-forgot">
                  Mot de passe oublié ?
                </a>
              </div>
              <input
                id="pwd"
                type="password"
                className="auth-input"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                style={{ marginTop: 5 }}
              />
            </div>

            <button className="auth-btn" onClick={handleLogin} disabled={loading}>
              {loading ? "⏳ Connexion…" : "Se connecter →"}
            </button>

            {/* DIVIDER */}
            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">ou</span>
              <div className="auth-divider-line" />
            </div>

            {/* GOOGLE (disabled) */}
            <button
              style={{
                width: "100%",
                background: "white",
                border: "1.5px solid #E0E0E0",
                borderRadius: 10,
                padding: 11,
                fontSize: 13,
                fontWeight: 600,
                cursor: "not-allowed",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: 0.6,
              }}
              disabled
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuer avec Google
            </button>

            <div className="auth-footer">
              Pas encore de compte ?{" "}
              <Link
                href={
                  role === "formateur"
                    ? "/auth/inscription/formateur"
                    : "/auth/inscription/participant"
                }
              >
                {role === "formateur"
                  ? "Créer un compte formateur →"
                  : "Créer un compte participant →"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
