"use client";

import Link from "next/link";
import { useState } from "react";

type DemandeSalleRow = { id: string; statut: string; hotelNom: string | null } | null;

type FormationRow = {
  id: string;
  titre: string;
  lieuVille: string | null;
  formateurNom: string;
  formateurSpec: string;
  date: string;
  placesTotal: number;
  placesRestantes: number;
  inscrits: number;
  statut: string;
  demandeSalle: DemandeSalleRow;
};

const STATUT_FORMATION: Record<string, { label: string; pillClass: string }> = {
  BROUILLON: { label: "Brouillon", pillClass: "pill-gray" },
  EN_ATTENTE_SALLE: { label: "En attente salle", pillClass: "pill-orange" },
  SALLE_CONFIRMEE: { label: "Salle confirmée", pillClass: "pill-blue" },
  PUBLIEE: { label: "Publiée", pillClass: "pill-green" },
  COMPLETE: { label: "Complète", pillClass: "pill-blue" },
  ANNULEE: { label: "Annulée", pillClass: "pill-gray" },
};

const STATUT_DEMANDE: Record<string, { label: string; color: string }> = {
  EN_ATTENTE: { label: "Demande en attente", color: "#e65100" },
  CONTACT_HOTEL: { label: "Hôtel contacté", color: "#1565c0" },
  DEVIS_RECU: { label: "Devis reçu", color: "#2e7d32" },
  VALIDE: { label: "Validé", color: "#2e7d32" },
  TRANSMIS_FORMATEUR: { label: "Transmis", color: "#2e7d32" },
  PAYE: { label: "Payé", color: "#2e7d32" },
};

export default function FormationsClient({
  formations,
  totalInscriptions,
}: {
  formations: FormationRow[];
  totalInscriptions: number;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");

  const filtered = formations.filter((f) => {
    const matchSearch =
      search === "" ||
      f.titre.toLowerCase().includes(search.toLowerCase()) ||
      f.formateurNom.toLowerCase().includes(search.toLowerCase()) ||
      (f.lieuVille ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (f.demandeSalle?.hotelNom ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "Tous" ||
      f.statut === statusFilter ||
      (statusFilter === "AVEC_DEMANDE" && f.demandeSalle !== null) ||
      (statusFilter === "SANS_DEMANDE" && f.demandeSalle === null);
    return matchSearch && matchStatus;
  });

  const publiees = formations.filter((f) => f.statut === "PUBLIEE").length;
  const avecDemande = formations.filter((f) => f.demandeSalle !== null).length;
  const enAttenteSalle = formations.filter((f) => f.demandeSalle?.statut === "EN_ATTENTE").length;

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/admin/dashboard" className="topbar-back">← Dashboard</Link>
          <div className="topbar-sep" />
          <span className="topbar-title">Formations & demandes de salle</span>
        </div>
        <button className="btn btn-ghost" style={{ fontSize: 12 }}>📥 Exporter CSV</button>
      </div>

      <div className="content">
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
            <div className="stat-card-val" style={{ color: enAttenteSalle > 0 ? "var(--red)" : undefined }}>
              {enAttenteSalle}
            </div>
            <div className="stat-card-label">Demandes à traiter</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val">{totalInscriptions}</div>
            <div className="stat-card-label">Participants total</div>
          </div>
        </div>

        <div className="filters-bar">
          <div className="search-box">
            <span>🔍</span>
            <input
              placeholder="Titre, formateur, ville, hôtel…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="Tous">Tous les statuts</option>
            <option value="PUBLIEE">Publiée</option>
            <option value="EN_ATTENTE_SALLE">En attente salle</option>
            <option value="SALLE_CONFIRMEE">Salle confirmée</option>
            <option value="BROUILLON">Brouillon</option>
            <option value="COMPLETE">Complète</option>
            <option value="ANNULEE">Annulée</option>
            <option value="AVEC_DEMANDE">Avec demande salle</option>
            <option value="SANS_DEMANDE">Sans demande salle</option>
          </select>
        </div>

        <div className="card" style={{ padding: 0 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: "var(--gray)", fontSize: 14 }}>
              {formations.length === 0 ? "Aucune formation créée." : "Aucune formation ne correspond à ces filtres."}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Formation</th>
                  <th>Formateur · Ville</th>
                  <th>Date</th>
                  <th>Places</th>
                  <th>Hôtel</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => {
                  const statut = STATUT_FORMATION[f.statut] ?? { label: f.statut, pillClass: "pill-gray" };
                  const demande = f.demandeSalle;
                  const demandeStatut = demande ? STATUT_DEMANDE[demande.statut] : null;
                  return (
                    <tr key={f.id}>
                      <td>
                        <div className="td-name">{f.titre}</div>
                        {f.lieuVille && <div className="td-sub">📍 {f.lieuVille}</div>}
                      </td>
                      <td>
                        <div className="td-name">{f.formateurNom}</div>
                        <div className="td-sub">{f.formateurSpec}</div>
                      </td>
                      <td style={{ fontSize: 12, whiteSpace: "nowrap" as const }}>{f.date}</td>
                      <td style={{ fontSize: 12 }}>{f.inscrits} / {f.placesTotal}</td>
                      <td style={{ fontSize: 12 }}>
                        {demande ? (
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--black)" }}>
                              {demande.hotelNom ?? <span style={{ fontStyle: "italic", color: "var(--gray)" }}>Non renseigné</span>}
                            </div>
                            {demandeStatut && (
                              <div style={{ fontSize: 11, color: demandeStatut.color, marginTop: 2, fontWeight: 600 }}>
                                {demandeStatut.label}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "var(--gray)", fontStyle: "italic" }}>—</span>
                        )}
                      </td>
                      <td>
                        <span className={`pill ${statut.pillClass}`}>{statut.label}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const }}>
                          <Link href={`/admin/formations/${f.id}`} className="btn btn-ghost" style={{ fontSize: 11 }}>
                            Voir →
                          </Link>
                          {demande && (
                            <Link href={`/admin/demandes/${demande.id}`} className="btn btn-red" style={{ fontSize: 11 }}>
                              Salle →
                            </Link>
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
