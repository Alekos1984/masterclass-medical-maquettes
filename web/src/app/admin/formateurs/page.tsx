"use client";

import { useState } from "react";
import Link from "next/link";

const formateurs = [
  {
    nom: "Dr. Pierre Dumont",
    email: "pierre.dumont@chu-lyon.fr",
    specialite: "Cardiologie",
    formations: 4,
    revenus: "13 500 € HT",
    abonnement: "Actif · 20€/mois",
    pillClass: "pill-green",
    inscription: "1 juil. 2026",
  },
  {
    nom: "Dr. Sophie Bernard",
    email: "s.bernard@chu-paris.fr",
    specialite: "Cardiologie",
    formations: 2,
    revenus: "6 400 € HT",
    abonnement: "Actif · 20€/mois",
    pillClass: "pill-green",
    inscription: "15 août 2026",
  },
  {
    nom: "Dr. Marc Lefebvre",
    email: "m.lefebvre@hopital-lille.fr",
    specialite: "Cardiologie",
    formations: 3,
    revenus: "4 200 € HT",
    abonnement: "⚠ Impayé · oct. 2026",
    pillClass: "pill-red",
    inscription: "5 sept. 2026",
    impaye: true,
  },
  {
    nom: "Dr. Anne Chartier",
    email: "a.chartier@chu-marseille.fr",
    specialite: "Rythmologie",
    formations: 1,
    revenus: "1 560 € HT",
    abonnement: "1ère formation (gratuit)",
    pillClass: "pill-blue",
    inscription: "2 oct. 2026",
  },
  {
    nom: "Dr. Thomas Moreau",
    email: "t.moreau@chub-bordeaux.fr",
    specialite: "Médecine interne",
    formations: 2,
    revenus: "3 800 € HT",
    abonnement: "Actif · 20€/mois",
    pillClass: "pill-green",
    inscription: "20 sept. 2026",
  },
];

export default function AdminFormateursPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous les abonnements");

  const filtered = formateurs.filter((f) => {
    const matchSearch =
      search === "" ||
      f.nom.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      f.specialite.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "Tous les abonnements" ||
      (statusFilter === "Actif" && f.pillClass === "pill-green") ||
      (statusFilter === "Impayé" && f.pillClass === "pill-red") ||
      (statusFilter === "Inactif" && f.pillClass === "pill-gray");
    return matchSearch && matchStatus;
  });

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/admin/dashboard" className="topbar-back">← Dashboard</Link>
          <div className="topbar-sep"></div>
          <span className="topbar-title">Formateurs</span>
        </div>
        <button className="btn btn-ghost" style={{ fontSize: 12 }}>📥 Export CSV</button>
      </div>

      <div className="content">
        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-val">41</div>
            <div className="stat-card-label">Total formateurs</div>
            <div className="stat-card-trend trend-up">↑ +5 ce mois</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val">34</div>
            <div className="stat-card-label">Abonnements actifs</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val" style={{ color: "var(--red)" }}>4</div>
            <div className="stat-card-label">Impayés</div>
            <div className="stat-card-trend trend-warn">⚠ Action requise</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val">3</div>
            <div className="stat-card-label">Nouvelles inscriptions</div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="filters-bar">
          <div className="search-box">
            <span>🔍</span>
            <input
              placeholder="Nom, email, spécialité…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>Tous les abonnements</option>
            <option>Actif</option>
            <option>Impayé</option>
            <option>Inactif</option>
          </select>
          <select className="filter-select">
            <option>Toutes les spécialités</option>
            <option>Cardiologie</option>
            <option>Neurologie</option>
            <option>Autre</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Formateur</th>
                <th>Spécialité</th>
                <th>Formations</th>
                <th>Revenus générés</th>
                <th>Abonnement</th>
                <th>Inscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.email}>
                  <td>
                    <div className="td-name">{f.nom}</div>
                    <div className="td-sub">{f.email}</div>
                  </td>
                  <td>{f.specialite}</td>
                  <td>{f.formations}</td>
                  <td>{f.revenus}</td>
                  <td><span className={`pill ${f.pillClass}`}>{f.abonnement}</span></td>
                  <td>{f.inscription}</td>
                  <td>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button className="btn btn-ghost">Voir</button>
                      {f.impaye && (
                        <button className="btn btn-warn">Relancer</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
