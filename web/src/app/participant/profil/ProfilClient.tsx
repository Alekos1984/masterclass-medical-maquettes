"use client";

import { useState } from "react";
import Link from "next/link";
import { SPECIALITES_OPTIONS } from "@/lib/specialites";

interface ProfilData {
  // From User
  name: string | null;
  email: string | null;
  // From ParticipantProfile
  titre: string | null;
  specialite: string | null;
  phone: string | null;
  ville: string | null;
  rpps: string | null;
  adresse: string | null;
  codePostal: string | null;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfilClient({ profil }: { profil: ProfilData }) {
  const [nom, setNom] = useState(profil.name ?? "");
  const [titre, setTitre] = useState(profil.titre ?? "");
  const [specialite, setSpecialite] = useState(profil.specialite ?? "");
  const [phone, setPhone] = useState(profil.phone ?? "");
  const [ville, setVille] = useState(profil.ville ?? "");
  const [rpps, setRpps] = useState(profil.rpps ?? "");
  const [adresse, setAdresse] = useState(profil.adresse ?? "");
  const [codePostal, setCodePostal] = useState(profil.codePostal ?? "");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initials = getInitials(nom || profil.name);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/participant/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nom,
          titre,
          specialite,
          phone,
          ville,
          rpps,
          adresse,
          codePostal,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Erreur lors de la sauvegarde");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setNom(profil.name ?? "");
    setTitre(profil.titre ?? "");
    setSpecialite(profil.specialite ?? "");
    setPhone(profil.phone ?? "");
    setVille(profil.ville ?? "");
    setRpps(profil.rpps ?? "");
    setAdresse(profil.adresse ?? "");
    setCodePostal(profil.codePostal ?? "");
    setError(null);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1.5px solid #E0E0E0",
    borderRadius: 9,
    padding: "10px 13px",
    fontSize: 13,
    fontFamily: "inherit",
    color: "var(--black)",
    outline: "none",
    background: "white",
    boxSizing: "border-box",
  };
  const inputDisabledStyle: React.CSSProperties = {
    ...inputStyle,
    background: "#f5f5f5",
    color: "#9e9e9e",
    cursor: "not-allowed",
  };
  const fieldStyle: React.CSSProperties = { marginBottom: 14 };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 80px" }}>

