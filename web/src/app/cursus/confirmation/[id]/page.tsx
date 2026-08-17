"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Creneau = {
  journeeId: string; slotId: string; titre: string; heureDebut: string; heureFin: string;
  dateStr: string; lieu: string | null; statut: "PROPOSE" | "CONFIRME" | "DECLINE" | null;
};

const inputStyle: React.CSSProperties = {
  border: "1.5px solid #E0E0E0", borderRadius: 10, padding: "10px 14px", fontSize: 14,
  fontFamily: "inherit", color: "#0F0F0F", background: "white", outline: "none", width: "100%", boxSizing: "border-box",
};

export default function ConfirmationCreneauxPage() {
  const { id } = useParams<{ id: string }>();
  const [step, setStep] = useState<"identify" | "select" | "done">("identify");
  const [form, setForm] = useState({ prenom: "", nom: "", email: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cursusTitre, setCursusTitre] = useState("");
  const [cursusAnnee, setCursusAnnee] = useState<string | null>(null);
  const [enseignantNom, setEnseignantNom] = useState("");
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [choix, setChoix] = useState<Record<string, "CONFIRME" | "DECLINE">>({});

  async function chercher() {
    if (!form.email.includes("@")) { setError("Email invalide"); return; }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/cursus/${id}/mes-creneaux?email=${encodeURIComponent(form.email.trim())}`);
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? "Erreur"); return; }
      if (!d.found) {
        setError("Aucun créneau ne vous a été proposé avec cette adresse pour ce DU. Vérifiez l'adresse ou contactez le coordinateur.");
        return;
      }
      setCursusTitre(d.cursusTitre);
      setCursusAnnee(d.cursusAnnee);
      setEnseignantNom(d.enseignantNom);
      setCreneaux(d.creneaux);
      const initial: Record<string, "CONFIRME" | "DECLINE"> = {};
      for (const c of d.creneaux as Creneau[]) {
        if (c.statut === "CONFIRME" || c.statut === "DECLINE") initial[`${c.journeeId}:${c.slotId}`] = c.statut;
      }
      setChoix(initial);
      setStep("select");
    } catch {
      setError("Erreur réseau");
    } finally {
      setBusy(false);
    }
  }

  async function envoyer() {
    const reponses = Object.entries(choix).map(([key, statut]) => {
      const [journeeId, slotId] = key.split(":");
      return { journeeId, slotId, statut };
    });
    if (reponses.length === 0) { setError("Choisissez au moins une réponse"); return; }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/cursus/${id}/confirmer-creneaux`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim(), reponses }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? "Erreur"); return; }
      setStep("done");
    } catch {
      setError("Erreur réseau");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F9F7F4", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-sans, 'DM Sans', sans-serif)", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 20, border: "1px solid #E0E0E0", padding: "40px 36px", maxWidth: 560, width: "100%" }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#C8102E", color: "white", fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>M</div>

        {step === "identify" && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C8102E", marginBottom: 8, textAlign: "center" }}>
              Confirmation de créneaux d&apos;enseignement
            </div>
            <div style={{ fontSize: 13, color: "#6A6A6A", lineHeight: 1.6, marginBottom: 24, textAlign: "center" }}>
              Renseignez votre identité pour retrouver les cours qui vous ont été proposés — aucun compte n&apos;est nécessaire.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <input placeholder="Prénom" value={form.prenom} onChange={(e) => setForm((s) => ({ ...s, prenom: e.target.value }))} style={inputStyle} />
              <input placeholder="Nom" value={form.nom} onChange={(e) => setForm((s) => ({ ...s, nom: e.target.value }))} style={inputStyle} />
            </div>
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} style={{ ...inputStyle, marginBottom: 16 }} />
            {error && <div style={{ fontSize: 13, color: "#c62828", marginBottom: 14 }}>{error}</div>}
            <button
              onClick={chercher}
              disabled={busy}
              style={{ width: "100%", background: busy ? "#999" : "#C8102E", color: "white", border: "none", borderRadius: 100, padding: "13px 0", fontSize: 14, fontWeight: 800, cursor: busy ? "not-allowed" : "pointer", fontFamily: "inherit" }}
            >
              {busy ? "Recherche…" : "Voir mes créneaux proposés →"}
            </button>
          </>
        )}

        {step === "select" && (
          <>
            <div style={{ fontSize: 19, fontWeight: 800, color: "#0F0F0F", marginBottom: 4, textAlign: "center" }}>
              {cursusTitre}{cursusAnnee ? ` · ${cursusAnnee}` : ""}
            </div>
            <div style={{ fontSize: 13, color: "#6A6A6A", marginBottom: 20, textAlign: "center" }}>
              Bonjour {enseignantNom}, voici les cours qui vous ont été proposés.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              {creneaux.map((c) => {
                const key = `${c.journeeId}:${c.slotId}`;
                const val = choix[key];
                return (
                  <div key={key} style={{ border: "1px solid #E0E0E0", borderRadius: 12, padding: "12px 16px" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0F0F0F" }}>{c.titre}</div>
                    <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 10 }}>
                      📅 {c.dateStr} · 🕐 {c.heureDebut}–{c.heureFin}{c.lieu ? ` · 📍 ${c.lieu}` : ""}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => setChoix((s) => ({ ...s, [key]: "CONFIRME" }))}
                        style={{
                          flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                          border: `1.5px solid ${val === "CONFIRME" ? "#2e7d32" : "#E0E0E0"}`,
                          background: val === "CONFIRME" ? "#e8f5e9" : "white", color: val === "CONFIRME" ? "#2e7d32" : "#6A6A6A",
                        }}
                      >
                        ✅ J&apos;accepte
                      </button>
                      <button
                        onClick={() => setChoix((s) => ({ ...s, [key]: "DECLINE" }))}
                        style={{
                          flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                          border: `1.5px solid ${val === "DECLINE" ? "#c62828" : "#E0E0E0"}`,
                          background: val === "DECLINE" ? "#ffebee" : "white", color: val === "DECLINE" ? "#c62828" : "#6A6A6A",
                        }}
                      >
                        ❌ Je décline
                      </button>
                    </div>
                  </div>
                );
              })}
              {creneaux.length === 0 && (
                <div style={{ textAlign: "center", color: "#9A9A9A", fontSize: 13, padding: 20 }}>Aucun créneau ne vous a été affecté pour l&apos;instant.</div>
              )}
            </div>
            {error && <div style={{ fontSize: 13, color: "#c62828", marginBottom: 14 }}>{error}</div>}
            {creneaux.length > 0 && (
              <button
                onClick={envoyer}
                disabled={busy}
                style={{ width: "100%", background: busy ? "#999" : "#C8102E", color: "white", border: "none", borderRadius: 100, padding: "13px 0", fontSize: 14, fontWeight: 800, cursor: busy ? "not-allowed" : "pointer", fontFamily: "inherit" }}
              >
                {busy ? "Envoi…" : "Envoyer mes réponses"}
              </button>
            )}
          </>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0F0F0F", marginBottom: 6 }}>Merci, votre réponse est enregistrée</div>
            <div style={{ fontSize: 13, color: "#6A6A6A" }}>Un récapitulatif vous a été envoyé par email.</div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 22 }}>
          <Link href="/" style={{ fontSize: 12, color: "#9A9A9A", textDecoration: "none" }}>← Masterclass Médical</Link>
        </div>
      </div>
    </div>
  );
}
