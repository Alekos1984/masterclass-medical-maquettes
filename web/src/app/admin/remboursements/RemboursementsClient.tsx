"use client";

import { useState } from "react";
import Link from "next/link";

export type RemboursementRow = {
  id: string;
  participantNom: string;
  email: string | null;
  formationTitre: string;
  formationVille: string | null;
  dateFormation: string;
  motif: string;
  montant: string;
  dateDemande: string;
  eligible: boolean;
  statut: string;
};

type Props = {
  remboursements: RemboursementRow[];
  enAttenteCount: number;
};

function statutPill(statut: string): { label: string; pillClass: string } {
  switch (statut) {
    case "EN_ATTENTE": return { label: "En attente", pillClass: "pill-orange" };
    case "APPROUVE": return { label: "Approuvé", pillClass: "pill-blue" };
    case "REFUSE": return { label: "Refusé", pillClass: "pill-gray" };
    case "EFFECTUE": return { label: "Remboursé", pillClass: "pill-blue" };
    default: return { label: statut, pillClass: "pill-gray" };
  }
}

export default function RemboursementsClient({ remboursements, enAttenteCount }: Props) {
  const [rows, setRows] = useState(remboursements);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous les statuts");

  function updateStatut(id: string, statut: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, statut } : r)));
  }

  const filtered = rows.filter((r) => {
    const matchSearch =
      search === "" ||
      r.participantNom.toLowerCase().includes(search.toLowerCase()) ||
      r.formationTitre.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "Tous les statuts" ||
      statutPill(r.statut).label === statusFilter;
    return matchSearch && matchStatus;
  });

  const displayedEnAttente = rows.filter((r) => r.statut === "EN_ATTENTE").length;

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
            <div className="stat-card-val" style={{ color: displayedEnAttente > 0 ? "var(--red)" : undefined }}>
              {displayedEnAttente}
            </div>
            <div className="stat-card-label">En attente de traitement</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val">{rows.length}</div>
            <div className="stat-card-label">Total demandes</div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="filters-bar">
          <div className="search-box">
            <span>🔍</span>
            <input
              placeholder="Nom, formation…"
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
            <option>Approuvé</option>
            <option>Remboursé</option>
            <option>Refusé</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="card" style={{ padding: 0 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: "var(--gray)", fontSize: 14 }}>
              Aucune demande de remboursement pour l&apos;instant.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Formation</th>
                  <th>Motif</th>
                  <th>Montant</th>
                  <th>Date demande</th>
                  <th>Éligibilité</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const pill = statutPill(r.statut);
                  const isActionnable = r.statut === "EN_ATTENTE";
                  const isFaded = r.statut === "REFUSE";
                  return (
                    <tr key={r.id} style={{ opacity: isFaded ? 0.6 : 1 }}>
                      <td>
                        <div className="td-name">{r.participantNom}</div>
                        {r.email && <div className="td-sub">{r.email}</div>}
                      </td>
                      <td>
                        <div className="td-name">{r.formationTitre}</div>
                        <div className="td-sub">{r.dateFormation}{r.formationVille ? ` — ${r.formationVille}` : ""}</div>
                      </td>
                      <td>{r.motif}</td>
                      <td style={{ fontWeight: 700 }}>{r.montant}</td>
                      <td>{r.dateDemande}</td>
                      <td>
                        <span className={`pill ${r.eligible ? "pill-green" : "pill-red"}`}>
                          {r.eligible ? "✓ Éligible" : "✗ Non éligible"}
                        </span>
                      </td>
                      <td><span className={`pill ${pill.pillClass}`}>{pill.label}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 5 }}>
                          {isActionnable ? (
                            <>
                              <button
                                className="btn btn-green"
                                onClick={() => updateStatut(r.id, "APPROUVE")}
                              >
                                ✓ Approuver
                              </button>
                              <button
                                className="btn btn-ghost"
                                onClick={() => updateStatut(r.id, "REFUSE")}
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
          )}
        </div>
      </div>
    </>
  );
}
