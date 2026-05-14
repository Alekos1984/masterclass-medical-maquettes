"use client";

import { useState } from "react";
import Link from "next/link";

const inscriptions = [
  { participant: "Dr. Sophie Bernard", formation: "Cardiologie inter. — Lyon", montant: "450 €", commission: "90 €", date: "18 oct. 2026", statut: "Capturé", pillClass: "pill-green" },
  { participant: "Dr. Marc Lefebvre", formation: "Cardiologie inter. — Lyon", montant: "450 €", commission: "90 €", date: "20 oct. 2026", statut: "Capturé", pillClass: "pill-green" },
  { participant: "Dr. Anne Chartier", formation: "Cardiologie inter. — Lyon", montant: "450 €", commission: "90 €", date: "22 oct. 2026", statut: "Capturé", pillClass: "pill-green" },
  { participant: "Dr. Thomas Moreau", formation: "Stenting — Toulouse", montant: "420 €", commission: "84 €", date: "15 mai 2026", statut: "Capturé", pillClass: "pill-green" },
  { participant: "Dr. Isabelle Petit", formation: "Stenting — Toulouse", montant: "420 €", commission: "84 €", date: "18 mai 2026", statut: "Capturé", pillClass: "pill-green" },
];

const commissions = [
  { formation: "Cardiologie inter. — Lyon", formateur: "Dr. P. Dumont", inscrits: 12, tauxComm: "20%", montant: "1 080 €", statut: "Prélevée", pillClass: "pill-green" },
  { formation: "Échocardiographie — Paris", formateur: "Dr. S. Bernard", inscrits: 6, tauxComm: "20%", montant: "384 €", statut: "Prélevée", pillClass: "pill-green" },
  { formation: "Rythmologie — Marseille", formateur: "Dr. A. Chartier", inscrits: 3, tauxComm: "20%", montant: "234 €", statut: "En attente", pillClass: "pill-orange" },
  { formation: "Stenting — Toulouse", formateur: "Dr. P. Dumont", inscrits: 14, tauxComm: "20%", montant: "3 360 €", statut: "Prélevée", pillClass: "pill-green" },
];

const virements = [
  { formateur: "Dr. P. Dumont", iban: "FR76 3000 6000 0112 3456 7890 189", formation: "Cardiologie inter. — Lyon", montant: "4 320 €", date: "30 oct. 2026", statut: "À virer", pillClass: "pill-orange" },
  { formateur: "Dr. S. Bernard", iban: "FR76 1027 8060 0001 2345 6789 012", formation: "Échocardiographie — Paris", montant: "1 536 €", date: "30 oct. 2026", statut: "À virer", pillClass: "pill-orange" },
  { formateur: "Dr. A. Chartier", iban: "FR76 2004 1010 0505 0013 4567 892", formation: "Rythmologie — Marseille", montant: "936 €", date: "30 nov. 2026", statut: "En attente", pillClass: "pill-gray" },
];

const abonnements = [
  { formateur: "Dr. P. Dumont", email: "pierre.dumont@chu-lyon.fr", montant: "20 €/mois", prochainPrel: "1 nov. 2026", statut: "Actif", pillClass: "pill-green" },
  { formateur: "Dr. S. Bernard", email: "s.bernard@chu-paris.fr", montant: "20 €/mois", prochainPrel: "1 nov. 2026", statut: "Actif", pillClass: "pill-green" },
  { formateur: "Dr. M. Lefebvre", email: "m.lefebvre@hopital-lille.fr", montant: "20 €/mois", prochainPrel: "—", statut: "⚠ Impayé", pillClass: "pill-red" },
  { formateur: "Dr. T. Moreau", email: "t.moreau@chub-bordeaux.fr", montant: "20 €/mois", prochainPrel: "1 nov. 2026", statut: "Actif", pillClass: "pill-green" },
];

