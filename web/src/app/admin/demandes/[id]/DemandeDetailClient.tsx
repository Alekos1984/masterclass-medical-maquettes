"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUTS = [
  { key: "EN_ATTENTE", label: "En attente", pillClass: "pill-gray" },
  { key: "CONTACT_HOTEL", label: "Hôtel contacté", pillClass: "pill-orange" },
  { key: "DEVIS_RECU", label: "Devis reçu", pillClass: "pill-blue" },
  { key: "VALIDE", label: "Validé", pillClass: "pill-green" },
  { key: "TRANSMIS_FORMATEUR", label: "Transmis formateur", pillClass: "pill-green" },
  { key: "PAYE", label: "Payé", pillClass: "pill-green" },
] as const;

type DemandeSalleData = {
  id: string;
  statut: string;
  hotelNom: string | null;
  hotelEmail: string | null;
  hotelPhone: string | null;
  emailEnvoye: boolean;
  dateContact: string | null;
  devisHT: number | null;
  fraisGestion: number | null;
  totalHT: number | null;
  devisUrl: string | null;
  dateDevis: string | null;
  notes: string | null;
  createdAt: string;
  formation: {
    id: string;
    titre: string;
    date: string;
    heureDebut: string;
    heureFin: string;
    placesTotal: number;
    lieuVille: string | null;
    lieuNom: string | null;
    specialite: string;
    formateurNom: string;
    formateurEmail: string;
    formateurSpec: string;
    formateurPhone: string | null;
    formateurVille: string | null;
  };
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function fmtFull(d: string) {
  return new Date(d).toLocaleString("fr-FR");
}

export default function DemandeDetailClient({ demande }: { demande: DemandeSalleData }) {
  const router = useRouter();
  const [statut, setStatut] = useState(demande.statut);
  const [hotelNom, setHotelNom] = useState(demande.hotelNom ?? "");
  const [hotelEmail, setHotelEmail] = useState(demande.hotelEmail ?? "");
  const [hotelPhone, setHotelPhone] = useState(demande.hotelPhone ?? "");
  const [devisHT, setDevisHT] = useState(demande.devisHT?.toString() ?? "");
  const [notes, setNotes] = useState(demande.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const f = demande.formation;
  const currentStatut = STATUTS.find((s) => s.key === statut) ?? STATUTS[0];
  const statutIdx = STATUTS.findIndex((s) => s.key === statut);

  async function save(overrides?: Record<string, unknown>) {
    setSaving(true);
    try {
      const payload = {
        hotelNom: hotelNom || undefined,
        hotelEmail: hotelEmail || undefined,
        hotelPhone: hotelPhone || undefined,
        notes: notes || undefined,
        devisHT: devisHT ? Number(devisHT) : undefined,
        fraisGestion: devisHT ? Number(devisHT) * 0.1 : undefined,
        ...overrides,
      };
      const res = await fetch(`/api/admin/demandes/${demande.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json() as { statut: string };
        if (data.statut) setStatut(data.statut);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function changeStatut(next: string) {
    await save({ statut: next });
  }

  const devisHTNum = devisHT ? Number(devisHT) : null;
  const fraisGestion = devisHTNum ? devisHTNum * 0.1 : null;
  const totalHT = devisHTNum && fraisGestion ? devisHTNum + fraisGestion : null;

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/admin/formations" className="topbar-back">← Formations</Link>
          <div className="topbar-sep" />
          <span className="topbar-title">Demande de salle · {f.titre}</span>
        </div>
        <div className="topbar-right" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {saved && <span style={{ fontSize: 12, color: "#2e7d32", fontWeight: 600 }}>✓ Sauvegardé</span>}
          <span className={`pill ${currentStatut.pillClass}`}>{currentStatut.label}</span>
        </div>
      </div>

      <div className="content">
        <div className="page-grid-detail">

          {/* COLONNE GAUCHE */}
          <div>

            {/* INFOS FORMATION */}
            <div className="card card-mb">
              <div className="card-header" style={{ borderBottom: "1px solid var(--light-gray)", paddingBottom: 12 }}>
                <div className="card-title">Formation concernée</div>
                <Link href={`/admin/formations/${f.id}`} className="btn btn-ghost" style={{ fontSize: 11 }}>
                  Voir la formation →
                </Link>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>{f.titre}</div>
                <div className="info-row"><span className="info-key">Date</span><span className="info-val">{fmt(f.date)} · {f.heureDebut}–{f.heureFin}</span></div>
                <div className="info-row"><span className="info-key">Spécialité</span><span className="info-val">{f.specialite}</span></div>
                <div className="info-row"><span className="info-key">Capacité</span><span className="info-val">{f.placesTotal} personnes</span></div>
                {f.lieuVille && <div className="info-row"><span className="info-key">Ville souhaitée</span><span className="info-val">{f.lieuVille}</span></div>}
                <div style={{ borderTop: "1px solid var(--light-gray)", paddingTop: 12, marginTop: 12 }}>
                  <div className="formateur-mini">
                    <div className="formateur-avatar">
                      {f.formateurNom.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="formateur-name">{f.formateurNom}</div>
                      <div className="formateur-spec">{f.formateurSpec}{f.formateurVille ? ` · ${f.formateurVille}` : ""}</div>
                      <div className="formateur-contact">{f.formateurEmail}{f.formateurPhone ? ` · ${f.formateurPhone}` : ""}</div>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: "var(--gray)", marginBottom: 6 }}>Demande reçue le {fmtFull(demande.createdAt)}</div>
                </div>
              </div>
            </div>

            {/* CONTACT HÔTEL */}
            <div className="card card-mb">
              <div className="card-header" style={{ borderBottom: "1px solid var(--light-gray)", paddingBottom: 12 }}>
                <div className="card-title">Contact hôtel / salle</div>
              </div>
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Nom de l'établissement", value: hotelNom, set: setHotelNom, placeholder: "Ex : Hôtel Marriott Lyon" },
                  { label: "Email contact", value: hotelEmail, set: setHotelEmail, placeholder: "events@hotel.fr", type: "email" },
                  { label: "Téléphone", value: hotelPhone, set: setHotelPhone, placeholder: "+33 1 23 45 67 89", type: "tel" },
                ].map(({ label, value, set, placeholder, type }) => (
                  <div key={label}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--gray)", marginBottom: 4 }}>{label}</label>
                    <input
                      type={type ?? "text"}
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder={placeholder}
                      style={{ width: "100%", border: "1.5px solid var(--light-gray)", borderRadius: 8, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--gray)", marginBottom: 4 }}>Notes internes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Accessibilité PMR requise, proximité gare…"
                    rows={3}
                    style={{ width: "100%", border: "1.5px solid var(--light-gray)", borderRadius: 8, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", resize: "vertical" as const, boxSizing: "border-box" as const }}
                  />
                </div>
                <button
                  onClick={() => save()}
                  disabled={saving}
                  className="btn btn-ghost"
                  style={{ fontSize: 13, padding: "9px 0" }}
                >
                  {saving ? "Sauvegarde…" : saved ? "✓ Sauvegardé" : "Sauvegarder le contact"}
                </button>
              </div>
            </div>

            {/* DEVIS */}
            <div className="card card-mb">
              <div className="card-header" style={{ borderBottom: "1px solid var(--light-gray)", paddingBottom: 12 }}>
                <div className="card-title">Devis reçu</div>
                {demande.dateDevis && (
                  <span className="pill pill-green">Reçu le {fmt(demande.dateDevis)}</span>
                )}
              </div>
              <div style={{ marginTop: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--gray)", marginBottom: 4 }}>
                  Montant HT devis (€)
                </label>
                <input
                  type="number"
                  value={devisHT}
                  onChange={(e) => setDevisHT(e.target.value)}
                  placeholder="Ex : 1500"
                  style={{ width: "100%", border: "1.5px solid var(--light-gray)", borderRadius: 8, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const, marginBottom: 12 }}
                />
                {devisHTNum && (
                  <div style={{ background: "var(--off-white)", borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
                    {[
                      ["Devis hôtel HT", `${devisHTNum.toLocaleString("fr-FR")} €`],
                      ["Frais de gestion (10%)", `+ ${fraisGestion!.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`],
                      ["Total formateur", `${totalHT!.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`],
                    ].map(([label, val], i) => (
                      <div key={label} style={{
                        display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: i < 2 ? 5 : 0,
                        ...(i === 2 ? { borderTop: "1px solid #E0E0E0", paddingTop: 8, fontWeight: 700 } : {}),
                      }}>
                        <span style={{ color: i < 2 ? "var(--gray)" : undefined }}>{label}</span>
                        <span style={{ color: i === 1 ? "var(--red)" : undefined }}>{val}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => save({ statut: "DEVIS_RECU" })}
                  disabled={saving || !devisHT}
                  className="btn btn-green"
                  style={{ width: "100%", fontSize: 13, padding: "10px 0", opacity: !devisHT ? 0.5 : 1 }}
                >
                  ✓ Enregistrer le devis &amp; passer à "Devis reçu"
                </button>
              </div>
            </div>

          </div>

          {/* COLONNE DROITE */}
          <div>

            {/* WORKFLOW */}
            <div className="card card-mb">
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Étapes de traitement</div>
              {STATUTS.map((s, i) => {
                const isDone = STATUTS.findIndex((x) => x.key === statut) > i;
                const isCurrent = s.key === statut;
                return (
                  <div key={s.key}>
                    <div className="action-step">
                      <div className={`action-step-num ${isDone ? "step-done" : isCurrent ? "step-active" : "step-todo"}`}>
                        {isDone ? "✓" : i + 1}
                      </div>
                      <div>
                        <div className="action-step-title" style={{ color: isCurrent ? "var(--red)" : undefined }}>
                          {s.label}
                        </div>
                        {isCurrent && (
                          <div className="action-step-sub">Statut actuel</div>
                        )}
                      </div>
                    </div>
                    {i < STATUTS.length - 1 && <div className="step-connector" />}
                  </div>
                );
              })}
            </div>

            {/* ACTIONS DE STATUT */}
            <div className="card card-mb">
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Changer le statut</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {STATUTS.filter((s) => s.key !== statut).map((s) => (
                  <button
                    key={s.key}
                    onClick={() => changeStatut(s.key)}
                    disabled={saving}
                    className="btn btn-ghost"
                    style={{ fontSize: 12, justifyContent: "flex-start", textAlign: "left" as const }}
                  >
                    → {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* INFORMATIONS ACTUELLES */}
            {(demande.hotelNom || demande.devisHT) && (
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Résumé</div>
                {demande.hotelNom && <div className="info-row"><span className="info-key">Hôtel</span><span className="info-val">{demande.hotelNom}</span></div>}
                {demande.hotelEmail && <div className="info-row"><span className="info-key">Email hôtel</span><span className="info-val">{demande.hotelEmail}</span></div>}
                {demande.hotelPhone && <div className="info-row"><span className="info-key">Téléphone</span><span className="info-val">{demande.hotelPhone}</span></div>}
                {demande.devisHT && <div className="info-row"><span className="info-key">Devis HT</span><span className="info-val" style={{ fontWeight: 700 }}>{Number(demande.devisHT).toLocaleString("fr-FR")} €</span></div>}
                {demande.totalHT && <div className="info-row"><span className="info-key">Total formateur</span><span className="info-val" style={{ fontWeight: 700, color: "var(--red)" }}>{Number(demande.totalHT).toLocaleString("fr-FR")} €</span></div>}
                {demande.dateContact && <div className="info-row"><span className="info-key">Hôtel contacté</span><span className="info-val">{fmt(demande.dateContact)}</span></div>}
                {demande.dateDevis && <div className="info-row"><span className="info-key">Devis reçu</span><span className="info-val">{fmt(demande.dateDevis)}</span></div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
