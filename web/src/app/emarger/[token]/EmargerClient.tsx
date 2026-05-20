"use client";

import { useState } from "react";
import Link from "next/link";

interface EmargerData {
  emargementId: string;
  formationId: string;
  alreadySigned: boolean;
  signedAt: string | null;
  participant: { nom: string; email: string };
  formation: {
    titre: string;
    date: string;
    heureDebut: string;
    heureFin: string;
    lieu: string;
    formateurNom: string;
  };
  token: string;
}

export default function EmargerClient({ data }: { data: EmargerData }) {
  const [signed, setSigned] = useState(data.alreadySigned);
  const [loading, setLoading] = useState(false);
  const [signedTime, setSignedTime] = useState<string>(() => {
    if (data.signedAt) {
      const d = new Date(data.signedAt);
      return `${d.getHours().toString().padStart(2, "0")}h${d.getMinutes().toString().padStart(2, "0")}`;
    }
    return "";
  });
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function doSign() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/emarger/${data.token}`, { method: "POST" });
      if (res.status === 409) {
        setSigned(true);
        setShowModal(true);
        return;
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError((j as { error?: string }).error ?? "Erreur lors de l'enregistrement.");
        return;
      }
      const j = await res.json() as { signedAt: string };
      const d = new Date(j.signedAt);
      const time = `${d.getHours().toString().padStart(2, "0")}h${d.getMinutes().toString().padStart(2, "0")}`;
      setSignedTime(time);
      setSigned(true);
      setShowModal(true);
    } catch {
      setError("Erreur réseau, veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  const { participant: p, formation: f } = data;
  const initials = p.nom.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#F9F7F4", minHeight: "100vh", display: "flex", flexDirection: "column", color: "#0F0F0F" }}>

      {/* NAV */}
      <nav style={{ background: "#0F0F0F", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "#C8102E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "white" }}>M</div>
          <span style={{ fontSize: 14, fontWeight: 800, color: "white" }}>Masterclass Médical</span>
        </Link>
      </nav>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg,#080810,#0a1808)", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#4caf50", marginBottom: 10 }}>
          ⬤ Session ouverte · En direct
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "white", letterSpacing: -0.3, marginBottom: 4 }}>
          Feuille d&apos;émargement numérique
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
          Confirmez votre présence à la formation
        </div>
      </div>

      {/* PAGE */}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "28px 20px 60px", flex: 1 }}>

        {/* PARTICIPANT CARD */}
        <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#1565c0,#42a5f5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "white", flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}>{p.nom}</div>
              <div style={{ fontSize: 13, color: "#6A6A6A" }}>{p.email}</div>
            </div>
          </div>
        </div>

        {/* FORMATION CARD */}
        <div style={{ background: "linear-gradient(135deg,#080810,#1a0408)", borderRadius: 14, padding: "18px 20px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, background: "radial-gradient(circle,rgba(200,16,46,.2) 0%,transparent 65%)" }} />
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,.35)", marginBottom: 6 }}>Formation</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "white", marginBottom: 10 }}>{f.titre}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {[
              `📅 ${f.date}`,
              `📍 ${f.lieu}`,
              `🕐 ${f.heureDebut}–${f.heureFin}`,
              `🎓 ${f.formateurNom}`,
            ].map((r, i) => (
              <div key={i} style={{ fontSize: 12, color: "rgba(255,255,255,.55)" }}>{r}</div>
            ))}
          </div>
        </div>

        {/* STATUS STEPS */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "#6A6A6A", marginBottom: 10 }}>Votre dossier</div>
          {[
            { done: true, title: "Inscription confirmée", sub: "Paiement reçu · Inscription validée", icon: "✓", iconBg: "#e8f5e9" },
            { done: signed, title: `Émargement — ${signed ? "Confirmé" : "En attente"}`, sub: signed ? `Présence confirmée à ${signedTime}` : "Confirmez votre présence ci-dessous", icon: signed ? "✓" : "⏳", iconBg: signed ? "#e8f5e9" : "#e3f2fd" },
            { done: false, title: "Attestation de participation", sub: "Disponible après clôture de la session", icon: "🎓", iconBg: "#f5f5f5", opacity: 0.5 },
          ].map((s, i) => (
            <div key={i} style={{ background: "white", border: `1.5px solid ${s.done ? "#c8e6c9" : "#E0E0E0"}`, borderRadius: 12, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12, opacity: ("opacity" in s ? s.opacity : 1) as number }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, background: s.iconBg }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{s.title}</div>
                <div style={{ fontSize: 11, color: "#6A6A6A" }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ERROR */}
        {error && (
          <div style={{ background: "#fff5f6", border: "1.5px solid #ffc5cc", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#c62828", fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ALREADY SIGNED */}
        {signed && (
          <div style={{ background: "#e8f5e9", border: "1.5px solid #c8e6c9", borderRadius: 12, padding: 16, textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#2e7d32", marginBottom: 4 }}>Présence déjà confirmée</div>
            <div style={{ fontSize: 13, color: "#388e3c" }}>Émargé à <strong>{signedTime}</strong> · Merci !</div>
          </div>
        )}
        {signed && (
          <a
            href={`/participant/session/${data.formationId}`}
            style={{ display: "block", background: "#0F0F0F", color: "white", border: "none", borderRadius: 12, padding: "14px 24px", fontSize: 14, fontWeight: 700, textAlign: "center", textDecoration: "none", marginBottom: 20 }}
          >
            🖥️ Rejoindre la session en direct →
          </a>
        )}

        {/* BOUTON ÉMARGER */}
        {!signed && (
          <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 16, padding: 24, marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Vous êtes bien présent(e) ?</div>
            <div style={{ fontSize: 13, color: "#6A6A6A", marginBottom: 20, lineHeight: 1.6 }}>
              En cliquant sur le bouton, vous confirmez votre présence physique à cette formation. Ce geste a valeur de signature.
            </div>
            <button
              onClick={doSign}
              disabled={loading}
              style={{ background: "#C8102E", color: "white", border: "none", borderRadius: 12, padding: "16px 32px", fontSize: 16, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", width: "100%", boxShadow: "0 4px 20px rgba(200,16,46,.3)", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "⏳ Enregistrement…" : "✍️ Je confirme ma présence"}
            </button>
            <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 10 }}>🔒 Horodaté et certifié · Lien à usage unique</div>
          </div>
        )}
      </div>

      {/* SUCCESS MODAL */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 20, padding: "40px 32px", maxWidth: 380, width: "90%", textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Présence confirmée !</div>
            <div style={{ fontSize: 14, color: "#6A6A6A", lineHeight: 1.6, marginBottom: 8 }}>
              Votre émargement a été enregistré et horodaté.
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#2e7d32", marginBottom: 20 }}>
              ⏱ {f.date} à {signedTime}
            </div>
            <div style={{ fontSize: 13, color: "#6A6A6A", marginBottom: 20 }}>
              Votre attestation de participation sera disponible après la clôture de la session.
            </div>
            <button
              onClick={() => setShowModal(false)}
              style={{ background: "#0F0F0F", color: "white", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
