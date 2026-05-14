"use client";

import { useState } from "react";

const participants = [
  {
    initials: "SB", name: "Dr. Sophie Bernard", spec: "Cardiologue · Paris",
    formation: "Cardiologie inter. — Lyon", date: "15 nov. 2026",
    inscrit: "18 oct. 2026", paiement: "Payé · 450 €", convention: "Signée", attestation: "À venir",
    actions: ["Email", "↓ Conv."],
    avatarBg: "linear-gradient(135deg,#1565c0,#42a5f5)",
    payClass: "pill-green", convClass: "pill-green", attestClass: "pill-orange",
  },
  {
    initials: "ML", name: "Dr. Marc Lefebvre", spec: "Cardiologue · Lille",
    formation: "Cardiologie inter. — Lyon", date: "15 nov. 2026",
    inscrit: "20 oct. 2026", paiement: "Payé · 450 €", convention: "En attente", attestation: "À venir",
    actions: ["Relancer", "↓ Conv."],
    avatarBg: "linear-gradient(135deg,#2e7d32,#66bb6a)",
    payClass: "pill-green", convClass: "pill-orange", attestClass: "pill-orange",
  },
  {
    initials: "AC", name: "Dr. Anne Chartier", spec: "Rythmologue · Marseille",
    formation: "Cardiologie inter. — Lyon", date: "15 nov. 2026",
    inscrit: "22 oct. 2026", paiement: "Payé · 450 €", convention: "Signée", attestation: "À venir",
    actions: ["Email", "↓ Conv."],
    avatarBg: "linear-gradient(135deg,#6a1b9a,#ab47bc)",
    payClass: "pill-green", convClass: "pill-green", attestClass: "pill-orange",
  },
  {
    initials: "TM", name: "Dr. Thomas Moreau", spec: "Médecine interne · Bordeaux",
    formation: "Cardiologie inter. — Lyon", date: "15 nov. 2026",
    inscrit: "24 oct. 2026", paiement: "Payé · 450 €", convention: "Signée", attestation: "À venir",
    actions: ["Email"],
    avatarBg: "linear-gradient(135deg,#e65100,#ff9800)",
    payClass: "pill-green", convClass: "pill-green", attestClass: "pill-orange",
  },
  {
    initials: "IP", name: "Dr. Isabelle Petit", spec: "Cardiologue · Lyon",
    formation: "Cardiologie inter. — Lyon", date: "15 nov. 2026",
    inscrit: "25 oct. 2026", paiement: "Payé · 450 €", convention: "En attente", attestation: "À venir",
    actions: ["Relancer"],
    avatarBg: "linear-gradient(135deg,#ad1457,#f06292)",
    payClass: "pill-green", convClass: "pill-orange", attestClass: "pill-orange",
    separator: true,
    separatorLabel: "Stenting coronarien — Toulouse · juin 2026 (terminée)",
  },
  {
    initials: "NR", name: "Dr. Nicolas Roy", spec: "Médecin · Toulouse",
    formation: "Stenting coronarien — Toulouse", date: "14 juin 2026",
    inscrit: "15 mai 2026", paiement: "Payé · 420 €", convention: "Signée", attestation: "Envoyée",
    actions: ["↓ Attest.", "↓ Facture"],
    avatarBg: "linear-gradient(135deg,#00695c,#26a69a)",
    payClass: "pill-green", convClass: "pill-green", attestClass: "pill-green",
  },
  {
    initials: "EB", name: "Dr. Émilie Blanc", spec: "Cardiologue · Rennes",
    formation: "Stenting coronarien — Toulouse", date: "14 juin 2026",
    inscrit: "18 mai 2026", paiement: "Payé · 420 €", convention: "Signée", attestation: "Envoyée",
    actions: ["↓ Attest.", "↓ Facture"],
    avatarBg: "linear-gradient(135deg,#4527a0,#7e57c2)",
    payClass: "pill-green", convClass: "pill-green", attestClass: "pill-green",
  },
];

