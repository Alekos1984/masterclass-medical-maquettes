"use client";

import { useState } from "react";
import Link from "next/link";

const steps = [
  { num: "✓", style: "done", title: "Inscription et paiement confirmés", sub: "Votre paiement de 450 € HT a été validé. La facture PDF est disponible ci-dessous.", badge: "✓ Maintenant", badgeClass: "done" },
  { num: "✓", style: "done", title: "Email de confirmation envoyé", sub: "Programme détaillé, adresse, plan d'accès et vos coordonnées de participant dans votre boîte mail.", badge: "✓ Envoyé à l'instant", badgeClass: "done" },
  { num: "✓", style: "done", title: "Convention de formation à signer", sub: "Vous allez recevoir dans quelques minutes un email YouSign pour signer électroniquement votre convention de formation (obligatoire).", badge: "✓ Email YouSign en route", badgeClass: "done" },
  { num: "4", style: "soon", title: "Rappel J-7 automatique", sub: "Le 8 novembre 2026, vous recevrez l'adresse exacte, le plan d'accès, les horaires précis et le programme final.", badge: "8 novembre 2026", badgeClass: "soon" },
  { num: "5", style: "soon", title: "Lien d'émargement le jour J", sub: "Le 15 novembre au matin, vous recevrez un lien unique et sécurisé pour confirmer votre présence. Cliquez dessus à votre arrivée.", badge: "15 novembre 2026", badgeClass: "soon" },
  { num: "6", style: "later", title: "Attestation de participation", sub: "Dans les 24h suivant la formation, votre attestation nominative PDF sera envoyée automatiquement par email et disponible dans votre espace participant.", badge: "⚡ Automatique · J+1", badgeClass: "auto" },
];

const stepColors: Record<string, { bg: string; color: string }> = {
  done: { bg: "#e8f5e9", color: "#2e7d32" },
  soon: { bg: "#fff3e0", color: "#e65100" },
  later: { bg: "var(--off-white)", color: "var(--gray)" },
};

const badgeColors: Record<string, { bg: string; color: string }> = {
  done: { bg: "#e8f5e9", color: "#2e7d32" },
  soon: { bg: "#fff3e0", color: "#e65100" },
  auto: { bg: "#e3f2fd", color: "#1565c0" },
};

const docs = [
  { icon: "📄", name: "Facture PDF", status: "✓ Disponible · FCT-2026-0312", ready: true },
  { icon: "📋", name: "Programme officiel", status: "✓ Disponible", ready: true },
  { icon: "📜", name: "Convention de formation", status: "⏳ Signature YouSign en attente", ready: false },
  { icon: "🎓", name: "Attestation de participation", status: "⏳ Disponible après la formation", ready: false },
];

