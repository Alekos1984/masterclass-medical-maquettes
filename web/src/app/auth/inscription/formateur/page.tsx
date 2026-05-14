"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Step = 1 | 2 | 3 | 4;

export default function InscriptionFormateurPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  // Step 1 fields
  const [civilite, setCivilite] = useState("Dr.");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [pwdStrength, setPwdStrength] = useState(0);
  const [pwdHint, setPwdHint] = useState("8 caractères minimum, 1 majuscule, 1 chiffre.");

  // Step 2 fields
  const [specialite, setSpecialite] = useState("Cardiologie");
  const [sousSpecialite, setSousSpecialite] = useState("");
  const [etablissement, setEtablissement] = useState("");
  const [rpps, setRpps] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");

  // Step 3 fields
  const [plan, setPlan] = useState<"mensuel" | "annuel">("mensuel");
  const [cgu, setCgu] = useState(false);

  function checkPwd(v: string) {
    let strength = 0;
    if (v.length >= 8) strength++;
    if (/[A-Z]/.test(v)) strength++;
    if (/[0-9]/.test(v)) strength++;
    if (/[^A-Za-z0-9]/.test(v)) strength++;
    setPwdStrength(strength);
    const labels = ["Très faible", "Faible", "Moyen", "Fort"];
    setPwdHint(strength > 0 ? "Force : " + labels[strength - 1] : "8 caractères minimum, 1 majuscule, 1 chiffre.");
  }

  const pwdBarColors = ["#f44336", "#ff9800", "#ffc107", "#4caf50"];

  function goStep(n: Step) {
    setStep(n);
    window.scrollTo(0, 0);
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "formateur",
          civilite, prenom, nom, email, telephone, password,
          specialite, sousSpecialite, etablissement, rpps, experience, bio,
          plan,
        }),
      });
      goStep(4);
    } catch {
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  function getStepClass(s: number) {
    if (s < step) return "done";
    if (s === step) return "active";
    return "todo";
  }

  function getConnectorClass(s: number) {
    if (s < step) return "done";
    if (s === step) return "active";
    return "";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--off-white)" }}>
      {/* NAV */}
      <nav className="auth-nav">
        <Link href="/" className="auth-nav-logo">
          <div className="auth-nav-logo-mark">M</div>
          <span className="auth-nav-logo-name">Masterclass Médical</span>
        </Link>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,.45)" }}>
          Déjà un compte ?{" "}
          <Link href="/auth/login" style={{ color: "#ff8a96", fontWeight: 600, textDecoration: "none" }}>
            Se connecter →
          </Link>
        </span>
      </nav>

      {/* STEPS HEADER */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid var(--light-gray)",
          padding: "20px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        {([1, 2, 3, 4] as Step[]).map((s, idx) => {
          const labels = ["Identité", "Spécialité", "Abonnement", "Confirmation"];
          const cls = getStepClass(s);
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 28, height: 28, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                    background: cls === "done" ? "#e8f5e9" : cls === "active" ? "var(--red)" : "#f5f5f5",
                    color: cls === "done" ? "#2e7d32" : cls === "active" ? "white" : "#9e9e9e",
                  }}
                >
                  {cls === "done" ? "✓" : s}
                </div>
                <span
                  style={{
                    fontSize: 12, fontWeight: 600,
                    color: cls === "todo" ? "#9e9e9e" : "var(--black)",
                  }}
                >
                  {labels[idx]}
                </span>
              </div>
              {s < 4 && (
                <div
                  style={{
                    width: 40, height: 2, margin: "0 6px",
                    background: getConnectorClass(s) === "done" ? "#2e7d32" : getConnectorClass(s) === "active" ? "var(--red)" : "var(--light-gray)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* PAGE CONTENT */}
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px 60px", width: "100%" }}>

        {/* ÉTAPE 1 — Identité */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.4px", marginBottom: 4 }}>
              Créez votre compte formateur
            </div>
            <div style={{ fontSize: 14, color: "var(--gray)", marginBottom: 28 }}>
              Informations de connexion et identité professionnelle.
            </div>

            <div className="auth-field-two" style={{ marginBottom: 18 }}>
              <div>
                <label className="auth-label" htmlFor="civilite">Civilité</label>
                <select id="civilite" className="auth-select" value={civilite} onChange={e => setCivilite(e.target.value)}>
                  <option>Dr.</option>
                  <option>Pr.</option>
                  <option>M.</option>
                  <option>Mme</option>
                </select>
              </div>
              <div>
                <label className="auth-label" htmlFor="prenom">Prénom</label>
                <input id="prenom" type="text" className="auth-input" placeholder="Pierre" value={prenom} onChange={e => setPrenom(e.target.value)} />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="nom">Nom</label>
              <input id="nom" type="text" className="auth-input" placeholder="Dumont" value={nom} onChange={e => setNom(e.target.value)} />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="email">Email professionnel</label>
              <input id="email" type="email" className="auth-input" placeholder="nom@hopital.fr" value={email} onChange={e => setEmail(e.target.value)} />
              <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 4 }}>Utilisé pour la connexion et les notifications.</div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="telephone">
                Téléphone{" "}
                <span style={{ fontSize: 11, fontWeight: 400, color: "var(--gray)" }}>(non public)</span>
              </label>
              <input id="telephone" type="tel" className="auth-input" placeholder="06 12 34 56 78" value={telephone} onChange={e => setTelephone(e.target.value)} />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                className="auth-input"
                placeholder="••••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); checkPwd(e.target.value); }}
              />
              <div style={{ height: 4, borderRadius: 100, marginTop: 6, background: "var(--light-gray)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 100,
                  width: `${pwdStrength * 25}%`,
                  background: pwdStrength > 0 ? pwdBarColors[pwdStrength - 1] : "#e0e0e0",
                  transition: "width 0.3s, background 0.3s",
                }} />
              </div>
              <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 4 }}>{pwdHint}</div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="passwordConfirm">Confirmer le mot de passe</label>
              <input id="passwordConfirm" type="password" className="auth-input" placeholder="••••••••••" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                className="auth-btn"
                style={{ flex: 2 }}
                onClick={() => goStep(2)}
              >
                Continuer → Spécialité
              </button>
            </div>
            <div className="auth-footer">
              Déjà un compte ?{" "}
              <Link href="/auth/login">Se connecter</Link>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 — Profil médical */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.4px", marginBottom: 4 }}>
              Votre profil médical
            </div>
            <div style={{ fontSize: 14, color: "var(--gray)", marginBottom: 28 }}>
              Ces informations apparaîtront sur vos pages de formation.
            </div>

            <div className="auth-field-two" style={{ marginBottom: 18 }}>
              <div>
                <label className="auth-label" htmlFor="specialite">Spécialité</label>
                <select id="specialite" className="auth-select" value={specialite} onChange={e => setSpecialite(e.target.value)}>
                  <option>Cardiologie</option>
                  <option>Neurologie</option>
                  <option>Oncologie</option>
                  <option>Chirurgie</option>
                  <option>Rhumatologie</option>
                  <option>Médecine interne</option>
                  <option>Pédiatrie</option>
                  <option>Psychiatrie</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label className="auth-label" htmlFor="sousSpecialite">
                  Sous-spécialité{" "}
                  <span style={{ fontSize: 11, fontWeight: 400, color: "var(--gray)" }}>opt.</span>
                </label>
                <input id="sousSpecialite" type="text" className="auth-input" placeholder="Cardiologie interventionnelle" value={sousSpecialite} onChange={e => setSousSpecialite(e.target.value)} />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="etablissement">Établissement principal</label>
              <input id="etablissement" type="text" className="auth-input" placeholder="CHU de Lyon-Sud — Service de Cardiologie" value={etablissement} onChange={e => setEtablissement(e.target.value)} />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="rpps">Numéro RPPS</label>
              <input id="rpps" type="text" className="auth-input" placeholder="10 chiffres" value={rpps} onChange={e => setRpps(e.target.value)} />
              <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 4 }}>Obligatoire pour la génération des attestations.</div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="experience">Années d&apos;expérience</label>
              <input id="experience" type="number" className="auth-input" placeholder="18" style={{ maxWidth: 120 }} value={experience} onChange={e => setExperience(e.target.value)} />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="bio">
                Biographie courte{" "}
                <span style={{ fontSize: 11, fontWeight: 400, color: "var(--gray)" }}>opt.</span>
              </label>
              <textarea
                id="bio"
                rows={3}
                className="auth-input"
                placeholder="Cardiologue interventionnel depuis 18 ans au CHU de Lyon…"
                value={bio}
                onChange={e => setBio(e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                onClick={() => goStep(1)}
                style={{
                  flex: 1, background: "white", border: "1.5px solid var(--light-gray)",
                  borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit", color: "var(--gray)",
                  transition: "border-color 0.15s",
                }}
              >
                ← Retour
              </button>
              <button className="auth-btn" style={{ flex: 2 }} onClick={() => goStep(3)}>
                Continuer → Abonnement
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 — Abonnement */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.4px", marginBottom: 4 }}>
              Choisissez votre abonnement
            </div>
            <div style={{ fontSize: 14, color: "var(--gray)", marginBottom: 28 }}>
              Votre première formation est gratuite. L&apos;abonnement démarre à la publication.
            </div>

            {/* PLANS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              <div
                onClick={() => setPlan("mensuel")}
                style={{
                  border: `1.5px solid ${plan === "mensuel" ? "var(--red)" : "var(--light-gray)"}`,
                  borderRadius: 12, padding: 16, cursor: "pointer",
                  background: plan === "mensuel" ? "#fff5f6" : "white",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 800, color: plan === "mensuel" ? "var(--red)" : "var(--black)", marginBottom: 2 }}>Formateur Actif</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--black)", marginBottom: 4 }}>
                  20 €{" "}<span style={{ fontSize: 12, fontWeight: 400, color: "var(--gray)" }}>HT/mois</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--gray)", lineHeight: 1.5 }}>Formations illimitées · Documents inclus · Support prioritaire</div>
              </div>
              <div
                onClick={() => setPlan("annuel")}
                style={{
                  border: `1.5px solid ${plan === "annuel" ? "var(--red)" : "var(--light-gray)"}`,
                  borderRadius: 12, padding: 16, cursor: "pointer",
                  background: plan === "annuel" ? "#fff5f6" : "white",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 800, color: plan === "annuel" ? "var(--red)" : "var(--black)", marginBottom: 2 }}>Formateur Annuel</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--black)", marginBottom: 4 }}>
                  180 €{" "}<span style={{ fontSize: 12, fontWeight: 400, color: "var(--gray)" }}>HT/an</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--gray)", lineHeight: 1.5 }}>2 mois offerts · Tout inclus · Facture annuelle</div>
              </div>
            </div>

            <div style={{ background: "#e8f5e9", border: "1.5px solid #c8e6c9", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#2e7d32", marginBottom: 20 }}>
              ✓ Première formation <strong>gratuite</strong> — L&apos;abonnement ne débute qu&apos;à la publication de votre 2e formation.
            </div>

            <div className="auth-field">
              <label className="auth-label">Moyen de paiement</label>
              <div style={{ border: "1.5px solid var(--light-gray)", borderRadius: 10, padding: 14, background: "white", fontSize: 13, color: "var(--gray)", display: "flex", alignItems: "center", gap: 10 }}>
                💳 <span>Carte bancaire (Stripe sécurisé) — saisie à la publication</span>
              </div>
            </div>

            <div className="auth-checkbox-group" style={{ padding: 14, background: "white", border: "1.5px solid var(--light-gray)", borderRadius: 10, marginBottom: 16, alignItems: "flex-start" }}>
              <input
                type="checkbox"
                id="cgu"
                checked={cgu}
                onChange={e => setCgu(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "var(--red)", flexShrink: 0, marginTop: 1 }}
              />
              <label htmlFor="cgu" className="auth-checkbox-label">
                J&apos;accepte les{" "}
                <a href="#">Conditions Générales d&apos;Utilisation</a>,{" "}
                la <a href="#">Politique de confidentialité</a> et les{" "}
                <a href="#">Conditions formateur</a> de Masterclass Médical.
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                onClick={() => goStep(2)}
                style={{
                  flex: 1, background: "white", border: "1.5px solid var(--light-gray)",
                  borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit", color: "var(--gray)",
                }}
              >
                ← Retour
              </button>
              <button
                className="auth-btn"
                style={{ flex: 2 }}
                onClick={handleSubmit}
                disabled={loading || !cgu}
              >
                {loading ? "⏳ Création…" : "Créer mon compte →"}
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 4 — Succès */}
        {step === 4 && (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--black)", marginBottom: 8 }}>
              Compte créé avec succès !
            </div>
            <div style={{ fontSize: 14, color: "var(--gray)", lineHeight: 1.7, marginBottom: 24 }}>
              Bienvenue sur Masterclass Médical, {civilite} {nom}.<br /><br />
              Un email de vérification a été envoyé à <strong>{email}</strong>.<br />
              Cliquez sur le lien pour activer votre compte.<br /><br />
              Vous pouvez commencer à créer votre première formation maintenant.
            </div>
            <button
              style={{
                background: "var(--black)", color: "white", border: "none",
                borderRadius: 10, padding: "13px 28px", fontSize: 15,
                fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}
              onClick={() => router.push("/auth/login")}
            >
              Accéder à mon espace →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
