"use client";

import { useState } from "react";
import Link from "next/link";

const presentParticipants = [
  { initials: "SB", name: "Dr. Sophie Bernard", spec: "Cardiologue · Paris", time: "08h34", bg: "linear-gradient(135deg,#2e7d32,#66bb6a)" },
  { initials: "ML", name: "Dr. Marc Lefebvre", spec: "Cardiologue · Lille", time: "08h37", bg: "linear-gradient(135deg,#1565c0,#42a5f5)" },
  { initials: "AC", name: "Dr. Anne Chartier", spec: "Rythmologue · Marseille", time: "08h41", bg: "linear-gradient(135deg,#6a1b9a,#ab47bc)" },
  { initials: "TM", name: "Dr. Thomas Moreau", spec: "Médecine interne · Bordeaux", time: "08h43", bg: "linear-gradient(135deg,#e65100,#ff9800)" },
  { initials: "IP", name: "Dr. Isabelle Petit", spec: "Cardiologue · Lyon", time: "08h47", bg: "linear-gradient(135deg,#c62828,#ef5350)" },
  { initials: "PM", name: "Dr. Pierre Martin", spec: "Cardiologue · Nantes", time: "08h51", bg: "linear-gradient(135deg,#2e7d32,#4caf50)" },
  { initials: "CD", name: "Dr. Claire Dupont", spec: "Cardiologue · Strasbourg", time: "09h02", bg: "linear-gradient(135deg,#00695c,#26a69a)" },
  { initials: "NR", name: "Dr. Nicolas Roy", spec: "Médecin · Toulouse", time: "09h05", bg: "linear-gradient(135deg,#4527a0,#7e57c2)" },
  { initials: "EB", name: "Dr. Émilie Blanc", spec: "Cardiologue · Rennes", time: "09h11", bg: "linear-gradient(135deg,#ad1457,#f06292)" },
];

const waitingParticipants = [
  { initials: "JN", name: "Dr. Julien Noir", spec: "Cardiologue · Montpellier" },
  { initials: "SC", name: "Dr. Sarah Cohen", spec: "Cardiologue · Nice" },
  { initials: "AL", name: "Dr. Antoine Lebrun", spec: "Médecin · Grenoble" },
];

