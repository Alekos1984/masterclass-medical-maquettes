"use client";

import Link from "next/link";
import { useState } from "react";

type FormationRow = {
  id: string;
  titre: string;
  lieuVille: string | null;
  formateurNom: string;
  formateurSpec: string;
  date: string;
  placesTotal: number;
  placesRestantes: number;
  statut: string;
};

const STATUT_DISPLAY: Record<string, { label: string; pillClass: string }> = {
  BROUILLON: { label: "Brouillon", pillClass: "pill-gray" },
  EN_ATTENTE_SALLE: { label: "En attente salle", pillClass: "pill-orange" },
  SALLE_CONFIRMEE: { label: "Salle confirmée", pillClass: "pill-blue" },
  PUBLIEE: { label: "Publiée", pillClass: "pill-green" },
  COMPLETE: { label: "Complète", pillClass: "pill-blue" },
  ANNULEE: { label: "Annulée", pillClass: "pill-gray" },
};

export default function FormationsClient({
  formations,
  totalInscriptions,
}: {
  formations: FormationRow[];
  totalInscriptions: number;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous les statuts");

  const filtered = formations.filter((f) => {
    const matchSearch =
      search === "" ||
      f.titre.toLowerCase().includes(search.toLowerCase()) ||
      f.formateurNom.toLowerCase().includes(search.toLowerCase()) ||
      (f.lieuVille ?? "").toLowerCase().includes(search.toLowerCase());
    const statut = STATUT_DISPLAY[f.statut]?.label ?? f.statut;
    const matchStatus = statusFilter === "Tous les statuts" || statut === statusFilter;
    return matchSearch && matchStatus;
  });

  const publiees = formations.filter((f) => f.statut === "PUBLIEE").length;

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
            <div className="stat-card-val">{formations.length}</div>
            <div className="stat-card-label">Formations totales</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val">{publiees}</div>
            <div className="stat-card-label">Publiées</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val">{totalInscriptions}</div>
            <div className="stat-card-label">Participants total</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val">{formations.filter((f) => f.statut === "BROUILLON").length}</div>
            <div className="stat-card-label">Brouillons</div>
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
            <option>En attente salle</option>
            <option>Salle confirmée</option>
            <option>Brouillon</option>
            <option>Complète</option>
            <option>Annulée</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="card" style={{ padding: 0 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: "var(--gray)", fontSize: 14 }}>
              {formations.length === 0
                ? "Aucune formation créée pour l'instant."
                : "Aucune formation ne correspond à ces filtres."}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Formation</th>
                  <th>Formateur</th>
                  <th>Date</th>
                  <th>Places</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => {
                  const statut = STATUT_DISPLAY[f.statut] ?? { label: f.statut, pillClass: "pill-gray" };
                  const inscrits = f.placesTotal - f.placesRestantes;
                  return (
                    <tr key={f.id}>
                      <td>
                        <div className="td-name">{f.titre}</div>
                        <div className="td-sub">{f.lieuVille ?? "Lieu non défini"}</div>
                      </td>
                      <td>
                        <div className="td-name">{f.formateurNom}</div>
                        <div className="td-sub">{f.formateurSpec}</div>
                      </td>
                      <td>{f.date}</td>
                      <td>{inscrits} / {f.placesTotal}</td>
                      <td><span className={`pill ${statut.pillClass}`}>{statut.label}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button className="btn btn-ghost">Voir →</button>
                          {f.statut === "EN_ATTENTE_SALLE" && (
                            <button className="btn btn-red" style={{ fontSize: 11 }}>Traiter</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
