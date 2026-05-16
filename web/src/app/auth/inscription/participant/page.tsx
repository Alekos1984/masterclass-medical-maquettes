"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SPECIALITES_OPTIONS } from "@/lib/specialites";

export default function InscriptionParticipantPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  const [civilite, setCivilite] = useState("Dr.");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [specialite, setSpecialite] = useState("");
  const [ville, setVille] = useState("");
  const [etablissement, setEtablissement] = useState("");
  const [rpps, setRpps] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [cgu, setCgu] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "participant",
          civilite, prenom, nom, email, telephone,
          specialite, ville, etablissement, rpps, password,
        }),
      });
      setStep(2);
      window.scrollTo(0, 0);
    } catch {
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
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
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28, height: 28, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
              background: step === 2 ? "#e8f5e9" : "var(--red)",
              color: step === 2 ? "#2e7d32" : "white",
            }}
          >
            {step === 2 ? "✓" : "1"}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--black)" }}>Profil</span>
        </div>
        <div
          style={{
            width: 40, height: 2, margin: "0 6px",
            background: step === 2 ? "#2e7d32" : "var(--light-gray)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28, height: 28, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
              background: step === 2 ? "var(--red)" : "#f5f5f5",
              color: step === 2 ? "white" : "#9e9e9e",
            }}
          >
            2
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: step === 2 ? "var(--black)" : "#9e9e9e" }}>
            Confirmation
          </span>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "40px 20px 60px", width: "100%" }}>

        {/* ÉTAPE 1 — Profil */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.4px", marginBottom: 4 }}>
              Créez votre espace participant
            </div>
            <div style={{ fontSize: 14, color: "var(--gray)", marginBottom: 28 }}>
              Pour suivre vos inscriptions et télécharger vos attestations.
            </div>

            <div className="auth-field-two" style={{ marginBottom: 16 }}>
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
                <input id="prenom" type="text" className="auth-input" placeholder="Sophie" value={prenom} onChange={e => setPrenom(e.target.value)} />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="nom">Nom</label>
              <input id="nom" type="text" className="auth-input" placeholder="Bernard" value={nom} onChange={e => setNom(e.target.value)} />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="email">Email professionnel</label>
              <input id="email" type="email" className="auth-input" placeholder="nom@hopital.fr" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="telephone">Téléphone</label>
              <input id="telephone" type="tel" className="auth-input" placeholder="06 12 34 56 78" value={telephone} onChange={e => setTelephone(e.target.value)} />
            </div>

            <div className="auth-field-two" style={{ marginBottom: 16 }}>
              <div>
                <label className="auth-label" htmlFor="specialite">Spécialité</label>
                <select id="specialite" className="auth-select" value={specialite} onChange={e => setSpecialite(e.target.value)}>
                  {SPECIALITES_OPTIONS}
                </select>
              </div>
              <div>
                <label className="auth-label" htmlFor="ville">Ville d&apos;exercice</label>
                <input id="ville" type="text" className="auth-input" placeholder="Paris" value={ville} onChange={e => setVille(e.target.value)} />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="etablissement">Établissement</label>
              <input id="etablissement" type="text" className="auth-input" placeholder="CHU Paris-Necker" value={etablissement} onChange={e => setEtablissement(e.target.value)} />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="rpps">
                Numéro RPPS{" "}
                <span style={{ fontSize: 11, fontWeight: 400, color: "var(--gray)" }}>(opt. — pour attestations)</span>
              </label>
              <input id="rpps" type="text" className="auth-input" placeholder="10 chiffres" value={rpps} onChange={e => setRpps(e.target.value)} />
              <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 4 }}>
                Permet la génération d&apos;attestations nominatives certifiées.
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="password">Mot de passe</label>
              <input id="password" type="password" className="auth-input" placeholder="••••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="passwordConfirm">Confirmer le mot de passe</label>
              <input id="passwordConfirm" type="password" className="auth-input" placeholder="••••••••••" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} />
            </div>

            <div style={{ background: "#e3f2fd", border: "1.5px solid #90caf9", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#1565c0", marginBottom: 20, lineHeight: 1.6 }}>
              ℹ️ L&apos;inscription est <strong>gratuite</strong>. Vous ne payez que lors de votre inscription à une formation.
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
                <a href="#">Conditions Générales d&apos;Utilisation</a>{" "}
                et la <a href="#">Politique de confidentialité</a>.
              </label>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="auth-btn"
                style={{ flex: 2 }}
                onClick={handleSubmit}
                disabled={loading || !cgu}
              >
                {loading ? "⏳ Création…" : "Créer mon compte →"}
              </button>
            </div>

            <div className="auth-footer">
              Déjà un compte ?{" "}
              <Link href="/auth/login">Se connecter</Link>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 — Succès */}
        {step === 2 && (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--black)", marginBottom: 8 }}>
              Compte créé !
            </div>
            <div style={{ fontSize: 14, color: "var(--gray)", lineHeight: 1.7, marginBottom: 24 }}>
              Bienvenue sur Masterclass Médical, {civilite} {nom}.<br /><br />
              Un email de vérification a été envoyé à <strong>{email}</strong>.<br />
              Activez votre compte puis parcourez le catalogue.
            </div>
            <button
              style={{
                background: "var(--black)", color: "white", border: "none",
                borderRadius: 10, padding: "13px 28px", fontSize: 15,
                fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}
              onClick={() => { window.location.href = "/auth/redirect"; }}
            >
              Accéder à mon espace →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