export default function AdminPaiementsPage() {
  const [activeTab, setActiveTab] = useState("inscriptions");

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/admin/dashboard" className="topbar-back">← Dashboard</Link>
          <div className="topbar-sep"></div>
          <span className="topbar-title">Paiements & commissions</span>
        </div>
        <button className="btn btn-ghost" style={{ fontSize: 12 }}>📥 Export</button>
      </div>

      <div className="content">
        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-val" style={{ fontSize: 18 }}>18 640 €</div>
            <div className="stat-card-label">Revenus plateforme HT</div>
            <div className="stat-card-trend trend-up">↑ +2 340 € ce mois</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val" style={{ fontSize: 18 }}>93 200 €</div>
            <div className="stat-card-label">Volume total transactions</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val">41</div>
            <div className="stat-card-label">Abonnements actifs</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val" style={{ color: "var(--red)" }}>3</div>
            <div className="stat-card-label">Virements en attente</div>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs">
          {[
            { id: "inscriptions", label: "Inscriptions" },
            { id: "commissions", label: "Commissions" },
            { id: "abonnements", label: "Abonnements" },
            { id: "virements", label: "Virements formateurs" },
          ].map((t) => (
            <button
              key={t.id}
              className={`tab${activeTab === t.id ? " active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* PANEL: INSCRIPTIONS */}
        {activeTab === "inscriptions" && (
          <div className="card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Formation</th>
                  <th>Montant HT</th>
                  <th>Commission (20%)</th>
                  <th>Date</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {inscriptions.map((i) => (
                  <tr key={`${i.participant}-${i.date}`}>
                    <td><div className="td-name">{i.participant}</div></td>
                    <td>{i.formation}</td>
                    <td>{i.montant}</td>
                    <td style={{ color: "var(--red)" }}>{i.commission}</td>
                    <td>{i.date}</td>
                    <td><span className={`pill ${i.pillClass}`}>{i.statut}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PANEL: COMMISSIONS */}
        {activeTab === "commissions" && (
          <div className="card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Formation</th>
                  <th>Formateur</th>
                  <th>Inscrits</th>
                  <th>Taux</th>
                  <th>Commission</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c.formation}>
                    <td><div className="td-name">{c.formation}</div></td>
                    <td>{c.formateur}</td>
                    <td>{c.inscrits}</td>
                    <td>{c.tauxComm}</td>
                    <td style={{ fontWeight: 700, color: "var(--red)" }}>{c.montant}</td>
                    <td><span className={`pill ${c.pillClass}`}>{c.statut}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PANEL: ABONNEMENTS */}
        {activeTab === "abonnements" && (
          <div className="card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Formateur</th>
                  <th>Email</th>
                  <th>Montant</th>
                  <th>Prochain prélèvement</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {abonnements.map((a) => (
                  <tr key={a.email}>
                    <td><div className="td-name">{a.formateur}</div></td>
                    <td style={{ fontSize: 11, color: "var(--gray)" }}>{a.email}</td>
                    <td>{a.montant}</td>
                    <td>{a.prochainPrel}</td>
                    <td><span className={`pill ${a.pillClass}`}>{a.statut}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button className="btn btn-ghost">Voir</button>
                        {a.pillClass === "pill-red" && (
                          <button className="btn btn-warn">Relancer</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PANEL: VIREMENTS */}
        {activeTab === "virements" && (
          <div className="card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Formateur</th>
                  <th>IBAN</th>
                  <th>Formation</th>
                  <th>Montant net HT</th>
                  <th>Date prévue</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {virements.map((v) => (
                  <tr key={v.formateur + v.formation}>
                    <td><div className="td-name">{v.formateur}</div></td>
                    <td style={{ fontSize: 11, fontFamily: "monospace", color: "var(--gray)" }}>{v.iban}</td>
                    <td>{v.formation}</td>
                    <td style={{ fontWeight: 700 }}>{v.montant}</td>
                    <td>{v.date}</td>
                    <td><span className={`pill ${v.pillClass}`}>{v.statut}</span></td>
                    <td>
                      {v.pillClass === "pill-orange" ? (
                        <button className="btn btn-red" style={{ fontSize: 11 }}>💸 Virer</button>
                      ) : (
                        <button className="btn btn-ghost">Voir</button>
                      )}
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
