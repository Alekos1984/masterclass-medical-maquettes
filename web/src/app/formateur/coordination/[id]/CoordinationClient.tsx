"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type Slot = {
  slotId: string; heureDebut: string; heureFin: string;
  titre: string; description: string; type: string; enseignantId: string | null;
};
type Journee = {
  id: string; date: string; heureDebut: string; heureFin: string;
  modaliteSession: string; visioUrl: string | null; lieuNom: string | null; lieuVille: string | null;
  sessionStatus: string | null; slots: Slot[];
};
type Enseignant = { id: string; email: string; nom: string | null; statut: string; coCoordinateur: boolean };
type Support = { id: string; formationId: string; slotId: string | null; nom: string; taille: number | null };
type Message = { id: string; auteurEmail: string; auteurNom: string; texte: string; createdAt: string };
type Echange = {
  id: string; deEnseignantId: string; versEnseignantId: string;
  journeeAId: string; slotIdA: string; journeeBId: string; slotIdB: string; statut: string;
};
type Alertes = {
  creneauxSansEnseignant: { journeeId: string; date: string; slot: Slot }[];
  supportsManquants: { journeeId: string; date: string; slot: Slot }[];
  conflits: { enseignantId: string; date: string; titres: string[] }[];
  invitationsEnAttente: Enseignant[];
};
type ApiData = {
  role: "COORDINATEUR" | "ENSEIGNANT";
  monEnseignantId: string | null;
  cursus: {
    id: string; slug: string; titre: string; description: string; specialite: string;
    annee: string | null; publique: boolean; statut: string; inscriptionMode: string; prixHT: number | null;
    lieuNom: string | null; lieuAdresse: string | null; lieuVille: string | null;
    certifBlocCode: string | null; certifActionTitre: string | null; coordinateurNom: string;
  };
  journees: Journee[];
  enseignants: Enseignant[];
  supports: Support[];
  messages: Message[];
  echanges: Echange[];
  nbEtudiants: number;
  alertes: Alertes | null;
};
type Etudiant = { participantId: string; nom: string; email: string; presences: Record<string, { matin: boolean; apresMidi: boolean }> };

const SLOT_TYPES = [
  { value: "cours", label: "Cours magistral" },
  { value: "atelier", label: "Atelier pratique" },
  { value: "cas_clinique", label: "Cas clinique" },
  { value: "evaluation", label: "Évaluation" },
  { value: "pause", label: "Pause" },
  { value: "autre", label: "Autre" },
];

