"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Paiement = {
  id: string;
  numeroFacture: string | null;
  statut: string;
};

type Inscription = {
  id: string;
  statut: string;
  participantNom: string;
  participantEmail: string;
  paiement: Paiement | null;
  nbEmargements: number;
};

type Formation = {
  id: string;
  titre: string;
  statut: string;
  date: string;
  lieuVille: string | null;
  placesTotal: number;
  placesRestantes: number;
  formateurNom: string;
  formateurEmail: string;
  nbSatisfactions: number;
  nbEmargements: number;
  pvSigne: boolean;
  bilanSigne: boolean;
  emargementSigne: boolean;
  certificatSigne: boolean;
  demandeSalle: { id: string; statut: string; hotelNom: string | null } | null;
  inscriptions: Inscription[];
};

const STATUT_DISPLAY: Record<string, { label: string; pillClass: string }> = {
  BROUILLON: { label: "Brouillon", pillClass: "pill-gray" },
  EN_ATTENTE_SALLE: { label: "En attente salle", pillClass: "pill-orange" },
  SALLE_CONFIRMEE: { label: "Salle confirmée", pillClass: "pill-blue" },
  PUBLIEE: { label: "Publiée", pillClass: "pill-green" },
  COMPLETE: { label: "Complète", pillClass: "pill-blue" },
  ANNULEE: { label: "Annulée", pillClass: "pill-gray" },
};

const INSCRIPTION_STATUT: Record<string, { label: string; pillClass: string }> = {
  EN_ATTENTE: { label: "En attente", pillClass: "pill-orange" },
  CONFIRMEE: { label: "Confirmée", pillClass: "pill-green" },
  ANNULEE: { label: "Annulée", pillClass: "pill-gray" },
  LISTE_ATTENTE: { label: "Liste d'attente", pillClass: "pill-blue" },
};


const STATUT_TRANSITIONS: Record<string, { label: string; next: string; btnClass?: string }[]> = {
  BROUILLON: [{ label: "Publier la formation", next: "PUBLIEE", btnClass: "btn btn-red" }],
  EN_ATTENTE_SALLE: [{ label: "Confirmer la salle", next: "SALLE_CONFIRMEE", btnClass: "btn btn-ghost" }, { label: "Publier", next: "PUBLIEE", btnClass: "btn btn-red" }],
  SALLE_CONFIRMEE: [{ label: "Publier la formation", next: "PUBLIEE", btnClass: "btn btn-red" }],
  PUBLIEE: [{ label: "Marquer complète", next: "COMPLETE", btnClass: "btn btn-ghost" }, { label: "Annuler", next: "ANNULEE", btnClass: "btn btn-warn" }],
  COMPLETE: [],
  ANNULEE: [{ label: "Réactiver (brouillon)", next: "BROUILLON", btnClass: "btn btn-ghost" }],
};

