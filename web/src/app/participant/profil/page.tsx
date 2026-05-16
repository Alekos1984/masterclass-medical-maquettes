"use client";

import { useState } from "react";
import Link from "next/link";
import { SPECIALITES_OPTIONS } from "@/lib/specialites";

export default function ParticipantProfilPage() {
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 9,
    padding: "10px 13px", fontSize: 13, fontFamily: "inherit",
    color: "var(--black)", outline: "none", background: "white",
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
          }}>SB</div>
          <div style={{
            position: "absolute", bottom: 0, right: 0, width: 22, height: 22,
            borderRadius: "50%", background: "var(--red)", border: "2px solid white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, cursor: "pointer", color: "white",
          }}>✏️</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 2 }}>Dr. Sophie Bernard</div>
          <div style={{ fontSize: 13, color: "var(--gray)" }}>Cardiologue · CHU Paris-Necker · Paris</div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <span className="pill pill-green">✓ Email vérifié</span>
            <span className="pill pill-blue">3 formations suivies</span>
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
            <select style={inputStyle}><option>Dr.</option><option>Pr.</option><option>M.</option><option>Mme</option></select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Prénom</label>
            <input type="text" defaultValue="Sophie" style={inputStyle} />
          </div>
        </div>
        <div style={fieldStyle}><label style={labelStyle}>Nom</label><input type="text" defaultValue="Bernard" style={inputStyle} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={fieldStyle}><label style={labelStyle}>Email</label><input type="email" defaultValue="s.bernard@chu-paris.fr" style={inputStyle} /></div>
          <div style={fieldStyle}><label style={labelStyle}>Téléphone</label><input type="tel" defaultValue="06 23 45 67 89" style={inputStyle} /></div>
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
            <select style={inputStyle}>{SPECIALITES_OPTIONS}</select>
          </div>
          <div style={fieldStyle}><label style={labelStyle}>Ville d&apos;exercice</label><input type="text" defaultValue="Paris" style={inputStyle} /></div>
        </div>
        <div style={fieldStyle}><label style={labelStyle}>Établissement</label><input type="text" defaultValue="CHU Paris-Necker — Service de Cardiologie" style={inputStyle} /></div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Numéro RPPS <span style={{ color: "var(--gray)", fontWeight: 400, fontSize: 11 }}>(pour attestations certifiées)</span></label>
          <input type="text" defaultValue="1020304050" style={inputStyle} />
          <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 4 }}>
            Apparaît sur vos attestations de participation. Obligatoire pour les attestations certifiées.
          </div>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Numéro ADELI <span style={{ color: "var(--gray)", fontWeight: 400, fontSize: 11 }}>(optionnel)</span></label>
          <input type="text" placeholder="9 chiffres" style={inputStyle} />
        </div>
      </div>

      {/* ADRESSE FACTURATION */}
      <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 14, padding: "20px 22px", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #E0E0E0" }}>
          Adresse de facturation
        </div>
        <div style={fieldStyle}><label style={labelStyle}>Adresse</label><input type="text" defaultValue="15 Rue de la Médecine" style={inputStyle} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={fieldStyle}><label style={labelStyle}>Code postal</label><input type="text" defaultValue="75015" style={inputStyle} /></div>
          <div style={fieldStyle}><label style={labelStyle}>Ville</label><input type="text" defaultValue="Paris" style={inputStyle} /></div>
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

      {/* SAVE BAR */}
      <div style={{
        position: "sticky", bottom: 0, background: "white", borderTop: "1px solid #E0E0E0",
        padding: "12px 20px", display: "flex", justifyContent: "flex-end", gap: 10,
        margin: "0 -20px",
      }}>
        <button style={{ background: "white", border: "1.5px solid #E0E0E0", borderRadius: 9, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "var(--gray)" }}>
          Annuler
        </button>
        <button
          onClick={save}
          style={{
            background: saved ? "#2e7d32" : "var(--red)", color: "white", border: "none",
            borderRadius: 9, padding: "10px 20px", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {saved ? "✓ Enregistré !" : "✓ Enregistrer"}
        </button>
      </div>
    </div>
  );
}
