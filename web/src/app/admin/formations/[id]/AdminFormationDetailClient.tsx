"use client";

import Link from "next/link";

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

const PDF_BUTTONS = [
  { label: "Programme", href: (id: string) => `/api/pdf/programme/${id}` },
  { label: "Questionnaire", href: (id: string) => `/api/pdf/questionnaire/${id}` },
  { label: "Affiche A4", href: (id: string) => `/api/pdf/affiche/${id}` },
  { label: "Affiche IA", href: (id: string) => `/api/pdf/affiche/${id}?ai=true` },
  { label: "Feuille présence", href: (id: string) => `/api/pdf/feuille-presence/${id}` },
  { label: "PV formation", href: (id: string) => `/api/pdf/pv-formation/${id}` },
  { label: "Bilan", href: (id: string) => `/api/pdf/bilan/${id}` },
  { label: "Bilan IA", href: (id: string) => `/api/pdf/bilan/${id}?ai=true` },
];

export default function AdminFormationDetailClient({ formation }: { formation: Formation }) {
  const statut = STATUT_DISPLAY[formation.statut] ?? { label: formation.statut, pillClass: "pill-gray" };
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
        <div className="topbar-right">
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

        <div className="card card-mb" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title">Documents à générer</div>
            <span style={{ fontSize: 11, color: "var(--gray)" }}>Ouvre dans un nouvel onglet</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
            {PDF_BUTTONS.map((btn) => (
              <a
                key={btn.label}
                href={btn.href(formation.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
                style={{ fontSize: 12, textDecoration: "none" }}
              >
                📄 {btn.label}
              </a>
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
                          <a
                            href={`/api/pdf/convention/${ins.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost"
                            style={{ fontSize: 11, textDecoration: "none" }}
                          >
                            Conv.
                          </a>
                          {canAttestation ? (
                            <a
                              href={`/api/pdf/attestation/${ins.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-ghost"
                              style={{ fontSize: 11, textDecoration: "none" }}
                            >
                              Attest.
                            </a>
                          ) : (
                            <span
                              className="btn btn-ghost"
                              style={{ fontSize: 11, opacity: 0.4, cursor: "not-allowed" }}
                            >
                              Attest.
                            </span>
                          )}
                          {canFacture ? (
                            <a
                              href={`/api/pdf/facture/${ins.paiement!.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-ghost"
                              style={{ fontSize: 11, textDecoration: "none" }}
                            >
                              Facture
                            </a>
                          ) : (
                            <span
                              className="btn btn-ghost"
                              style={{ fontSize: 11, opacity: 0.4, cursor: "not-allowed" }}
                            >
                              Facture
                            </span>
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