export default function FormateurEmargementPage() {
  const [waiting, setWaiting] = useState(waitingParticipants);
  const [manualPresent, setManualPresent] = useState<{ initials: string; name: string; spec: string; time: string }[]>([]);
  const [activeTab, setActiveTab] = useState<"matin" | "aprem">("matin");
  const [showCloture, setShowCloture] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);

  const totalPresent = presentParticipants.length + manualPresent.length;
  const totalWaiting = waiting.length;

  function markPresent(initials: string) {
    const participant = waiting.find((p) => p.initials === initials);
    if (!participant) return;
    const now = new Date();
    const time = `Manuel · ${now.getHours().toString().padStart(2, "0")}h${now.getMinutes().toString().padStart(2, "0")}`;
    setManualPresent((prev) => [...prev, { ...participant, time }]);
    setWaiting((prev) => prev.filter((p) => p.initials !== initials));
  }

  function sendReminder() {
    setReminderSent(true);
    setTimeout(() => setReminderSent(false), 3000);
  }

  function confirmCloture() {
    setShowCloture(false);
    setTimeout(() => setShowSuccess(true), 500);
  }

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/formateur/formations" style={{ fontSize: 13, color: "var(--gray)", textDecoration: "none" }}>
            ← Cardiologie inter. — Lyon
          </Link>
          <div style={{ width: 1, height: 18, background: "#E0E0E0" }} />
          <div className="topbar-title">Émargement · 15 novembre 2026</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={sendReminder}
            style={{
              background: reminderSent ? "#e8f5e9" : "white",
              color: reminderSent ? "#2e7d32" : "var(--gray)",
              border: `1.5px solid ${reminderSent ? "#c8e6c9" : "#E0E0E0"}`,
              borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            {reminderSent ? "✓ Envoyé" : "📧 Renvoyer les liens"}
          </button>
          <button
            onClick={() => setShowCloture(true)}
            style={{
              background: "#2e7d32", color: "white", border: "none",
              borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            🔒 Clôturer la session
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">

        {/* SESSION HEADER */}
        <div style={{
          background: "linear-gradient(135deg,#0a2010,#0a1808)", borderRadius: 16,
          padding: "22px 28px", marginBottom: 20, display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -30, right: -30, width: 160, height: 160,
            background: "radial-gradient(circle,rgba(46,204,113,0.18) 0%,transparent 65%)",
          }} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", background: "#4caf50",
                animation: "pulse 2s infinite",
              }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#4caf50", letterSpacing: 1, textTransform: "uppercase" }}>
                Session ouverte · En direct
              </span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "white", letterSpacing: -0.3, marginBottom: 4 }}>
              Cardiologie interventionnelle — Techniques avancées 2026
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
              15 novembre 2026 · Ouverte à 08h31 · Marriott Lyon, Salle Rhône
            </div>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "white", letterSpacing: -1 }}>{totalPresent}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Présents</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: -1 }}>{totalWaiting}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>En attente</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: -1 }}>12</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Total</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>

          {/* MAIN */}
          <div>
            {/* DEMI JOURNÉES */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {(["matin", "aprem"] as const).map((tab) => (
                <div
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1, padding: 10, borderRadius: 10,
                    border: `1.5px solid ${activeTab === tab ? "var(--red)" : "#E0E0E0"}`,
                    background: activeTab === tab ? "#fff5f6" : "white",
                    textAlign: "center", cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: activeTab === tab ? "var(--red)" : "var(--black)" }}>
                    {tab === "matin" ? "Matin" : "Après-midi"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 2 }}>
                    {tab === "matin" ? `08h30 – 12h30 · ${totalPresent}/12 présents` : "13h30 – 17h30 · Non ouvert"}
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">Présences en temps réel</span>
                <span style={{ fontSize: 12, color: "var(--gray)" }}>Mise à jour automatique</span>
              </div>

              {/* PRÉSENTS */}
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "#2e7d32", marginBottom: 8 }}>
                Présents ({totalPresent})
              </div>

              {presentParticipants.map((p) => (
                <div key={p.initials} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                  borderRadius: 10, marginBottom: 6, border: "1.5px solid #c8e6c9", background: "#f1f8e9",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700,
                    color: "white", flexShrink: 0, background: p.bg,
                  }}>{p.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--gray)" }}>{p.spec}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#2e7d32", fontWeight: 600 }}>Émargé à {p.time}</div>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: 14,
                    background: "#e8f5e9", color: "#2e7d32", flexShrink: 0,
                  }}>✓</div>
                </div>
              ))}

              {manualPresent.map((p) => (
                <div key={p.initials} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                  borderRadius: 10, marginBottom: 6, border: "1.5px solid #c8e6c9", background: "#f1f8e9",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700,
                    color: "white", flexShrink: 0, background: "linear-gradient(135deg,#2e7d32,#66bb6a)",
                  }}>{p.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--gray)" }}>{p.spec}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#2e7d32", fontWeight: 600 }}>{p.time}</div>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: 14,
                    background: "#e8f5e9", color: "#2e7d32", flexShrink: 0,
                  }}>✓</div>
                </div>
              ))}

              {waiting.length > 0 && (
                <>
                  <div style={{ height: 12 }} />
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--gray)", marginBottom: 8 }}>
                    En attente de réponse ({waiting.length})
                  </div>
                  {waiting.map((p) => (
                    <div key={p.initials} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                      borderRadius: 10, marginBottom: 6, border: "1.5px solid #f5f5f5",
                      background: "#fafafa", opacity: 0.7,
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%", display: "flex",
                        alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700,
                        color: "white", flexShrink: 0, background: "#bdbdbd",
                      }}>{p.initials}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "var(--gray)" }}>{p.spec}</div>
                      </div>
                      <span style={{ fontSize: 11, color: "var(--gray)" }}>Lien envoyé à 08h31</span>
                      <button
                        onClick={() => markPresent(p.initials)}
                        style={{
                          fontSize: 11, fontWeight: 600, padding: "4px 10px",
                          border: "1.5px solid #E0E0E0", borderRadius: 6, background: "white",
                          cursor: "pointer", fontFamily: "inherit", color: "var(--gray)",
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
              <div style={{ fontSize: 13, fontWeight: 700, textAlign: "center", marginBottom: 16 }}>Taux de présence</div>
              <div style={{
                width: 100, height: 100, borderRadius: "50%",
                background: `conic-gradient(var(--red) 0% ${Math.round(totalPresent / 12 * 100)}%, #EBEBEB ${Math.round(totalPresent / 12 * 100)}% 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%", background: "white",
                  display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{Math.round(totalPresent / 12 * 100)}%</div>
                  <div style={{ fontSize: 9, color: "var(--gray)" }}>présents</div>
                </div>
              </div>
              {[
                { key: "Présents", val: totalPresent, color: "#2e7d32" },
                { key: "En attente", val: totalWaiting, color: undefined },
                { key: "Session ouverte", val: "08h31", color: undefined },
                { key: "Dernière présence", val: "09h11", color: undefined },
              ].map((r, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", padding: "7px 0",
                  borderBottom: i < 3 ? "1px solid #EBEBEB" : "none", fontSize: 12,
                }}>
                  <span style={{ color: "var(--gray)" }}>{r.key}</span>
                  <span style={{ fontWeight: 600, color: r.color || "var(--black)" }}>{r.val}</span>
                </div>
              ))}
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Lien d&apos;émargement</div>
              <div style={{ fontSize: 12, color: "var(--gray)", marginBottom: 10 }}>
                Partagez ce lien aux participants qui n&apos;ont pas reçu l&apos;email :
              </div>
              <div style={{
                background: "var(--off-white)", borderRadius: 8, padding: "10px 12px",
                fontSize: 11, fontFamily: "monospace", wordBreak: "break-all", marginBottom: 8,
              }}>
                masterclassmedical.fr/emarger/[token-unique]
              </div>
              <button
                onClick={() => alert("Lien copié dans le presse-papiers")}
                style={{
                  width: "100%", justifyContent: "center", fontSize: 12, background: "white",
                  color: "var(--gray)", border: "1.5px solid #E0E0E0", borderRadius: 8,
                  padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                📋 Copier le lien
              </button>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Notes admin</div>
              <textarea
                style={{
                  width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 8,
                  padding: 10, fontSize: 13, fontFamily: "inherit", resize: "none",
                  minHeight: 80, outline: "none",
                }}
                placeholder="Notes sur le déroulement de la journée…"
              />
            </div>

            <div style={{
              background: "#f1f8e9", border: "1.5px solid #c8e6c9", borderRadius: 12, padding: "14px 16px",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#2e7d32", marginBottom: 8 }}>À la clôture</div>
              <div style={{ fontSize: 12, color: "#388e3c", lineHeight: 1.7 }}>
                ✓ Feuille de présence certifiée générée<br />
                ✓ PV de formation créé<br />
                ✓ Attestations envoyées J+1<br />
                ✓ Questionnaire de satisfaction J+1
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CLOTURE */}
      {showCloture && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ background: "white", borderRadius: 20, padding: 36, maxWidth: 440, width: "90%", textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>📋</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Clôturer l&apos;émargement ?</div>
            <div style={{ fontSize: 13, color: "var(--gray)", lineHeight: 1.6, marginBottom: 24 }}>
              {totalPresent} présences confirmées sur 12 participants.<br />
              {totalWaiting} participants seront marqués absents.<br /><br />
              Une fois clôturée, la feuille de présence certifiée et le PV de formation seront générés automatiquement.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowCloture(false)}
                style={{
                  flex: 1, border: "1.5px solid #E0E0E0", background: "white", borderRadius: 10,
                  padding: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Annuler
              </button>
              <button
                onClick={confirmCloture}
                style={{
                  flex: 1, background: "#2e7d32", color: "white", border: "none",
                  borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
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
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ background: "white", borderRadius: 20, padding: 36, maxWidth: 440, width: "90%", textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Session clôturée !</div>
            <div style={{ fontSize: 13, color: "var(--gray)", lineHeight: 1.6, marginBottom: 24 }}>
              Feuille de présence certifiée générée · PV de formation créé<br />
              Les attestations seront envoyées automatiquement demain matin.
            </div>
            <Link
              href="/formateur/formations"
              style={{
                background: "var(--black)", color: "white", border: "none", borderRadius: 10,
                padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit", textDecoration: "none", display: "inline-block",
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