      {/* PAGE HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/participant/dashboard" style={{ fontSize: 13, color: "var(--gray)", textDecoration: "none" }}>
          ← Mon espace
        </Link>
        <div style={{ width: 1, height: 16, background: "#E0E0E0" }} />
        <div style={{ fontSize: 18, fontWeight: 800 }}>Mon profil</div>
      </div>

      {/* PROFILE HEADER */}
      <div style={{
        background: "white", border: "1px solid #E0E0E0", borderRadius: 16,
        padding: 24, marginBottom: 20, display: "flex", alignItems: "center", gap: 20,
      }}>
        <div style={{ position: "relative" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg,#1565c0,#42a5f5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 700, color: "white",
          }}>
            {initials}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 2 }}>
            {[titre, nom].filter(Boolean).join(" ") || "—"}
          </div>
          <div style={{ fontSize: 13, color: "var(--gray)" }}>
            {[specialite, ville].filter(Boolean).join(" · ") || "Profil à compléter"}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <span className="pill pill-green">✓ Email vérifié</span>
          </div>
        </div>
      </div>

      {/* INFOS PERSONNELLES */}
      <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 14, padding: "20px 22px", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #E0E0E0" }}>
          Informations personnelles
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Civilité</label>
            <select
              style={inputStyle}
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
            >
              <option value="">—</option>
              <option value="Dr.">Dr.</option>
              <option value="Pr.">Pr.</option>
              <option value="M.">M.</option>
              <option value="Mme">Mme</option>
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Nom complet</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              style={inputStyle}
              placeholder="Prénom Nom"
            />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Email <span style={{ color: "var(--gray)", fontWeight: 400, fontSize: 11 }}>(non modifiable)</span></label>
            <input
              type="email"
              value={profil.email ?? ""}
              disabled
              style={inputDisabledStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
              placeholder="06 00 00 00 00"
            />
          </div>
        </div>
      </div>

      {/* PROFIL MÉDICAL */}
      <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 14, padding: "20px 22px", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #E0E0E0" }}>
          Profil médical
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Spécialité</label>
            <select
              style={inputStyle}
              value={specialite}
              onChange={(e) => setSpecialite(e.target.value)}
            >
              {SPECIALITES_OPTIONS}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Ville d&apos;exercice</label>
            <input
              type="text"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              style={inputStyle}
              placeholder="Paris"
            />
          </div>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>
            Numéro RPPS <span style={{ color: "var(--gray)", fontWeight: 400, fontSize: 11 }}>(pour attestations certifiées)</span>
          </label>
          <input
            type="text"
            value={rpps}
            onChange={(e) => setRpps(e.target.value)}
            style={inputStyle}
            placeholder="11 chiffres"
          />
          <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 4 }}>
            Apparaît sur vos attestations de participation. Obligatoire pour les attestations certifiées.
          </div>
        </div>
      </div>

      {/* ADRESSE FACTURATION */}
      <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 14, padding: "20px 22px", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #E0E0E0" }}>
          Adresse de facturation
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Adresse</label>
          <input
            type="text"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            style={inputStyle}
            placeholder="15 Rue de la Médecine"
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Code postal</label>
            <input
              type="text"
              value={codePostal}
              onChange={(e) => setCodePostal(e.target.value)}
              style={inputStyle}
              placeholder="75000"
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Ville</label>
            <input
              type="text"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              style={inputStyle}
              placeholder="Paris"
            />
          </div>
        </div>
        <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 4 }}>Utilisée pour vos factures d&apos;inscription.</div>
      </div>

      {/* NOTIFICATIONS */}
      <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 14, padding: "20px 22px", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #E0E0E0" }}>
          Préférences de notification
        </div>
        {[
          { title: "Confirmation d'inscription", sub: "Email à chaque nouvelle inscription", checked: true },
          { title: "Rappel J-7", sub: "Email une semaine avant chaque formation", checked: true },
          { title: "Nouvelles formations recommandées", sub: "En fonction de votre spécialité", checked: true },
          { title: "Newsletter mensuelle", sub: "Actualités et nouvelles formations", checked: false },
        ].map((n, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 3 ? "1px solid #E0E0E0" : "none" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{n.title}</div>
              <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 1 }}>{n.sub}</div>
            </div>
            <input type="checkbox" defaultChecked={n.checked} style={{ width: 18, height: 18, accentColor: "var(--red)", cursor: "pointer" }} />
          </div>
        ))}
      </div>

      {/* MOT DE PASSE */}
      <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 14, padding: "20px 22px", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #E0E0E0" }}>
          Mot de passe
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={fieldStyle}><label style={labelStyle}>Mot de passe actuel</label><input type="password" placeholder="••••••••••" style={inputStyle} /></div>
          <div />
          <div style={fieldStyle}><label style={labelStyle}>Nouveau mot de passe</label><input type="password" placeholder="••••••••••" style={inputStyle} /></div>
          <div style={fieldStyle}><label style={labelStyle}>Confirmer</label><input type="password" placeholder="••••••••••" style={inputStyle} /></div>
        </div>
      </div>

      {/* DANGER */}
      <div style={{ background: "white", border: "1.5px solid #ef9a9a", borderRadius: 14, padding: "20px 22px", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#c62828", marginBottom: 12 }}>Zone de danger</div>
        <button style={{ background: "#ffebee", color: "#c62828", border: "1.5px solid #ef9a9a", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Supprimer mon compte
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div style={{ background: "#ffebee", border: "1.5px solid #ef9a9a", borderRadius: 10, padding: "10px 16px", marginBottom: 12, fontSize: 13, color: "#c62828" }}>
          {error}
        </div>
      )}

      {/* SAVE BAR */}
      <div style={{
        position: "sticky", bottom: 0, background: "white", borderTop: "1px solid #E0E0E0",
        padding: "12px 20px", display: "flex", justifyContent: "flex-end", gap: 10,
        margin: "0 -20px",
      }}>
        <button
          onClick={handleCancel}
          disabled={saving}
          style={{ background: "white", border: "1.5px solid #E0E0E0", borderRadius: 9, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", color: "var(--gray)" }}
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: saved ? "#2e7d32" : "var(--red)", color: "white", border: "none",
            borderRadius: 9, padding: "10px 20px", fontSize: 14, fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Enregistrement…" : saved ? "✓ Enregistré !" : "✓ Enregistrer"}
        </button>
      </div>
    </div>
  );
}
