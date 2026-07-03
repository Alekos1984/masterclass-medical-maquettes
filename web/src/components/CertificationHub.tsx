"use client";

import { useEffect, useMemo, useState } from "react";
import { SPECIALITES_OPTIONS } from "@/lib/specialites";
import {
  calculerPeriode,
  progressionPeriode,
  type CertifBloc,
  type CertifJustificatif,
} from "@/lib/certification";

type Tab = "referentiel" | "documents" | "progression" | "infos";

type ApiData = {
  compte: { specialite: string | null; anneeDES: number | null };
  blocs: CertifBloc[];
  justificatifs: CertifJustificatif[];
};

const TABS: { key: Tab; label: string }[] = [
  { key: "referentiel", label: "📖 Référentiel" },
  { key: "documents", label: "📁 Mes documents" },
  { key: "progression", label: "📊 Ma progression" },
  { key: "infos", label: "💡 À savoir" },
];

// Règle de l'arrêté : les actions comptées au sein d'un même bloc doivent être distinctes
function nbActionsDistinctes(justifs: CertifJustificatif[]): number {
  return new Set(justifs.map((j) => j.actionTitre.trim().toLowerCase())).size;
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polar(cx, cy, r, endAngle);
  const end = polar(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export default function CertificationHub() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("referentiel");
  const [savingCompte, setSavingCompte] = useState(false);

  // Formulaire d'ajout de justificatif
  const [addOpen, setAddOpen] = useState<string | null>(null); // blocCode ou null
  const [addTitre, setAddTitre] = useState("");
  const [addType, setAddType] = useState("");
  const [addDate, setAddDate] = useState("");
  const [addFichierNom, setAddFichierNom] = useState("");
  const [addFichierBase64, setAddFichierBase64] = useState("");
  const [addSaving, setAddSaving] = useState(false);

  useEffect(() => {
    fetch("/api/certification")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const justifsParBloc = useMemo(() => {
    const map: Record<string, CertifJustificatif[]> = {};
    for (const j of data?.justificatifs ?? []) {
      (map[j.blocCode] ??= []).push(j);
    }
    return map;
  }, [data]);

  const periode = data?.compte.anneeDES ? calculerPeriode(data.compte.anneeDES) : null;

  async function patchCompte(payload: { specialite?: string; anneeDES?: number | null }) {
    setSavingCompte(true);
    try {
      const res = await fetch("/api/certification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        // Recharge tout : les actions du référentiel dépendent de la spécialité
        const refreshed = await fetch("/api/certification").then((r) => r.json());
        setData(refreshed);
      }
    } finally {
      setSavingCompte(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Fichier trop volumineux (max 10 Mo)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAddFichierBase64(result.split(",")[1] ?? "");
      setAddFichierNom(file.name);
    };
    reader.readAsDataURL(file);
  }

  async function submitJustificatif() {
    if (!addOpen || !addTitre.trim()) {
      alert("Indiquez l'intitulé de l'action réalisée.");
      return;
    }
    setAddSaving(true);
    try {
      const res = await fetch("/api/certification/justificatifs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blocCode: addOpen,
          actionTitre: addTitre,
          typeDocument: addType || undefined,
          dateAction: addDate || undefined,
          fichierNom: addFichierNom || undefined,
          fichierBase64: addFichierBase64 || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error ?? "Erreur lors de l'ajout");
        return;
      }
      // Recharge la liste
      const refreshed = await fetch("/api/certification").then((r) => r.json());
      setData(refreshed);
      setAddOpen(null);
      setAddTitre(""); setAddType(""); setAddDate(""); setAddFichierNom(""); setAddFichierBase64("");
    } catch {
      alert("Erreur réseau");
    } finally {
      setAddSaving(false);
    }
  }

  async function deleteJustificatif(id: string) {
    if (!confirm("Supprimer ce justificatif ?")) return;
    const res = await fetch(`/api/certification/justificatifs/${id}`, { method: "DELETE" });
    if (res.ok) {
      setData((d) => (d ? { ...d, justificatifs: d.justificatifs.filter((j) => j.id !== id) } : d));
    } else {
      const d = await res.json();
      alert(d.error ?? "Erreur");
    }
  }

  const inputStyle: React.CSSProperties = {
    border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "8px 12px",
    fontSize: 13, fontFamily: "inherit", outline: "none", background: "white", color: "#0F0F0F",
  };

  if (loading) {
    return <div style={{ padding: 60, textAlign: "center", color: "#6A6A6A", fontSize: 14 }}>Chargement…</div>;
  }
  if (!data) {
    return <div style={{ padding: 60, textAlign: "center", color: "#c62828", fontSize: 14 }}>Erreur de chargement. Rechargez la page.</div>;
  }

  const totalActions = data.blocs.reduce((s, b) => s + b.actionsRequises, 0);
  const totalFaites = data.blocs.reduce(
    (s, b) => s + Math.min(nbActionsDistinctes(justifsParBloc[b.code] ?? []), b.actionsRequises),
    0
  );

  return (
    <div>
      {/* EN-TÊTE */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C8102E", marginBottom: 6 }}>
          Certification périodique
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#0F0F0F", letterSpacing: "-0.5px", marginBottom: 4 }}>
          Votre hub certification
        </div>
        <div style={{ fontSize: 14, color: "#6A6A6A", lineHeight: 1.5, maxWidth: 720 }}>
          Suivez votre obligation de certification périodique : comprenez le référentiel, centralisez vos
          justificatifs et visualisez ce qu&apos;il vous reste à accomplir sur la période.
        </div>
      </div>

      {/* PROFIL CERTIFICATION */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid #E0E0E0", padding: "18px 24px", marginBottom: 20, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "#0F0F0F" }}>
            Votre spécialité
          </label>
          <select
            value={data.compte.specialite ?? ""}
            onChange={(e) => patchCompte({ specialite: e.target.value })}
            disabled={savingCompte}
            style={{ ...inputStyle, width: "100%" }}
          >
            {SPECIALITES_OPTIONS}
          </select>
        </div>
        <div style={{ minWidth: 200 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "#0F0F0F" }}>
            Année de validation du DES
          </label>
          <input
            type="number"
            placeholder="Ex : 2018"
            min={1950}
            max={new Date().getFullYear() + 1}
            defaultValue={data.compte.anneeDES ?? ""}
            onBlur={(e) => {
              const v = e.target.value ? parseInt(e.target.value) : null;
              if (v !== data.compte.anneeDES) patchCompte({ anneeDES: v });
            }}
            style={{ ...inputStyle, width: 160 }}
          />
        </div>
        {periode && (
          <div style={{ background: "#F9F7F4", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#0F0F0F" }}>
            Période en cours : <strong>{periode.debut} → {periode.fin}</strong>
            {periode.premierePeriodeTransitoire && (
              <span style={{ color: "#6A6A6A" }}> (1ʳᵉ période transitoire de 9 ans)</span>
            )}
          </div>
        )}
      </div>

      {/* ONGLETS */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, borderBottom: "1px solid #E0E0E0", flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              background: "transparent", border: "none", fontFamily: "inherit", cursor: "pointer",
              padding: "10px 16px", fontSize: 14, fontWeight: activeTab === t.key ? 700 : 500,
              color: activeTab === t.key ? "#C8102E" : "#6A6A6A",
              borderBottom: activeTab === t.key ? "3px solid #C8102E" : "3px solid transparent",
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ RÉFÉRENTIEL ═══ */}
      {activeTab === "referentiel" && (
        <div>
          {data.compte.specialite && !data.blocs.some((b) => b.actions.some((a) => a.specialite)) && (
            <div style={{ background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: 12, padding: "14px 18px", marginBottom: 18, fontSize: 13, color: "#5d4037", lineHeight: 1.6 }}>
              ⚠️ Aucun référentiel spécifique trouvé pour « {data.compte.specialite} ». Re-sélectionnez votre
              spécialité dans la liste ci-dessus pour charger les actions officielles de votre CNP.
            </div>
          )}
          <div style={{ fontSize: 13, color: "#6A6A6A", marginBottom: 18, lineHeight: 1.6 }}>
            La certification périodique repose sur <strong>4 blocs</strong>. Sur chaque période, vous devez réaliser au moins{" "}
            <strong>2 actions par bloc</strong> — et les 2 actions d&apos;un même bloc doivent être{" "}
            <strong>différentes</strong> (arrêté du 26 février 2026). Le référentiel de base est commun à toutes les
            spécialités ; votre Conseil National Professionnel (CNP) le décline pour{" "}
            {data.compte.specialite ? <strong>{data.compte.specialite}</strong> : "votre spécialité"}.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
            {data.blocs.map((bloc) => {
              const actionsSpe = bloc.actions.filter((a) => a.specialite);
              return (
                <div key={bloc.code} style={{ background: "white", borderRadius: 16, border: "1px solid #E0E0E0", borderTop: `4px solid ${bloc.couleur}`, padding: "22px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 26 }}>{bloc.emoji}</div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: bloc.couleur }}>
                        Bloc {bloc.ordre}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#0F0F0F", lineHeight: 1.3 }}>{bloc.titre}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "#6A6A6A", lineHeight: 1.6, marginBottom: 14 }}>{bloc.description}</div>

                  {actionsSpe.length > 0 ? (
                    <>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: bloc.couleur, marginBottom: 8 }}>
                        Actions validantes — {data.compte.specialite} ({actionsSpe.length})
                      </div>
                      <ul style={{ margin: "0 0 14px", paddingLeft: 0, listStyle: "none", maxHeight: 300, overflowY: "auto", border: "1px solid #F0EDE8", borderRadius: 10, padding: "6px 12px" }}>
                        {actionsSpe.map((a) => (
                          <li key={a.id} style={{ fontSize: 13, color: "#0F0F0F", padding: "6px 0", display: "flex", gap: 8, lineHeight: 1.45, borderBottom: "1px solid #F5F5F5" }}>
                            <span style={{ color: bloc.couleur, flexShrink: 0 }}>✓</span>
                            <span>
                              {a.titre}
                              {a.typeJustificatif && (
                                <span style={{ display: "block", fontSize: 11, color: "#9A9A9A", marginTop: 1 }}>📄 {a.typeJustificatif}</span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "#6A6A6A", marginBottom: 8 }}>
                        Exemples d&apos;actions (base commune)
                      </div>
                      <ul style={{ margin: "0 0 14px", paddingLeft: 0, listStyle: "none" }}>
                        {(bloc.exemples as string[]).map((ex, i) => (
                          <li key={i} style={{ fontSize: 13, color: "#0F0F0F", padding: "4px 0", display: "flex", gap: 8, lineHeight: 1.45 }}>
                            <span style={{ color: bloc.couleur, flexShrink: 0 }}>✓</span> {ex}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "#6A6A6A", marginBottom: 8 }}>
                    Justificatifs acceptés
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {(bloc.justificatifs as string[]).map((j, i) => (
                      <span key={i} style={{ fontSize: 11, fontWeight: 600, background: "#F9F7F4", color: "#444", padding: "4px 10px", borderRadius: 100, border: "1px solid #EBEBEB" }}>
                        📄 {j}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ MES DOCUMENTS ═══ */}
      {activeTab === "documents" && (
        <div>
          <div style={{ fontSize: 13, color: "#6A6A6A", marginBottom: 18, lineHeight: 1.6 }}>
            Centralisez ici tous vos justificatifs. Les formations certifiantes réalisées sur la plateforme sont
            ajoutées <strong>automatiquement</strong> ✨. Pour le reste (congrès, DU, visite médicale…), importez vos documents.
          </div>
          {data.blocs.map((bloc) => {
            const justifs = justifsParBloc[bloc.code] ?? [];
            const nbValides = Math.min(nbActionsDistinctes(justifs), bloc.actionsRequises);
            const complet = nbValides >= bloc.actionsRequises;
            return (
              <div key={bloc.code} style={{ background: "white", borderRadius: 16, border: "1px solid #E0E0E0", marginBottom: 16, overflow: "hidden" }}>
                <div style={{ padding: "16px 22px", borderBottom: "1px solid #EBEBEB", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{bloc.emoji}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#0F0F0F" }}>{bloc.titre}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 100,
                      background: complet ? "#e8f5e9" : "#fff3e0", color: complet ? "#2e7d32" : "#e65100",
                    }}>
                      {complet ? "✓ Bloc complet" : `${nbValides}/${bloc.actionsRequises} action${nbValides > 1 ? "s" : ""} justifiée${nbValides > 1 ? "s" : ""}`}
                    </span>
                    <button
                      onClick={() => { setAddOpen(addOpen === bloc.code ? null : bloc.code); setAddType(""); }}
                      style={{ background: "#fff5f6", color: "#C8102E", border: "1.5px solid #C8102E", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      + Ajouter
                    </button>
                  </div>
                </div>

                {/* Formulaire d'ajout */}
                {addOpen === bloc.code && (
                  <div style={{ padding: "16px 22px", background: "#F9F7F4", borderBottom: "1px solid #EBEBEB" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                      <input
                        type="text"
                        placeholder="Intitulé de l'action (ex : Congrès SFC 2026)"
                        value={addTitre}
                        onChange={(e) => setAddTitre(e.target.value)}
                        style={inputStyle}
                      />
                      <select value={addType} onChange={(e) => setAddType(e.target.value)} style={inputStyle}>
                        <option value="">Type de document…</option>
                        {(bloc.justificatifs as string[]).map((j, i) => <option key={i} value={j}>{j}</option>)}
                        <option value="Autre">Autre</option>
                      </select>
                      <input type="date" value={addDate} onChange={(e) => setAddDate(e.target.value)} style={inputStyle} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={onFileChange} style={{ fontSize: 12, fontFamily: "inherit" }} />
                      {addFichierNom && <span style={{ fontSize: 12, color: "#2e7d32", fontWeight: 600 }}>✓ {addFichierNom}</span>}
                      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                        <button
                          onClick={() => setAddOpen(null)}
                          style={{ background: "transparent", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#444" }}
                        >
                          Annuler
                        </button>
                        <button
                          onClick={submitJustificatif}
                          disabled={addSaving}
                          style={{ background: addSaving ? "#999" : "#C8102E", color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: addSaving ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                        >
                          {addSaving ? "Enregistrement…" : "💾 Enregistrer"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Liste des justificatifs + emplacements vides */}
                <div>
                  {justifs.map((j) => (
                    <div key={j.id} style={{ padding: "13px 22px", borderBottom: "1px solid #F5F5F5", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 17, flexShrink: 0 }}>{j.source === "PLATEFORME" ? "✨" : "📎"}</span>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0F0F0F" }}>{j.actionTitre}</div>
                        <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 2 }}>
                          {j.typeDocument ?? "Document"}
                          {j.dateAction && ` · ${new Date(j.dateAction).toLocaleDateString("fr-FR")}`}
                          {j.source === "PLATEFORME" && " · Ajouté automatiquement par la plateforme"}
                        </div>
                      </div>
                      {(j.url || j.hasFichier) && (
                        <a
                          href={j.url ?? `/api/certification/justificatifs/${j.id}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: 12, fontWeight: 700, color: "#C8102E", textDecoration: "none", border: "1.5px solid #C8102E", borderRadius: 8, padding: "5px 12px" }}
                        >
                          📄 Voir
                        </a>
                      )}
                      {!j.url && !j.hasFichier && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#e65100", background: "#fff3e0", padding: "4px 10px", borderRadius: 100 }}>
                          ⚠️ Document manquant
                        </span>
                      )}
                      {j.source === "UPLOAD" && (
                        <button
                          onClick={() => deleteJustificatif(j.id)}
                          title="Supprimer"
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#6A6A6A", padding: 4 }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, bloc.actionsRequises - justifs.length) }).map((_, i) => (
                    <div key={`empty-${i}`} style={{ padding: "13px 22px", borderBottom: "1px solid #F5F5F5", display: "flex", alignItems: "center", gap: 12, opacity: 0.65 }}>
                      <span style={{ fontSize: 17 }}>⬜</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#6A6A6A" }}>
                          Action {justifs.length + i + 1} — à réaliser
                        </div>
                        <div style={{ fontSize: 11, color: "#9A9A9A", marginTop: 2 }}>
                          Justificatif attendu : {(bloc.justificatifs as string[])[0] ?? "attestation"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ MA PROGRESSION ═══ */}
      {activeTab === "progression" && (
        <div>
          {!periode && (
            <div style={{ background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: 12, padding: "16px 20px", marginBottom: 20, fontSize: 13, color: "#5d4037", lineHeight: 1.6 }}>
              ⏱ <strong>Renseignez votre année de validation du DES</strong> (en haut de page) pour afficher votre
              timeline de certification.
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 28, alignItems: "center", background: "white", borderRadius: 16, border: "1px solid #E0E0E0", padding: "28px 32px", marginBottom: 20, flexWrap: "wrap" }}>
            {/* Cercle 4 quarts */}
            <svg width="220" height="220" viewBox="0 0 220 220">
              {data.blocs.map((bloc, i) => {
                const justifs = justifsParBloc[bloc.code] ?? [];
                const completion = Math.min(nbActionsDistinctes(justifs) / bloc.actionsRequises, 1);
                const start = i * 90 + 3;
                const spanMax = 84;
                return (
                  <g key={bloc.code}>
                    <path
                      d={arcPath(110, 110, 82, start, start + spanMax)}
                      stroke={bloc.couleur}
                      strokeOpacity={0.15}
                      strokeWidth={26}
                      fill="none"
                      strokeLinecap="round"
                    />
                    {completion > 0 && (
                      <path
                        d={arcPath(110, 110, 82, start, start + spanMax * completion)}
                        stroke={bloc.couleur}
                        strokeWidth={26}
                        fill="none"
                        strokeLinecap="round"
                      />
                    )}
                  </g>
                );
              })}
              <text x="110" y="104" textAnchor="middle" style={{ fontSize: 34, fontWeight: 800, fill: "#0F0F0F", fontFamily: "inherit" }}>
                {Math.round((totalFaites / totalActions) * 100)}%
              </text>
              <text x="110" y="128" textAnchor="middle" style={{ fontSize: 12, fill: "#6A6A6A", fontFamily: "inherit" }}>
                {totalFaites}/{totalActions} actions
              </text>
            </svg>

            {/* Légende par bloc */}
            <div style={{ minWidth: 260 }}>
              {data.blocs.map((bloc) => {
                const justifs = justifsParBloc[bloc.code] ?? [];
                const nb = Math.min(nbActionsDistinctes(justifs), bloc.actionsRequises);
                const complet = nb >= bloc.actionsRequises;
                return (
                  <div key={bloc.code} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #F5F5F5" }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: bloc.couleur, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#0F0F0F" }}>
                      {bloc.emoji} {bloc.titre}
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 100, flexShrink: 0,
                      background: complet ? "#e8f5e9" : "#F9F7F4", color: complet ? "#2e7d32" : "#6A6A6A",
                    }}>
                      {complet ? "✓ Complet" : `${nb}/${bloc.actionsRequises}`}
                    </span>
                  </div>
                );
              })}
              <div style={{ fontSize: 12, color: "#6A6A6A", marginTop: 12, lineHeight: 1.5 }}>
                Chaque quart du cercle représente un bloc et se remplit au fur et à mesure de vos actions justifiées.
              </div>
            </div>
          </div>

          {/* Timeline */}
          {periode && (
            <div style={{ background: "white", borderRadius: 16, border: "1px solid #E0E0E0", padding: "24px 32px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6A6A6A", marginBottom: 18 }}>
                Votre période de certification
              </div>
              {(() => {
                const pct = progressionPeriode(periode) * 100;
                const enRetard = totalFaites / totalActions < progressionPeriode(periode);
                return (
                  <>
                    <div style={{ position: "relative", height: 14, background: "#F0EDE8", borderRadius: 100, marginBottom: 8 }}>
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: enRetard ? "#e65100" : "#2e7d32", borderRadius: 100, transition: "width 0.4s" }} />
                      <div style={{ position: "absolute", left: `${pct}%`, top: -6, transform: "translateX(-50%)", width: 3, height: 26, background: "#0F0F0F", borderRadius: 2 }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6A6A6A", marginBottom: 16 }}>
                      <span><strong style={{ color: "#0F0F0F" }}>{periode.debut}</strong> — début de période</span>
                      <span style={{ fontWeight: 700, color: "#0F0F0F" }}>Aujourd&apos;hui · {Math.round(pct)}% écoulé</span>
                      <span><strong style={{ color: "#0F0F0F" }}>{periode.fin}</strong> — échéance</span>
                    </div>
                    <div style={{
                      borderRadius: 10, padding: "12px 16px", fontSize: 13, lineHeight: 1.6,
                      background: enRetard ? "#fff3e0" : "#e8f5e9", color: enRetard ? "#5d4037" : "#1b5e20",
                    }}>
                      {enRetard
                        ? <>⚠️ <strong>Vous êtes en retard sur le rythme.</strong> {Math.round(pct)}% de la période est écoulée mais seulement {Math.round((totalFaites / totalActions) * 100)}% des actions sont justifiées. Pensez à planifier vos prochaines actions — le catalogue de formations certifiantes peut vous aider.</>
                        : <>✅ <strong>Vous êtes dans les temps.</strong> Continuez à ce rythme pour valider sereinement votre période {periode.debut}–{periode.fin}.</>}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ═══ À SAVOIR ═══ */}
      {activeTab === "infos" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          {[
            {
              emoji: "⚖️", titre: "De quoi s'agit-il ?",
              texte: "La certification périodique est une obligation légale instaurée par l'ordonnance n° 2021-961 du 19 juillet 2021, en vigueur depuis le 1er janvier 2023. Elle concerne les 7 professions de santé à ordre, dont les médecins, et vise à garantir le maintien des compétences tout au long de la carrière.",
            },
            {
              emoji: "📅", titre: "Quelle échéance pour vous ?",
              texte: "Les professionnels déjà en exercice au 1er janvier 2023 bénéficient d'une première période transitoire de 9 ans (2023 → 2032). Les professionnels diplômés à partir de 2023 disposent de 6 ans à compter de la validation de leur DES. Ensuite, les périodes se renouvellent tous les 6 ans.",
            },
            {
              emoji: "✅", titre: "Que faut-il valider ?",
              texte: "Au moins 2 actions dans chacun des 4 blocs du référentiel au cours de la période : actualisation des connaissances, qualité des pratiques, relation patient et santé personnelle. Les 2 actions d'un même bloc doivent être différentes. Les actions sont définies par l'arrêté du 26 février 2026, décliné par chaque Conseil National Professionnel (CNP).",
            },
            {
              emoji: "🗂️", titre: "Qui contrôle ?",
              texte: "Chaque professionnel dispose d'un compte individuel sur la plateforme nationale de certification périodique. Le contrôle du respect de l'obligation relève de votre ordre professionnel (CNOM pour les médecins). Conservez tous vos justificatifs : c'est exactement le rôle de l'onglet « Mes documents ».",
            },
            {
              emoji: "✨", titre: "Le + Masterclass Médical",
              texte: "Chaque formation suivie sur la plateforme et rattachée à une action du référentiel alimente automatiquement votre dossier : l'attestation est déposée dans vos documents dès votre participation validée. Zéro paperasse.",
            },
            {
              emoji: "🔎", titre: "Et si je ne fais rien ?",
              texte: "En l'absence d'actions justifiées à l'échéance, l'ordre peut engager une procédure pouvant aller jusqu'à des mesures disciplinaires (l'insuffisance professionnelle peut être examinée). Mieux vaut lisser l'effort : 2 actions par bloc sur 6 ans, c'est très atteignable en s'y prenant tôt.",
            },
          ].map((card, i) => (
            <div key={i} style={{ background: "white", borderRadius: 16, border: "1px solid #E0E0E0", padding: "22px 24px" }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{card.emoji}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0F0F0F", marginBottom: 8 }}>{card.titre}</div>
              <div style={{ fontSize: 13, color: "#6A6A6A", lineHeight: 1.65 }}>{card.texte}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