export default function AdminFormationDetailClient({ formation }: { formation: Formation }) {
  const router = useRouter();
  const [changingStatut, setChangingStatut] = useState(false);
  const [currentStatut, setCurrentStatut] = useState(formation.statut);

  const statut = STATUT_DISPLAY[currentStatut] ?? { label: currentStatut, pillClass: "pill-gray" };
  const transitions = STATUT_TRANSITIONS[currentStatut] ?? [];

  async function changeStatut(next: string) {
    setChangingStatut(true);
    try {
      const res = await fetch(`/api/admin/formations/${formation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: next }),
      });
      if (res.ok) {
        setCurrentStatut(next);
        router.refresh();
      }
    } finally {
      setChangingStatut(false);
    }
  }

  const inscrits = formation.placesTotal - formation.placesRestantes;
  const tauxSatisfaction =
    formation.inscriptions.length > 0
      ? Math.round((formation.nbSatisfactions / formation.inscriptions.length) * 100)
      : 0;

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/admin/formations" className="topbar-back">← Formations</Link>
          <div className="topbar-sep"></div>
          <span className="topbar-title">{formation.titre}</span>
        </div>
        <div className="topbar-right" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {transitions.map((t) => (
            <button
              key={t.next}
              className={t.btnClass ?? "btn btn-ghost"}
              disabled={changingStatut}
              onClick={() => changeStatut(t.next)}
            >
              {changingStatut ? "…" : t.label}
            </button>
          ))}
          <span className={`pill ${statut.pillClass}`}>{statut.label}</span>
        </div>
      </div>

      <div className="content">

        <div className="stats-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-card-val">{inscrits}</div>
            <div className="stat-card-label">Inscrits / {formation.placesTotal} places</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val">{tauxSatisfaction}%</div>
            <div className="stat-card-label">Taux satisfaction ({formation.nbSatisfactions} réponses)</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val">{formation.nbEmargements}</div>
            <div className="stat-card-label">Émargements enregistrés</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val">{formation.date}</div>
            <div className="stat-card-label">{formation.lieuVille ?? "Ville non définie"}</div>
          </div>
        </div>

        {/* DOCUMENTS SIGNÉS PAR LE FORMATEUR */}
        <div className="card card-mb" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title">Documents signés par le formateur</div>
            {formation.demandeSalle && (
              <Link href={`/admin/demandes/${formation.demandeSalle.id}`} className="btn btn-ghost" style={{ fontSize: 11 }}>
                🏨 Demande salle →
              </Link>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 8 }}>
            {[
              { label: "Émargement", signed: formation.emargementSigne, href: `/api/pdf/feuille-presence/${formation.id}`, icon: "✅" },
              { label: "PV de formation", signed: formation.pvSigne, href: `/api/pdf/pv-formation/${formation.id}`, icon: "📋" },
              { label: "Bilan pédagogique", signed: formation.bilanSigne, href: `/api/pdf/bilan/${formation.id}`, icon: "📊" },
              { label: "Certificat", signed: formation.certificatSigne, href: `/api/pdf/certificat-realisation/${formation.id}`, icon: "📜" },
            ].map((doc) => (
              doc.signed ? (
                <a
                  key={doc.label}
                  href={doc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                    border: "1.5px solid #c8e6c9", borderRadius: 8, textDecoration: "none",
                    color: "#2e7d32", background: "#f1f8e9",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{doc.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{doc.label}</div>
                    <div style={{ fontSize: 10, color: "#388e3c" }}>Signé · Voir PDF</div>
                  </div>
                </a>
              ) : (
                <div
                  key={doc.label}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                    border: "1.5px solid var(--light-gray)", borderRadius: 8,
                    color: "var(--gray)", opacity: 0.5,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{doc.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{doc.label}</div>
                    <div style={{ fontSize: 10 }}>En attente</div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--light-gray)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="card-title">Participants ({formation.inscriptions.length})</span>
            <span style={{ fontSize: 11, color: "var(--gray)" }}>Formateur : {formation.formateurNom}</span>
          </div>
          {formation.inscriptions.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--gray)", fontSize: 13 }}>
              Aucun participant inscrit.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Statut inscription</th>
                  <th>Émargements</th>
                  <th>Documents</th>
                </tr>
              </thead>
              <tbody>
                {formation.inscriptions.map((ins) => {
                  const insStatut = INSCRIPTION_STATUT[ins.statut] ?? { label: ins.statut, pillClass: "pill-gray" };
                  const canAttestation = ins.statut === "CONFIRMEE";
                  const canFacture = ins.paiement !== null;
                  return (
                    <tr key={ins.id}>
                      <td>
                        <div className="td-name">{ins.participantNom}</div>
                        <div className="td-sub">{ins.participantEmail}</div>
                      </td>
                      <td>
                        <span className={`pill ${insStatut.pillClass}`}>{insStatut.label}</span>
                      </td>
                      <td style={{ fontSize: 12 }}>{ins.nbEmargements}</td>
                      <td>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          <a href={`/api/pdf/convocation/${ins.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: 11, textDecoration: "none" }}>Convoc.</a>
                          <a href={`/api/pdf/convention/${ins.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: 11, textDecoration: "none" }}>Conv.</a>
                          {canAttestation
                            ? <a href={`/api/pdf/attestation/${ins.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: 11, textDecoration: "none" }}>Attest.</a>
                            : <span className="btn btn-ghost" style={{ fontSize: 11, opacity: 0.35, cursor: "not-allowed" }}>Attest.</span>
                          }
                          {canFacture
                            ? <a href={`/api/pdf/facture/${ins.paiement!.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: 11, textDecoration: "none" }}>Facture</a>
                            : <span className="btn btn-ghost" style={{ fontSize: 11, opacity: 0.35, cursor: "not-allowed" }}>Facture</span>
                          }
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
