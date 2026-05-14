"use client";

import { useState } from "react";
import Link from "next/link";

type FormateurRow = {
  id: string;
  nom: string;
  email: string;
  specialite: string;
  formations: number;
  statutAbonnement: string;
  inscription: string;
};

function abonnementDisplay(statut: string): { label: string; pillClass: string; impaye: boolean } {
  switch (statut) {
    case "ACTIF":
      return { label: "Actif · 20€/mois", pillClass: "pill-green", impaye: false };
    case "SUSPENDU":
      return { label: "⚠ Impayé", pillClass: "pill-red", impaye: true };
    case "RESILIE":
      return { label: "Résilié", pillClass: "pill-gray", impaye: false };
    default:
      return { label: "Inactif", pillClass: "pill-gray", impaye: false };
  }
}

export default function FormateursClient({ formateurs }: { formateurs: FormateurRow[] }) {
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
      (statusFilter === "Actif" && f.statutAbonnement === "ACTIF") ||
      (statusFilter === "Impayé" && f.statutAbonnement === "SUSPENDU") ||
      (statusFilter === "Inactif" && (f.statutAbonnement === "INACTIF" || f.statutAbonnement === "RESILIE"));
    return matchSearch && matchStatus;
  });

  const actifs = formateurs.filter((f) => f.statutAbonnement === "ACTIF").length;
  const impayes = formateurs.filter((f) => f.statutAbonnement === "SUSPENDU").length;

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
            <div className="stat-card-val">{formateurs.length}</div>
            <div className="stat-card-label">Total formateurs</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val">{actifs}</div>
            <div className="stat-card-label">Abonnements actifs</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val" style={{ color: impayes > 0 ? "var(--red)" : undefined }}>{impayes}</div>
            <div className="stat-card-label">Impayés</div>
            {impayes > 0 && <div className="stat-card-trend trend-warn">⚠ Action requise</div>}
          </div>
          <div className="stat-card">
            <div className="stat-card-val">{formateurs.length - actifs}</div>
            <div className="stat-card-label">Sans abonnement actif</div>
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
        </div>

        {/* TABLE */}
        <div className="card" style={{ padding: 0 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: "var(--gray)", fontSize: 14 }}>
              {formateurs.length === 0
                ? "Aucun formateur inscrit pour l'instant."
                : "Aucun formateur ne correspond à ces filtres."}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Formateur</th>
                  <th>Spécialité</th>
                  <th>Formations</th>
                  <th>Abonnement</th>
                  <th>Inscription</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => {
                  const abo = abonnementDisplay(f.statutAbonnement);
                  return (
                    <tr key={f.id}>
                      <td>
                        <div className="td-name">{f.nom}</div>
                        <div className="td-sub">{f.email}</div>
                      </td>
                      <td>{f.specialite}</td>
                      <td>{f.formations}</td>
                      <td><span className={`pill ${abo.pillClass}`}>{abo.label}</span></td>
                      <td>{f.inscription}</td>
                      <td>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button className="btn btn-ghost">Voir</button>
                          {abo.impaye && (
                            <button className="btn btn-warn">Relancer</button>
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