export default function ParticipantConfirmationPage() {
  const [calAdded, setCalAdded] = useState(false);

  return (
    <>
      {/* SUCCESS HERO */}
      <div style={{
        background: "linear-gradient(135deg,#032b0a,#051a10)",
        padding: "56px 40px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
          width: 400, height: 400,
          background: "radial-gradient(circle,rgba(46,204,113,0.15) 0%,transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "rgba(46,204,113,0.15)", border: "2px solid rgba(46,204,113,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, margin: "0 auto 20px", position: "relative", zIndex: 1,
        }}>✓</div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#4caf50", marginBottom: 10, position: "relative", zIndex: 1 }}>
          Inscription confirmée
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, color: "white", lineHeight: 1.1, letterSpacing: -1, marginBottom: 8, position: "relative", zIndex: 1 }}>
          Votre place est{" "}
          <em style={{ fontFamily: "Georgia, serif", fontWeight: 400, color: "#a5d6a7", fontStyle: "italic" }}>réservée !</em>
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", position: "relative", zIndex: 1 }}>
          Un email de confirmation vous a été envoyé à{" "}
          <strong style={{ color: "rgba(255,255,255,0.7)" }}>s.bernard@chu-paris.fr</strong>
        </p>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 40px 60px" }}>

        {/* CONFIRMATION CARD */}
        <div style={{ background: "white", border: "1.5px solid #c8e6c9", borderRadius: 16, padding: "28px 32px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #EBEBEB" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🎓</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2e7d32", letterSpacing: 0.5 }}>✓ Réf. inscription : INS-2026-0312 · Paiement confirmé</div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.3, marginTop: 2 }}>Cardiologie interventionnelle — Techniques avancées 2026</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--gray)", marginBottom: 8 }}>Formation</div>
              {[
                { icon: "📅", val: "Samedi 15 novembre 2026", sub: "08h30 – 17h30" },
                { icon: "📍", val: "Marriott Lyon Cité Internationale", sub: "Salle Rhône · 70 Quai Charles de Gaulle, 69006 Lyon" },
                { icon: "🕐", val: "7 heures · Masterclass", sub: "Niveau intermédiaire" },
                { icon: "🍽️", val: "Restauration incluse", sub: "Pause café matin + déjeuner" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0", borderBottom: i < 3 ? "1px solid #EBEBEB" : "none" }}>
                  <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{r.val}</div>
                    <div style={{ fontSize: 11, color: "var(--gray)" }}>{r.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--gray)", marginBottom: 8 }}>Formateur & paiement</div>
              {[
                { icon: "👨‍⚕️", val: "Dr. Pierre Dumont", sub: "Cardiologue interventionnel · CHU Lyon · ⭐ 4.9" },
                { icon: "💳", val: "450 € HT payés", sub: "Visa ···· 4242 · Exonéré de TVA" },
                { icon: "📄", val: "Facture PDF disponible", sub: "N° FCT-2026-0312" },
                { icon: "❌", val: "Annulation remboursée jusqu'au", sub: "1er novembre 2026 (J-14)" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0", borderBottom: i < 3 ? "1px solid #EBEBEB" : "none" }}>
                  <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{r.val}</div>
                    <div style={{ fontSize: 11, color: "var(--gray)" }}>{r.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* NEXT STEPS */}
        <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 16, padding: "24px 28px", marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: -0.3, marginBottom: 20 }}>Ce qui se passe maintenant</div>
          {steps.map((s, i) => {
            const numStyle = stepColors[s.style];
            return (
              <div key={i} style={{ display: "flex", gap: 16, marginBottom: i < steps.length - 1 ? 16 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, background: numStyle.bg, color: numStyle.color }}>
                    {s.num}
                  </div>
                  {i < steps.length - 1 && <div style={{ width: 1.5, background: "#EBEBEB", flex: 1, margin: "3px 0" }} />}
                </div>
                <div style={{ flex: 1, paddingTop: 2 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: "var(--gray)", lineHeight: 1.5 }}>{s.sub}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, display: "inline-block", marginTop: 4, background: badgeColors[s.badgeClass].bg, color: badgeColors[s.badgeClass].color }}>
                    {s.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* DOCUMENTS */}
        <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 16, padding: "24px 28px", marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Vos documents</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {docs.map((d, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                border: `1.5px solid ${d.ready ? "#c8e6c9" : "#E0E0E0"}`,
                borderRadius: 10, opacity: d.ready ? 1 : 0.6,
              }}>
                <div style={{ fontSize: 18, flexShrink: 0 }}>{d.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{d.name}</div>
                  <div style={{ fontSize: 10, marginTop: 2, color: d.ready ? "#2e7d32" : "var(--gray)" }}>{d.status}</div>
                </div>
                {d.ready && <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--red)", cursor: "pointer", fontWeight: 600, flexShrink: 0 }}>↓</span>}
              </div>
            ))}
          </div>
        </div>

        {/* LIEU */}
        <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
          <div style={{
            width: "100%", height: 140,
            background: "linear-gradient(135deg,#e8eaf6,#c5cae9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#5c6bc0", fontSize: 13, fontWeight: 600, position: "relative",
          }}>
            📍 Marriott Lyon Cité Internationale · Salle Rhône
            <button style={{ position: "absolute", right: 12, top: 12, background: "white", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#5c6bc0" }}>
              Agrandir
            </button>
          </div>
          <div style={{ padding: "18px 22px", display: "flex", gap: 20, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 3 }}>Marriott Lyon Cité Internationale</div>
              <div style={{ fontSize: 12, color: "var(--gray)", marginBottom: 8 }}>70 Quai Charles de Gaulle, 69006 Lyon · Salle Rhône (2e étage)</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {["🚇 T1 Cité Internationale", "🚗 Parking disponible", "♿ PMR accessible", "🍽️ Déjeuner inclus"].map((f, i) => (
                  <span key={i} style={{ fontSize: 11, color: "var(--gray)", background: "var(--off-white)", border: "1px solid #EBEBEB", borderRadius: 5, padding: "2px 8px" }}>{f}</span>
                ))}
              </div>
            </div>
            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              <button
                onClick={() => alert("Google Maps : Marriott Lyon")}
                style={{ background: "var(--red)", color: "white", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
              >
                🗺️ Itinéraire
              </button>
              <button
                onClick={() => { setCalAdded(true); setTimeout(() => setCalAdded(false), 2000); }}
                style={{
                  background: calAdded ? "#e8f5e9" : "white",
                  color: calAdded ? "#2e7d32" : "var(--gray)",
                  border: `1.5px solid ${calAdded ? "#c8e6c9" : "#E0E0E0"}`,
                  borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                }}
              >
                {calAdded ? "✓ Ajouté" : "📅 Ajouter au calendrier"}
              </button>
            </div>
          </div>
        </div>

        {/* SHARE */}
        <div style={{
          background: "var(--off-white)", border: "1px solid #E0E0E0", borderRadius: 12,
          padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 13 }}>
            Partagez cette formation avec vos confrères · <strong>3 places restantes</strong>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["LinkedIn", "Copier le lien", "Email"].map((b, i) => (
              <button key={i} style={{ border: "1.5px solid #E0E0E0", background: "white", borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "var(--gray)" }}>
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* BOTTOM ACTIONS */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/participant/dashboard" style={{ background: "var(--black)", color: "white", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>
            📋 Voir mon espace participant →
          </Link>
          <Link href="/formations" style={{ background: "white", color: "var(--gray)", border: "1.5px solid #E0E0E0", borderRadius: 10, padding: "11px 22px", fontSize: 14, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>
            🔍 Trouver d&apos;autres formations
          </Link>
          <Link href="/formations" style={{ background: "white", color: "var(--gray)", border: "1.5px solid #E0E0E0", borderRadius: 10, padding: "11px 22px", fontSize: 14, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>
            ← Retour à la formation
          </Link>
        </div>
      </div>
    </>
  );
}
