"use client";

import { useState } from "react";

type TabId = "revenus" | "salles" | "abonnement" | "factures";

const tabs: { id: TabId; label: string }[] = [
  { id: "revenus", label: "💰 Revenus formations" },
  { id: "salles", label: "🏨 Frais de salle" },
  { id: "abonnement", label: "🔄 Abonnement" },
  { id: "factures", label: "📄 Mes factures" },
];

const revenusFormations = [
  { formation: "Stenting coronarien — Toulouse", date: "14 juin 2026", inscrits: 14, prix: "420 €", brut: "5 880 €", commission: "− 1 176 €", net: "4 704 €", statut: "Virement J+7", statusClass: "pill-orange" },
  { formation: "Coronarographie — Paris", date: "18 mars 2026", inscrits: 15, prix: "400 €", brut: "6 000 €", commission: "− 1 200 €", net: "4 800 €", statut: "Viré · 28 mars", statusClass: "pill-green" },
  { formation: "Urgences cardio. — Lyon", date: "10 oct. 2025", inscrits: 7, prix: "300 €", brut: "2 100 €", commission: "− 420 €", net: "1 680 €", statut: "Viré · 20 oct.", statusClass: "pill-green" },
];

const fraisSalle = [
  { formation: "Cardiologie inter. — Lyon · Marriott", date: "15 nov. 2026 · Salle Rhône", devis: "1 200 €", frais: "+ 120 €", total: "1 320 €", datePay: "2 oct. 2026" },
  { formation: "Coronarographie — Paris · Marriott RG", date: "18 mars 2026 · Salle Loire", devis: "1 100 €", frais: "+ 110 €", total: "1 210 €", datePay: "5 fév. 2026" },
  { formation: "Urgences cardio. — Lyon · Radisson", date: "10 oct. 2025", devis: "900 €", frais: "+ 90 €", total: "990 €", datePay: "15 sept. 2025" },
];

const abonnementHistory = [
  { periode: "Nov. 2026", montant: "20 € HT", statut: "Payé" },
  { periode: "Oct. 2026", montant: "20 € HT", statut: "Payé" },
  { periode: "Sept. 2026", montant: "20 € HT", statut: "Payé" },
  { periode: "Août 2026", montant: "20 € HT", statut: "Payé" },
  { periode: "Juil. 2026", montant: "20 € HT", statut: "Payé" },
];

const factures = [
  { num: "FCT-2026-0089", desc: "Frais salle — Marriott Lyon", sub: "Cardiologie inter. · Réf. DR-2026-0041", date: "2 oct. 2026", montant: "1 320 €" },
  { num: "FCT-2026-0088", desc: "Abonnement formateur — Novembre 2026", sub: "", date: "1 nov. 2026", montant: "20 €" },
  { num: "FCT-2026-0071", desc: "Frais salle — Marriott Paris", sub: "Coronarographie · Réf. DR-2026-0021", date: "5 fév. 2026", montant: "1 210 €" },
  { num: "FCT-2025-0049", desc: "Frais salle — Radisson Blu Lyon", sub: "Urgences cardio. · Réf. DR-2025-0011", date: "15 sept. 2025", montant: "990 €" },
];

const graphBars = [
  { label: "Oct", val: "840€", pct: 25 },
  { label: "Nov", val: "600€", pct: 18 },
  { label: "Déc", val: "1.2k€", pct: 35 },
  { label: "Jan", val: "480€", pct: 15 },
  { label: "Mar", val: "1.5k€", pct: 45 },
  { label: "Juin", val: "4.3k€", pct: 100, highlight: true },
];

