"use client";

import { useState } from "react";
import Link from "next/link";

type InscriptionRow = {
  id: string;
  participantNom: string;
  formationTitre: string;
  formationVille: string | null;
  montantHT: string;
  commission: string;
  date: string;
};

type AbonnementRow = {
  id: string;
  formateurNom: string;
  email: string;
  statut: string;
  pillClass: string;
};

type Props = {
  inscriptions: InscriptionRow[];
  abonnements: AbonnementRow[];
  inscriptionsCount: number;
  abonnementsActifs: number;
};

export default function PaiementsClient({ inscriptions, abonnements, inscriptionsCount, abonnementsActifs }: Props) {
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
            <div className="stat-card-val">{inscriptionsCount}</div>
            <div className="stat-card-label">Inscriptions confirmées</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val">{abonnementsActifs}</div>
            <div className="stat-card-label">Abonnements actifs</div>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs">
          {[
            { id: "inscriptions", label: "Inscriptions" },
            { id: "abonnements", label: "Abonnements" },
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
            {inscriptions.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "var(--gray)", fontSize: 14 }}>
                Aucune inscription confirmée pour l&apos;instant.
              </div>
            ) : (
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
                    <tr key={i.id}>
                      <td><div className="td-name">{i.participantNom}</div></td>
                      <td>
                        <div className="td-name">{i.formationTitre}</div>
                        {i.formationVille && <div className="td-sub">{i.formationVille}</div>}
                      </td>
                      <td>{i.montantHT}</td>
                      <td style={{ color: "var(--red)" }}>{i.commission}</td>
                      <td>{i.date}</td>
                      <td><span className="pill pill-green">Confirmée</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* PANEL: ABONNEMENTS */}
        {activeTab === "abonnements" && (
          <div className="card" style={{ padding: 0 }}>
            {abonnements.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "var(--gray)", fontSize: 14 }}>
                Aucun abonnement pour l&apos;instant.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Formateur</th>
                    <th>Email</th>
                    <th>Montant</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {abonnements.map((a) => (
                    <tr key={a.id}>
                      <td><div className="td-name">{a.formateurNom}</div></td>
                      <td style={{ fontSize: 11, color: "var(--gray)" }}>{a.email}</td>
                      <td>20 €/mois</td>
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
            )}
          </div>
        )}
      </div>
    </>
  );
}