const inputStyle: React.CSSProperties = {
  border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "8px 12px",
  fontSize: 13, fontFamily: "inherit", outline: "none", background: "white", color: "#0F0F0F",
};
const cardStyle: React.CSSProperties = { background: "white", borderRadius: 16, border: "1px solid #E0E0E0", marginBottom: 16 };
const btnRed: React.CSSProperties = { background: "#C8102E", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
const btnGhost: React.CSSProperties = { background: "transparent", color: "#444", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };

function fdate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function CoordinationClient({ cursusId }: { cursusId: string }) {
  const router = useRouter();
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"journees" | "equipe" | "etudiants" | "messages" | "parametres">("journees");
  const [busy, setBusy] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const res = await fetch(`/api/cursus/${cursusId}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [cursusId]);

  useEffect(() => { reload(); }, [reload]);

  // Journées : édition de slots (état local par journée)
  const [slotsEdit, setSlotsEdit] = useState<Record<string, Slot[]>>({});
  const [newJournee, setNewJournee] = useState({ date: "", heureDebut: "09:00", heureFin: "17:00", modaliteSession: "PRESENTIEL", visioUrl: "" });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteNom, setInviteNom] = useState("");
  const [importText, setImportText] = useState("");
  const [importResult, setImportResult] = useState("");
  const [etudiants, setEtudiants] = useState<Etudiant[] | null>(null);
  const [etudiantsJournees, setEtudiantsJournees] = useState<{ id: string; date: string }[]>([]);
  const [messageText, setMessageText] = useState("");
  const [echangeFor, setEchangeFor] = useState<{ journeeId: string; slot: Slot } | null>(null);

  useEffect(() => {
    if (tab !== "etudiants" || etudiants !== null) return;
    fetch(`/api/cursus/${cursusId}/etudiants`)
      .then((r) => r.json())
      .then((d) => { setEtudiants(d.etudiants ?? []); setEtudiantsJournees(d.journees ?? []); })
      .catch(() => {});
  }, [tab, etudiants, cursusId]);

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "#6A6A6A" }}>Chargement…</div>;
  if (!data) return <div style={{ padding: 60, textAlign: "center", color: "#c62828" }}>Cursus introuvable ou accès refusé. <Link href="/formateur/coordination">← Retour</Link></div>;

  const { cursus, role } = data;
  const isCoord = role === "COORDINATEUR";
  const enseignantsById = new Map(data.enseignants.map((e) => [e.id, e]));
  const supportByKey = new Map(data.supports.map((s) => [`${s.formationId}:${s.slotId}`, s]));
  const getSlots = (j: Journee) => slotsEdit[j.id] ?? j.slots;
  const echangesPourMoi = data.echanges.filter((e) => e.statut === "EN_ATTENTE" && e.versEnseignantId === data.monEnseignantId);

  async function api(path: string, method: string, body?: unknown) {
    const res = await fetch(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "Erreur");
      return null;
    }
    return res.json().catch(() => ({}));
  }

  async function saveSlots(journeeId: string) {
    setBusy(`slots-${journeeId}`);
    const ok = await api(`/api/cursus/${cursusId}/journees/${journeeId}`, "PATCH", { slots: slotsEdit[journeeId] });
    if (ok) { setSlotsEdit((s) => { const n = { ...s }; delete n[journeeId]; return n; }); await reload(); }
    setBusy(null);
  }

  async function uploadSupport(journeeId: string, slotId: string, file: File) {
    if (file.size > 15 * 1024 * 1024) { alert("Fichier trop volumineux (max 15 Mo)"); return; }
    const base64 = await new Promise<string>((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve((r.result as string).split(",")[1] ?? "");
      r.readAsDataURL(file);
    });
    setBusy(`support-${slotId}`);
    const ok = await api(`/api/cursus/${cursusId}/journees/${journeeId}/support`, "POST", { slotId, nom: file.name, base64, taille: file.size });
    if (ok) await reload();
    setBusy(null);
  }

  function exportCsv() {
    if (!etudiants) return;
    const header = ["Nom", "Email", ...etudiantsJournees.map((j) => `${new Date(j.date).toLocaleDateString("fr-FR")} matin;${new Date(j.date).toLocaleDateString("fr-FR")} après-midi`)].join(";");
    const rows = etudiants.map((e) => [
      e.nom, e.email,
      ...etudiantsJournees.map((j) => {
        const p = e.presences[j.id];
        return `${p?.matin ? "Présent" : "Absent"};${p?.apresMidi ? "Présent" : "Absent"}`;
      }),
    ].join(";"));
    const blob = new Blob(["﻿" + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `assiduite-${cursus.slug}.csv`;
    a.click();
  }

  const alertes = data.alertes;
  const nbAlertes = isCoord && alertes
    ? alertes.creneauxSansEnseignant.length + alertes.conflits.length + alertes.invitationsEnAttente.length + alertes.supportsManquants.length
    : 0;

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/formateur/coordination" style={{ fontSize: 13, color: "#6A6A6A", textDecoration: "none" }}>← Coordination</Link>
          <div style={{ width: 1, height: 18, background: "#E0E0E0" }} />
          <div className="topbar-title">{cursus.titre}{cursus.annee ? ` · ${cursus.annee}` : ""}</div>
        </div>
        <div className="topbar-right" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {cursus.statut === "PUBLIE"
            ? <span className="pill pill-green">Publié</span>
            : <span className="pill pill-orange">Brouillon</span>}
          {isCoord && (
            <>
              <a href={`/api/pdf/cursus-programme/${cursusId}`} target="_blank" rel="noreferrer" style={{ ...btnGhost, textDecoration: "none" }}>📄 Programme PDF</a>
              <button
                style={btnGhost}
                disabled={busy === "programme"}
                onClick={async () => {
                  const inclureEtudiants = confirm("Envoyer aussi le programme aux étudiants inscrits ?\nOK = enseignants + étudiants · Annuler = enseignants seulement");
                  setBusy("programme");
                  const r = await api(`/api/cursus/${cursusId}/envoyer-programme`, "POST", { inclureEtudiants });
                  if (r) alert(`Programme envoyé à ${r.envoyes} destinataire(s).`);
                  setBusy(null);
                }}
              >
                {busy === "programme" ? "Envoi…" : "✉️ Envoyer le programme"}
              </button>
              <button
                style={btnRed}
                disabled={busy === "statut"}
                onClick={async () => {
                  setBusy("statut");
                  await api(`/api/cursus/${cursusId}`, "PATCH", { statut: cursus.statut === "PUBLIE" ? "BROUILLON" : "PUBLIE" });
                  await reload();
                  setBusy(null);
                }}
              >
                {cursus.statut === "PUBLIE" ? "Repasser en brouillon" : "🚀 Publier"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="content" style={{ maxWidth: 1100 }}>
        {/* Bandeau échanges à traiter (enseignant sollicité) */}
        {echangesPourMoi.map((e) => {
          const jA = data.journees.find((j) => j.id === e.journeeAId);
          const jB = data.journees.find((j) => j.id === e.journeeBId);
          const sA = jA?.slots.find((s) => s.slotId === e.slotIdA);
          const sB = jB?.slots.find((s) => s.slotId === e.slotIdB);
          const proposant = enseignantsById.get(e.deEnseignantId);
          return (
            <div key={e.id} style={{ background: "#e3f2fd", border: "1.5px solid #90caf9", borderRadius: 12, padding: "14px 18px", marginBottom: 16, fontSize: 13, color: "#0d47a1", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ flex: 1, minWidth: 260 }}>
                🔄 <strong>{proposant?.nom ?? proposant?.email}</strong> propose d&apos;échanger :
                il/elle reprend « {sB?.titre} » ({jB ? new Date(jB.date).toLocaleDateString("fr-FR") : ""}) et vous confie
                « {sA?.titre} » ({jA ? new Date(jA.date).toLocaleDateString("fr-FR") : ""}).
              </span>
              <button style={btnRed} onClick={async () => { await api(`/api/cursus/${cursusId}/echanges`, "PATCH", { echangeId: e.id, decision: "ACCEPTE" }); await reload(); }}>Accepter</button>
              <button style={btnGhost} onClick={async () => { await api(`/api/cursus/${cursusId}/echanges`, "PATCH", { echangeId: e.id, decision: "REFUSE" }); await reload(); }}>Refuser</button>
            </div>
          );
        })}

        {/* Tableau de bord alertes (coordinateur) */}
        {isCoord && alertes && nbAlertes > 0 && (
          <div style={{ background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: 12, padding: "14px 18px", marginBottom: 20, fontSize: 13, color: "#5d4037", lineHeight: 1.8 }}>
            <strong>⚠️ À traiter :</strong>
            {alertes.creneauxSansEnseignant.length > 0 && <div>• {alertes.creneauxSansEnseignant.length} créneau(x) sans enseignant affecté</div>}
            {alertes.invitationsEnAttente.length > 0 && <div>• {alertes.invitationsEnAttente.length} invitation(s) enseignant en attente (onglet Équipe → relancer)</div>}
            {alertes.supportsManquants.length > 0 && <div>• {alertes.supportsManquants.length} support(s) de cours non chargé(s)</div>}
            {alertes.conflits.map((c, i) => (
              <div key={i} style={{ color: "#c62828" }}>
                • Conflit : {enseignantsById.get(c.enseignantId)?.nom ?? "un enseignant"} affecté à 2 créneaux qui se chevauchent le {new Date(c.date).toLocaleDateString("fr-FR")} ({c.titres.join(" / ")})
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "Journées", val: data.journees.length },
            { label: "Enseignants", val: data.enseignants.length },
            { label: "Étudiants", val: data.nbEtudiants },
            { label: "Modalité", val: cursus.inscriptionMode === "PAYANT" ? `${cursus.prixHT ?? 0} € HT` : "Import université" },
          ].map((s, i) => (
            <div key={i} style={{ background: "white", borderRadius: 12, border: "1px solid #E0E0E0", padding: "12px 20px", minWidth: 120 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0F0F0F" }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "#6A6A6A", textTransform: "uppercase", letterSpacing: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ONGLETS */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, borderBottom: "1px solid #E0E0E0", flexWrap: "wrap" }}>
          {([
            ["journees", "📅 Journées & créneaux"],
            ["equipe", "🧑‍🏫 Équipe"],
            ...(isCoord ? [["etudiants", "🎓 Étudiants"]] : []),
            ["messages", `💬 Messages${data.messages.length ? ` (${data.messages.length})` : ""}`],
            ...(isCoord ? [["parametres", "⚙️ Paramètres"]] : []),
          ] as [typeof tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                background: "transparent", border: "none", fontFamily: "inherit", cursor: "pointer",
                padding: "10px 14px", fontSize: 14, fontWeight: tab === key ? 700 : 500,
                color: tab === key ? "#C8102E" : "#6A6A6A",
                borderBottom: tab === key ? "3px solid #C8102E" : "3px solid transparent", marginBottom: -1,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ═══ JOURNÉES ═══ */}
        {tab === "journees" && (
          <div>
            {isCoord && (
              <div style={{ ...cardStyle, padding: "16px 22px", display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 3 }}>Date</div>
                  <input type="date" value={newJournee.date} onChange={(e) => setNewJournee((s) => ({ ...s, date: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 3 }}>Début</div>
                  <input type="time" value={newJournee.heureDebut} onChange={(e) => setNewJournee((s) => ({ ...s, heureDebut: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 3 }}>Fin</div>
                  <input type="time" value={newJournee.heureFin} onChange={(e) => setNewJournee((s) => ({ ...s, heureFin: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 3 }}>Modalité</div>
                  <select value={newJournee.modaliteSession} onChange={(e) => setNewJournee((s) => ({ ...s, modaliteSession: e.target.value }))} style={inputStyle}>
                    <option value="PRESENTIEL">Présentiel</option>
                    <option value="VIRTUEL">Visioconférence</option>
                    <option value="MIXTE">Mixte</option>
                  </select>
                </div>
                {newJournee.modaliteSession !== "PRESENTIEL" && (
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 3 }}>Lien visio (Zoom/Teams)</div>
                    <input type="url" placeholder="https://…" value={newJournee.visioUrl} onChange={(e) => setNewJournee((s) => ({ ...s, visioUrl: e.target.value }))} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
                  </div>
                )}
                <button
                  style={btnRed}
                  disabled={!newJournee.date || busy === "addJournee"}
                  onClick={async () => {
                    setBusy("addJournee");
                    const ok = await api(`/api/cursus/${cursusId}/journees`, "POST", newJournee);
                    if (ok) { setNewJournee({ date: "", heureDebut: "09:00", heureFin: "17:00", modaliteSession: "PRESENTIEL", visioUrl: "" }); await reload(); }
                    setBusy(null);
                  }}
                >
                  + Ajouter la journée
                </button>
              </div>
            )}

            {data.journees.length === 0 && (
              <div style={{ ...cardStyle, padding: "36px 24px", textAlign: "center", color: "#6A6A6A", fontSize: 14 }}>
                Aucune journée pour l&apos;instant.
              </div>
            )}

            {data.journees.map((j, idx) => {
              const slots = getSlots(j);
              const edited = !!slotsEdit[j.id];
              return (
                <div key={j.id} style={cardStyle}>
                  <div style={{ padding: "14px 22px", borderBottom: "1px solid #EBEBEB", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0F0F0F" }}>
                        Journée {idx + 1} — {fdate(j.date)}
                      </div>
                      <div style={{ fontSize: 12, color: "#6A6A6A", marginTop: 2 }}>
                        {j.heureDebut}–{j.heureFin} · {j.modaliteSession === "VIRTUEL" ? "🖥️ Visio" : j.modaliteSession === "MIXTE" ? "🖥️+🏛️ Mixte" : "🏛️ Présentiel"}
                        {j.visioUrl && <> · <a href={j.visioUrl} target="_blank" rel="noreferrer" style={{ color: "#C8102E" }}>lien visio</a></>}
                        {j.lieuNom && ` · ${j.lieuNom}${j.lieuVille ? `, ${j.lieuVille}` : ""}`}
                      </div>
                    </div>
                    <Link href={`/formateur/formations/${j.id}`} style={{ fontSize: 12, fontWeight: 700, color: "#C8102E", textDecoration: "none", border: "1.5px solid #C8102E", borderRadius: 8, padding: "5px 12px" }}>
                      Machinerie journée →
                    </Link>
                    {isCoord && (
                      <button
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#6A6A6A" }}
                        title="Supprimer la journée"
                        onClick={async () => {
                          if (!confirm(`Supprimer la journée du ${fdate(j.date)} ?`)) return;
                          await api(`/api/cursus/${cursusId}/journees/${j.id}`, "DELETE");
                          await reload();
                        }}
                      >
                        🗑
                      </button>
                    )}
                  </div>

                  {/* Créneaux */}
                  <div>
                    {slots.map((slot, si) => {
                      const support = supportByKey.get(`${j.id}:${slot.slotId}`);
                      const estMonSlot = slot.enseignantId === data.monEnseignantId;
                      const peutEditer = isCoord;
                      return (
                        <div key={slot.slotId} style={{ padding: "12px 22px", borderBottom: "1px solid #F5F5F5", background: estMonSlot ? "#fff5f6" : "white" }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: peutEditer ? 6 : 0 }}>
                            {peutEditer ? (
                              <>
                                <input type="time" value={slot.heureDebut} onChange={(e) => setSlotsEdit((s) => ({ ...s, [j.id]: slots.map((x, k) => k === si ? { ...x, heureDebut: e.target.value } : x) }))} style={{ ...inputStyle, padding: "5px 7px", fontSize: 12 }} />
                                <span style={{ fontSize: 11, color: "#6A6A6A" }}>→</span>
                                <input type="time" value={slot.heureFin} onChange={(e) => setSlotsEdit((s) => ({ ...s, [j.id]: slots.map((x, k) => k === si ? { ...x, heureFin: e.target.value } : x) }))} style={{ ...inputStyle, padding: "5px 7px", fontSize: 12 }} />
                                <input type="text" placeholder="Titre du cours" value={slot.titre} onChange={(e) => setSlotsEdit((s) => ({ ...s, [j.id]: slots.map((x, k) => k === si ? { ...x, titre: e.target.value } : x) }))} style={{ ...inputStyle, padding: "5px 9px", fontSize: 12, flex: 1, minWidth: 160 }} />
                                <select value={slot.type} onChange={(e) => setSlotsEdit((s) => ({ ...s, [j.id]: slots.map((x, k) => k === si ? { ...x, type: e.target.value } : x) }))} style={{ ...inputStyle, padding: "5px 7px", fontSize: 12 }}>
                                  {SLOT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                                <select
                                  value={slot.enseignantId ?? ""}
                                  onChange={(e) => setSlotsEdit((s) => ({ ...s, [j.id]: slots.map((x, k) => k === si ? { ...x, enseignantId: e.target.value || null } : x) }))}
                                  style={{ ...inputStyle, padding: "5px 7px", fontSize: 12, borderColor: slot.enseignantId || slot.type === "pause" ? "#E0E0E0" : "#e65100" }}
                                >
                                  <option value="">— Enseignant —</option>
                                  {data.enseignants.map((e) => <option key={e.id} value={e.id}>{e.nom ?? e.email}{e.statut === "EN_ATTENTE" ? " (invité)" : ""}</option>)}
                                </select>
                                <button
                                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#6A6A6A" }}
                                  onClick={() => setSlotsEdit((s) => ({ ...s, [j.id]: slots.filter((_, k) => k !== si) }))}
                                >
                                  ✕
                                </button>
                              </>
                            ) : (
                              <>
                                <span style={{ fontSize: 12, color: "#6A6A6A", whiteSpace: "nowrap" }}>{slot.heureDebut}–{slot.heureFin}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#0F0F0F", flex: 1 }}>{slot.titre}</span>
                                <span style={{ fontSize: 12, color: slot.enseignantId ? "#C8102E" : "#e65100", fontWeight: 600 }}>
                                  {slot.type === "pause" ? "☕" : slot.enseignantId ? (enseignantsById.get(slot.enseignantId)?.nom ?? enseignantsById.get(slot.enseignantId)?.email) : "Non affecté"}
                                  {estMonSlot && " (vous)"}
                                </span>
                              </>
                            )}
                          </div>
                          {/* Support + échange */}
                          {slot.type !== "pause" && (
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                              {support ? (
                                <>
                                  <span style={{ fontSize: 11, color: "#2e7d32", fontWeight: 600 }}>📎 {support.nom}</span>
                                  {(isCoord || estMonSlot) && (
                                    <button
                                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#6A6A6A", textDecoration: "underline", fontFamily: "inherit" }}
                                      onClick={async () => { await api(`/api/cursus/${cursusId}/journees/${j.id}/support`, "DELETE", { slotId: slot.slotId }); await reload(); }}
                                    >
                                      retirer
                                    </button>
                                  )}
                                </>
                              ) : (isCoord || estMonSlot) ? (
                                <label style={{ fontSize: 11, color: "#C8102E", fontWeight: 600, cursor: "pointer" }}>
                                  {busy === `support-${slot.slotId}` ? "Chargement…" : "📎 Charger le support (PPT/PDF)"}
                                  <input
                                    type="file"
                                    accept=".pdf,.ppt,.pptx"
                                    style={{ display: "none" }}
                                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadSupport(j.id, slot.slotId, f); }}
                                  />
                                </label>
                              ) : (
                                <span style={{ fontSize: 11, color: "#9A9A9A" }}>Support non chargé</span>
                              )}
                              {estMonSlot && !isCoord && (
                                <button
                                  style={{ background: "none", border: "1px solid #90caf9", color: "#1565c0", borderRadius: 6, padding: "2px 9px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                                  onClick={() => setEchangeFor({ journeeId: j.id, slot })}
                                >
                                  🔄 Échanger ce cours
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {isCoord && (
                      <div style={{ padding: "12px 22px", display: "flex", gap: 10, alignItems: "center" }}>
                        <button
                          style={btnGhost}
                          onClick={() => setSlotsEdit((s) => ({
                            ...s,
                            [j.id]: [...slots, { slotId: `slot-${Date.now()}`, heureDebut: j.heureDebut, heureFin: "", titre: "", description: "", type: "cours", enseignantId: null }],
                          }))}
                        >
                          + Créneau
                        </button>
                        {edited && (
                          <button style={btnRed} disabled={busy === `slots-${j.id}`} onClick={() => saveSlots(j.id)}>
                            {busy === `slots-${j.id}` ? "Sauvegarde…" : "💾 Sauvegarder les créneaux"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ ÉQUIPE ═══ */}
        {tab === "equipe" && (
          <div>
            {isCoord && (
              <div style={{ ...cardStyle, padding: "16px 22px", display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 3 }}>Email de l&apos;enseignant</div>
                  <input type="email" placeholder="prenom.nom@chu.fr" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
                </div>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 3 }}>Nom (optionnel)</div>
                  <input type="text" placeholder="Dr Jeanne Martin" value={inviteNom} onChange={(e) => setInviteNom(e.target.value)} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
                </div>
                <button
                  style={btnRed}
                  disabled={!inviteEmail || busy === "invite"}
                  onClick={async () => {
                    setBusy("invite");
                    const ok = await api(`/api/cursus/${cursusId}/enseignants`, "POST", { email: inviteEmail, nom: inviteNom });
                    if (ok) { setInviteEmail(""); setInviteNom(""); await reload(); }
                    setBusy(null);
                  }}
                >
                  ✉️ Inviter
                </button>
              </div>
            )}

            <div style={cardStyle}>
              {data.enseignants.length === 0 && <div style={{ padding: "30px 22px", textAlign: "center", color: "#6A6A6A", fontSize: 13 }}>Aucun enseignant pour l&apos;instant.</div>}
              {data.enseignants.map((e) => {
                const nbCreneaux = data.journees.reduce((s, j) => s + j.slots.filter((sl) => sl.enseignantId === e.id).length, 0);
                return (
                  <div key={e.id} style={{ padding: "14px 22px", borderBottom: "1px solid #F5F5F5", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0F0F0F" }}>
                        {e.nom ?? e.email}
                        {e.coCoordinateur && <span style={{ fontSize: 10, fontWeight: 700, background: "#e3f2fd", color: "#1565c0", padding: "2px 8px", borderRadius: 100, marginLeft: 8 }}>Co-coordinateur</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "#6A6A6A" }}>{e.email} · {nbCreneaux} créneau{nbCreneaux > 1 ? "x" : ""}</div>
                    </div>
                    {e.statut === "ACCEPTE"
                      ? <span className="pill pill-green">Actif</span>
                      : <span className="pill pill-orange">Invitation en attente</span>}
                    {isCoord && (
                      <>
                        {e.statut === "EN_ATTENTE" && (
                          <button style={btnGhost} onClick={async () => { const r = await api(`/api/cursus/${cursusId}/enseignants/${e.id}`, "PATCH", { action: "relancer" }); if (r) alert("Invitation relancée !"); }}>
                            🔔 Relancer
                          </button>
                        )}
                        <button
                          style={btnGhost}
                          onClick={async () => { await api(`/api/cursus/${cursusId}/enseignants/${e.id}`, "PATCH", { coCoordinateur: !e.coCoordinateur }); await reload(); }}
                        >
                          {e.coCoordinateur ? "Retirer co-coord." : "Co-coordinateur"}
                        </button>
                        <button
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#6A6A6A" }}
                          onClick={async () => {
                            if (!confirm(`Retirer ${e.nom ?? e.email} de l'équipe ? Ses créneaux seront désaffectés.`)) return;
                            await api(`/api/cursus/${cursusId}/enseignants/${e.id}`, "DELETE");
                            await reload();
                          }}
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ ÉTUDIANTS ═══ */}
        {tab === "etudiants" && isCoord && (
          <div>
            <div style={{ ...cardStyle, padding: "20px 22px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Importer la liste des étudiants</div>
              <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 10, lineHeight: 1.5 }}>
                Une ligne par étudiant : <code>email;nom;prénom</code> (le nom et le prénom sont optionnels).
                Les comptes sont créés, inscrits à toutes les journées, et chaque étudiant reçoit ses identifiants par email.
              </div>
              <textarea
                placeholder={"marie.dupont@chu.fr;Dupont;Marie\njean.martin@aphp.fr;Martin;Jean"}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                style={{ ...inputStyle, width: "100%", boxSizing: "border-box", minHeight: 120, fontFamily: "monospace", fontSize: 12, resize: "vertical" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
                <button
                  style={btnRed}
                  disabled={!importText.trim() || busy === "import"}
                  onClick={async () => {
                    setBusy("import");
                    const rows = importText.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
                      const [email, nom, prenom] = l.split(/[;,\t]/).map((x) => x?.trim());
                      return { email, nom, prenom };
                    });
                    const r = await api(`/api/cursus/${cursusId}/etudiants`, "POST", { etudiants: rows });
                    if (r) {
                      setImportResult(`✅ ${r.crees} compte(s) créé(s), ${r.existants} existant(s), ${r.inscrits} inscription(s), ${r.erreurs} erreur(s).`);
                      setImportText("");
                      setEtudiants(null);
                      await reload();
                    }
                    setBusy(null);
                  }}
                >
                  {busy === "import" ? "Import en cours…" : "📥 Importer et inscrire"}
                </button>
                {importResult && <span style={{ fontSize: 12, color: "#2e7d32" }}>{importResult}</span>}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ padding: "14px 22px", borderBottom: "1px solid #EBEBEB", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Assiduité ({etudiants?.length ?? "…"} étudiant·e·s)</span>
                <button style={btnGhost} onClick={exportCsv} disabled={!etudiants?.length}>⬇️ Export CSV</button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #E0E0E0" }}>
                      <th style={{ textAlign: "left", padding: "10px 22px", color: "#6A6A6A" }}>Étudiant·e</th>
                      {etudiantsJournees.map((j) => (
                        <th key={j.id} style={{ padding: "10px 8px", color: "#6A6A6A", whiteSpace: "nowrap" }}>
                          {new Date(j.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}<br/>
                          <span style={{ fontWeight: 400, fontSize: 10 }}>mat. / a-m.</span>
                        </th>
                      ))}
                      <th style={{ padding: "10px 8px", color: "#6A6A6A" }}>Taux</th>
                      <th style={{ padding: "10px 22px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(etudiants ?? []).map((e) => {
                      const demi = etudiantsJournees.length * 2;
                      const pres = etudiantsJournees.reduce((s, j) => s + (e.presences[j.id]?.matin ? 1 : 0) + (e.presences[j.id]?.apresMidi ? 1 : 0), 0);
                      const taux = demi ? Math.round((pres / demi) * 100) : 0;
                      return (
                        <tr key={e.participantId} style={{ borderBottom: "1px solid #F5F5F5" }}>
                          <td style={{ padding: "9px 22px" }}>
                            <div style={{ fontWeight: 600, color: "#0F0F0F" }}>{e.nom}</div>
                            <div style={{ fontSize: 11, color: "#9A9A9A" }}>{e.email}</div>
                          </td>
                          {etudiantsJournees.map((j) => {
                            const p = e.presences[j.id];
                            return (
                              <td key={j.id} style={{ textAlign: "center", padding: "9px 8px", whiteSpace: "nowrap" }}>
                                <span style={{ color: p?.matin ? "#2e7d32" : "#c62828" }}>{p?.matin ? "✓" : "✗"}</span>
                                {" / "}
                                <span style={{ color: p?.apresMidi ? "#2e7d32" : "#c62828" }}>{p?.apresMidi ? "✓" : "✗"}</span>
                              </td>
                            );
                          })}
                          <td style={{ textAlign: "center", padding: "9px 8px", fontWeight: 700, color: taux >= 80 ? "#2e7d32" : taux >= 50 ? "#e65100" : "#c62828" }}>{taux}%</td>
                          <td style={{ padding: "9px 22px", textAlign: "right" }}>
                            <a href={`/api/pdf/assiduite/${cursusId}/${e.participantId}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, fontWeight: 700, color: "#C8102E", textDecoration: "none" }}>
                              📄 Attestation
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                    {etudiants?.length === 0 && (
                      <tr><td colSpan={etudiantsJournees.length + 3} style={{ padding: "26px 22px", textAlign: "center", color: "#6A6A6A" }}>Aucun étudiant inscrit pour l&apos;instant.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══ MESSAGES ═══ */}
        {tab === "messages" && (
          <div style={cardStyle}>
            <div style={{ padding: "14px 22px", borderBottom: "1px solid #EBEBEB", fontSize: 12, color: "#6A6A6A" }}>
              Fil de discussion de l&apos;équipe pédagogique — visible uniquement par les enseignants du cursus et le coordinateur.
            </div>
            <div style={{ maxHeight: 420, overflowY: "auto", padding: "10px 22px" }}>
              {data.messages.length === 0 && <div style={{ padding: 20, textAlign: "center", color: "#9A9A9A", fontSize: 13 }}>Aucun message. Lancez la discussion !</div>}
              {data.messages.map((m) => (
                <div key={m.id} style={{ padding: "10px 0", borderBottom: "1px solid #F5F5F5" }}>
                  <div style={{ fontSize: 12, marginBottom: 3 }}>
                    <strong style={{ color: "#0F0F0F" }}>{m.auteurNom}</strong>
                    <span style={{ color: "#9A9A9A", marginLeft: 8 }}>{new Date(m.createdAt).toLocaleString("fr-FR")}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#444", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.texte}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "14px 22px", borderTop: "1px solid #EBEBEB", display: "flex", gap: 10 }}>
              <input
                type="text"
                placeholder="Votre message à l'équipe…"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && messageText.trim()) { e.preventDefault(); (document.getElementById("btn-send-msg") as HTMLButtonElement)?.click(); } }}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                id="btn-send-msg"
                style={btnRed}
                disabled={!messageText.trim() || busy === "msg"}
                onClick={async () => {
                  setBusy("msg");
                  const ok = await api(`/api/cursus/${cursusId}/messages`, "POST", { texte: messageText });
                  if (ok) { setMessageText(""); await reload(); }
                  setBusy(null);
                }}
              >
                Envoyer
              </button>
            </div>
          </div>
        )}

        {/* ═══ PARAMÈTRES ═══ */}
        {tab === "parametres" && isCoord && (
          <ParametresTab cursusId={cursusId} cursus={cursus} onSaved={reload} onDeleted={() => router.push("/formateur/coordination")} api={api} busy={busy} setBusy={setBusy} />
        )}
      </div>

      {/* MODAL ÉCHANGE */}
      {echangeFor && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setEchangeFor(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: "28px 28px", maxWidth: 560, width: "92%", maxHeight: "80vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#0F0F0F", marginBottom: 6 }}>Échanger « {echangeFor.slot.titre} »</div>
            <div style={{ fontSize: 13, color: "#6A6A6A", marginBottom: 16 }}>
              Choisissez le cours d&apos;un·e collègue à reprendre à la place. Il/elle recevra la proposition et devra l&apos;accepter — le programme se mettra à jour automatiquement.
            </div>
            {data.journees.flatMap((j) =>
              j.slots
                .filter((s) => s.enseignantId && s.enseignantId !== data.monEnseignantId && s.type !== "pause")
                .map((s) => (
                  <button
                    key={`${j.id}-${s.slotId}`}
                    style={{ display: "block", width: "100%", textAlign: "left", background: "#F9F7F4", border: "1.5px solid #E0E0E0", borderRadius: 10, padding: "11px 14px", marginBottom: 8, cursor: "pointer", fontFamily: "inherit" }}
                    onClick={async () => {
                      await api(`/api/cursus/${cursusId}/echanges`, "POST", {
                        journeeAId: echangeFor.journeeId, slotIdA: echangeFor.slot.slotId,
                        journeeBId: j.id, slotIdB: s.slotId,
                      });
                      setEchangeFor(null);
                      alert("Proposition envoyée ! Vous serez notifié·e de la réponse.");
                      await reload();
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0F0F0F" }}>{s.titre}</div>
                    <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 2 }}>
                      {new Date(j.date).toLocaleDateString("fr-FR")} · {s.heureDebut}–{s.heureFin} · {enseignantsById.get(s.enseignantId!)?.nom ?? enseignantsById.get(s.enseignantId!)?.email}
                    </div>
                  </button>
                ))
            )}
            <button style={{ ...btnGhost, marginTop: 8 }} onClick={() => setEchangeFor(null)}>Annuler</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Onglet Paramètres ────────────────────────────────────────────────────────

function ParametresTab({ cursusId, cursus, onSaved, onDeleted, api, busy, setBusy }: {
  cursusId: string;
  cursus: ApiData["cursus"];
  onSaved: () => Promise<void>;
  onDeleted: () => void;
  api: (path: string, method: string, body?: unknown) => Promise<Record<string, unknown> | null>;
  busy: string | null;
  setBusy: (b: string | null) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    titre: cursus.titre, description: cursus.description, annee: cursus.annee ?? "",
    publique: cursus.publique, inscriptionMode: cursus.inscriptionMode, prixHT: cursus.prixHT?.toString() ?? "",
    lieuNom: cursus.lieuNom ?? "", lieuAdresse: cursus.lieuAdresse ?? "", lieuVille: cursus.lieuVille ?? "",
  });

  return (
    <div style={{ ...cardStyle, padding: "22px 26px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Titre</div>
          <input type="text" value={form.titre} onChange={(e) => setForm((s) => ({ ...s, titre: e.target.value }))} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Année</div>
          <input type="text" value={form.annee} onChange={(e) => setForm((s) => ({ ...s, annee: e.target.value }))} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Description</div>
        <textarea value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} style={{ ...inputStyle, width: "100%", boxSizing: "border-box", minHeight: 90, resize: "vertical" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
        <input type="text" placeholder="Lieu (établissement)" value={form.lieuNom} onChange={(e) => setForm((s) => ({ ...s, lieuNom: e.target.value }))} style={inputStyle} />
        <input type="text" placeholder="Adresse" value={form.lieuAdresse} onChange={(e) => setForm((s) => ({ ...s, lieuAdresse: e.target.value }))} style={inputStyle} />
        <input type="text" placeholder="Ville" value={form.lieuVille} onChange={(e) => setForm((s) => ({ ...s, lieuVille: e.target.value }))} style={inputStyle} />
      </div>
      <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
          <input type="checkbox" checked={form.publique} onChange={(e) => setForm((s) => ({ ...s, publique: e.target.checked }))} />
          Affichage public (page /du/{cursus.slug})
        </label>
        <select value={form.inscriptionMode} onChange={(e) => setForm((s) => ({ ...s, inscriptionMode: e.target.value }))} style={inputStyle}>
          <option value="IMPORT">Import de la liste étudiante</option>
          <option value="PAYANT">Inscription payante en ligne</option>
        </select>
        {form.inscriptionMode === "PAYANT" && (
          <input type="number" placeholder="Prix HT" value={form.prixHT} onChange={(e) => setForm((s) => ({ ...s, prixHT: e.target.value }))} style={{ ...inputStyle, width: 120 }} />
        )}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          style={btnRed}
          disabled={busy === "params"}
          onClick={async () => {
            setBusy("params");
            const ok = await api(`/api/cursus/${cursusId}`, "PATCH", form);
            if (ok) await onSaved();
            setBusy(null);
          }}
        >
          {busy === "params" ? "Sauvegarde…" : "💾 Sauvegarder"}
        </button>
        <button
          style={btnGhost}
          disabled={busy === "dupliquer"}
          onClick={async () => {
            if (!confirm("Dupliquer ce cursus pour l'année suivante ? (structure, équipe et créneaux conservés, dates décalées d'un an, brouillon)")) return;
            setBusy("dupliquer");
            const r = await api(`/api/cursus/${cursusId}/dupliquer`, "POST");
            setBusy(null);
            if (r?.id) router.push(`/formateur/coordination/${r.id}`);
          }}
        >
          {busy === "dupliquer" ? "Duplication…" : "🔁 Dupliquer pour l'année suivante"}
        </button>
        <button
          style={{ ...btnGhost, color: "#c62828", borderColor: "#ffcdd2", marginLeft: "auto" }}
          onClick={async () => {
            if (!confirm("Supprimer définitivement ce cursus et toutes ses journées ?")) return;
            const ok = await api(`/api/cursus/${cursusId}`, "DELETE");
            if (ok) onDeleted();
          }}
        >
          🗑 Supprimer le cursus
        </button>
      </div>
    </div>
  );
}