export default function FormateurPaiementsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("revenus");

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Paiements & facturation</div>
        <button style={{
          background: "white", border: "1.5px solid #E0E0E0", borderRadius: 8,
          padding: "8px 16px", fontSize: 13, fontWeight: 700, color: "var(--gray)",
          cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6,
        }}>
          📥 Exporter relevé PDF
        </button>
      </div>

      <div className="content">

        {/* VIREMENT BANNER */}
        <div style={{
          background: "linear-gradient(135deg,#0a2010,#0a1808)", borderRadius: 14,
          padding: "18px 22px", marginBottom: 20, display: "flex",
          alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 3 }}>Prochain virement</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Revenus de la formation de Toulouse · J+7 après formation</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#4caf50", letterSpacing: -1 }}>4 320 €</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>HT — vers IBAN FR76 ···· 1234</div>
          </div>
        </div>

        {/* METRICS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Revenus nets cumulés", val: "10 800 €", sub: "Après commissions (20%)", trend: "↑ +4 320 € en attente" },
            { label: "Frais salle payés", val: "2 640 €", sub: "3 formations · Incl. frais gestion", trend: null },
            { label: "Commissions prélevées", val: "2 700 €", sub: "20% HT sur inscriptions", trend: null },
            { label: "Abonnement", val: "20 € HT", sub: "/mois · Actif", trend: "Renouvellement le 1er déc." },
          ].map((m, i) => (
            <div key={i} style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--gray)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>{m.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>{m.val}</div>
              <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 4 }}>{m.sub}</div>
              {m.trend && <div style={{ fontSize: 11, fontWeight: 600, marginTop: 3, color: "#2e7d32" }}>{m.trend}</div>}
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{
          background: "white", border: "1px solid #E0E0E0", borderRadius: 10,
          padding: 3, display: "flex", gap: 2, marginBottom: 20,
        }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                flex: 1, padding: "7px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: "pointer", textAlign: "center", border: "none", fontFamily: "inherit",
                background: activeTab === t.id ? "var(--red)" : "transparent",
                color: activeTab === t.id ? "white" : "var(--gray)",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* REVENUS */}
        {activeTab === "revenus" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="card" style={{ marginBottom: 0 }}>
                <div className="card-header"><span className="card-title">Revenus mensuels</span></div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100, marginTop: 12 }}>
                  {graphBars.map((b, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: b.highlight ? "var(--red)" : "var(--black)" }}>{b.val}</div>
                      <div style={{ width: "100%", height: `${b.pct}%`, borderRadius: "5px 5px 0 0", background: b.highlight ? "var(--red)" : "#ffc107" }} />
                      <div style={{ fontSize: 10, color: "var(--gray)", fontWeight: b.highlight ? 700 : 400 }}>{b.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card" style={{ marginBottom: 0 }}>
                <div className="card-header"><span className="card-title">Répartition</span></div>
                {[
                  { key: "Revenus bruts formations", val: "13 500 €", color: undefined },
                  { key: "Commissions plateforme (20%)", val: "− 2 700 €", color: "var(--red)" },
                  { key: "Revenus nets virés", val: "6 480 €", color: "#2e7d32" },
                  { key: "En attente (Toulouse)", val: "4 320 €", color: "#e65100" },
                  { key: "Total nets", val: "10 800 €", color: undefined, big: true },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 4 ? "1px solid #EBEBEB" : "none", fontSize: 12 }}>
                    <span style={{ color: "var(--gray)" }}>{r.key}</span>
                    <span style={{ fontWeight: r.big ? 800 : 600, fontSize: r.big ? 15 : 12, color: r.color || "var(--black)" }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Détail par formation</span>
                <button style={{ background: "white", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: "var(--gray)", fontFamily: "inherit" }}>📥 Export CSV</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Formation</th>
                    <th>Inscrits payants</th>
                    <th>Prix HT</th>
                    <th>Revenus bruts</th>
                    <th>Commission (20%)</th>
                    <th>Net HT</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {revenusFormations.map((r, i) => (
                    <tr key={i}>
                      <td><div style={{ fontWeight: 600 }}>{r.formation}</div><div style={{ fontSize: 11, color: "var(--gray)" }}>{r.date}</div></td>
                      <td>{r.inscrits}</td>
                      <td>{r.prix}</td>
                      <td>{r.brut}</td>
                      <td style={{ color: "var(--red)", fontWeight: 700 }}>{r.commission}</td>
                      <td style={{ color: "#2e7d32", fontWeight: 700 }}>{r.net}</td>
                      <td><span className={`pill ${r.statusClass}`}>{r.statut}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* FRAIS SALLE */}
        {activeTab === "salles" && (
          <div className="card">
            <div className="card-header"><span className="card-title">Paiements de salle</span></div>
            <table>
              <thead>
                <tr>
                  <th>Formation · Établissement</th>
                  <th>Devis salle HT</th>
                  <th>Frais gestion (10%)</th>
                  <th>Total payé HT</th>
                  <th>Date</th>
                  <th>Facture</th>
                </tr>
              </thead>
              <tbody>
                {fraisSalle.map((f, i) => (
                  <tr key={i}>
                    <td><div style={{ fontWeight: 600 }}>{f.formation}</div><div style={{ fontSize: 11, color: "var(--gray)" }}>{f.date}</div></td>
                    <td>{f.devis}</td>
                    <td style={{ color: "var(--red)" }}>{f.frais}</td>
                    <td style={{ fontWeight: 700 }}>{f.total}</td>
                    <td>{f.datePay}</td>
                    <td>
                      <button style={{ border: "1px solid #E0E0E0", background: "white", borderRadius: 5, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>↓ PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ABONNEMENT */}
        {activeTab === "abonnement" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>Formateur Actif</div>
                  <div style={{ fontSize: 13, color: "var(--gray)", marginTop: 2 }}>20 € HT / mois</div>
                </div>
                <span className="pill pill-green">Actif</span>
              </div>
              {[
                { key: "Date de début", val: "1er juillet 2026" },
                { key: "Prochain prélèvement", val: "1er décembre 2026" },
                { key: "Moyen de paiement", val: "Visa ···· 4242" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #EBEBEB", fontSize: 12 }}>
                  <span style={{ color: "var(--gray)" }}>{r.key}</span>
                  <span style={{ fontWeight: 600 }}>{r.val}</span>
                </div>
              ))}
              <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                <button style={{ border: "1.5px solid #E0E0E0", background: "white", color: "var(--gray)", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Changer le moyen de paiement
                </button>
                <button style={{ background: "#ffebee", color: "#c62828", border: "1.5px solid #ef9a9a", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Résilier
                </button>
              </div>
            </div>
            <div className="card" style={{ marginBottom: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Historique abonnement</div>
              <table>
                <thead><tr><th>Période</th><th>Montant</th><th>Statut</th></tr></thead>
                <tbody>
                  {abonnementHistory.map((h, i) => (
                    <tr key={i}>
                      <td>{h.periode}</td>
                      <td>{h.montant}</td>
                      <td><span className="pill pill-green">{h.statut}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FACTURES */}
        {activeTab === "factures" && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Toutes les factures</span>
              <button style={{ background: "white", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: "var(--gray)", fontFamily: "inherit" }}>📥 Tout télécharger</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>N° Facture</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Montant HT</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {factures.map((f, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: "monospace", fontSize: 11 }}>{f.num}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{f.desc}</div>
                      {f.sub && <div style={{ fontSize: 11, color: "var(--gray)" }}>{f.sub}</div>}
                    </td>
                    <td>{f.date}</td>
                    <td>{f.montant}</td>
                    <td><span className="pill pill-green">Payée</span></td>
                    <td>
                      <button style={{ border: "1px solid #E0E0E0", background: "white", borderRadius: 5, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>↓ PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
