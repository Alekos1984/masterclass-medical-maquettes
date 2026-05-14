"use client";

import Link from "next/link";
import { useState } from "react";

const formations = [
  {
    titre: "Cardiologie interventionnelle — Lyon",
    sous: "Masterclass · 7h · Marriott Lyon",
    formateur: "Dr. P. Dumont",
    specialite: "Cardiologue",
    date: "15 nov. 2026",
    inscrits: "12 / 15",
    revenus: "1 080 €",
    statut: "Publiée",
    pillClass: "pill-green",
  },
  {
    titre: "Échocardiographie — Paris",
    sous: "Atelier · 4h · Hôtel Lutetia",
    formateur: "Dr. S. Bernard",
    specialite: "Cardiologue",
    date: "3 déc. 2026",
    inscrits: "6 / 15",
    revenus: "384 €",
    statut: "Devis reçu",
    pillClass: "pill-orange",
  },
  {
    titre: "Rythmologie — Marseille",
    sous: "Masterclass · 7h · Intercontinental",
    formateur: "Dr. A. Chartier",
    specialite: "Rythmologue",
    date: "8 fév. 2027",
    inscrits: "3 / 15",
    revenus: "234 €",
    statut: "Validée",
    pillClass: "pill-blue",
  },
  {
    titre: "Insuffisance cardiaque — Bordeaux",
    sous: "Masterclass · 7h",
    formateur: "Dr. M. Lefebvre",
    specialite: "Cardiologue",
    date: "Mars 2027",
    inscrits: "—",
    revenus: "—",
    statut: "Brouillon",
    pillClass: "pill-gray",
  },
  {
    titre: "Stenting coronarien — Toulouse",
    sous: "Masterclass · 7h · Novotel Wilson",
    formateur: "Dr. P. Dumont",
    specialite: "Cardiologue",
    date: "14 juin 2026",
    inscrits: "14 / 15",
    revenus: "3 360 €",
    statut: "Archivée",
    pillClass: "pill-gray",
  },
  {
    titre: "Coronarographie — Paris",
    sous: "Masterclass · 7h · Marriott RG",
    formateur: "Dr. P. Dumont",
    specialite: "Cardiologue",
    date: "18 mars 2026",
    inscrits: "15 / 15",
    revenus: "4 800 €",
    statut: "Archivée",
    pillClass: "pill-gray",
  },
];

export default function AdminFormationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous les statuts");

  const filtered = formations.filter((f) => {
    const matchSearch =
      search === "" ||
      f.titre.toLowerCase().includes(search.toLowerCase()) ||
      f.formateur.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "Tous les statuts" || f.statut === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/admin/dashboard" className="topbar-back">← Dashboard</Link>
          <div className="topbar-sep"></div>
          <span className="topbar-title">Toutes les formations</span>
        </div>
        <button className="btn btn-ghost" style={{ fontSize: 12 }}>📥 Exporter CSV</button>
      </div>

      <div className="content">
        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-val">23</div>
            <div className="stat-card-label">Formations actives</div>
            <div className="stat-card-trend trend-up">↑ +3 ce mois</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val">8</div>
            <div className="stat-card-label">Publiées</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val">312</div>
            <div className="stat-card-label">Participants total</div>
            <div className="stat-card-trend trend-up">↑ +47 ce mois</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val" style={{ fontSize: 18 }}>18 640 €</div>
            <div className="stat-card-label">Revenus commissions</div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="filters-bar">
          <div className="search-box">
            <span>🔍</span>
            <input
              placeholder="Titre, formateur, ville…"
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
            <option>Publiée</option>
            <option>Devis reçu</option>
            <option>Validée</option>
            <option>Brouillon</option>
            <option>Archivée</option>
          </select>
          <select className="filter-select">
            <option>Toutes les spécialités</option>
            <option>Cardiologie</option>
            <option>Neurologie</option>
            <option>Oncologie</option>
          </select>
          <select className="filter-select">
            <option>Toutes les dates</option>
            <option>Ce mois</option>
            <option>3 mois</option>
            <option>6 mois</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Formation</th>
                <th>Formateur</th>
                <th>Date</th>
                <th>Inscrits</th>
                <th>Revenus comm.</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.titre}>
                  <td>
                    <div className="td-name">{f.titre}</div>
                    <div className="td-sub">{f.sous}</div>
                  </td>
                  <td>
                    <div className="td-name">{f.formateur}</div>
                    <div className="td-sub">{f.specialite}</div>
                  </td>
                  <td>{f.date}</td>
                  <td>{f.inscrits}</td>
                  <td>{f.revenus}</td>
                  <td><span className={`pill ${f.pillClass}`}>{f.statut}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button className="btn btn-ghost">Voir →</button>
                      {f.statut === "Brouillon" && (
                        <button className="btn btn-red" style={{ fontSize: 11 }}>Valider</button>
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
