"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Participant = {
  id: string;
  name: string;
  email: string;
  specialite: string | null;
  statut: string;
  presentMatin: boolean;
  presentApresMidi: boolean;
  signatureMatin: string | null;
  signatureApresMidi: string | null;
  emargementToken: string | null;
};

type Formation = {
  id: string;
  titre: string;
  specialite: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  dureeHeures: number;
  lieuNom: string | null;
  lieuVille: string | null;
  statut: string;
  placesTotal: number;
  sessionStatus: string | null;
  sessionStartedAt: string | null;
  sessionEndedAt: string | null;
  sessionLog?: { type: string; time: string }[] | null;
  participants: Participant[];
};

type LogEntry = { type: string; time: string };
type SessionStatus = "IDLE" | "EN_COURS" | "EN_PAUSE" | "TERMINEE";

function useCurrentTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function formatTime(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export default function LiveFormationClient({ formation }: { formation: Formation }) {
  const now = useCurrentTime();
  const [activeSection, setActiveSection] = useState<"participants" | "emargement" | "diaporama" | "log">("participants");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Session state (DB-backed)
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>(
    (formation.sessionStatus as SessionStatus | null) ?? "IDLE"
  );
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(formation.sessionStartedAt);
  const [sessionLog, setSessionLog] = useState<LogEntry[]>(formation.sessionLog ?? []);
  const [sessionBusy, setSessionBusy] = useState(false);

  // Email sending state
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState<string | null>(null);
  const [satisfactionSending, setSatisfactionSending] = useState(false);
  const [satisfactionResult, setSatisfactionResult] = useState<string | null>(null);

  // Client-side baseUrl for QR code
  const [baseUrl, setBaseUrl] = useState<string>("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  async function callSessionApi(action: "start" | "pause" | "resume" | "stop" | "reopen" | "reset") {
    setSessionBusy(true);
    try {
      const res = await fetch(`/api/formateur/formations/${formation.id}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Erreur lors de la mise à jour de la session");
        return false;
      }
      const data = (await res.json()) as {
        sessionStatus: string | null;
        sessionStartedAt: string | null;
        sessionEndedAt: string | null;
        sessionLog: LogEntry[];
      };
      setSessionStatus((data.sessionStatus as SessionStatus) ?? "IDLE");
      setSessionStartedAt(data.sessionStartedAt);
      setSessionLog(data.sessionLog ?? []);
      return true;
    } catch {
      alert("Erreur réseau");
      return false;
    } finally {
      setSessionBusy(false);
    }
  }

  async function startSession() {
    // Warn if today's date doesn't match formation date
    const today = new Date().toISOString().slice(0, 10);
    const formationDay = formation.date.slice(0, 10);
    if (today !== formationDay) {
      const dateLabel = new Intl.DateTimeFormat("fr-FR", {
        day: "numeric", month: "long", year: "numeric",
      }).format(new Date(formation.date));
      if (!window.confirm(`La formation est prévue le ${dateLabel}. Êtes-vous sûr de vouloir lancer la session aujourd'hui ?`)) {
        return;
      }
    }
    await callSessionApi("start");
  }

  async function pauseSession() {
    await callSessionApi("pause");
  }

  async function resumeSession() {
    await callSessionApi("resume");
  }

  async function stopSession() {
    if (sessionStartedAt) {
      const elapsedMin = Math.floor((Date.now() - new Date(sessionStartedAt).getTime()) / 60000);
      const minRequired = formation.dureeHeures * 60 * 0.5;
      if (elapsedMin < minRequired) {
        if (!window.confirm(`La formation devait durer ${formation.dureeHeures}h mais seulement ${elapsedMin} min se sont écoulées. Confirmer la fin ?`)) {
          return;
        }
      }
    }
    await callSessionApi("stop");
  }

  async function resetSession() {
    if (!window.confirm("Remettre la session à zéro ?")) return;
    await callSessionApi("reset");
  }

  async function sendEmargementEmails() {
    setEmailSending(true);
    setEmailResult(null);
    try {
      const res = await fetch(`/api/formateur/formations/${formation.id}/send-emargement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl: window.location.origin }),
      });
      const data = await res.json() as { sent: number; errors: string[]; total: number };
      if (res.ok) {
        setEmailResult(`✅ ${data.sent} email${data.sent > 1 ? "s" : ""} envoyé${data.sent > 1 ? "s" : ""} sur ${data.total}${data.errors.length > 0 ? ` (${data.errors.length} erreur${data.errors.length > 1 ? "s" : ""})` : ""}`);
      } else {
        setEmailResult("❌ Erreur lors de l'envoi");
      }
    } catch {
      setEmailResult("❌ Erreur réseau");
    } finally {
      setEmailSending(false);
    }
  }

  async function sendSatisfactionEmails() {
    setSatisfactionSending(true);
    setSatisfactionResult(null);
    try {
      const res = await fetch(`/api/formateur/formations/${formation.id}/send-satisfaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl: window.location.origin }),
      });
      const data = await res.json() as { sent: number; errors: string[]; total: number };
      if (res.ok) {
        setSatisfactionResult(`✅ ${data.sent} questionnaire${data.sent > 1 ? "s" : ""} envoyé${data.sent > 1 ? "s" : ""} sur ${data.total}${data.errors.length > 0 ? ` (${data.errors.length} erreur${data.errors.length > 1 ? "s" : ""})` : ""}`);
      } else {
        setSatisfactionResult("❌ Erreur lors de l'envoi");
      }
    } catch {
      setSatisfactionResult("❌ Erreur réseau");
    } finally {
      setSatisfactionSending(false);
    }
  }

  const dateFormatted = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(formation.date));

  const timeNow = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const presentMatin = formation.participants.filter((p) => p.presentMatin).length;
  const presentAM = formation.participants.filter((p) => p.presentApresMidi).length;
  const total = formation.participants.length;

  const emargementUrl = `/formateur/emargement/${formation.id}`;

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedFile(url);
  }

  const sectionBtn = (key: typeof activeSection, label: string) => (
    <button
      onClick={() => setActiveSection(key)}
      style={{
        flex: 1, padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
        border: "none", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
        background: activeSection === key ? "#C8102E" : "rgba(255,255,255,0.07)",
        color: activeSection === key ? "white" : "rgba(255,255,255,0.6)",
      }}
    >
      {label}
    </button>
  );

  const logTypeLabel: Record<string, string> = {
    start: "▶ Démarrage",
    pause: "⏸ Pause",
    resume: "▶ Reprise",
    stop: "⏹ Arrêt",
    reset: "↺ Remise à zéro",
    reopen: "↩ Réouverture",
  };

  const logTypeColor: Record<string, string> = {
    start: "#22c55e",
    pause: "#f97316",
    resume: "#22c55e",
    stop: "#ef4444",
    reset: "#a78bfa",
    reopen: "#60a5fa",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "white", fontFamily: "inherit" }}>

      {/* TOPBAR */}
      <div style={{
        background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(8px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link
            href={`/formateur/formations/${formation.id}`}
            style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}
          >
            ← Détail
          </Link>
          <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.12)" }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{formation.titre}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Live indicator */}
          {(() => {
            const ind =
              sessionStatus === "EN_COURS"
                ? { label: "Session active", color: "#22c55e", pulse: true }
                : sessionStatus === "EN_PAUSE"
                ? { label: "En pause", color: "#f97316", pulse: false }
                : sessionStatus === "TERMINEE"
                ? { label: "Terminée", color: "rgba(255,255,255,0.4)", pulse: false }
                : { label: "Non démarrée", color: "rgba(255,255,255,0.4)", pulse: false };
            return (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", background: ind.color,
                  boxShadow: ind.pulse ? `0 0 0 3px ${ind.color}40` : "none",
                  animation: ind.pulse ? "pulse 2s infinite" : "none",
                }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: ind.color, letterSpacing: 1, textTransform: "uppercase" }}>
                  {ind.label}
                </span>
                {/* Reset button for EN_PAUSE or TERMINEE */}
                {(sessionStatus === "EN_PAUSE" || sessionStatus === "TERMINEE") && (
                  <button
                    onClick={resetSession}
                    disabled={sessionBusy}
                    title="Remettre la session à zéro"
                    style={{
                      background: "none", border: "none", cursor: sessionBusy ? "not-allowed" : "pointer",
                      fontSize: 14, padding: "2px 4px", opacity: sessionBusy ? 0.4 : 0.7,
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    ⚙️
                  </button>
                )}
              </div>
            );
          })()}
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>
            {timeNow}
          </div>
          <Link
            href={emargementUrl}
            target="_blank"
            style={{
              background: "#C8102E", color: "white", borderRadius: 8, padding: "7px 14px",
              fontSize: 12, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5,
            }}
          >
            ✍️ Gérer l&apos;émargement
          </Link>

          {/* Session control buttons */}
          {sessionStatus === "IDLE" && (
            <button
              onClick={startSession}
              disabled={sessionBusy}
              style={{
                background: "#22c55e", color: "white", border: "none", borderRadius: 8, padding: "7px 14px",
                fontSize: 12, fontWeight: 700, cursor: sessionBusy ? "not-allowed" : "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 5,
                opacity: sessionBusy ? 0.6 : 1,
              }}
            >
              ▶ Démarrer la session
            </button>
          )}
          {sessionStatus === "EN_COURS" && (
            <>
              <button
                onClick={pauseSession}
                disabled={sessionBusy}
                style={{
                  background: "#f97316", color: "white", border: "none", borderRadius: 8, padding: "7px 14px",
                  fontSize: 12, fontWeight: 700, cursor: sessionBusy ? "not-allowed" : "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 5,
                  opacity: sessionBusy ? 0.6 : 1,
                }}
              >
                ⏸ Pause
              </button>
              <button
                onClick={stopSession}
                disabled={sessionBusy}
                style={{
                  background: "#ef4444", color: "white", border: "none", borderRadius: 8, padding: "7px 14px",
                  fontSize: 12, fontWeight: 700, cursor: sessionBusy ? "not-allowed" : "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 5,
                  opacity: sessionBusy ? 0.6 : 1,
                }}
              >
                ⏹ Terminer
              </button>
            </>
          )}
          {sessionStatus === "EN_PAUSE" && (
            <>
              <button
                onClick={resumeSession}
                disabled={sessionBusy}
                style={{
                  background: "#22c55e", color: "white", border: "none", borderRadius: 8, padding: "7px 14px",
                  fontSize: 12, fontWeight: 700, cursor: sessionBusy ? "not-allowed" : "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 5,
                  opacity: sessionBusy ? 0.6 : 1,
                }}
              >
                ▶ Reprendre
              </button>
              <button
                onClick={stopSession}
                disabled={sessionBusy}
                style={{
                  background: "#ef4444", color: "white", border: "none", borderRadius: 8, padding: "7px 14px",
                  fontSize: 12, fontWeight: 700, cursor: sessionBusy ? "not-allowed" : "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 5,
                  opacity: sessionBusy ? 0.6 : 1,
                }}
              >
                ⏹ Terminer
              </button>
            </>
          )}
          {sessionStatus === "TERMINEE" && (
            <span style={{
              background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)",
              borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700,
            }}>
              Session terminée
            </span>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 28px" }}>

        {/* HERO STATS */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr auto",
          gap: 20, marginBottom: 24, alignItems: "start",
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C8102E", marginBottom: 6 }}>
              Formation en cours
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 8 }}>
              {formation.titre}
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                `📅 ${dateFormatted}`,
                `🕐 ${formation.heureDebut} – ${formation.heureFin}`,
                formation.lieuNom ? `📍 ${formation.lieuVille} · ${formation.lieuNom}` : formation.lieuVille ? `📍 ${formation.lieuVille}` : null,
              ].filter(Boolean).map((m, i) => (
                <span key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{m}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { val: String(total), sub: `Inscrits / ${formation.placesTotal}`, color: "white" },
              { val: String(presentMatin), sub: "Présents matin", color: "#22c55e" },
              { val: String(presentAM), sub: "Présents après-midi", color: "#22c55e" },
            ].map((s, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "14px 20px", textAlign: "center", minWidth: 100,
              }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: "-0.5px" }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3, lineHeight: 1.3 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION TABS */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 4, border: "1px solid rgba(255,255,255,0.08)" }}>
          {sectionBtn("participants", "👥 Participants")}
          {sectionBtn("emargement", "✍️ Émargement")}
          {sectionBtn("diaporama", "🖥 Diaporama")}
          {sectionBtn("log", "📋 Log")}
        </div>

        {/* PARTICIPANTS */}
        {activeSection === "participants" && (
          <div>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Liste des participants</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                  {presentMatin} / {total} présences enregistrées ce matin
                </div>
              </div>
              {formation.participants.length === 0 ? (
                <div style={{ padding: "48px 20px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>👥</div>
                  <div>Aucun participant inscrit</div>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                      {["Participant", "Spécialité", "Matin", "Après-midi", "Heure signature"].map((h) => (
                        <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {formation.participants.map((p, i) => (
                      <tr
                        key={p.id}
                        style={{ borderBottom: i < formation.participants.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                      >
                        <td style={{ padding: "12px 20px" }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{p.email}</div>
                        </td>
                        <td style={{ padding: "12px 20px", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                          {p.specialite ?? "—"}
                        </td>
                        <td style={{ padding: "12px 20px" }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100,
                            background: p.presentMatin ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                            color: p.presentMatin ? "#22c55e" : "rgba(255,255,255,0.3)",
                          }}>
                            {p.presentMatin ? "✓ Présent" : "Absent"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 20px" }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100,
                            background: p.presentApresMidi ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                            color: p.presentApresMidi ? "#22c55e" : "rgba(255,255,255,0.3)",
                          }}>
                            {p.presentApresMidi ? "✓ Présent" : "Absent"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 20px", fontSize: 12, color: "rgba(255,255,255,0.4)", fontVariantNumeric: "tabular-nums" }}>
                          {p.signatureMatin || p.signatureApresMidi
                            ? [p.signatureMatin && `M: ${formatTime(p.signatureMatin)}`, p.signatureApresMidi && `AM: ${formatTime(p.signatureApresMidi)}`].filter(Boolean).join("  ·  ")
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Satisfaction email button */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 24px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Questionnaire de satisfaction</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 16, lineHeight: 1.6 }}>
                Envoyez un questionnaire de satisfaction par email à tous les participants confirmés une fois la formation terminée.
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={sendSatisfactionEmails}
                  disabled={satisfactionSending}
                  style={{
                    background: satisfactionSending ? "rgba(255,255,255,0.1)" : "rgba(200,16,46,0.15)",
                    color: satisfactionSending ? "rgba(255,255,255,0.4)" : "#C8102E",
                    border: "1px solid rgba(200,16,46,0.3)",
                    borderRadius: 8, padding: "9px 16px",
                    fontSize: 13, fontWeight: 700, cursor: satisfactionSending ? "not-allowed" : "pointer", fontFamily: "inherit",
                    display: "inline-flex", alignItems: "center", gap: 6,
                  }}
                >
                  {satisfactionSending ? "Envoi en cours…" : "📧 Envoyer le questionnaire de satisfaction"}
                </button>
                {satisfactionResult && (
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{satisfactionResult}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* EMARGEMENT */}
        {activeSection === "emargement" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Lancer l'émargement */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "24px 24px" }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Émargement digital</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 20, lineHeight: 1.6 }}>
                Ouvrez la session d&apos;émargement. Chaque participant reçoit un lien sécurisé unique par email. Ils confirment leur présence en un clic.
              </div>
              <Link
                href={emargementUrl}
                target="_blank"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: "#C8102E", color: "white", borderRadius: 10,
                  padding: "14px 20px", textDecoration: "none", fontWeight: 700, fontSize: 14,
                  marginBottom: 12,
                }}
              >
                ✍️ Ouvrir le panneau émargement
              </Link>

              {/* Send email button */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                <button
                  onClick={sendEmargementEmails}
                  disabled={emailSending}
                  style={{
                    background: emailSending ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.08)",
                    color: emailSending ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.8)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10, padding: "12px 18px",
                    fontSize: 13, fontWeight: 700, cursor: emailSending ? "not-allowed" : "pointer", fontFamily: "inherit",
                    display: "inline-flex", alignItems: "center", gap: 6, width: "100%", justifyContent: "center",
                  }}
                >
                  {emailSending ? "Envoi en cours…" : "📧 Envoyer les liens d'émargement"}
                </button>
              </div>
              {emailResult && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: 8 }}>
                  {emailResult}
                </div>
              )}

              {/* QR code */}
              {baseUrl && (
                <div style={{ marginTop: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>
                    QR Code d&apos;émargement
                  </div>
                  <div style={{
                    display: "inline-block", background: "white", borderRadius: 12, padding: 12,
                  }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${baseUrl}/formateur/emargement/${formation.id}`)}`}
                      alt="QR code émargement"
                      width={180}
                      height={180}
                      style={{ display: "block", borderRadius: 4 }}
                    />
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>
                    Scannez pour accéder à l&apos;émargement
                  </div>
                </div>
              )}

              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 8 }}>
                S&apos;ouvre dans un nouvel onglet · Feuille de présence générée automatiquement à la clôture
              </div>
            </div>

            {/* Statut temps réel */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "24px 24px" }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Présences en temps réel</div>
              {/* Progress */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>
                  <span>Matin</span>
                  <span style={{ fontWeight: 700, color: presentMatin === total && total > 0 ? "#22c55e" : "white" }}>
                    {presentMatin} / {total}
                  </span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 100 }}>
                  <div style={{ height: "100%", background: "#22c55e", borderRadius: 100, width: total > 0 ? `${Math.round(presentMatin / total * 100)}%` : "0%", transition: "width 0.5s" }} />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>
                  <span>Après-midi</span>
                  <span style={{ fontWeight: 700, color: presentAM === total && total > 0 ? "#22c55e" : "white" }}>
                    {presentAM} / {total}
                  </span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 100 }}>
                  <div style={{ height: "100%", background: "#22c55e", borderRadius: 100, width: total > 0 ? `${Math.round(presentAM / total * 100)}%` : "0%", transition: "width 0.5s" }} />
                </div>
              </div>
              {formation.participants.slice(0, 4).map((p) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{p.name}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 100, background: p.presentMatin ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)", color: p.presentMatin ? "#22c55e" : "rgba(255,255,255,0.25)", fontWeight: 700 }}>M</span>
                    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 100, background: p.presentApresMidi ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)", color: p.presentApresMidi ? "#22c55e" : "rgba(255,255,255,0.25)", fontWeight: 700 }}>AM</span>
                  </div>
                </div>
              ))}
              {formation.participants.length > 4 && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 8, textAlign: "center" }}>
                  +{formation.participants.length - 4} autres — voir onglet Participants
                </div>
              )}
            </div>
          </div>
        )}

        {/* DIAPORAMA */}
        {activeSection === "diaporama" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
              {uploadedFile ? (
                <iframe
                  src={uploadedFile}
                  style={{ width: "100%", height: 540, border: "none" }}
                  title="Diaporama"
                />
              ) : (
                <div style={{ height: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                  <div style={{ fontSize: 48, opacity: 0.3 }}>🖥</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>Aucun diaporama chargé</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Importez un fichier PDF ou PowerPoint</div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.ppt,.pptx"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    📂 Importer un fichier
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Formats supportés</div>
                {["PDF (.pdf)", "PowerPoint (.pptx)", "OpenDocument (.odp)"].map((f) => (
                  <div key={f} style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {f}
                  </div>
                ))}
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 12, lineHeight: 1.5 }}>
                  Le fichier reste local et n&apos;est pas envoyé au serveur. Il s&apos;affiche directement dans votre navigateur.
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Conseils</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
                  Pour une présentation optimale, utilisez le mode plein écran de votre navigateur (F11). Vous pouvez également ouvrir votre diaporama en parallèle dans PowerPoint ou Keynote.
                </div>
              </div>
              {uploadedFile && (
                <button
                  onClick={() => setUploadedFile(null)}
                  style={{
                    background: "rgba(200,16,46,0.15)", color: "#C8102E", border: "1px solid rgba(200,16,46,0.3)",
                    borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  ✕ Retirer le fichier
                </button>
              )}
            </div>
          </div>
        )}

        {/* LOG */}
        {activeSection === "log" && (
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Journal de session</div>
            </div>
            {sessionLog.length === 0 ? (
              <div style={{ padding: "48px 20px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
                <div>Aucun événement enregistré</div>
                <div style={{ fontSize: 12, marginTop: 6, color: "rgba(255,255,255,0.25)" }}>Démarrez la session pour commencer à enregistrer les événements</div>
              </div>
            ) : (
              <div style={{ padding: "8px 0" }}>
                {sessionLog.map((entry, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "center", gap: 16,
                      padding: "10px 20px",
                      borderBottom: i < sessionLog.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    }}
                  >
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100,
                      background: `${(logTypeColor[entry.type] ?? "#888")}22`,
                      color: logTypeColor[entry.type] ?? "#888",
                      minWidth: 120, textAlign: "center",
                    }}>
                      {logTypeLabel[entry.type] ?? entry.type}
                    </span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>
                      {new Date(entry.time).toLocaleString("fr-FR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BOTTOM ACTIONS */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: 24, padding: "16px 20px",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
        }}>
          <div style={{ display: "flex", gap: 8 }}>
            <a
              href={`/api/pdf/feuille-presence/${formation.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5,
              }}
            >
              📄 Feuille de présence PDF
            </a>
            <a
              href={`/api/pdf/programme/${formation.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5,
              }}
            >
              📋 Programme officiel PDF
            </a>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
            Mise à jour automatique · {timeNow}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
