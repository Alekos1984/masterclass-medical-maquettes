"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = {
  cursus: {
    id: string; titre: string; annee: string | null; specialite: string; description: string;
    coordinateurNom: string; inscriptionMode: string; prixHT: number | null;
    lieuNom: string | null; lieuVille: string | null;
    enseignants: string[];
    journees: {
      date: string; heureDebut: string; heureFin: string; modalite: string;
      slots: { heureDebut: string; heureFin: string; titre: string; type: string; enseignantNom: string | null }[];
    }[];
  };
};

export default function DuPublicClient({ cursus }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function inscrire() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/cursus/${cursus.id}/inscription`, { method: "POST" });
      const d = await res.json();
      if (res.status === 401) {
        router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/du/${window.location.pathname.split("/").pop()}`)}`);
        return;
      }
      if (!res.ok) { setError(d.error ?? "Erreur"); return; }
      if (d.gratuit) { router.push("/participant/dashboard"); return; }
      const checkout = await fetch(`/api/checkout/${d.inscriptionId}`, { method: "POST" });
      const c = await checkout.json();
      if (c.url) window.location.href = c.url;
      else setError(c.error ?? "Erreur de paiement");
    } catch {
      setError("Erreur réseau");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F9F7F4", fontFamily: "var(--font-sans, 'DM Sans', sans-serif)" }}>
      <div style={{ background: "#0F0F0F", padding: "48px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C8102E", marginBottom: 10 }}>
          Enseignement universitaire · {cursus.specialite}
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "white", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
          {cursus.titre}{cursus.annee ? ` — ${cursus.annee}` : ""}
        </h1>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
          Coordination : {cursus.coordinateurNom}
          {cursus.lieuNom && ` · ${cursus.lieuNom}${cursus.lieuVille ? `, ${cursus.lieuVille}` : ""}`}
          {` · ${cursus.journees.length} journée${cursus.journees.length > 1 ? "s" : ""}`}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 24px 80px" }}>
        {cursus.description && (
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #E0E0E0", padding: "24px 28px", marginBottom: 20, fontSize: 14, color: "#444", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {cursus.description}
          </div>
        )}

        {/* Inscription */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #E0E0E0", padding: "24px 28px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          {cursus.inscriptionMode === "PAYANT" ? (
            <>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#0F0F0F" }}>{cursus.prixHT ?? 0} € HT</div>
                <div style={{ fontSize: 12, color: "#6A6A6A" }}>Cursus complet · accès aux supports, sessions et attestations</div>
              </div>
              <button
                onClick={inscrire}
                disabled={busy}
                style={{ background: busy ? "#999" : "#C8102E", color: "white", border: "none", borderRadius: 100, padding: "14px 34px", fontSize: 15, fontWeight: 800, cursor: busy ? "not-allowed" : "pointer", fontFamily: "inherit" }}
              >
                {busy ? "Un instant…" : "S'inscrire →"}
              </button>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "#6A6A6A", lineHeight: 1.6 }}>
              🎓 Les inscriptions à cet enseignement sont gérées par l&apos;université.
              Contactez le secrétariat pédagogique de votre faculté pour vous inscrire.
            </div>
          )}
          {error && <div style={{ width: "100%", fontSize: 13, color: "#c62828" }}>{error}</div>}
        </div>

        {/* Intervenants */}
        {cursus.enseignants.length > 0 && (
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #E0E0E0", padding: "24px 28px", marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6A6A6A", marginBottom: 14 }}>
              Équipe pédagogique
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {cursus.enseignants.map((e, i) => (
                <span key={i} style={{ fontSize: 13, fontWeight: 600, background: "#F9F7F4", color: "#0F0F0F", padding: "6px 14px", borderRadius: 100, border: "1px solid #EBEBEB" }}>
                  🧑‍⚕️ {e}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Programme */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #E0E0E0", padding: "24px 28px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6A6A6A", marginBottom: 14 }}>
            Programme
          </div>
          {cursus.journees.map((j, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F0F0F", marginBottom: 2 }}>
                📅 {new Date(j.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
              <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 8 }}>
                {j.heureDebut}–{j.heureFin} · {j.modalite === "VIRTUEL" ? "Visioconférence" : j.modalite === "MIXTE" ? "Présentiel + visio" : "Présentiel"}
              </div>
              {j.slots.map((s, k) => (
                <div key={k} style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: "1px solid #F5F5F5", fontSize: 13 }}>
                  <span style={{ color: "#9A9A9A", whiteSpace: "nowrap", width: 95 }}>{s.heureDebut}–{s.heureFin}</span>
                  <span style={{ flex: 1, fontWeight: s.type === "pause" ? 400 : 600, color: s.type === "pause" ? "#9A9A9A" : "#0F0F0F" }}>{s.titre}</span>
                  {s.type !== "pause" && s.enseignantNom && <span style={{ color: "#C8102E", whiteSpace: "nowrap" }}>{s.enseignantNom}</span>}
                </div>
              ))}
            </div>
          ))}
          {cursus.journees.length === 0 && <div style={{ fontSize: 13, color: "#9A9A9A" }}>Programme à venir.</div>}
        </div>

        <div style={{ textAlign: "center", marginTop: 28 }}>
          <Link href="/" style={{ fontSize: 13, color: "#6A6A6A", textDecoration: "none" }}>← Masterclass Médical</Link>
        </div>
      </div>
    </div>
  );
}
