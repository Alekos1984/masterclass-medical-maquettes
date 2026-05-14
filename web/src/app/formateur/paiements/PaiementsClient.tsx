"use client";

import { useState } from "react";

type TabId = "revenus" | "salles" | "abonnement" | "factures";

const tabs: { id: TabId; label: string }[] = [
  { id: "revenus", label: "💰 Revenus formations" },
  { id: "salles", label: "🏨 Frais de salle" },
  { id: "abonnement", label: "🔄 Abonnement" },
  { id: "factures", label: "📄 Mes factures" },
];

type PaiementRow = {
  id: string;
  type: string;
  statut: string;
  montantHT: number;
  numeroFacture: string | null;
  factureUrl: string | null;
  datePaiement: string | null;
  formationTitre: string | null;
  formationDate: string | null;
};

type AbonnementInfo = {
  statut: string;
};

interface Props {
  revenus: PaiementRow[];
  sallePaiements: PaiementRow[];
  abonnementPaiements: PaiementRow[];
  factures: PaiementRow[];
  abonnement: AbonnementInfo;
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div
      style={{
        padding: "60px 40px",
        textAlign: "center",
        color: "var(--gray)",
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
        {message}
      </div>
    </div>
  );
}

export default function PaiementsClient({
  revenus,
  sallePaiements,
  abonnementPaiements,
  factures,
  abonnement,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("revenus");

  return (
    <>
      {/* TABS */}
      <div
        style={{
          background: "white",
          border: "1px solid #E0E0E0",
          borderRadius: 10,
          padding: 3,
          display: "flex",
          gap: 2,
          marginBottom: 20,
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1,
              padding: "7px 10px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "center",
              border: "none",
              fontFamily: "inherit",
              background: activeTab === t.id ? "var(--red)" : "transparent",
              color: activeTab === t.id ? "white" : "var(--gray)",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* REVENUS */}
      {activeTab === "revenus" && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Détail par formation</span>
          </div>
          {revenus.length === 0 ? (
            <EmptyState
              icon="💰"
              message="Aucun revenu pour l'instant. Les revenus de vos formations apparaîtront ici."
            />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Formation</th>
                  <th>Montant HT</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {revenus.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {r.formationTitre ?? "—"}
                      </div>
                      {r.formationDate && (
                        <div style={{ fontSize: 11, color: "var(--gray)" }}>
                          {r.formationDate}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {r.montantHT.toLocaleString("fr-FR")} € HT
                    </td>
                    <td>
                      <span
                        className={`pill ${r.statut === "CAPTE" ? "pill-green" : "pill-orange"}`}
                      >
                        {r.statut === "CAPTE" ? "Viré" : "En attente"}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--gray)" }}>
                      {r.datePaiement ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* FRAIS SALLE */}
      {activeTab === "salles" && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Paiements de salle</span>
          </div>
          {sallePaiements.length === 0 ? (
            <EmptyState
              icon="🏨"
              message="Aucun frais de salle enregistré."
            />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Formation</th>
                  <th>Total HT</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Facture</th>
                </tr>
              </thead>
              <tbody>
                {sallePaiements.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {f.formationTitre ?? "—"}
                      </div>
                      {f.formationDate && (
                        <div style={{ fontSize: 11, color: "var(--gray)" }}>
                          {f.formationDate}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {f.montantHT.toLocaleString("fr-FR")} € HT
                    </td>
                    <td>
                      <span
                        className={`pill ${f.statut === "CAPTE" ? "pill-green" : "pill-orange"}`}
                      >
                        {f.statut === "CAPTE" ? "Payé" : "En attente"}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--gray)" }}>
                      {f.datePaiement ?? "—"}
                    </td>
                    <td>
                      {f.factureUrl ? (
                        <a
                          href={f.factureUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            border: "1px solid #E0E0E0",
                            background: "white",
                            borderRadius: 5,
                            padding: "3px 8px",
                            fontSize: 11,
                            cursor: "pointer",
                            textDecoration: "none",
                            color: "var(--black)",
                          }}
                        >
                          ↓ PDF
                        </a>
                      ) : (
                        <span style={{ fontSize: 11, color: "var(--gray)" }}>
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ABONNEMENT */}
      {activeTab === "abonnement" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div
            style={{
              background: "white",
              border: "1px solid #E0E0E0",
              borderRadius: 12,
              padding: "18px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>
                  Formateur Actif
                </div>
                <div style={{ fontSize: 13, color: "var(--gray)", marginTop: 2 }}>
                  20 € HT / mois
                </div>
              </div>
              <span
                className={`pill ${abonnement.statut === "ACTIF" ? "pill-green" : "pill-orange"}`}
              >
                {abonnement.statut === "ACTIF" ? "Actif" : abonnement.statut}
              </span>
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
              <button
                style={{
                  border: "1.5px solid #E0E0E0",
                  background: "white",
                  color: "var(--gray)",
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Changer le moyen de paiement
              </button>
              <button
                style={{
                  background: "#ffebee",
                  color: "#c62828",
                  border: "1.5px solid #ef9a9a",
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Résilier
              </button>
            </div>
          </div>
          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
              Historique abonnement
            </div>
            {abonnementPaiements.length === 0 ? (
              <EmptyState
                icon="🔄"
                message="Aucun paiement d'abonnement enregistré."
              />
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Montant</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {abonnementPaiements.map((h) => (
                    <tr key={h.id}>
                      <td>{h.datePaiement ?? "—"}</td>
                      <td>{h.montantHT.toLocaleString("fr-FR")} € HT</td>
                      <td>
                        <span
                          className={`pill ${h.statut === "CAPTE" ? "pill-green" : "pill-orange"}`}
                        >
                          {h.statut === "CAPTE" ? "Payé" : "En attente"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* FACTURES */}
      {activeTab === "factures" && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Toutes les factures</span>
          </div>
          {factures.length === 0 ? (
            <EmptyState
              icon="📄"
              message="Aucune facture disponible pour l'instant."
            />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>N° Facture</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Montant HT</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {factures.map((f) => (
                  <tr key={f.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 11 }}>
                      {f.numeroFacture ?? "—"}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {f.formationTitre ?? f.type}
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--gray)" }}>
                      {f.datePaiement ?? "—"}
                    </td>
                    <td>{f.montantHT.toLocaleString("fr-FR")} €</td>
                    <td>
                      <span
                        className={`pill ${f.statut === "CAPTE" ? "pill-green" : "pill-orange"}`}
                      >
                        {f.statut === "CAPTE" ? "Payée" : "En attente"}
                      </span>
                    </td>
                    <td>
                      {f.factureUrl ? (
                        <a
                          href={f.factureUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            border: "1px solid #E0E0E0",
                            background: "white",
                            borderRadius: 5,
                            padding: "3px 8px",
                            fontSize: 11,
                            cursor: "pointer",
                            textDecoration: "none",
                            color: "var(--black)",
                          }}
                        >
                          ↓ PDF
                        </a>
                      ) : (
                        <span style={{ fontSize: 11, color: "var(--gray)" }}>
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}
