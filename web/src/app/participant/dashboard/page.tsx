"use client";

import { useState } from "react";
import Link from "next/link";

export default function ParticipantDashboardPage() {
  const [calAdded, setCalAdded] = useState(false);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px 60px" }}>

      {/* WELCOME */}
      <div style={{
        background: "linear-gradient(135deg,#080810,#0c1828)", borderRadius: 16,
        padding: "28px 32px", marginBottom: 24, display: "flex",
        alignItems: "center", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40, width: 200, height: 200,
          background: "radial-gradient(circle,rgba(21,101,192,0.2) 0%,transparent 65%)",
        }} />
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "white", letterSpacing: -0.3, marginBottom: 4 }}>
            Bonjour, Dr. Bernard 👋
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
            Vous avez une formation dans 20 jours. Pensez à vérifier vos documents.
          </div>
          <div style={{
            background: "rgba(21,101,192,0.2)", border: "1px solid rgba(21,101,192,0.4)",
            color: "#90caf9", padding: "4px 12px", borderRadius: 100, fontSize: 11,
            fontWeight: 700, marginTop: 10, display: "inline-block",
          }}>
            📅 Prochaine formation : 15 novembre 2026 · Lyon
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, position: "relative", zIndex: 1 }}>
          {[
            { val: "3", label: "Formations suivies" },
            { val: "3", label: "Attestations" },
            { val: "4.9", label: "Note moy. reçue" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 20px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "white", letterSpacing: -0.5 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        <div>

          {/* MES INSCRIPTIONS */}
          <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 14, padding: "20px 22px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Mes inscriptions</span>
              <Link href="/formations" style={{ fontSize: 12, fontWeight: 600, color: "var(--red)", textDecoration: "none" }}>
                Trouver une formation →
              </Link>
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--red)", marginBottom: 8 }}>
              À venir (1)
            </div>

            <div style={{ border: "1.5px solid #E0E0E0", borderRadius: 12, overflow: "hidden", marginBottom: 10 }}>
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 4, borderRadius: 100, flexShrink: 0, alignSelf: "stretch", minHeight: 50, background: "var(--red)" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                        <span className="pill pill-green">Confirmée</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--red)", background: "#fff5f6", border: "1px solid #ffc5cc", padding: "3px 10px", borderRadius: 100 }}>⏰ Dans 20 jours</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: -0.2 }}>
                        Cardiologie interventionnelle — Techniques avancées 2026
                      </div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
                      450 € <span style={{ fontSize: 11, fontWeight: 400, color: "var(--gray)" }}>HT</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                    {["📅 15 novembre 2026 · 08h30–17h30", "📍 Lyon · Marriott, Salle Rhône", "🍽️ Déjeuner inclus"].map((m, i) => (
                      <span key={i} style={{ fontSize: 12, color: "var(--gray)", display: "flex", alignItems: "center", gap: 4 }}>{m}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,var(--red),#ff6b7a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "white", flexShrink: 0 }}>PD</div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600 }}>Dr. Pierre Dumont</div>
                      <div style={{ fontSize: 10, color: "var(--gray)" }}>Cardiologue interventionnel · CHU Lyon</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ padding: "8px 16px", background: "var(--off-white)", borderTop: "1px solid #EBEBEB", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: "#2e7d32", display: "flex", alignItems: "center", gap: 4 }}>✓ Facture</span>
                <span style={{ fontSize: 11, color: "#2e7d32" }}>✓ Convention signée</span>
                <span style={{ fontSize: 11, color: "#2e7d32" }}>✓ Rappel J-7 reçu</span>
                <span style={{ fontSize: 11, color: "var(--gray)" }}>⏳ Émargement (jour J)</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  <Link href="/formations" style={{ border: "1.5px solid #E0E0E0", background: "white", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", color: "var(--black)" }}>
                    Voir la formation
                  </Link>
                  <button
                    onClick={() => { setCalAdded(true); setTimeout(() => setCalAdded(false), 2000); }}
                    style={{ border: "1.5px solid #E0E0E0", background: calAdded ? "#e8f5e9" : "white", color: calAdded ? "#2e7d32" : "var(--black)", borderColor: calAdded ? "#c8e6c9" : "#E0E0E0", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {calAdded ? "✓ Ajouté" : "📅 Ajouter au calendrier"}
                  </button>
                  <button
                    onClick={() => alert("Ouverture dans Google Maps : Marriott Lyon Cité Internationale")}
                    style={{ background: "var(--red)", color: "white", border: "1.5px solid var(--red)", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    🗺️ Itinéraire
                  </button>
                </div>
              </div>
            </div>

            <div style={{ height: 16 }} />
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--gray)", marginBottom: 8 }}>
              Passées (2)
            </div>

            {[
              { title: "Stenting coronarien avancé — Toulouse 2026", date: "14 juin 2026", lieu: "Toulouse · Novotel Wilson", price: "420 € HT", note: "5/5", attestation: true },
              { title: "Urgences cardiologiques — Simulation pratique", date: "10 octobre 2025", lieu: "Lyon · Radisson Blu", price: "300 € HT", note: "4/5", attestation: true },
            ].map((f, i) => (
              <div key={i} style={{ border: "1.5px solid #E0E0E0", borderRadius: 12, overflow: "hidden", marginBottom: i === 0 ? 10 : 0, opacity: 0.85 }}>
                <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 4, borderRadius: 100, flexShrink: 0, alignSelf: "stretch", minHeight: 50, background: "#1565c0" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                          <span className="pill pill-blue">Terminée</span>
                          <span style={{ fontSize: 11, color: "var(--gray)" }}>Attestation envoyée</span>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 800 }}>{f.title}</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gray)" }}>{f.price}</div>
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: "var(--gray)" }}>📅 {f.date}</span>
                      <span style={{ fontSize: 12, color: "var(--gray)" }}>📍 {f.lieu}</span>
                      <span style={{ fontSize: 12, color: "#ffc107", fontWeight: 600 }}>⭐ Votre note : {f.note}</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "8px 16px", background: "var(--off-white)", borderTop: "1px solid #EBEBEB", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "#2e7d32" }}>✓ Attestation reçue</span>
                  <span style={{ fontSize: 11, color: "#2e7d32" }}>✓ Facture</span>
                  <span style={{ fontSize: 11, color: "#2e7d32" }}>✓ Évaluation envoyée</span>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    <button style={{ border: "1.5px solid #E0E0E0", background: "white", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>↓ Attestation PDF</button>
                    <button style={{ border: "1.5px solid #E0E0E0", background: "white", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>↓ Facture</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ATTESTATIONS */}
          <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 14, padding: "20px 22px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Mes attestations</span>
              <button style={{ border: "1.5px solid #E0E0E0", background: "white", borderRadius: 7, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>📥 Tout télécharger</button>
            </div>
            {[
              { title: "Cardiologie interventionnelle — Lyon 2026", meta: "15 novembre 2026 · 7h · Dr. Pierre Dumont", status: "À venir", statusBg: "#fff3e0", statusColor: "#e65100", dl: null },
              { title: "Stenting coronarien avancé — Toulouse", meta: "14 juin 2026 · 7h · Dr. Pierre Dumont", status: null, statusBg: null, statusColor: null, dl: "↓ PDF" },
              { title: "Urgences cardiologiques — Lyon", meta: "10 oct. 2025 · 4h · Dr. A. Chartier", status: null, statusBg: null, statusColor: null, dl: "↓ PDF" },
            ].map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 2 ? "1px solid #EBEBEB" : "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🎓</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 1 }}>{a.meta}</div>
                </div>
                {a.status && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: a.statusBg || undefined, color: a.statusColor || undefined, padding: "2px 8px", borderRadius: 100, marginRight: 8, flexShrink: 0 }}>
                    {a.status}
                  </span>
                )}
                {a.dl && <a href="#" style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "var(--red)", cursor: "pointer", textDecoration: "none", flexShrink: 0 }}>{a.dl}</a>}
              </div>
            ))}
          </div>

          {/* SUGGESTIONS */}
          <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Formations recommandées pour vous</span>
              <Link href="/formations" style={{ fontSize: 12, fontWeight: 600, color: "var(--red)", textDecoration: "none" }}>Voir tout →</Link>
            </div>
            {[
              { tag: "Cardiologie", avail: "Places disponibles", availBg: "#e8f5e9", availColor: "#2e7d32", title: "Échocardiographie transthoracique — Cas cliniques avancés", meta: "📅 3 déc. 2026 · Paris · Dr. S. Moreau · ⭐ 4.8", price: "320 €" },
              { tag: "Cardiologie", avail: "⚡ 3 places", availBg: "#fff3e0", availColor: "#e65100", title: "Rythmologie clinique — Arythmies et prise en charge urgente", meta: "📅 8 fév. 2027 · Marseille · Dr. A. Chartier · ⭐ 4.7", price: "390 €" },
            ].map((s, i) => (
              <div key={i} style={{ border: "1.5px solid #E0E0E0", borderRadius: 12, padding: "14px 16px", marginBottom: i === 0 ? 8 : 0, display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, background: "#fff0f2", color: "var(--red)", padding: "2px 8px", borderRadius: 100 }}>{s.tag}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, background: s.availBg, color: s.availColor, padding: "2px 7px", borderRadius: 100 }}>{s.avail}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: "var(--gray)" }}>{s.meta}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                  {s.price}<span style={{ fontSize: 11, fontWeight: 400, color: "var(--gray)" }}> HT</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div>
          {/* PROFIL */}
          <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 14, padding: "20px 22px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Mon profil</div>
            <div style={{ background: "var(--off-white)", borderRadius: 12, padding: "14px 16px", marginBottom: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#1565c0,#42a5f5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "white", flexShrink: 0 }}>SB</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>Dr. Sophie Bernard</div>
                  <div style={{ fontSize: 12, color: "var(--gray)" }}>Cardiologue · CHU Paris-Necker</div>
                </div>
              </div>
              {[
                { key: "Email", val: "s.bernard@chu-paris.fr" },
                { key: "Spécialité", val: "Cardiologie" },
                { key: "RPPS", val: "1020304050" },
                { key: "Ville", val: "Paris" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: i < 3 ? "1px solid #E0E0E0" : "none" }}>
                  <span style={{ color: "var(--gray)" }}>{r.key}</span>
                  <span style={{ fontWeight: 600 }}>{r.val}</span>
                </div>
              ))}
              <Link href="/participant/profil" style={{
                width: "100%", background: "white", border: "1.5px solid #E0E0E0", borderRadius: 8,
                padding: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                marginTop: 10, display: "block", textAlign: "center", textDecoration: "none", color: "var(--black)",
              }}>
                ✏️ Modifier mon profil
              </Link>
            </div>
          </div>

          {/* RAPPELS */}
          <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 14, padding: "20px 22px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Rappels & notifications</div>
            {[
              { dot: "var(--red)", title: "🎓 Formation dans 20 jours", sub: "Cardiologie inter. — Lyon · 15 nov. 2026", time: "Rappel J-7 automatique prévu le 8 nov." },
              { dot: "#2e7d32", title: "✓ Convention signée", sub: "Formation Lyon · Signée via YouSign le 18 oct.", time: "Il y a 18 jours" },
              { dot: "#1565c0", title: "📊 Bilan pédagogique disponible", sub: "Formation Toulouse — Synthèse disponible", time: "Il y a 4 mois" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: i < 2 ? "1px solid #EBEBEB" : "none" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.dot, flexShrink: 0, marginTop: 4 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 2, lineHeight: 1.4 }}>{r.sub}</div>
                  <div style={{ fontSize: 10, color: "var(--gray)", marginTop: 3 }}>{r.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* AIDE */}
          <div style={{ background: "#fff5f6", border: "1.5px solid #ffc5cc", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Besoin d&apos;aide ?</div>
            <div style={{ fontSize: 12, color: "var(--gray)", marginBottom: 10, lineHeight: 1.5 }}>
              Pour toute question sur votre inscription, annulation ou vos documents.
            </div>
            <a href="mailto:contact@masterclassmedical.fr" style={{ fontSize: 12, fontWeight: 600, color: "var(--red)", textDecoration: "none" }}>
              ✉️ Contacter le support →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
