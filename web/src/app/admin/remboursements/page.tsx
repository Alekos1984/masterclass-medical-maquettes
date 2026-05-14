"use client";

import { useState } from "react";
import Link from "next/link";

type Remboursement = {
  participant: string;
  email?: string;
  formation: string;
  dateFormation: string;
  motif: string;
  montant: string;
  dateDemande: string;
  eligibilite: string;
  eligibilitePillClass: string;
  statut: string;
  statutPillClass: string;
  actionnable: boolean;
  faded?: boolean;
};

const initialRemboursements: Remboursement[] = [
  {
    participant: "Dr. Pierre Martin",
    email: "p.martin@chu-nantes.fr",
    formation: "Cardiologie inter. — Lyon",
    dateFormation: "15 nov. 2026",
    motif: "Empêchement professionnel",
    montant: "450 €",
    dateDemande: "25 oct. 2026",
    eligibilite: "✓ J-21 · Eligible",
    eligibilitePillClass: "pill-green",
    statut: "En attente",
    statutPillClass: "pill-orange",
    actionnable: true,
  },
  {
    participant: "Dr. Claire Dupont",
    email: "c.dupont@hopital-stras.fr",
    formation: "Échocardiographie — Paris",
    dateFormation: "3 déc. 2026",
    motif: "Formation annulée",
    montant: "320 €",
    dateDemande: "28 oct. 2026",
    eligibilite: "✓ Formation annulée",
    eligibilitePillClass: "pill-green",
    statut: "En attente",
    statutPillClass: "pill-orange",
    actionnable: true,
  },
  {
    participant: "Dr. Nicolas Roy",
    email: undefined,
    formation: "Stenting — Toulouse",
    dateFormation: "14 juin 2026",
    motif: "Motif personnel",
    montant: "420 €",
    dateDemande: "2 juin 2026",
    eligibilite: "✗ J-12 · Non éligible",
    eligibilitePillClass: "pill-red",
    statut: "Refusé",
    statutPillClass: "pill-gray",
    actionnable: false,
    faded: true,
  },
  {
    participant: "Dr. Émilie Blanc",
    email: undefined,
    formation: "Coronarographie — Paris",
    dateFormation: "18 mars 2026",
    motif: "Maladie",
    montant: "400 €",
    dateDemande: "10 mars 2026",
    eligibilite: "✓ Certificat médical",
    eligibilitePillClass: "pill-green",
    statut: "Remboursé",
    statutPillClass: "pill-blue",
    actionnable: false,
    faded: true,
  },
];

export default function AdminRemboursementsPage() {
  const [remboursements, setRemboursements] = useState(initialRemboursements);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous les statuts");

  function approve(index: number) {
    setRemboursements((prev) =>
      prev.map((r, i) =>
        i === index
          ? { ...r, statut: "Remboursé", statutPillClass: "pill-blue", actionnable: false, faded: false }
          : r
      )
    );
  }

  function refuse(index: number) {
    setRemboursements((prev) =>
      prev.map((r, i) =>
        i === index
          ? { ...r, statut: "Refusé", statutPillClass: "pill-gray", actionnable: false, faded: true }
          : r
      )
    );
  }

  const filtered = remboursements.filter((r) => {
    const matchSearch =
      search === "" ||
      r.participant.toLowerCase().includes(search.toLowerCase()) ||
      r.formation.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "Tous les statuts" || r.statut === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/admin/dashboard" className="topbar-back">← Dashboard</Link>
          <div className="topbar-sep"></div>
          <span className="topbar-title">Remboursements & litiges</span>
        </div>
      </div>

      <div className="content">
        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-val" style={{ color: "var(--red)" }}>2</div>
            <div className="stat-card-label">En attente de traitement</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val">5</div>
            <div className="stat-card-label">Traités ce mois</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val" style={{ fontSize: 18 }}>1 680 €</div>
            <div className="stat-card-label">Remboursés ce mois</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val">0</div>
            <div className="stat-card-label">Litiges Stripe ouverts</div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="filters-bar">
          <div className="search-box">
            <span>🔍</span>
            <input
              placeholder="Nom, formation, référence…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>Tous les statuts</option>
            <option>En attente</option>
            <option>Remboursé</option>
            <option>Refusé</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Participant</th>
                <th>Formation</th>
                <th>Motif</th>
                <th>Montant</th>
                <th>Date demande</th>
                <th>Délai annul.</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const originalIndex = remboursements.indexOf(r);
                return (
                  <tr key={r.participant + r.dateDemande} style={{ opacity: r.faded ? 0.6 : 1 }}>
                    <td>
                      <div className="td-name">{r.participant}</div>
                      {r.email && <div className="td-sub">{r.email}</div>}
                    </td>
                    <td>
                      <div className="td-name">{r.formation}</div>
                      <div className="td-sub">{r.dateFormation}</div>
                    </td>
                    <td>{r.motif}</td>
                    <td style={{ fontWeight: 700 }}>{r.montant}</td>
                    <td>{r.dateDemande}</td>
                    <td><span className={`pill ${r.eligibilitePillClass}`}>{r.eligibilite}</span></td>
                    <td><span className={`pill ${r.statutPillClass}`}>{r.statut}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 5 }}>
                        {r.actionnable ? (
                          <>
                            <button
                              className="btn btn-green"
                              onClick={() => approve(originalIndex)}
                            >
                              ✓ Approuver
                            </button>
                            <button
                              className="btn btn-ghost"
                              onClick={() => refuse(originalIndex)}
                            >
                              ✗ Refuser
                            </button>
                          </>
                        ) : (
                          <button className="btn btn-ghost">Voir</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