export default function FormateurParticipantsPage() {
  const [search, setSearch] = useState("");
  const [formation, setFormation] = useState("Toutes les formations");
  const [statut, setStatut] = useState("Tous les statuts");

  const filtered = participants.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.name.toLowerCase().includes(q) || p.spec.toLowerCase().includes(q) || !q) &&
      (formation === "Toutes les formations" || p.formation.includes(formation.split("—")[0].trim())) &&
      (statut === "Tous les statuts" || p.convention === statut || p.attestation === statut || p.paiement.startsWith(statut))
    );
  });

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Mes participants</div>
        <button
          style={{
            background: "white", border: "1.5px solid #E0E0E0", borderRadius: 8,
            padding: "7px 14px", fontSize: 12, fontWeight: 600, color: "var(--gray)",
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          📥 Exporter CSV
        </button>
      </div>

      <div className="content">
        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { val: "34", label: "Total participants", color: undefined },
            { val: "12", label: "Formation en cours", color: undefined },
            { val: "31", label: "Attestations envoyées", color: "#2e7d32" },
            { val: "3", label: "Conventions en attente", color: "var(--red)" },
          ].map((s, i) => (
            <div key={i} style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, color: s.color || "var(--black)" }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div style={{
          background: "white", border: "1px solid #E0E0E0", borderRadius: 12,
          padding: "14px 18px", marginBottom: 20, display: "flex", gap: 10,
          alignItems: "center", flexWrap: "wrap",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, background: "var(--off-white)",
            border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "7px 12px",
            flex: 1, minWidth: 200,
          }}>
            <span>🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, email, spécialité…"
              style={{ border: "none", outline: "none", fontSize: 13, fontFamily: "inherit", background: "transparent", width: "100%" }}
            />
          </div>
          <select
            value={formation}
            onChange={(e) => setFormation(e.target.value)}
            style={{ border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "7px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", background: "white" }}
          >
            <option>Toutes les formations</option>
            <option>Cardiologie inter. — Lyon (nov. 2026)</option>
            <option>Stenting — Toulouse (juin 2026)</option>
          </select>
          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            style={{ border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "7px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", background: "white" }}
          >
            <option>Tous les statuts</option>
            <option>Payé</option>
            <option>Signée</option>
            <option>En attente</option>
            <option>Envoyée</option>
          </select>
        </div>

        {/* TABLE */}
        <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 14, overflow: "hidden" }}>
          <table>
            <thead>
              <tr>
                <th>Participant</th>
                <th>Formation</th>
                <th>Inscription</th>
                <th>Paiement</th>
                <th>Convention</th>
                <th>Attestation</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <>
                  {p.separator && (
                    <tr key={`sep-${i}`} style={{ background: "#fafafa" }}>
                      <td colSpan={7} style={{
                        fontSize: 11, fontWeight: 700, color: "var(--gray)",
                        textTransform: "uppercase", letterSpacing: 0.8, padding: "8px 14px",
                      }}>
                        {p.separatorLabel}
                      </td>
                    </tr>
                  )}
                  <tr key={p.initials}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%", display: "flex",
                          alignItems: "center", justifyContent: "center", fontSize: 11,
                          fontWeight: 700, color: "white", flexShrink: 0, background: p.avatarBg,
                        }}>{p.initials}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 1 }}>{p.spec}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>{p.formation}</div>
                      <div style={{ fontSize: 11, color: "var(--gray)" }}>{p.date}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{p.inscrit}</td>
                    <td><span className={`pill ${p.payClass}`}>{p.paiement}</span></td>
                    <td><span className={`pill ${p.convClass}`}>{p.convention}</span></td>
                    <td><span className={`pill ${p.attestClass}`}>{p.attestation}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 5 }}>
                        {p.actions.map((a, j) => (
                          <button key={j} style={{
                            border: "1px solid #E0E0E0", background: "white", borderRadius: 6,
                            padding: "4px 9px", fontSize: 11, fontWeight: 600, cursor: "pointer",
                            color: "var(--gray)", fontFamily: "inherit",
                          }}>
                            {a}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
