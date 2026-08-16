"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = {
  cursus: {
    id: string; titre: string; annee: string | null; specialite: string; description: string;
    coordinateurNom: string; inscriptionMode: string; prixHT: number | null;
    lieuNom: string | null; lieuVille: string | null;
    prerequis: string | null; publicVise: string | null;
    enseignants: string[];
    journees: {
      date: string; heureDebut: string; heureFin: string; modalite: string;
      slots: { heureDebut: string; heureFin: string; titre: string; type: string; enseignantNom: string | null }[];
    }[];
  };
};

type Piece = { nom: string; base64: string; taille: number | null };

export default function DuPublicClient({ cursus }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [candidatureOpen, setCandidatureOpen] = useState(false);
  const [candBusy, setCandBusy] = useState(false);
  const [candError, setCandError] = useState("");
  const [candSent, setCandSent] = useState(false);
  const [candForm, setCandForm] = useState({ prenom: "", nom: "", email: "", phone: "" });
  const [cv, setCv] = useState<Piece | null>(null);
  const [lettre, setLettre] = useState<Piece | null>(null);

  function readFile(f: File, set: (p: Piece) => void) {
    if (f.size > 10 * 1024 * 1024) { setCandError("Fichier trop volumineux (max 10 Mo)"); return; }
    const r = new FileReader();
    r.onload = () => set({ nom: f.name, base64: r.result as string, taille: f.size });
    r.readAsDataURL(f);
  }

  async function envoyerCandidature() {
    if (!candForm.prenom.trim() || !candForm.nom.trim() || !candForm.email.trim()) {
      setCandError("Prénom, nom et email sont obligatoires");
      return;
    }
    setCandBusy(true);
    setCandError("");
    try {
      const res = await fetch(`/api/cursus/${cursus.id}/candidature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...candForm, cv, lettre }),
      });
      const d = await res.json();
      if (!res.ok) { setCandError(d.error ?? "Erreur"); return; }
      setCandSent(true);
    } catch {
      setCandError("Erreur réseau");
    } finally {
      setCandBusy(false);
    }
  }

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

        {/* Prérequis & public visé */}
        {(cursus.prerequis || cursus.publicVise) && (
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #E0E0E0", padding: "24px 28px", marginBottom: 20, display: "grid", gridTemplateColumns: cursus.prerequis && cursus.publicVise ? "1fr 1fr" : "1fr", gap: 20 }}>
            {cursus.publicVise && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6A6A6A", marginBottom: 8 }}>🎯 Public visé</div>
                <div style={{ fontSize: 13, color: "#444", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{cursus.publicVise}</div>
              </div>
            )}
            {cursus.prerequis && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6A6A6A", marginBottom: 8 }}>✅ Prérequis</div>
                <div style={{ fontSize: 13, color: "#444", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{cursus.prerequis}</div>
              </div>
            )}
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

        {/* Candidature (CV + lettre de motivation) */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #E0E0E0", padding: "24px 28px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F0F0F" }}>Enseignement sélectif ?</div>
            <div style={{ fontSize: 12, color: "#6A6A6A" }}>Déposez votre candidature avec CV et lettre de motivation.</div>
          </div>
          <button
            onClick={() => { setCandidatureOpen(true); setCandSent(false); setCandError(""); }}
            style={{ background: "white", color: "#C8102E", border: "1.5px solid #C8102E", borderRadius: 100, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            📎 Déposer sa candidature
          </button>
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

      {candidatureOpen && (
        <div
          onClick={() => setCandidatureOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 16, padding: "26px 30px", width: 480, maxWidth: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Déposer sa candidature</div>
              <button onClick={() => setCandidatureOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#6A6A6A" }}>✕</button>
            </div>
            {candSent ? (
              <div style={{ padding: "24px 0", textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>✅</div>
                <div style={{ fontSize: 14, color: "#0F0F0F", fontWeight: 600, marginBottom: 4 }}>Candidature envoyée</div>
                <div style={{ fontSize: 13, color: "#6A6A6A" }}>Le coordinateur du DU examinera votre dossier et reviendra vers vous.</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 16, lineHeight: 1.5 }}>
                  Renseignez vos coordonnées et joignez votre CV et/ou votre lettre de motivation.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <input type="text" placeholder="Prénom *" value={candForm.prenom} onChange={(e) => setCandForm((s) => ({ ...s, prenom: e.target.value }))} style={inputStyleModal} />
                  <input type="text" placeholder="Nom *" value={candForm.nom} onChange={(e) => setCandForm((s) => ({ ...s, nom: e.target.value }))} style={inputStyleModal} />
                </div>
                <input type="email" placeholder="Email *" value={candForm.email} onChange={(e) => setCandForm((s) => ({ ...s, email: e.target.value }))} style={{ ...inputStyleModal, width: "100%", boxSizing: "border-box", marginBottom: 10 }} />
                <input type="tel" placeholder="Téléphone" value={candForm.phone} onChange={(e) => setCandForm((s) => ({ ...s, phone: e.target.value }))} style={{ ...inputStyleModal, width: "100%", boxSizing: "border-box", marginBottom: 16 }} />

                {([
                  { key: "cv" as const, label: "CV", value: cv, set: setCv as (p: Piece | null) => void },
                  { key: "lettre" as const, label: "Lettre de motivation", value: lettre, set: setLettre as (p: Piece | null) => void },
                ]).map((f) => (
                  <div key={f.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F0F0F0" }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{f.label}</div>
                    {f.value ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: "#6A6A6A" }}>{f.value.nom}</span>
                        <button onClick={() => f.set(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#9A9A9A" }}>🗑</button>
                      </div>
                    ) : (
                      <label style={{ fontSize: 12, color: "#C8102E", fontWeight: 600, cursor: "pointer" }}>
                        + Ajouter
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,image/*"
                          style={{ display: "none" }}
                          onChange={(e) => { const file = e.target.files?.[0]; if (file) readFile(file, f.set); }}
                        />
                      </label>
                    )}
                  </div>
                ))}

                {candError && <div style={{ fontSize: 13, color: "#c62828", marginTop: 12 }}>{candError}</div>}

                <button
                  onClick={envoyerCandidature}
                  disabled={candBusy}
                  style={{ width: "100%", marginTop: 18, background: candBusy ? "#999" : "#C8102E", color: "white", border: "none", borderRadius: 100, padding: "13px 0", fontSize: 14, fontWeight: 800, cursor: candBusy ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                >
                  {candBusy ? "Envoi…" : "Envoyer ma candidature"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyleModal: React.CSSProperties = {
  border: "1.5px solid #E0E0E0", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontFamily: "inherit", color: "#0F0F0F", background: "white", outline: "none",
};
