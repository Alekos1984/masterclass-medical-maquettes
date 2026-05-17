"use client";

import { useState } from "react";
import Link from "next/link";

type ParticipantRow = {
  inscriptionId: string;
  name: string;
  initials: string;
  specialite: string | null;
  ville: string | null;
  bg: string;
  presentMatin: boolean;
  presentApresMidi: boolean;
  signatureMatinTime: string | null;
  signatureApresMidiTime: string | null;
  emargementToken: string | null;
};

interface Props {
  formationId: string;
  formationTitre: string;
  formationDate: string;
  lieuDisplay: string;
  heureDebut: string;
  heureFin: string;
  placesTotal: number;
  participants: ParticipantRow[];
}

export default function EmargementClient({
  formationId,
  formationTitre,
  formationDate,
  lieuDisplay,
  heureDebut,
  heureFin,
  placesTotal,
  participants,
}: Props) {
  const [activeTab, setActiveTab] = useState<"matin" | "aprem">("matin");
  const [manualPresent, setManualPresent] = useState<
    Record<string, { time: string }>
  >({});
  const [showCloture, setShowCloture] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);
  const [reminderError, setReminderError] = useState<string | null>(null);
  const [reminderLoading, setReminderLoading] = useState(false);

  const presentIds = new Set([
    ...participants
      .filter((p) =>
        activeTab === "matin" ? p.presentMatin : p.presentApresMidi
      )
      .map((p) => p.inscriptionId),
    ...Object.keys(manualPresent),
  ]);

  const totalPresent = presentIds.size;
  const totalWaiting = placesTotal - totalPresent;

  function markPresent(inscriptionId: string) {
    if (manualPresent[inscriptionId]) return;
    const now = new Date();
    const time = `Manuel · ${now.getHours().toString().padStart(2, "0")}h${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    setManualPresent((prev) => ({ ...prev, [inscriptionId]: { time } }));
  }

  async function sendReminder() {
    setReminderLoading(true);
    setReminderError(null);
    try {
      const res = await fetch(`/api/formateur/formations/${formationId}/send-emargement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl: window.location.origin }),
      });
      const data = await res.json() as { sent?: number; total?: number; errors?: string[]; error?: string };
      if (!res.ok) {
        setReminderError(data.error ?? "Erreur lors de l'envoi");
      } else if ((data.errors?.length ?? 0) > 0) {
        setReminderError(`Envoyé ${data.sent}/${data.total} · Échec : ${data.errors?.join(", ")}`);
        setReminderSent(true);
      } else {
        setReminderSent(true);
        setTimeout(() => setReminderSent(false), 5000);
      }
    } catch {
      setReminderError("Erreur réseau");
    } finally {
      setReminderLoading(false);
    }
  }

  function confirmCloture() {
    setShowCloture(false);
    setTimeout(() => setShowSuccess(true), 500);
  }

  const presentParticipants = participants.filter((p) => presentIds.has(p.inscriptionId));
  const waitingParticipants = participants.filter(
    (p) => !presentIds.has(p.inscriptionId)
  );

  const rate = placesTotal > 0 ? Math.round((totalPresent / placesTotal) * 100) : 0;

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/formateur/formations"
            style={{
              fontSize: 13,
              color: "var(--gray)",
              textDecoration: "none",
            }}
          >
            ← {formationTitre}
          </Link>
          <div style={{ width: 1, height: 18, background: "#E0E0E0" }} />
          <div className="topbar-title">
            Émargement · {formationDate}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <button
              onClick={sendReminder}
              disabled={reminderLoading}
              style={{
                background: reminderSent ? "#e8f5e9" : reminderError ? "#fff3e0" : "white",
                color: reminderSent ? "#2e7d32" : reminderError ? "#e65100" : "var(--gray)",
                border: `1.5px solid ${reminderSent ? "#c8e6c9" : reminderError ? "#ffcc80" : "#E0E0E0"}`,
                borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700,
                cursor: reminderLoading ? "wait" : "pointer", fontFamily: "inherit",
                display: "inline-flex", alignItems: "center", gap: 6,
                opacity: reminderLoading ? 0.7 : 1,
              }}
            >
              {reminderLoading ? "Envoi…" : reminderSent ? "✓ Liens envoyés" : "📧 Envoyer les liens"}
            </button>
            {reminderError && (
              <span style={{ fontSize: 11, color: "#e65100", maxWidth: 260, textAlign: "right" }}>{reminderError}</span>
            )}
          </div>
          <button
            onClick={() => setShowCloture(true)}
            style={{
              background: "#2e7d32",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            🔒 Clôturer la session
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">
        {/* SESSION HEADER */}
        <div
          style={{
            background: "linear-gradient(135deg,#0a2010,#0a1808)",
            borderRadius: 16,
            padding: "22px 28px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 160,
              height: 160,
              background:
                "radial-gradient(circle,rgba(46,204,113,0.18) 0%,transparent 65%)",
            }}
          />
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#4caf50",
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#4caf50",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Session ouverte · En direct
              </span>
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "white",
                letterSpacing: -0.3,
                marginBottom: 4,
              }}
            >
              {formationTitre}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
              {formationDate}
              {lieuDisplay ? ` · ${lieuDisplay}` : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: -1,
                }}
              >
                {totalPresent}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                Présents
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: -1,
                }}
              >
                {totalWaiting}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                En attente
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: -1,
                }}
              >
                {placesTotal}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                Total
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
          {/* MAIN */}
          <div>
            {/* DEMI-JOURNÉES */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {(["matin", "aprem"] as const).map((tab) => (
                <div
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 10,
                    border: `1.5px solid ${activeTab === tab ? "var(--red)" : "#E0E0E0"}`,
                    background: activeTab === tab ? "#fff5f6" : "white",
                    textAlign: "center",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color:
                        activeTab === tab ? "var(--red)" : "var(--black)",
                    }}
                  >
                    {tab === "matin" ? "Matin" : "Après-midi"}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--gray)",
                      marginTop: 2,
                    }}
                  >
                    {tab === "matin"
                      ? `${heureDebut} · ${totalPresent}/${placesTotal} présents`
                      : `${heureFin} · Non ouvert`}
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">Présences en temps réel</span>
                <span style={{ fontSize: 12, color: "var(--gray)" }}>
                  Mise à jour automatique
                </span>
              </div>

              {/* PRÉSENTS */}
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  color: "#2e7d32",
                  marginBottom: 8,
                }}
              >
                Présents ({totalPresent})
              </div>

              {presentParticipants.length === 0 && (
                <div
                  style={{
                    padding: "16px 0",
                    textAlign: "center",
                    fontSize: 12,
                    color: "var(--gray)",
                  }}
                >
                  Aucun émargement enregistré pour le moment.
                </div>
              )}

              {presentParticipants.map((p) => {
                const timeStr =
                  manualPresent[p.inscriptionId]?.time ??
                  (activeTab === "matin"
                    ? p.signatureMatinTime
                    : p.signatureApresMidiTime) ??
                  "—";
                return (
                  <div
                    key={p.inscriptionId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: 10,
                      marginBottom: 6,
                      border: "1.5px solid #c8e6c9",
                      background: "#f1f8e9",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "white",
                        flexShrink: 0,
                        background: p.bg,
                      }}
                    >
                      {p.initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>
                        {p.name}
                      </div>
                      {(p.specialite || p.ville) && (
                        <div style={{ fontSize: 11, color: "var(--gray)" }}>
                          {[p.specialite, p.ville].filter(Boolean).join(" · ")}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#2e7d32",
                        fontWeight: 600,
                      }}
                    >
                      Émargé à {timeStr}
                    </div>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        background: "#e8f5e9",
                        color: "#2e7d32",
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </div>
                  </div>
                );
              })}

              {/* EN ATTENTE */}
              {waitingParticipants.length > 0 && (
                <>
                  <div style={{ height: 12 }} />
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                      color: "var(--gray)",
                      marginBottom: 8,
                    }}
                  >
                    En attente de réponse ({waitingParticipants.length})
                  </div>
                  {waitingParticipants.map((p) => (
                    <div
                      key={p.inscriptionId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 12px",
                        borderRadius: 10,
                        marginBottom: 6,
                        border: "1.5px solid #f5f5f5",
                        background: "#fafafa",
                        opacity: 0.7,
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "white",
                          flexShrink: 0,
                          background: "#bdbdbd",
                        }}
                      >
                        {p.initials}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>
                          {p.name}
                        </div>
                        {(p.specialite || p.ville) && (
                          <div style={{ fontSize: 11, color: "var(--gray)" }}>
                            {[p.specialite, p.ville].filter(Boolean).join(" · ")}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: 11, color: "var(--gray)" }}>
                        Lien envoyé
                      </span>
                      <button
                        onClick={() => markPresent(p.inscriptionId)}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "4px 10px",
                          border: "1.5px solid #E0E0E0",
                          borderRadius: 6,
                          background: "white",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          color: "var(--gray)",
                        }}
                      >
                        Marquer présent
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <div style={{ position: "sticky", top: 80 }}>
            <div className="card" style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                Taux de présence
              </div>
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: `conic-gradient(var(--red) 0% ${rate}%, #EBEBEB ${rate}% 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      lineHeight: 1,
                    }}
                  >
                    {rate}%
                  </div>
                  <div style={{ fontSize: 9, color: "var(--gray)" }}>
                    présents
                  </div>
                </div>
              </div>
              {[
                { key: "Présents", val: totalPresent, color: "#2e7d32" },
                { key: "En attente", val: totalWaiting, color: undefined },
                { key: "Total inscrits", val: placesTotal, color: undefined },
              ].map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "7px 0",
                    borderBottom: i < 2 ? "1px solid #EBEBEB" : "none",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "var(--gray)" }}>{r.key}</span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: r.color || "var(--black)",
                    }}
                  >
                    {r.val}
                  </span>
                </div>
              ))}
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                Lien d&apos;émargement
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--gray)",
                  marginBottom: 10,
                }}
              >
                Partagez ce lien aux participants qui n&apos;ont pas reçu
                l&apos;email :
              </div>
              <div
                style={{
                  background: "var(--off-white)",
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 11,
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                  marginBottom: 8,
                }}
              >
                masterclassmedicale.com/emarger/[token]
              </div>
              <button
                onClick={() => alert("Lien copié dans le presse-papiers")}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  fontSize: 12,
                  background: "white",
                  color: "var(--gray)",
                  border: "1.5px solid #E0E0E0",
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                📋 Copier le lien
              </button>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                Notes admin
              </div>
              <textarea
                style={{
                  width: "100%",
                  border: "1.5px solid #E0E0E0",
                  borderRadius: 8,
                  padding: 10,
                  fontSize: 13,
                  fontFamily: "inherit",
                  resize: "none",
                  minHeight: 80,
                  outline: "none",
                }}
                placeholder="Notes sur le déroulement de la journée…"
              />
            </div>

            <div
              style={{
                background: "#f1f8e9",
                border: "1.5px solid #c8e6c9",
                borderRadius: 12,
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#2e7d32",
                  marginBottom: 8,
                }}
              >
                À la clôture
              </div>
              <div
                style={{ fontSize: 12, color: "#388e3c", lineHeight: 1.7 }}
              >
                ✓ Feuille de présence certifiée générée
                <br />
                ✓ PV de formation créé
                <br />
                ✓ Attestations envoyées J+1
                <br />✓ Questionnaire de satisfaction J+1
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CLOTURE */}
      {showCloture && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 36,
              maxWidth: 440,
              width: "90%",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 14 }}>📋</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
              Clôturer l&apos;émargement ?
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--gray)",
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              {totalPresent} présences confirmées sur {placesTotal} participants.
              <br />
              {totalWaiting > 0
                ? `${totalWaiting} participant${totalWaiting > 1 ? "s" : ""} ser${totalWaiting > 1 ? "ont" : "a"} marqué${totalWaiting > 1 ? "s" : ""} absent${totalWaiting > 1 ? "s" : ""}.`
                : "Tous les participants ont émargé."}
              <br />
              <br />
              Une fois clôturée, la feuille de présence certifiée et le PV de
              formation seront générés automatiquement.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowCloture(false)}
                style={{
                  flex: 1,
                  border: "1.5px solid #E0E0E0",
                  background: "white",
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Annuler
              </button>
              <button
                onClick={confirmCloture}
                style={{
                  flex: 1,
                  background: "#2e7d32",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                ✓ Confirmer la clôture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUCCESS */}
      {showSuccess && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 36,
              maxWidth: 440,
              width: "90%",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 14 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
              Session clôturée !
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--gray)",
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              Feuille de présence certifiée générée · PV de formation créé
              <br />
              Les attestations seront envoyées automatiquement demain matin.
            </div>
            <Link
              href="/formateur/formations"
              style={{
                background: "var(--black)",
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: "12px 28px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Retour à la formation →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
