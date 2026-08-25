"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseContacts as parseContactsLib, type ParsedContact as ParsedContactLib } from "@/lib/parse-contacts";
import { genererMessagePropositionCreneau } from "@/lib/proposition-message";
import { sommeDureeSlots, formatDureeHeures } from "@/lib/duree-creneaux";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type Slot = {
  slotId: string; heureDebut: string; heureFin: string;
  titre: string; description: string; type: string; enseignantId: string | null;
  intervenantRaw?: string | null;
  lieuNom?: string | null; salle?: string | null; enVisio?: boolean;
  confirmationStatut?: "PROPOSE" | "CONFIRME" | "DECLINE" | null;
  confirmationDemandeAt?: string | null;
};
type Journee = {
  id: string; date: string; heureDebut: string; heureFin: string;
  modaliteSession: string; visioUrl: string | null; lieuNom: string | null; lieuVille: string | null;
  sessionStatus: string | null; slots: Slot[];
};
type Enseignant = {
  id: string; email: string; nom: string | null; phone: string | null; fonction: string | null;
  statut: string; coCoordinateur: boolean; role: string; estOrganisateur: boolean;
  nomCivilite: string;
};
type PieceJointe = { nom: string; base64: string; taille: number | null };
type Prospect = {
  id: string; email: string; nom: string | null; prenom: string | null; phone: string | null; fonction: string | null; statut: string; createdAt: string;
  piecesJointes?: Partial<Record<"cv" | "lettre" | "diplome", PieceJointe>> | null;
};
type Support = { id: string; formationId: string; slotId: string | null; nom: string; taille: number | null };
type Message = { id: string; auteurEmail: string; auteurNom: string; texte: string; createdAt: string };
type Echange = {
  id: string; deEnseignantId: string; versEnseignantId: string;
  journeeAId: string; slotIdA: string; journeeBId: string; slotIdB: string; statut: string;
};
type Alertes = {
  creneauxSansEnseignant: { journeeId: string; date: string; slot: Slot }[];
  supportsManquants: { journeeId: string; date: string; slot: Slot }[];
  intervenantsNonRattaches: { journeeId: string; date: string; slot: Slot }[];
  conflits: { enseignantId: string; date: string; titres: string[] }[];
  invitationsEnAttente: Enseignant[];
};
type ApiData = {
  role: "COORDINATEUR" | "SECRETAIRE" | "ENSEIGNANT";
  monEnseignantId: string | null;
  cursus: {
    id: string; slug: string; titre: string; description: string; specialite: string;
    annee: string | null; publique: boolean; statut: string; inscriptionMode: string; prixHT: number | null;
    lieuNom: string | null; lieuAdresse: string | null; lieuVille: string | null;
    certifBlocCode: string | null; certifActionTitre: string | null; emargementMode?: string;
    orgNom?: string | null; orgLogoBase64?: string | null; masquerMM?: boolean;
    organisateursTexte?: string | null;
    contactNom?: string | null; contactEmail?: string | null; contactTelephone?: string | null;
    capaciteMax?: number | null;
    volumeHoraireAttendu?: number | null;
    prerequis?: string | null; publicVise?: string | null;
    coordinateurNom: string;
  };
  journees: Journee[];
  enseignants: Enseignant[];
  supports: Support[];
  messages: Message[];
  echanges: Echange[];
  prospects: Prospect[];
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

const CONFIRMATION_LABELS: Record<string, string> = {
  "": "Non demandé", PROPOSE: "Proposé", CONFIRME: "Confirmé", DECLINE: "Décliné",
};

function confirmationDot(statut?: "PROPOSE" | "CONFIRME" | "DECLINE" | null) {
  const color = statut === "CONFIRME" ? "#2e7d32" : statut === "PROPOSE" ? "#e65100" : statut === "DECLINE" ? "#c62828" : "#D0D0D0";
  return <span title={CONFIRMATION_LABELS[statut ?? ""]} style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: color, flexShrink: 0 }} />;
}

// Fine ligne d'insertion entre deux créneaux (+ au survol, cible de drop)
function InsertLine({ onInsert, onDropSlot, isDropTarget }: {
  onInsert: () => void;
  onDropSlot: () => void;
  isDropTarget: boolean;
}) {
  const [hover, setHover] = useState(false);
  const [over, setOver] = useState(false);
  const actif = hover || over || isDropTarget;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); onDropSlot(); }}
      style={{ position: "relative", height: actif ? 22 : 8, transition: "height 0.12s", display: "flex", alignItems: "center", padding: "0 22px", cursor: "pointer" }}
      onClick={onInsert}
      title="Insérer un créneau ici"
    >
      <div style={{ flex: 1, height: over ? 3 : 1, background: actif ? "#C8102E" : "#F0F0F0", borderRadius: 2, transition: "background 0.12s" }} />
      <div
        style={{
          position: "absolute", left: "50%", transform: "translateX(-50%)",
          width: 18, height: 18, borderRadius: "50%",
          background: actif ? "#C8102E" : "#E8E8E8", color: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, lineHeight: 1,
          opacity: actif ? 1 : 0.55, transition: "opacity 0.12s, background 0.12s",
        }}
      >
        +
      </div>
    </div>
  );
}

// Parseur de contacts factorisé dans @/lib/parse-contacts (partagé serveur/client)
export type ParsedContact = ParsedContactLib;
const parseContacts = parseContactsLib;

function PreviewTable({ contacts, editable, onChange }: {
  contacts: ParsedContact[];
  editable?: boolean;
  onChange?: (next: ParsedContact[]) => void;
}) {
  if (contacts.length === 0 && !editable) return null;
  const cellInputStyle: React.CSSProperties = {
    width: "100%", border: "1px solid #E0E0E0", borderRadius: 5, padding: "4px 7px",
    fontSize: 12, fontFamily: "inherit", outline: "none", background: "white", boxSizing: "border-box",
  };
  const update = (i: number, patch: Partial<ParsedContact>) => {
    if (!onChange) return;
    onChange(contacts.map((c, k) => k === i ? { ...c, ...patch } : c));
  };
  const remove = (i: number) => onChange && onChange(contacts.filter((_, k) => k !== i));
  const add = () => onChange && onChange([...contacts, { prenom: "", nom: "", email: "", phone: "", fonction: "" }]);

  return (
    <div style={{ overflowX: "auto", border: "1px solid #EBEBEB", borderRadius: 10, marginTop: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: "#F9F7F4", borderBottom: "1px solid #E0E0E0" }}>
            {["Prénom", "Nom", "Email", "Téléphone", "Fonction / note"].map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#6A6A6A", fontWeight: 600 }}>{h}</th>
            ))}
            {editable && <th style={{ padding: "8px 6px", width: 32 }}></th>}
          </tr>
        </thead>
        <tbody>
          {contacts.map((c, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #F5F5F5" }}>
              {editable ? (
                <>
                  <td style={{ padding: "5px 8px" }}><input value={c.prenom} onChange={(e) => update(i, { prenom: e.target.value })} style={cellInputStyle} /></td>
                  <td style={{ padding: "5px 8px" }}><input value={c.nom} onChange={(e) => update(i, { nom: e.target.value })} style={{ ...cellInputStyle, fontWeight: 600 }} /></td>
                  <td style={{ padding: "5px 8px" }}><input type="email" value={c.email} onChange={(e) => update(i, { email: e.target.value })} style={{ ...cellInputStyle, color: "#C8102E" }} /></td>
                  <td style={{ padding: "5px 8px" }}><input value={c.phone} onChange={(e) => update(i, { phone: e.target.value })} style={cellInputStyle} /></td>
                  <td style={{ padding: "5px 8px" }}><input value={c.fonction} onChange={(e) => update(i, { fonction: e.target.value })} style={cellInputStyle} /></td>
                  <td style={{ padding: "5px 4px", textAlign: "center" }}>
                    <button onClick={() => remove(i)} title="Supprimer la ligne" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#c62828" }}>✕</button>
                  </td>
                </>
              ) : (
                <>
                  <td style={{ padding: "7px 12px" }}>{c.prenom || <span style={{ color: "#CCC" }}>—</span>}</td>
                  <td style={{ padding: "7px 12px", fontWeight: 600 }}>{c.nom || <span style={{ color: "#CCC" }}>—</span>}</td>
                  <td style={{ padding: "7px 12px", color: "#C8102E" }}>{c.email}</td>
                  <td style={{ padding: "7px 12px" }}>{c.phone || <span style={{ color: "#CCC" }}>—</span>}</td>
                  <td style={{ padding: "7px 12px", color: "#6A6A6A" }}>{c.fonction || <span style={{ color: "#CCC" }}>—</span>}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {editable && (
        <div style={{ padding: "8px 12px", borderTop: "1px solid #F0F0F0", background: "#FAFAFA" }}>
          <button onClick={add} style={{ background: "none", border: "1px dashed #C8102E", color: "#C8102E", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            + Ajouter une ligne
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function CoordinationClient({ cursusId }: { cursusId: string }) {
  const router = useRouter();
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"journees" | "equipe" | "etudiants" | "messages" | "documents" | "validation" | "parametres">("journees");
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
  const [addOpen, setAddOpen] = useState(false);
  const [newEns, setNewEns] = useState({ prenom: "", nom: "", email: "", fonction: "" });
  const [secOpen, setSecOpen] = useState(false);
  const [newSec, setNewSec] = useState({ prenom: "", nom: "", email: "" });
  const [equipeText, setEquipeText] = useState("");
  const [equipeResult, setEquipeResult] = useState("");
  const [equipeRows, setEquipeRows] = useState<ParsedContact[] | null>(null);
  const [editEnseignantId, setEditEnseignantId] = useState<string | null>(null);
  const [prospectText, setProspectText] = useState("");
  const [prospectRows, setProspectRows] = useState<ParsedContact[] | null>(null);
  const [prospectResult, setProspectResult] = useState("");
  const [prospectSel, setProspectSel] = useState<string[]>([]);
  const [oneProspect, setOneProspect] = useState({ email: "", prenom: "", nom: "", fonction: "" });
  const [dossierProspectId, setDossierProspectId] = useState<string | null>(null);
  const [pieceBusy, setPieceBusy] = useState<string | null>(null);
  const [proposerEnseignantId, setProposerEnseignantId] = useState<string | null>(null);
  const [proposerForm, setProposerForm] = useState({ subject: "", message: "" });
  const [proposerSel, setProposerSel] = useState<string[]>([]);
  const [proposerBusy, setProposerBusy] = useState(false);
  const [proposerRegistre, setProposerRegistre] = useState<"vouvoiement" | "tutoiement">("vouvoiement");

  // Génération IA du calendrier (consigne libre et/ou digitalisation d'un programme existant)
  type JourneeProposee = {
    date: string; heureDebut: string; heureFin: string; modaliteSession: string; commentaire: string;
    slots: { heureDebut: string; heureFin: string; titre: string; type: string; enseignantId?: string | null; description?: string; intervenant?: string | null }[];
    chevauchement?: string; // autres DU du coordinateur le même jour (info, non bloquant)
    journeeId?: string | null; // digitalisation : journée existante à remplir
  };
  const [iaOpen, setIaOpen] = useState(false);
  const [iaConsigne, setIaConsigne] = useState("");
  const [iaPropositions, setIaPropositions] = useState<JourneeProposee[]>([]);
  const [iaFichier, setIaFichier] = useState<{ nom: string; base64: string } | null>(null);
  const [iaIntervenants, setIaIntervenants] = useState<{ reconnus: number; inconnus: number } | null>(null);

  // Drag & drop des créneaux
  const [dragSlot, setDragSlot] = useState<{ journeeId: string; index: number } | null>(null);

  // Sauvegarde automatique des créneaux (débounce ~1s par journée)
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, "saving" | "saved" | "error">>({});

  const persistSlots = useCallback(async (journeeId: string, slots: Slot[]) => {
    setSaveStatus((s) => ({ ...s, [journeeId]: "saving" }));
    try {
      const res = await fetch(`/api/cursus/${cursusId}/journees/${journeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      });
      setSaveStatus((s) => ({ ...s, [journeeId]: res.ok ? "saved" : "error" }));
    } catch {
      setSaveStatus((s) => ({ ...s, [journeeId]: "error" }));
    }
  }, [cursusId]);

  const updateSlots = useCallback((journeeId: string, newSlots: Slot[]) => {
    setSlotsEdit((s) => ({ ...s, [journeeId]: newSlots }));
    if (saveTimers.current[journeeId]) clearTimeout(saveTimers.current[journeeId]);
    saveTimers.current[journeeId] = setTimeout(() => persistSlots(journeeId, newSlots), 1000);
  }, [persistSlots]);
  const [etudiants, setEtudiants] = useState<Etudiant[] | null>(null);
  const [etudiantsJournees, setEtudiantsJournees] = useState<{ id: string; date: string }[]>([]);
  const [messageText, setMessageText] = useState("");
  const [messagesDeplies, setMessagesDeplies] = useState<Set<string>>(new Set());
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
  const isSecretaire = role === "SECRETAIRE";
  // La secrétaire pédagogique gère créneaux/équipe/étudiants/documents mais pas notes ni réglages du DU.
  const isManager = isCoord || isSecretaire;
  const enseignantsById = new Map(data.enseignants.map((e) => [e.id, e]));
  const supportByKey = new Map(data.supports.map((s) => [`${s.formationId}:${s.slotId}`, s]));
  const getSlots = (j: Journee) => slotsEdit[j.id] ?? j.slots;
  const echangesPourMoi = data.echanges.filter((e) => e.statut === "EN_ATTENTE" && e.versEnseignantId === data.monEnseignantId);

  // Créneaux affectés à un enseignant, avec le contexte de leur journée (date, formationId).
  const journees = data.journees;
  function enseignantCreneaux(enseignantId: string) {
    return journees.flatMap((j) =>
      j.slots
        .filter((s) => s.enseignantId === enseignantId)
        .map((s) => ({ journeeId: j.id, date: j.date, slot: s }))
    );
  }

  function genererMessageProposition(enseignant: Enseignant, slots: { journeeId: string; date: string; slot: Slot }[], registre: "vouvoiement" | "tutoiement" = "vouvoiement"): string {
    return genererMessagePropositionCreneau({
      enseignantNom: enseignant.nom ?? enseignant.email,
      enseignantNomCivilite: enseignant.nomCivilite,
      cursusTitre: cursus.titre,
      cursusAnnee: cursus.annee,
      coordinateurNom: cursus.coordinateurNom,
      creneaux: slots.map((c) => ({ titre: c.slot.titre, dateStr: fdate(c.date), heureDebut: c.slot.heureDebut, heureFin: c.slot.heureFin })),
      registre,
    });
  }

  function openProposer(enseignantId: string) {
    const enseignant = enseignantsById.get(enseignantId);
    if (!enseignant) return;
    const creneaux = enseignantCreneaux(enseignantId);
    const aConfirmer = creneaux.filter((c) => !c.slot.confirmationStatut || c.slot.confirmationStatut === "PROPOSE");
    const cible = aConfirmer.length > 0 ? aConfirmer : creneaux;
    setProposerSel(cible.map((c) => `${c.journeeId}:${c.slot.slotId}`));
    setProposerRegistre("vouvoiement");
    setProposerForm({
      subject: `${cursus.titre} — proposition de créneau${cible.length > 1 ? "x" : ""}`,
      message: genererMessageProposition(enseignant, cible, "vouvoiement"),
    });
    setProposerEnseignantId(enseignantId);
  }

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

  // Valide une proposition IA : remplit la journée existante ciblée, sinon crée une journée
  async function validerIaProposition(p: {
    journeeId?: string | null; date: string; heureDebut: string; heureFin: string; modaliteSession: string;
    slots: { heureDebut: string; heureFin: string; titre: string; type: string; enseignantId?: string | null; description?: string }[];
  }): Promise<boolean> {
    if (p.journeeId) {
      const slots = p.slots.map((s, i) => ({
        slotId: `slot-${Date.now()}-${i}`,
        heureDebut: s.heureDebut, heureFin: s.heureFin, titre: s.titre,
        description: s.description ?? "", type: s.type, enseignantId: s.enseignantId ?? null,
      }));
      return !!(await api(`/api/cursus/${cursusId}/journees/${p.journeeId}`, "PATCH", { slots }));
    }
    return !!(await api(`/api/cursus/${cursusId}/journees`, "POST", {
      date: p.date, heureDebut: p.heureDebut, heureFin: p.heureFin,
      modaliteSession: p.modaliteSession, slots: p.slots,
    }));
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
  const nbAlertes = isManager && alertes
    ? alertes.creneauxSansEnseignant.length + alertes.conflits.length + alertes.invitationsEnAttente.length + alertes.supportsManquants.length + (alertes.intervenantsNonRattaches?.length ?? 0)
    : 0;

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
          <Link href="/formateur/coordination" style={{ fontSize: 13, color: "#6A6A6A", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>← Coordination</Link>
          <div style={{ width: 1, height: 18, background: "#E0E0E0", flexShrink: 0 }} />
          <div className="topbar-title" title={`${cursus.titre}${cursus.annee ? ` · ${cursus.annee}` : ""}`}>{cursus.titre}{cursus.annee ? ` · ${cursus.annee}` : ""}</div>
        </div>
        <div className="topbar-right">
          {cursus.statut === "PUBLIE"
            ? <span className="pill pill-green" style={{ flexShrink: 0 }}>Publié</span>
            : <span className="pill pill-orange" style={{ flexShrink: 0 }}>Brouillon</span>}
          {isManager && (
            <>
              <a
                href={`/api/pdf/cursus-programme/${cursusId}`}
                target="_blank"
                rel="noreferrer"
                title="Télécharger le programme PDF"
                style={{ ...btnGhost, padding: "6px 12px", fontSize: 12, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}
              >
                📄 PDF
              </a>
              <button
                style={{ ...btnGhost, padding: "6px 12px", fontSize: 12, whiteSpace: "nowrap", flexShrink: 0 }}
                title="Envoyer le programme par email"
                disabled={busy === "programme"}
                onClick={async () => {
                  const inclureEtudiants = confirm("Envoyer aussi le programme aux étudiants inscrits ?\nOK = enseignants + étudiants · Annuler = enseignants seulement");
                  setBusy("programme");
                  const r = await api(`/api/cursus/${cursusId}/envoyer-programme`, "POST", { inclureEtudiants });
                  if (r) alert(`Programme envoyé à ${r.envoyes} destinataire(s).`);
                  setBusy(null);
                }}
              >
                {busy === "programme" ? "Envoi…" : "✉️ Envoyer"}
              </button>
            </>
          )}
          {isCoord && (
            <button
              style={{ ...btnRed, padding: "6px 14px", fontSize: 12, whiteSpace: "nowrap", flexShrink: 0 }}
              disabled={busy === "statut"}
              onClick={async () => {
                setBusy("statut");
                await api(`/api/cursus/${cursusId}`, "PATCH", { statut: cursus.statut === "PUBLIE" ? "BROUILLON" : "PUBLIE" });
                await reload();
                setBusy(null);
              }}
            >
              {cursus.statut === "PUBLIE" ? "↩ Brouillon" : "🚀 Publier"}
            </button>
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
        {isManager && alertes && nbAlertes > 0 && (
          <div style={{ background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: 12, padding: "14px 18px", marginBottom: 20, fontSize: 13, color: "#5d4037", lineHeight: 1.8 }}>
            <strong>⚠️ À traiter :</strong>
            {alertes.creneauxSansEnseignant.length > 0 && <div>• {alertes.creneauxSansEnseignant.length} créneau(x) sans enseignant affecté</div>}
            {alertes.invitationsEnAttente.length > 0 && <div>• {alertes.invitationsEnAttente.length} invitation(s) enseignant en attente (onglet Équipe → relancer)</div>}
            {alertes.supportsManquants.length > 0 && <div>• {alertes.supportsManquants.length} support(s) de cours non chargé(s)</div>}
            {(alertes.intervenantsNonRattaches?.length ?? 0) > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
                <span>🔗 {alertes.intervenantsNonRattaches.length} intervenant(s) détecté(s) à l&apos;import mais non rattaché(s) à l&apos;équipe</span>
                <button
                  onClick={async () => {
                    setBusy("rematch");
                    const r = await api(`/api/cursus/${cursusId}/rematch-intervenants`, "POST");
                    if (r) alert(`✅ ${r.rattaches ?? 0} intervenant(s) rattaché(s).`);
                    await reload();
                    setBusy(null);
                  }}
                  disabled={busy === "rematch"}
                  style={{ background: "#5d4037", color: "white", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                >
                  {busy === "rematch" ? "Rattachement…" : "🔄 Réessayer le rattachement"}
                </button>
              </div>
            )}
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
            ...(isManager ? [["etudiants", "🎓 Étudiants"]] : []),
            ["messages", `💬 Messages${data.messages.length ? ` (${data.messages.length})` : ""}`],
            ...(isManager ? [["documents", "📄 Documents"]] : []),
            ...(isCoord ? [["validation", "🎓 Validation du DU"]] : []),
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
            {/* Génération IA du calendrier */}
            {isManager && (
              <div style={{ ...cardStyle, padding: "16px 22px", border: iaOpen ? "1.5px solid #C8102E" : "1px solid #E0E0E0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>✨ Générer le calendrier avec l&apos;IA</div>
                    <div style={{ fontSize: 12, color: "#6A6A6A", marginTop: 2 }}>
                      Décrivez vos contraintes en langage naturel, l&apos;IA propose les dates — vous validez ligne par ligne.
                    </div>
                  </div>
                  <button style={iaOpen ? btnGhost : btnRed} onClick={() => setIaOpen((v) => !v)}>
                    {iaOpen ? "Fermer" : "✨ Ouvrir"}
                  </button>
                </div>
                {iaOpen && (
                  <div style={{ marginTop: 14 }}>
                    <textarea
                      placeholder={"Ex : donne-moi 2 jours par mois (des jeudis et vendredis à la suite, de la même semaine), plutôt vers la fin du mois, mais en dehors des vacances scolaires (région parisienne). Il me faut 7 couples, à partir de novembre 2026, de 9h à 18h avec une pause de 13h à 14h."}
                      value={iaConsigne}
                      onChange={(e) => setIaConsigne(e.target.value)}
                      style={{ ...inputStyle, width: "100%", boxSizing: "border-box", minHeight: 90, resize: "vertical", lineHeight: 1.5 }}
                    />
                    {/* Fichier programme (digitalisation) */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap", padding: "10px 12px", background: "#F9F7F4", borderRadius: 10 }}>
                      <span style={{ fontSize: 12, color: "#444", fontWeight: 600 }}>📂 Programme existant (optionnel) :</span>
                      {iaFichier ? (
                        <>
                          <span style={{ fontSize: 12, color: "#2e7d32", fontWeight: 600 }}>✓ {iaFichier.nom}</span>
                          <button
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#6A6A6A", textDecoration: "underline", fontFamily: "inherit" }}
                            onClick={() => setIaFichier(null)}
                          >
                            retirer
                          </button>
                        </>
                      ) : (
                        <label style={{ fontSize: 12, color: "#C8102E", fontWeight: 700, cursor: "pointer" }}>
                          Charger un fichier (PDF, Word, Excel, CSV…)
                          <input
                            type="file"
                            accept=".pdf,.docx,.xlsx,.xlsm,.csv,.txt,.tsv,.md"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              if (f.size > 10 * 1024 * 1024) { alert("Fichier trop volumineux (max 10 Mo)"); return; }
                              const reader = new FileReader();
                              reader.onload = () => setIaFichier({ nom: f.name, base64: (reader.result as string).split(",")[1] ?? "" });
                              reader.readAsDataURL(f);
                            }}
                          />
                        </label>
                      )}
                      <span style={{ fontSize: 11, color: "#9A9A9A", flexBasis: "100%" }}>
                        Ex : le programme de l&apos;année dernière — l&apos;IA détecte les créneaux, durées et intervenants,
                        et les positionne sur vos journées {data.journees.length > 0 ? "déjà planifiées" : "(ou propose des dates transposées à l'année suivante)"}.
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
                      <button
                        style={btnRed}
                        disabled={(!iaConsigne.trim() && !iaFichier) || busy === "ia"}
                        onClick={async () => {
                          setBusy("ia");
                          setIaPropositions([]);
                          setIaIntervenants(null);
                          const r = await api(`/api/cursus/${cursusId}/journees/generer`, "POST", {
                            consigne: iaConsigne,
                            fichierNom: iaFichier?.nom,
                            fichierBase64: iaFichier?.base64,
                          });
                          if (r && Array.isArray(r.journees)) {
                            setIaPropositions(r.journees as JourneeProposee[]);
                            if (r.intervenants) setIaIntervenants(r.intervenants as { reconnus: number; inconnus: number });
                            if ((r.journees as JourneeProposee[]).length === 0) alert("Aucune journée générée — reformulez la consigne ou vérifiez le fichier.");
                          }
                          setBusy(null);
                        }}
                      >
                        {busy === "ia" ? "Analyse…" : iaFichier ? "✨ Digitaliser le programme" : "✨ Générer les dates"}
                      </button>
                      {iaPropositions.length > 0 && (
                        <>
                          <span style={{ fontSize: 12, color: "#2e7d32", fontWeight: 600 }}>
                            {iaPropositions.length} journée(s) proposée(s)
                            {iaIntervenants && ` · intervenants : ${iaIntervenants.reconnus} reconnu(s)${iaIntervenants.inconnus > 0 ? `, ${iaIntervenants.inconnus} à rattacher` : ""}`}
                          </span>
                          <button
                            style={{ ...btnGhost, marginLeft: "auto" }}
                            disabled={busy === "iaAll"}
                            onClick={async () => {
                              setBusy("iaAll");
                              let valides = 0;
                              for (const p of iaPropositions) {
                                if (await validerIaProposition(p)) valides++;
                              }
                              setIaPropositions([]);
                              setBusy(null);
                              alert(`✅ ${valides} journée(s) validée(s).`);
                              await reload();
                            }}
                          >
                            {busy === "iaAll" ? "Validation…" : "✓ Tout valider"}
                          </button>
                        </>
                      )}
                    </div>
                    {iaPropositions.length > 0 && (
                      <div style={{ marginTop: 12, border: "1px solid #EBEBEB", borderRadius: 10, overflow: "hidden" }}>
                        {iaPropositions.map((p, i) => (
                          <div key={i} style={{ padding: "11px 16px", borderBottom: i < iaPropositions.length - 1 ? "1px solid #F5F5F5" : "none", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                            <div style={{ flex: 1, minWidth: 240 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#0F0F0F" }}>
                                📅 {new Date(p.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                                <span style={{ fontWeight: 500, color: "#6A6A6A" }}> · {p.heureDebut}–{p.heureFin}</span>
                                {p.journeeId && (
                                  <span style={{ fontSize: 10, fontWeight: 700, background: "#e3f2fd", color: "#1565c0", padding: "2px 8px", borderRadius: 100, marginLeft: 8 }}>
                                    → remplit la journée existante
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 2 }}>{p.commentaire}</div>
                              {p.slots.length > 0 && (
                                <div style={{ fontSize: 11, color: "#444", marginTop: 3, lineHeight: 1.6 }}>
                                  {p.slots.map((s, k) => (
                                    <div key={k}>
                                      {s.heureDebut}–{s.heureFin} · {s.type === "pause" ? "☕ " : ""}{s.titre}
                                      {s.intervenant && s.type !== "pause" && (
                                        <span style={{ color: s.enseignantId ? "#2e7d32" : "#e65100", fontWeight: 600 }}>
                                          {" — "}{s.intervenant} {s.enseignantId ? "✓" : "(à rattacher)"}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {p.chevauchement && (
                                <div style={{ fontSize: 11, color: "#1565c0", marginTop: 3 }}>
                                  ℹ️ Même jour qu&apos;un autre de vos cursus : {p.chevauchement} — c&apos;est permis, à vous de voir.
                                </div>
                              )}
                            </div>
                            {!p.journeeId && (
                              <input
                                type="date"
                                value={p.date}
                                onChange={(e) => setIaPropositions((arr) => arr.map((x, k) => k === i ? { ...x, date: e.target.value } : x))}
                                style={{ ...inputStyle, padding: "5px 8px", fontSize: 12 }}
                              />
                            )}
                            <button
                              style={{ ...btnRed, padding: "6px 12px", fontSize: 12 }}
                              disabled={busy === `iaCreate-${i}`}
                              onClick={async () => {
                                setBusy(`iaCreate-${i}`);
                                const ok = await validerIaProposition(p);
                                if (ok) {
                                  setIaPropositions((arr) => arr.filter((_, k) => k !== i));
                                  await reload();
                                }
                                setBusy(null);
                              }}
                            >
                              {p.journeeId ? "✓ Appliquer" : "✓ Créer"}
                            </button>
                            <button
                              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#6A6A6A" }}
                              onClick={() => setIaPropositions((arr) => arr.filter((_, k) => k !== i))}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <div style={{ padding: "8px 16px", background: "#fff8e1", fontSize: 11, color: "#5d4037" }}>
                          ⚠️ Vérifiez les dates par rapport au calendrier officiel des vacances scolaires avant de valider — l&apos;IA peut se tromper sur les zones.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {isManager && (
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

            {data.journees.length > 0 && (() => {
              const volumeActuelMin = data.journees.reduce((sum, j) => sum + sommeDureeSlots(getSlots(j)), 0);
              const volumeAttenduMin = cursus.volumeHoraireAttendu ? Math.round(cursus.volumeHoraireAttendu * 60) : null;
              const manquantMin = volumeAttenduMin != null ? Math.max(0, volumeAttenduMin - volumeActuelMin) : 0;
              return (
                <div style={{ ...cardStyle, padding: "14px 22px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#6A6A6A", textTransform: "uppercase", letterSpacing: 1 }}>⏱ Volume horaire total</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#C8102E" }}>{formatDureeHeures(volumeActuelMin)}</span>
                    <span style={{ fontSize: 11, color: "#9A9A9A" }}>(hors pauses)</span>
                    {volumeAttenduMin != null && (
                      <span style={{ fontSize: 12, color: "#6A6A6A" }}>· attendu : {formatDureeHeures(volumeAttenduMin)}</span>
                    )}
                  </div>
                  {volumeAttenduMin != null && manquantMin > 0 && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #F0F0F0" }}>
                      <div style={{ fontSize: 13, color: "#e65100", fontWeight: 700, marginBottom: 4 }}>
                        ⚠️ Il manque {formatDureeHeures(manquantMin)} pour atteindre le volume attendu
                      </div>
                      <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 10 }}>
                        Soit environ {Math.ceil(manquantMin / 120)} créneau{Math.ceil(manquantMin / 120) > 1 ? "x" : ""} de 2h,
                        {" "}{Math.ceil(manquantMin / 90)} créneau{Math.ceil(manquantMin / 90) > 1 ? "x" : ""} de 1h30,
                        {" "}ou {Math.ceil(manquantMin / 60)} créneau{Math.ceil(manquantMin / 60) > 1 ? "x" : ""} de 1h.
                      </div>
                      {isManager && (
                        <button
                          style={btnRed}
                          disabled={busy === "genererCreneaux"}
                          onClick={async () => {
                            setBusy("genererCreneaux");
                            const r = await api(`/api/cursus/${cursusId}/generer-creneaux-manquants`, "POST");
                            setBusy(null);
                            if (r) {
                              alert(r.crees > 0
                                ? `${r.crees} créneau(x) à définir ont été ajoutés (${formatDureeHeures(r.minutesAjoutees)}). Pensez à leur donner un titre et un enseignant.`
                                : "Aucun créneau libre trouvé dans les journées existantes — ajoutez de nouvelles journées si besoin.");
                              await reload();
                            }
                          }}
                        >
                          {busy === "genererCreneaux" ? "Génération…" : "🪄 Générer les créneaux manquants"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {data.journees.map((j, idx) => {
              const slots = getSlots(j);
              const insertAt = (index: number) => {
                const prev = slots[index - 1];
                const next = slots[index];
                updateSlots(j.id, [
                  ...slots.slice(0, index),
                  { slotId: `slot-${Date.now()}`, heureDebut: prev?.heureFin || j.heureDebut, heureFin: next?.heureDebut || "", titre: "", description: "", type: "cours", enseignantId: null },
                  ...slots.slice(index),
                ]);
              };
              const dropAt = (index: number) => {
                if (!dragSlot || dragSlot.journeeId !== j.id) return;
                const from = dragSlot.index;
                let to = index;
                if (from < to) to -= 1;
                setDragSlot(null);
                if (to === from) return;
                const arr = [...slots];
                const [moved] = arr.splice(from, 1);
                arr.splice(to, 0, moved);
                updateSlots(j.id, arr);
              };
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
                        {` · ⏱ ${formatDureeHeures(sommeDureeSlots(slots))} de cours`}
                      </div>
                    </div>
                    <Link href={`/formateur/formations/${j.id}`} style={{ fontSize: 12, fontWeight: 700, color: "#C8102E", textDecoration: "none", border: "1.5px solid #C8102E", borderRadius: 8, padding: "5px 12px" }}>
                      Machinerie journée →
                    </Link>
                    {isManager && (
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
                      const peutEditer = isManager;
                      const enCoursDeDrag = dragSlot?.journeeId === j.id && dragSlot.index === si;
                      return (
                        <div key={slot.slotId}>
                          {isManager && (
                            <InsertLine
                              onInsert={() => insertAt(si)}
                              onDropSlot={() => dropAt(si)}
                              isDropTarget={!!dragSlot && dragSlot.journeeId === j.id}
                            />
                          )}
                        <div style={{ padding: "12px 22px", borderBottom: "1px solid #F5F5F5", background: estMonSlot ? "#fff5f6" : "white", opacity: enCoursDeDrag ? 0.4 : 1 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: peutEditer ? 6 : 0 }}>
                            {peutEditer ? (
                              <>
                                <span
                                  draggable
                                  onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; setDragSlot({ journeeId: j.id, index: si }); }}
                                  onDragEnd={() => setDragSlot(null)}
                                  title="Glisser pour réordonner"
                                  style={{ cursor: "grab", color: "#B0B0B0", fontSize: 15, padding: "2px 4px", userSelect: "none", flexShrink: 0 }}
                                >
                                  ⠿
                                </span>
                                <input type="time" value={slot.heureDebut} onChange={(e) => updateSlots(j.id, slots.map((x, k) => k === si ? { ...x, heureDebut: e.target.value } : x))} style={{ ...inputStyle, padding: "5px 7px", fontSize: 12 }} />
                                <span style={{ fontSize: 11, color: "#6A6A6A" }}>→</span>
                                <input type="time" value={slot.heureFin} onChange={(e) => updateSlots(j.id, slots.map((x, k) => k === si ? { ...x, heureFin: e.target.value } : x))} style={{ ...inputStyle, padding: "5px 7px", fontSize: 12 }} />
                                <input type="text" placeholder="Titre du cours" value={slot.titre} onChange={(e) => updateSlots(j.id, slots.map((x, k) => k === si ? { ...x, titre: e.target.value } : x))} style={{ ...inputStyle, padding: "5px 9px", fontSize: 12, flex: 1, minWidth: 160 }} />
                                <select
                                  value={slot.type}
                                  onChange={(e) => updateSlots(j.id, slots.map((x, k) => k === si ? {
                                    ...x, type: e.target.value,
                                    ...(e.target.value === "pause" ? { enseignantId: null, intervenantRaw: null, confirmationStatut: null } : {}),
                                  } : x))}
                                  style={{ ...inputStyle, padding: "5px 7px", fontSize: 12 }}
                                >
                                  {SLOT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                                {slot.type !== "pause" && (
                                  <select
                                    value={slot.enseignantId ?? ""}
                                    onChange={(e) => updateSlots(j.id, slots.map((x, k) => k === si ? { ...x, enseignantId: e.target.value || null, intervenantRaw: e.target.value ? null : x.intervenantRaw } : x))}
                                    style={{ ...inputStyle, padding: "5px 7px", fontSize: 12, borderColor: slot.enseignantId ? "#E0E0E0" : "#e65100" }}
                                  >
                                    <option value="">— Enseignant —</option>
                                    {data.enseignants.map((e) => <option key={e.id} value={e.id}>{e.nom ?? e.email}{e.statut === "EN_ATTENTE" ? " (invité)" : ""}</option>)}
                                  </select>
                                )}
                                {slot.type !== "pause" && slot.enseignantId && (
                                  <>
                                    {confirmationDot(slot.confirmationStatut)}
                                    <select
                                      value={slot.confirmationStatut ?? ""}
                                      title="Statut de confirmation de l'enseignant — modifiable manuellement"
                                      onChange={(e) => updateSlots(j.id, slots.map((x, k) => k === si ? { ...x, confirmationStatut: (e.target.value || null) as Slot["confirmationStatut"] } : x))}
                                      style={{ ...inputStyle, padding: "5px 7px", fontSize: 11, width: 116 }}
                                    >
                                      <option value="">Non demandé</option>
                                      <option value="PROPOSE">Proposé</option>
                                      <option value="CONFIRME">Confirmé</option>
                                      <option value="DECLINE">Décliné</option>
                                    </select>
                                  </>
                                )}
                                <button
                                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#6A6A6A" }}
                                  onClick={() => updateSlots(j.id, slots.filter((_, k) => k !== si))}
                                >
                                  ✕
                                </button>
                              </>
                            ) : (
                              <>
                                <span style={{ fontSize: 12, color: "#6A6A6A", whiteSpace: "nowrap" }}>{slot.heureDebut}–{slot.heureFin}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#0F0F0F", flex: 1 }}>{slot.titre}</span>
                                {slot.type !== "pause" && slot.enseignantId && confirmationDot(slot.confirmationStatut)}
                                <span style={{ fontSize: 12, color: slot.enseignantId ? "#C8102E" : "#e65100", fontWeight: 600 }}>
                                  {slot.type === "pause" ? "☕" : slot.enseignantId ? (enseignantsById.get(slot.enseignantId)?.nom ?? enseignantsById.get(slot.enseignantId)?.email) : "Non affecté"}
                                  {estMonSlot && " (vous)"}
                                </span>
                              </>
                            )}
                          </div>
                          {/* Lieu du créneau (site / salle / visio) — laisser vide reprend le lieu de la journée */}
                          {slot.type !== "pause" && (
                            peutEditer ? (
                              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 4, marginLeft: 23 }}>
                                <input
                                  type="text" placeholder="Site (ex : Hôpital Saint-Antoine)"
                                  value={slot.lieuNom ?? ""}
                                  onChange={(e) => updateSlots(j.id, slots.map((x, k) => k === si ? { ...x, lieuNom: e.target.value } : x))}
                                  style={{ ...inputStyle, padding: "4px 8px", fontSize: 11, width: 190 }}
                                />
                                <input
                                  type="text" placeholder="Salle (ex : 206)"
                                  value={slot.salle ?? ""}
                                  onChange={(e) => updateSlots(j.id, slots.map((x, k) => k === si ? { ...x, salle: e.target.value } : x))}
                                  style={{ ...inputStyle, padding: "4px 8px", fontSize: 11, width: 110 }}
                                />
                                <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6A6A6A", cursor: "pointer" }}>
                                  <input
                                    type="checkbox"
                                    checked={!!slot.enVisio}
                                    onChange={(e) => updateSlots(j.id, slots.map((x, k) => k === si ? { ...x, enVisio: e.target.checked } : x))}
                                  />
                                  Ce créneau se fait en visio
                                </label>
                              </div>
                            ) : (slot.lieuNom || slot.salle || slot.enVisio) && (
                              <div style={{ marginTop: 4, marginLeft: 0, fontSize: 11, color: "#6A6A6A" }}>
                                {slot.enVisio && "💻 Visio"}
                                {slot.enVisio && (slot.lieuNom || slot.salle) && " · "}
                                {slot.lieuNom}{slot.lieuNom && slot.salle && " · "}{slot.salle && `Salle ${slot.salle}`}
                              </div>
                            )
                          )}
                          {/* Intervenant détecté à l'import mais non rattaché */}
                          {slot.intervenantRaw && !slot.enseignantId && slot.type !== "pause" && (
                            <div style={{ marginTop: 4, fontSize: 11, color: "#e65100", fontWeight: 600 }}>
                              🔗 Intervenant détecté à l&apos;import : <em>{slot.intervenantRaw}</em>
                              <span style={{ fontWeight: 400, color: "#8d5b32" }}> — invitez-le dans l&apos;équipe pour rattacher automatiquement</span>
                            </div>
                          )}
                          {/* Support + échange */}
                          {slot.type !== "pause" && (
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                              {support ? (
                                <>
                                  <span style={{ fontSize: 11, color: "#2e7d32", fontWeight: 600 }}>📎 {support.nom}</span>
                                  {(isManager || estMonSlot) && (
                                    <button
                                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#6A6A6A", textDecoration: "underline", fontFamily: "inherit" }}
                                      onClick={async () => { await api(`/api/cursus/${cursusId}/journees/${j.id}/support`, "DELETE", { slotId: slot.slotId }); await reload(); }}
                                    >
                                      retirer
                                    </button>
                                  )}
                                </>
                              ) : (isManager || estMonSlot) ? (
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
                        </div>
                      );
                    })}
                    {isManager && slots.length > 0 && (
                      <InsertLine
                        onInsert={() => insertAt(slots.length)}
                        onDropSlot={() => dropAt(slots.length)}
                        isDropTarget={!!dragSlot && dragSlot.journeeId === j.id}
                      />
                    )}
                    {isManager && (
                      <div style={{ padding: "12px 22px", display: "flex", gap: 10, alignItems: "center" }}>
                        <button
                          style={btnGhost}
                          onClick={() => updateSlots(j.id, [...slots, { slotId: `slot-${Date.now()}`, heureDebut: j.heureDebut, heureFin: "", titre: "", description: "", type: "cours", enseignantId: null, lieuNom: null, salle: null, enVisio: false }])}
                        >
                          + Créneau
                        </button>
                        {saveStatus[j.id] === "saving" && <span style={{ fontSize: 12, color: "#6A6A6A" }}>💾 Enregistrement…</span>}
                        {saveStatus[j.id] === "saved" && <span style={{ fontSize: 12, color: "#2e7d32", fontWeight: 600 }}>✓ Enregistré</span>}
                        {saveStatus[j.id] === "error" && (
                          <button style={{ ...btnGhost, color: "#c62828", borderColor: "#ffcdd2" }} onClick={() => persistSlots(j.id, slots)}>
                            ⚠️ Non enregistré — réessayer
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
            {isManager && (
              <>
                <div style={{ ...cardStyle, padding: addOpen ? "18px 22px" : "12px 22px" }}>
                  {!addOpen ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <button style={btnRed} onClick={() => setAddOpen(true)}>+ Ajouter un enseignant</button>
                      <span style={{ fontSize: 12, color: "#6A6A6A" }}>ou utilisez l&apos;import en masse ci-dessous ↓</span>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, alignItems: "end" }}>
                        <div>
                          <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 3 }}>Prénom</div>
                          <input value={newEns.prenom} onChange={(e) => setNewEns((s) => ({ ...s, prenom: e.target.value }))} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} placeholder="Marie" />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 3 }}>Nom</div>
                          <input value={newEns.nom} onChange={(e) => setNewEns((s) => ({ ...s, nom: e.target.value }))} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} placeholder="DUPONT" />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 3 }}>Fonction / note</div>
                          <input value={newEns.fonction} onChange={(e) => setNewEns((s) => ({ ...s, fonction: e.target.value }))} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} placeholder="PU-PH cardiologie" />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 3 }}>Email *</div>
                          <input type="email" value={newEns.email} onChange={(e) => setNewEns((s) => ({ ...s, email: e.target.value }))} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} placeholder="prenom.nom@chu.fr" />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                        <button style={btnGhost} onClick={() => { setAddOpen(false); setNewEns({ prenom: "", nom: "", email: "", fonction: "" }); }}>Annuler</button>
                        <div style={{ flex: 1 }} />
                        <button
                          style={btnGhost}
                          disabled={!newEns.email.includes("@") || busy === "addSans"}
                          onClick={async () => {
                            setBusy("addSans");
                            const ok = await api(`/api/cursus/${cursusId}/enseignants`, "POST", { ...newEns, sansInviter: true });
                            if (ok) {
                              if ((ok.rattaches ?? 0) > 0) alert(`🔗 ${ok.rattaches} intervenant(s) auto-rattaché(s).`);
                              setAddOpen(false); setNewEns({ prenom: "", nom: "", email: "", fonction: "" }); await reload();
                            }
                            setBusy(null);
                          }}
                        >
                          💾 Enregistrer sans inviter
                        </button>
                        <button
                          style={btnRed}
                          disabled={!newEns.email.includes("@") || busy === "addInvite"}
                          onClick={async () => {
                            setBusy("addInvite");
                            const ok = await api(`/api/cursus/${cursusId}/enseignants`, "POST", { ...newEns });
                            if (ok) {
                              if ((ok.rattaches ?? 0) > 0) alert(`🔗 ${ok.rattaches} intervenant(s) auto-rattaché(s).`);
                              setAddOpen(false); setNewEns({ prenom: "", nom: "", email: "", fonction: "" }); await reload();
                            }
                            setBusy(null);
                          }}
                        >
                          ✉️ Enregistrer et inviter
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Import en masse */}
                <div style={{ ...cardStyle, padding: "16px 22px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Importer toute l&apos;équipe d&apos;un coup</div>
                  <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 10, lineHeight: 1.5 }}>
                    Collez votre liste (CSV, export Excel, ou simple texte) OU <strong>importez un fichier</strong> (PDF, Word, Excel, CSV).
                    Les emails, noms, prénoms, téléphones et fonctions sont <strong>détectés automatiquement</strong>. Vérifiez et modifiez l&apos;aperçu avant d&apos;enregistrer.
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff5f6", color: "#C8102E", border: "1.5px dashed #C8102E", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: busy === "equipeFile" ? "wait" : "pointer" }}>
                      {busy === "equipeFile" ? "Analyse du fichier…" : "📎 Importer depuis un fichier (PDF / Word / Excel / CSV)"}
                      <input
                        type="file"
                        accept=".pdf,.docx,.xlsx,.xlsm,.csv,.txt,.tsv,.md"
                        style={{ display: "none" }}
                        disabled={busy === "equipeFile"}
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          if (f.size > 10 * 1024 * 1024) { alert("Fichier trop volumineux (max 10 Mo)"); return; }
                          setBusy("equipeFile");
                          try {
                            const base64 = await new Promise<string>((resolve) => {
                              const r = new FileReader();
                              r.onload = () => resolve((r.result as string).split(",")[1] ?? "");
                              r.readAsDataURL(f);
                            });
                            const r = await api(`/api/cursus/${cursusId}/extract-contacts`, "POST", { fichierNom: f.name, fichierBase64: base64 });
                            if (r?.contacts) {
                              setEquipeRows(r.contacts as ParsedContact[]);
                              if ((r.contacts as ParsedContact[]).length === 0) {
                                alert("Aucun contact détecté dans le fichier. Réessayez avec une consigne texte, ou vérifiez que le document contient des adresses email.");
                              }
                            }
                          } finally {
                            setBusy(null);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </label>
                  </div>
                  {equipeRows === null ? (
                    <>
                      <textarea
                        placeholder={"MARTIN Jeanne jeanne.martin@chu.fr 06 12 34 56 78 PU-PH cardiologie\ndupont@aphp.fr;Dupont;Paul;Praticien hospitalier"}
                        value={equipeText}
                        onChange={(e) => setEquipeText(e.target.value)}
                        style={{ ...inputStyle, width: "100%", boxSizing: "border-box", minHeight: 100, fontFamily: "monospace", fontSize: 12, resize: "vertical" }}
                      />
                      <PreviewTable contacts={parseContacts(equipeText)} />
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                        <button
                          style={btnGhost}
                          disabled={parseContacts(equipeText).length === 0}
                          onClick={() => setEquipeRows(parseContacts(equipeText))}
                        >
                          ✏️ Modifier avant d&apos;enregistrer
                        </button>
                        <button
                          style={btnGhost}
                          disabled={parseContacts(equipeText).length === 0 || busy === "equipeSans"}
                          onClick={async () => {
                            setBusy("equipeSans");
                            const contacts = parseContacts(equipeText).map((c) => ({
                              email: c.email, prenom: c.prenom || undefined, nom: c.nom || undefined,
                              phone: c.phone || undefined, fonction: c.fonction || undefined,
                            }));
                            const r = await api(`/api/cursus/${cursusId}/enseignants`, "POST", { enseignants: contacts, sansInviter: true });
                            if (r) {
                              const suffix = (r.rattaches ?? 0) > 0 ? ` · 🔗 ${r.rattaches} intervenant(s) auto-rattaché(s)` : "";
                              setEquipeResult(`✅ ${r.invites} enseignant(s) enregistré(s) sans invitation, ${r.doublons} déjà dans l'équipe.${suffix}`);
                              setEquipeText("");
                              await reload();
                            }
                            setBusy(null);
                          }}
                        >
                          {busy === "equipeSans" ? "Enregistrement…" : `💾 Enregistrer sans inviter (${parseContacts(equipeText).length})`}
                        </button>
                        <button
                          style={btnRed}
                          disabled={parseContacts(equipeText).length === 0 || busy === "equipeImport"}
                          onClick={async () => {
                            setBusy("equipeImport");
                            const contacts = parseContacts(equipeText).map((c) => ({
                              email: c.email, prenom: c.prenom || undefined, nom: c.nom || undefined,
                              phone: c.phone || undefined, fonction: c.fonction || undefined,
                            }));
                            const r = await api(`/api/cursus/${cursusId}/enseignants`, "POST", { enseignants: contacts });
                            if (r) {
                              const suffix = (r.rattaches ?? 0) > 0 ? ` · 🔗 ${r.rattaches} intervenant(s) auto-rattaché(s)` : "";
                              setEquipeResult(`✅ ${r.invites} invitation(s) envoyée(s), ${r.doublons} déjà dans l'équipe, ${r.erreurs} ligne(s) sans email valide.${suffix}`);
                              setEquipeText("");
                              await reload();
                            }
                            setBusy(null);
                          }}
                        >
                          {busy === "equipeImport" ? "Envoi…" : `✉️ Enregistrer et inviter (${parseContacts(equipeText).length})`}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 12, color: "#0F0F0F", background: "#e3f2fd", borderRadius: 8, padding: "8px 12px", marginTop: 4 }}>
                        ✏️ Mode édition manuelle — corrigez les lignes, ajoutez ou supprimez des enseignants, puis choisissez d&apos;enregistrer avec ou sans invitation.
                      </div>
                      <PreviewTable contacts={equipeRows} editable onChange={setEquipeRows} />
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                        <button
                          style={btnGhost}
                          onClick={() => { setEquipeRows(null); }}
                        >
                          ← Revenir au texte
                        </button>
                        <div style={{ flex: 1 }} />
                        <button
                          style={btnGhost}
                          disabled={equipeRows.filter((r) => r.email.includes("@")).length === 0 || busy === "equipeSans"}
                          onClick={async () => {
                            setBusy("equipeSans");
                            const contacts = equipeRows.filter((r) => r.email.includes("@")).map((c) => ({
                              email: c.email, prenom: c.prenom || undefined, nom: c.nom || undefined,
                              phone: c.phone || undefined, fonction: c.fonction || undefined,
                            }));
                            const r = await api(`/api/cursus/${cursusId}/enseignants`, "POST", { enseignants: contacts, sansInviter: true });
                            if (r) {
                              const suffix = (r.rattaches ?? 0) > 0 ? ` · 🔗 ${r.rattaches} intervenant(s) auto-rattaché(s)` : "";
                              setEquipeResult(`✅ ${r.invites} enseignant(s) enregistré(s) sans invitation, ${r.doublons} déjà dans l'équipe.${suffix}`);
                              setEquipeRows(null);
                              setEquipeText("");
                              await reload();
                            }
                            setBusy(null);
                          }}
                        >
                          {busy === "equipeSans" ? "Enregistrement…" : `💾 Enregistrer sans inviter (${equipeRows.filter((r) => r.email.includes("@")).length})`}
                        </button>
                        <button
                          style={btnRed}
                          disabled={equipeRows.filter((r) => r.email.includes("@")).length === 0 || busy === "equipeImport"}
                          onClick={async () => {
                            setBusy("equipeImport");
                            const contacts = equipeRows.filter((r) => r.email.includes("@")).map((c) => ({
                              email: c.email, prenom: c.prenom || undefined, nom: c.nom || undefined,
                              phone: c.phone || undefined, fonction: c.fonction || undefined,
                            }));
                            const r = await api(`/api/cursus/${cursusId}/enseignants`, "POST", { enseignants: contacts });
                            if (r) {
                              const suffix = (r.rattaches ?? 0) > 0 ? ` · 🔗 ${r.rattaches} intervenant(s) auto-rattaché(s)` : "";
                              setEquipeResult(`✅ ${r.invites} invitation(s) envoyée(s), ${r.doublons} déjà dans l'équipe, ${r.erreurs} ligne(s) sans email valide.${suffix}`);
                              setEquipeRows(null);
                              setEquipeText("");
                              await reload();
                            }
                            setBusy(null);
                          }}
                        >
                          {busy === "equipeImport" ? "Envoi…" : `✉️ Enregistrer et inviter (${equipeRows.filter((r) => r.email.includes("@")).length})`}
                        </button>
                      </div>
                    </>
                  )}
                  {equipeResult && <div style={{ fontSize: 12, color: "#2e7d32", marginTop: 8 }}>{equipeResult}</div>}
                </div>
              </>
            )}

            {isManager && data.enseignants.some((e) => e.role !== "SECRETAIRE") && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                <Link href={`/formateur/coordination/${cursusId}/propositions`} target="_blank" style={{ textDecoration: "none" }}>
                  <span style={{ ...btnGhost, display: "inline-block" }}>📋 Voir toutes les propositions</span>
                </Link>
              </div>
            )}

            <div style={cardStyle}>
              {data.enseignants.filter((e) => e.role !== "SECRETAIRE").length === 0 && <div style={{ padding: "30px 22px", textAlign: "center", color: "#6A6A6A", fontSize: 13 }}>Aucun enseignant pour l&apos;instant.</div>}
              {data.enseignants.filter((e) => e.role !== "SECRETAIRE").map((e) => {
                const mesCreneaux = enseignantCreneaux(e.id);
                const nbCreneaux = mesCreneaux.length;
                const nbAConfirmer = mesCreneaux.filter((c) => !c.slot.confirmationStatut || c.slot.confirmationStatut === "PROPOSE").length;
                return (
                <div key={e.id} style={{ borderBottom: "1px solid #F5F5F5" }}>
                  <div style={{ padding: "14px 22px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0F0F0F" }}>
                        {e.nom ?? e.email}
                        {e.fonction && <span style={{ fontSize: 11, fontWeight: 500, color: "#6A6A6A", marginLeft: 8 }}>· {e.fonction}</span>}
                        {e.coCoordinateur && <span style={{ fontSize: 10, fontWeight: 700, background: "#e3f2fd", color: "#1565c0", padding: "2px 8px", borderRadius: 100, marginLeft: 8 }}>Co-coordinateur</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "#6A6A6A" }}>
                        {e.email}{e.phone ? ` · 📞 ${e.phone}` : ""} · {nbCreneaux} créneau{nbCreneaux > 1 ? "x" : ""}
                        {nbCreneaux > 0 && nbAConfirmer === 0 && <span style={{ color: "#2e7d32", fontWeight: 600 }}> · tous confirmés</span>}
                      </div>
                    </div>
                    {e.statut === "ACCEPTE"
                      ? <span className="pill pill-green">Actif</span>
                      : e.statut === "EN_ATTENTE"
                      ? <span className="pill pill-orange">Invitation en attente</span>
                      : <span className="pill pill-gray">Enregistré · non invité</span>}
                    {isManager && nbCreneaux > 0 && (
                      <button
                        style={nbAConfirmer > 0 ? btnRed : btnGhost}
                        onClick={() => openProposer(e.id)}
                      >
                        ✉️ Proposer{nbAConfirmer > 0 ? ` (${nbAConfirmer})` : ""}
                      </button>
                    )}
                    {isManager && (
                      <>
                        {e.statut === "NON_INVITE" && (
                          <button
                            style={btnRed}
                            onClick={async () => {
                              const r = await api(`/api/cursus/${cursusId}/enseignants/${e.id}`, "PATCH", { action: "inviter" });
                              if (r) { alert("Invitation envoyée !"); await reload(); }
                            }}
                          >
                            ✉️ Inviter
                          </button>
                        )}
                        {e.statut === "EN_ATTENTE" && (
                          <button style={btnGhost} onClick={async () => { const r = await api(`/api/cursus/${cursusId}/enseignants/${e.id}`, "PATCH", { action: "relancer" }); if (r) alert("Invitation relancée !"); }}>
                            🔔 Relancer
                          </button>
                        )}
                        <button
                          style={btnGhost}
                          onClick={() => setEditEnseignantId(editEnseignantId === e.id ? null : e.id)}
                        >
                          {editEnseignantId === e.id ? "Fermer" : "✏️ Modifier"}
                        </button>
                        {isCoord && (
                          <button
                            style={btnGhost}
                            onClick={async () => { await api(`/api/cursus/${cursusId}/enseignants/${e.id}`, "PATCH", { coCoordinateur: !e.coCoordinateur }); await reload(); }}
                          >
                            {e.coCoordinateur ? "Retirer co-coord." : "Co-coordinateur"}
                          </button>
                        )}
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
                  {editEnseignantId === e.id && isManager && (
                    <EnseignantEdit
                      enseignant={e}
                      onSave={async (patch) => {
                        await api(`/api/cursus/${cursusId}/enseignants/${e.id}`, "PATCH", patch);
                        setEditEnseignantId(null);
                        await reload();
                      }}
                    />
                  )}
                </div>
                );
              })}
            </div>

            {proposerEnseignantId && (() => {
              const enseignant = enseignantsById.get(proposerEnseignantId);
              if (!enseignant) return null;
              const creneaux = enseignantCreneaux(proposerEnseignantId);
              const lienPortail = typeof window !== "undefined" ? `${window.location.origin}/cursus/confirmation/${cursusId}` : "";
              const statutPill = (statut?: "PROPOSE" | "CONFIRME" | "DECLINE" | null) => {
                if (statut === "CONFIRME") return <span className="pill pill-green">Confirmé</span>;
                if (statut === "DECLINE") return <span className="pill pill-gray">Décliné</span>;
                if (statut === "PROPOSE") return <span className="pill pill-orange">Proposé</span>;
                return <span className="pill pill-gray">Non demandé</span>;
              };
              return (
                <div onClick={() => setProposerEnseignantId(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
                  <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 16, padding: "24px 28px", width: 620, maxWidth: "100%", maxHeight: "88vh", overflowY: "auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ fontSize: 16, fontWeight: 800 }}>✉️ Proposer un créneau</div>
                      <button onClick={() => setProposerEnseignantId(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#6A6A6A" }}>✕</button>
                    </div>
                    <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 16 }}>{enseignant.nomCivilite} · {enseignant.email}</div>

                    <div style={{ fontSize: 12, fontWeight: 700, color: "#6A6A6A", marginBottom: 6 }}>Créneaux à inclure dans le message</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                      {creneaux.map((c) => {
                        const key = `${c.journeeId}:${c.slot.slotId}`;
                        const checked = proposerSel.includes(key);
                        return (
                          <label key={key} style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid #EBEBEB", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(ev) => setProposerSel((s) => ev.target.checked ? [...s, key] : s.filter((k) => k !== key))}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{c.slot.titre}</div>
                              <div style={{ fontSize: 11, color: "#9A9A9A" }}>{fdate(c.date)} · {c.slot.heureDebut}–{c.slot.heureFin}</div>
                            </div>
                            {statutPill(c.slot.confirmationStatut)}
                          </label>
                        );
                      })}
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 700, color: "#6A6A6A", marginBottom: 4 }}>Sujet</div>
                    <input
                      value={proposerForm.subject}
                      onChange={(e) => setProposerForm((s) => ({ ...s, subject: e.target.value }))}
                      style={{ ...inputStyle, width: "100%", boxSizing: "border-box", marginBottom: 12 }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#6A6A6A" }}>Message (pré-rempli, modifiable)</div>
                      <button
                        title="Basculer vouvoiement / tutoiement — régénère le message ci-dessous"
                        style={{ background: proposerRegistre === "tutoiement" ? "#fff5f6" : "white", border: `1.5px solid ${proposerRegistre === "tutoiement" ? "#C8102E" : "#E0E0E0"}`, borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: proposerRegistre === "tutoiement" ? "#C8102E" : "#6A6A6A" }}
                        onClick={() => {
                          const next = proposerRegistre === "tutoiement" ? "vouvoiement" : "tutoiement";
                          const cible = creneaux.filter((c) => proposerSel.includes(`${c.journeeId}:${c.slot.slotId}`));
                          setProposerRegistre(next);
                          setProposerForm((s) => ({ ...s, message: genererMessageProposition(enseignant, cible, next) }));
                        }}
                      >
                        🗣️ Tutoiement {proposerRegistre === "tutoiement" ? "activé" : ""}
                      </button>
                    </div>
                    <textarea
                      value={proposerForm.message}
                      onChange={(e) => setProposerForm((s) => ({ ...s, message: e.target.value }))}
                      style={{ ...inputStyle, width: "100%", boxSizing: "border-box", minHeight: 220, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
                    />
                    <div style={{ fontSize: 11, color: "#9A9A9A", marginTop: 6, marginBottom: 16 }}>
                      Un lien de confirmation en ligne (sans compte à créer) sera ajouté automatiquement si vous envoyez via la plateforme,
                      ou peut être copié ci-dessous pour l&apos;ajouter vous-même.
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        style={btnRed}
                        disabled={proposerBusy || proposerSel.length === 0}
                        onClick={async () => {
                          setProposerBusy(true);
                          const slots = proposerSel.map((key) => { const [journeeId, slotId] = key.split(":"); return { journeeId, slotId }; });
                          const r = await api(`/api/cursus/${cursusId}/proposer-creneau`, "POST", {
                            enseignantId: proposerEnseignantId, subject: proposerForm.subject, message: proposerForm.message, slots,
                          });
                          setProposerBusy(false);
                          if (r) { alert("Proposition envoyée !"); setProposerEnseignantId(null); await reload(); }
                        }}
                      >
                        {proposerBusy ? "Envoi…" : "📧 Envoyer via la plateforme"}
                      </button>
                      <button
                        style={btnGhost}
                        onClick={async () => {
                          const texte = `À : ${enseignant.email}\nObjet : ${proposerForm.subject}\n\n${proposerForm.message}\n\nRépondre en ligne : ${lienPortail}`;
                          navigator.clipboard.writeText(texte);
                          alert("Message copié — collez-le dans votre client email habituel.");
                          await api(`/api/cursus/${cursusId}/log-proposition`, "POST", { enseignantId: proposerEnseignantId, mode: "copie", message: proposerForm.message });
                          await reload();
                        }}
                      >
                        📋 Copier le message
                      </button>
                      <button
                        style={btnGhost}
                        onClick={() => { navigator.clipboard.writeText(lienPortail); alert("Lien copié !"); }}
                      >
                        🔗 Copier le lien du portail
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── Secrétariat pédagogique ── */}
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6A6A6A", margin: "24px 0 10px" }}>
              🗂️ Secrétariat pédagogique
            </div>
            {isCoord && (
              <div style={{ ...cardStyle, padding: secOpen ? "18px 22px" : "12px 22px" }}>
                {!secOpen ? (
                  <button style={btnGhost} onClick={() => setSecOpen(true)}>+ Ajouter une secrétaire pédagogique</button>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, alignItems: "end" }}>
                      <div>
                        <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 3 }}>Prénom</div>
                        <input value={newSec.prenom} onChange={(e) => setNewSec((s) => ({ ...s, prenom: e.target.value }))} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} placeholder="Julie" />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 3 }}>Nom</div>
                        <input value={newSec.nom} onChange={(e) => setNewSec((s) => ({ ...s, nom: e.target.value }))} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} placeholder="MARTIN" />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 3 }}>Email *</div>
                        <input type="email" value={newSec.email} onChange={(e) => setNewSec((s) => ({ ...s, email: e.target.value }))} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} placeholder="julie.martin@chu.fr" />
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 8, lineHeight: 1.5 }}>
                      Accès secrétariat : créneaux, équipe enseignante, étudiants, émargements, documents — sans les notes ni les réglages du DU.
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                      <button style={btnGhost} onClick={() => { setSecOpen(false); setNewSec({ prenom: "", nom: "", email: "" }); }}>Annuler</button>
                      <div style={{ flex: 1 }} />
                      <button
                        style={btnRed}
                        disabled={!newSec.email.includes("@") || busy === "addSec"}
                        onClick={async () => {
                          setBusy("addSec");
                          const ok = await api(`/api/cursus/${cursusId}/enseignants`, "POST", { ...newSec, role: "SECRETAIRE" });
                          if (ok) { setSecOpen(false); setNewSec({ prenom: "", nom: "", email: "" }); await reload(); }
                          setBusy(null);
                        }}
                      >
                        {busy === "addSec" ? "Envoi…" : "✉️ Inviter comme secrétaire"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            <div style={cardStyle}>
              {data.enseignants.filter((e) => e.role === "SECRETAIRE").length === 0 && (
                <div style={{ padding: "20px 22px", textAlign: "center", color: "#9A9A9A", fontSize: 13 }}>Aucune secrétaire pédagogique.</div>
              )}
              {data.enseignants.filter((e) => e.role === "SECRETAIRE").map((e) => (
                <div key={e.id} style={{ padding: "14px 22px", borderBottom: "1px solid #F5F5F5", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0F0F0F" }}>{e.nom ?? e.email}</div>
                    <div style={{ fontSize: 12, color: "#6A6A6A" }}>{e.email}{e.phone ? ` · 📞 ${e.phone}` : ""}</div>
                  </div>
                  {e.statut === "ACCEPTE"
                    ? <span className="pill pill-green">Actif</span>
                    : e.statut === "EN_ATTENTE"
                    ? <span className="pill pill-orange">Invitation en attente</span>
                    : <span className="pill pill-gray">Enregistré · non invité</span>}
                  {isCoord && (
                    <>
                      {e.statut === "NON_INVITE" && (
                        <button style={btnRed} onClick={async () => { const r = await api(`/api/cursus/${cursusId}/enseignants/${e.id}`, "PATCH", { action: "inviter" }); if (r) { alert("Invitation envoyée !"); await reload(); } }}>
                          ✉️ Inviter
                        </button>
                      )}
                      {e.statut === "EN_ATTENTE" && (
                        <button style={btnGhost} onClick={async () => { const r = await api(`/api/cursus/${cursusId}/enseignants/${e.id}`, "PATCH", { action: "relancer" }); if (r) alert("Invitation relancée !"); }}>
                          🔔 Relancer
                        </button>
                      )}
                      <button
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#6A6A6A" }}
                        onClick={async () => {
                          if (!confirm(`Retirer ${e.nom ?? e.email} du secrétariat ?`)) return;
                          await api(`/api/cursus/${cursusId}/enseignants/${e.id}`, "DELETE");
                          await reload();
                        }}
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ ÉTUDIANTS ═══ */}
        {tab === "etudiants" && isManager && (
          <div>
            {/* ── Liste d'attente ── */}
            <div style={{ ...cardStyle, padding: "20px 22px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>📋 Liste d&apos;attente</div>
              <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 10, lineHeight: 1.5 }}>
                Collez votre liste (texte libre) OU <strong>importez un fichier</strong> (PDF, Word, Excel, CSV) —
                emails, noms, prénoms, téléphones et fonctions <strong>détectés automatiquement</strong>. Les étudiants restent
                « en attente » jusqu&apos;à ce que vous les acceptiez : l&apos;acceptation crée le compte, inscrit à toutes
                les journées et envoie les identifiants.
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff5f6", color: "#C8102E", border: "1.5px dashed #C8102E", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: busy === "prospectFile" ? "wait" : "pointer" }}>
                  {busy === "prospectFile" ? "Analyse du fichier…" : "📎 Importer depuis un fichier (PDF / Word / Excel / CSV)"}
                  <input
                    type="file"
                    accept=".pdf,.docx,.xlsx,.xlsm,.csv,.txt,.tsv,.md"
                    style={{ display: "none" }}
                    disabled={busy === "prospectFile"}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (f.size > 10 * 1024 * 1024) { alert("Fichier trop volumineux (max 10 Mo)"); return; }
                      setBusy("prospectFile");
                      try {
                        const base64 = await new Promise<string>((resolve) => {
                          const r = new FileReader();
                          r.onload = () => resolve((r.result as string).split(",")[1] ?? "");
                          r.readAsDataURL(f);
                        });
                        const r = await api(`/api/cursus/${cursusId}/extract-contacts`, "POST", { fichierNom: f.name, fichierBase64: base64 });
                        if (r?.contacts) {
                          setProspectRows(r.contacts as ParsedContact[]);
                          if ((r.contacts as ParsedContact[]).length === 0) alert("Aucun contact détecté dans le fichier.");
                        }
                      } finally {
                        setBusy(null);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </label>
              </div>
              {prospectRows === null ? (
                <>
                  <textarea
                    placeholder={"DUPONT Marie marie.dupont@chu.fr 06 11 22 33 44 Interne DES cardiologie\njean.martin@aphp.fr;Martin;Jean;CCA"}
                    value={prospectText}
                    onChange={(e) => setProspectText(e.target.value)}
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box", minHeight: 100, fontFamily: "monospace", fontSize: 12, resize: "vertical" }}
                  />
                  <PreviewTable contacts={parseContacts(prospectText)} />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                    <button
                      style={btnGhost}
                      disabled={parseContacts(prospectText).length === 0}
                      onClick={() => setProspectRows(parseContacts(prospectText))}
                    >
                      ✏️ Modifier avant d&apos;ajouter
                    </button>
                    <button
                      style={btnRed}
                      disabled={parseContacts(prospectText).length === 0 || busy === "prospects"}
                      onClick={async () => {
                        setBusy("prospects");
                        const r = await api(`/api/cursus/${cursusId}/prospects`, "POST", { prospects: parseContacts(prospectText) });
                        if (r) {
                          setProspectResult(`✅ ${r.ajoutes} ajouté(s) à la liste d'attente, ${r.doublons} déjà présent(s), ${r.erreurs} erreur(s).`);
                          setProspectText("");
                          await reload();
                        }
                        setBusy(null);
                      }}
                    >
                      {busy === "prospects" ? "Ajout…" : `📥 Ajouter les ${parseContacts(prospectText).length} à la liste d'attente`}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 12, color: "#0F0F0F", background: "#e3f2fd", borderRadius: 8, padding: "8px 12px", marginBottom: 8 }}>
                    ✏️ Mode édition manuelle — corrigez, ajoutez ou supprimez des lignes puis validez l&apos;ajout à la liste d&apos;attente.
                  </div>
                  <PreviewTable contacts={prospectRows} editable onChange={setProspectRows} />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                    <button style={btnGhost} onClick={() => setProspectRows(null)}>← Revenir au texte</button>
                    <div style={{ flex: 1 }} />
                    <button
                      style={btnRed}
                      disabled={prospectRows.filter((r) => r.email.includes("@")).length === 0 || busy === "prospects"}
                      onClick={async () => {
                        setBusy("prospects");
                        const rows = prospectRows.filter((r) => r.email.includes("@"));
                        const r = await api(`/api/cursus/${cursusId}/prospects`, "POST", { prospects: rows });
                        if (r) {
                          setProspectResult(`✅ ${r.ajoutes} ajouté(s), ${r.doublons} déjà présent(s), ${r.erreurs} erreur(s).`);
                          setProspectRows(null);
                          setProspectText("");
                          await reload();
                        }
                        setBusy(null);
                      }}
                    >
                      {busy === "prospects" ? "Ajout…" : `📥 Ajouter ${prospectRows.filter((r) => r.email.includes("@")).length} à la liste d'attente`}
                    </button>
                  </div>
                </>
              )}
              {prospectResult && <div style={{ fontSize: 12, color: "#2e7d32", marginTop: 8 }}>{prospectResult}</div>}

              {/* Ajout un par un */}
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", marginTop: 16, paddingTop: 14, borderTop: "1px solid #EBEBEB" }}>
                <input type="email" placeholder="Email *" value={oneProspect.email} onChange={(e) => setOneProspect((s) => ({ ...s, email: e.target.value }))} style={{ ...inputStyle, flex: 1, minWidth: 160 }} />
                <input type="text" placeholder="Prénom" value={oneProspect.prenom} onChange={(e) => setOneProspect((s) => ({ ...s, prenom: e.target.value }))} style={{ ...inputStyle, width: 110 }} />
                <input type="text" placeholder="Nom" value={oneProspect.nom} onChange={(e) => setOneProspect((s) => ({ ...s, nom: e.target.value }))} style={{ ...inputStyle, width: 110 }} />
                <input type="text" placeholder="Fonction / note" value={oneProspect.fonction} onChange={(e) => setOneProspect((s) => ({ ...s, fonction: e.target.value }))} style={{ ...inputStyle, flex: 1, minWidth: 130 }} />
                <button
                  style={btnGhost}
                  disabled={!oneProspect.email.includes("@") || busy === "oneProspect"}
                  onClick={async () => {
                    setBusy("oneProspect");
                    const ok = await api(`/api/cursus/${cursusId}/prospects`, "POST", { prospects: [oneProspect] });
                    if (ok) { setOneProspect({ email: "", prenom: "", nom: "", fonction: "" }); await reload(); }
                    setBusy(null);
                  }}
                >
                  + Ajouter
                </button>
              </div>

              {/* Table des prospects */}
              {data.prospects.length > 0 && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0 8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0F0F0F" }}>
                      {data.prospects.filter((p) => p.statut === "ATTENTE").length} en attente · {data.prospects.filter((p) => p.statut === "ACCEPTE").length} accepté(s) · {data.prospects.filter((p) => p.statut === "REFUSE").length} refusé(s)
                    </span>
                    <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        style={{ ...btnRed, padding: "6px 12px", fontSize: 12 }}
                        disabled={prospectSel.length === 0 || busy === "accepter"}
                        onClick={async () => {
                          setBusy("accepter");
                          const r = await api(`/api/cursus/${cursusId}/prospects`, "PATCH", { ids: prospectSel, action: "ACCEPTER" });
                          if (r) {
                            alert(`✅ ${r.acceptes} étudiant(s) accepté(s) et inscrit(s) (${r.comptesCrees} compte(s) créé(s)).`);
                            setProspectSel([]);
                            setEtudiants(null);
                            await reload();
                          }
                          setBusy(null);
                        }}
                      >
                        {busy === "accepter" ? "Inscription…" : `✓ Accepter (${prospectSel.length})`}
                      </button>
                      <button
                        style={{ ...btnGhost, padding: "6px 12px", fontSize: 12 }}
                        disabled={prospectSel.length === 0}
                        onClick={async () => {
                          await api(`/api/cursus/${cursusId}/prospects`, "PATCH", { ids: prospectSel, action: "REFUSER" });
                          setProspectSel([]);
                          await reload();
                        }}
                      >
                        ✗ Refuser
                      </button>
                      <button
                        style={{ ...btnGhost, padding: "6px 12px", fontSize: 12 }}
                        disabled={prospectSel.length === 0}
                        onClick={async () => {
                          await api(`/api/cursus/${cursusId}/prospects`, "PATCH", { ids: prospectSel, action: "ATTENTE" });
                          setProspectSel([]);
                          await reload();
                        }}
                      >
                        ↺ En attente
                      </button>
                      <button
                        style={{ ...btnGhost, padding: "6px 12px", fontSize: 12, color: "#c62828", borderColor: "#ffcdd2" }}
                        disabled={prospectSel.length === 0}
                        onClick={async () => {
                          if (!confirm(`Retirer ${prospectSel.length} ligne(s) de la liste d'attente ?`)) return;
                          await api(`/api/cursus/${cursusId}/prospects`, "DELETE", { ids: prospectSel });
                          setProspectSel([]);
                          await reload();
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                  <div style={{ overflowX: "auto", border: "1px solid #EBEBEB", borderRadius: 10 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: "#F9F7F4", borderBottom: "1px solid #E0E0E0" }}>
                          <th style={{ padding: "8px 12px" }}>
                            <input
                              type="checkbox"
                              checked={prospectSel.length === data.prospects.length && data.prospects.length > 0}
                              onChange={(e) => setProspectSel(e.target.checked ? data.prospects.map((p) => p.id) : [])}
                            />
                          </th>
                          {["Prénom", "Nom", "Email", "Téléphone", "Fonction / note", "Dossier", "Statut"].map((h) => (
                            <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#6A6A6A", fontWeight: 600 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.prospects.map((p) => (
                          <tr key={p.id} style={{ borderBottom: "1px solid #F5F5F5", background: prospectSel.includes(p.id) ? "#fff5f6" : "white" }}>
                            <td style={{ padding: "7px 12px" }}>
                              <input
                                type="checkbox"
                                checked={prospectSel.includes(p.id)}
                                onChange={(e) => setProspectSel((s) => e.target.checked ? [...s, p.id] : s.filter((x) => x !== p.id))}
                              />
                            </td>
                            <td style={{ padding: "7px 12px" }}>{p.prenom ?? "—"}</td>
                            <td style={{ padding: "7px 12px", fontWeight: 600 }}>{p.nom ?? "—"}</td>
                            <td style={{ padding: "7px 12px" }}>{p.email}</td>
                            <td style={{ padding: "7px 12px" }}>{p.phone ?? "—"}</td>
                            <td style={{ padding: "7px 12px", color: "#6A6A6A" }}>{p.fonction ?? "—"}</td>
                            <td style={{ padding: "7px 12px" }}>
                              <button
                                onClick={() => setDossierProspectId(p.id)}
                                style={{ background: "none", border: "1px solid #E0E0E0", borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", color: "#6A6A6A" }}
                              >
                                📎 {Object.keys(p.piecesJointes ?? {}).length}/3
                              </button>
                            </td>
                            <td style={{ padding: "7px 12px" }}>
                              {p.statut === "ACCEPTE"
                                ? <span className="pill pill-green">Accepté</span>
                                : p.statut === "REFUSE"
                                ? <span className="pill pill-gray">Refusé</span>
                                : <span className="pill pill-orange">En attente</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {dossierProspectId && (() => {
              const p = data.prospects.find((pr) => pr.id === dossierProspectId);
              if (!p) return null;
              const slots: { type: "cv" | "lettre" | "diplome"; label: string }[] = [
                { type: "cv", label: "CV" },
                { type: "lettre", label: "Lettre de motivation" },
                { type: "diplome", label: "Diplôme(s)" },
              ];
              return (
                <div
                  onClick={() => setDossierProspectId(null)}
                  style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 16, padding: "22px 26px", width: 460, maxWidth: "90vw" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>Dossier d&apos;inscription</div>
                      <button onClick={() => setDossierProspectId(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#6A6A6A" }}>✕</button>
                    </div>
                    <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 16 }}>{p.prenom ?? ""} {p.nom ?? p.email}</div>
                    {slots.map((s) => {
                      const piece = p.piecesJointes?.[s.type];
                      const busyKey = `${p.id}:${s.type}`;
                      return (
                        <div key={s.type} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 0", borderBottom: "1px solid #F0F0F0" }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</div>
                          {piece ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <a href={piece.base64} download={piece.nom} style={{ fontSize: 12, color: "#C8102E", textDecoration: "none", fontWeight: 600 }}>📄 {piece.nom}</a>
                              <button
                                disabled={pieceBusy === busyKey}
                                onClick={async () => {
                                  setPieceBusy(busyKey);
                                  await api(`/api/cursus/${cursusId}/prospects/${p.id}/pieces`, "DELETE", { type: s.type });
                                  await reload();
                                  setPieceBusy(null);
                                }}
                                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#9A9A9A" }}
                              >
                                🗑
                              </button>
                            </div>
                          ) : (
                            <label style={{ fontSize: 12, color: "#C8102E", fontWeight: 600, cursor: pieceBusy === busyKey ? "wait" : "pointer" }}>
                              {pieceBusy === busyKey ? "Envoi…" : "+ Ajouter"}
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,image/*"
                                style={{ display: "none" }}
                                disabled={pieceBusy === busyKey}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (!f) return;
                                  if (f.size > 10 * 1024 * 1024) { alert("Fichier trop volumineux (max 10 Mo)"); return; }
                                  setPieceBusy(busyKey);
                                  const r = new FileReader();
                                  r.onload = async () => {
                                    await api(`/api/cursus/${cursusId}/prospects/${p.id}/pieces`, "POST", {
                                      type: s.type, nom: f.name, base64: r.result as string, taille: f.size,
                                    });
                                    await reload();
                                    setPieceBusy(null);
                                  };
                                  r.readAsDataURL(f);
                                }}
                              />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

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
              {data.messages.map((m) => {
                const deplie = messagesDeplies.has(m.id);
                const premiereLigne = m.texte.split("\n")[0];
                const aPlusDeContenu = m.texte.length > premiereLigne.length;
                return (
                  <div
                    key={m.id}
                    style={{ padding: "10px 0", borderBottom: "1px solid #F5F5F5", cursor: aPlusDeContenu ? "pointer" : "default" }}
                    onClick={() => {
                      if (!aPlusDeContenu) return;
                      setMessagesDeplies((s) => {
                        const next = new Set(s);
                        if (next.has(m.id)) next.delete(m.id); else next.add(m.id);
                        return next;
                      });
                    }}
                  >
                    <div style={{ fontSize: 12, marginBottom: 3, display: "flex", alignItems: "center", gap: 8 }}>
                      <strong style={{ color: "#0F0F0F" }}>{m.auteurNom}</strong>
                      <span style={{ color: "#9A9A9A" }}>{new Date(m.createdAt).toLocaleString("fr-FR")}</span>
                      {aPlusDeContenu && <span style={{ color: "#C8102E", fontSize: 11 }}>{deplie ? "▾ réduire" : "▸ voir plus"}</span>}
                    </div>
                    <div
                      style={{
                        fontSize: 13, color: "#444", lineHeight: 1.5,
                        whiteSpace: deplie ? "pre-wrap" : "nowrap",
                        overflow: deplie ? "visible" : "hidden",
                        textOverflow: deplie ? "clip" : "ellipsis",
                      }}
                    >
                      {deplie ? m.texte : premiereLigne}
                    </div>
                  </div>
                );
              })}
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

        {/* ═══ DOCUMENTS DU DU ═══ */}
        {tab === "documents" && isManager && (
          <DocumentsTab
            cursusId={cursusId}
            cursusSlug={cursus.slug}
            journees={data.journees}
            api={api}
            busy={busy}
            setBusy={setBusy}
          />
        )}

        {/* ═══ VALIDATION DU DU ═══ */}
        {tab === "validation" && isCoord && (
          <ValidationTab cursusId={cursusId} nbEtudiants={data.nbEtudiants} api={api} busy={busy} setBusy={setBusy} />
        )}

        {/* ═══ PARAMÈTRES ═══ */}
        {tab === "parametres" && isCoord && (
          <ParametresTab cursusId={cursusId} cursus={cursus} enseignants={data.enseignants} onSaved={reload} onDeleted={() => router.push("/formateur/coordination")} api={api} busy={busy} setBusy={setBusy} />
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

// ─── Édition inline d'un enseignant ───────────────────────────────────────────

function EnseignantEdit({ enseignant, onSave }: {
  enseignant: Enseignant;
  onSave: (patch: { nom?: string; email?: string; phone?: string; fonction?: string }) => Promise<void>;
}) {
  const [nom, setNom] = useState(enseignant.nom ?? "");
  const [email, setEmail] = useState(enseignant.email);
  const [phone, setPhone] = useState(enseignant.phone ?? "");
  const [fonction, setFonction] = useState(enseignant.fonction ?? "");
  const [saving, setSaving] = useState(false);
  const inp: React.CSSProperties = { border: "1px solid #E0E0E0", borderRadius: 6, padding: "5px 9px", fontSize: 12, fontFamily: "inherit", outline: "none", background: "white", width: "100%", boxSizing: "border-box" };
  return (
    <div style={{ padding: "10px 22px 14px", background: "#F9F7F4", borderTop: "1px dashed #E0E0E0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 8, alignItems: "end" }}>
        <div>
          <div style={{ fontSize: 10, color: "#6A6A6A", marginBottom: 2 }}>Nom complet</div>
          <input value={nom} onChange={(e) => setNom(e.target.value)} style={inp} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: "#6A6A6A", marginBottom: 2 }}>Email</div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inp} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: "#6A6A6A", marginBottom: 2 }}>Téléphone</div>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inp} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: "#6A6A6A", marginBottom: 2 }}>Fonction / note</div>
          <input value={fonction} onChange={(e) => setFonction(e.target.value)} style={inp} />
        </div>
        <button
          disabled={saving || !email.includes("@")}
          onClick={async () => {
            setSaving(true);
            try { await onSave({ nom, email, phone, fonction }); } finally { setSaving(false); }
          }}
          style={{ background: saving ? "#999" : "#C8102E", color: "white", border: "none", borderRadius: 6, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}
        >
          {saving ? "…" : "💾 Enregistrer"}
        </button>
      </div>
    </div>
  );
}

// ─── Onglet Documents du DU ──────────────────────────────────────────────────
// Regroupe tous les documents PDF générables pour le DU (programme, feuilles
// de présence par journée, attestations). Les enseignants ne voient que leurs
// supports de cours dans l'onglet Journées.

function DocumentsTab({ cursusId, cursusSlug, journees, api, busy, setBusy }: {
  cursusId: string;
  cursusSlug: string;
  journees: Journee[];
  api: (path: string, method: string, body?: unknown) => Promise<Record<string, unknown> | null>;
  busy: string | null;
  setBusy: (b: string | null) => void;
}) {
  const cardDocStyle: React.CSSProperties = { background: "white", borderRadius: 12, border: "1px solid #E0E0E0", padding: "18px 20px" };
  return (
    <div>
      <div style={{ fontSize: 13, color: "#6A6A6A", marginBottom: 20, lineHeight: 1.6, maxWidth: 700 }}>
        Tous les documents du DU en un seul endroit. Ces documents ne sont pas exposés aux enseignants
        depuis leur vue &quot;Mes cours&quot; — seuls le coordinateur (et éventuellement les co-coordinateurs) y ont accès ici.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, marginBottom: 24 }}>
        <div style={{ ...cardDocStyle, border: "1.5px solid #C8102E", background: "#fff5f6" }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>🗄️</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Export global du dossier</div>
          <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 12, lineHeight: 1.5 }}>
            Archive ZIP complète pour l&apos;archivage annuel ou un audit qualité (Qualiopi) : programme,
            liste des étudiants avec assiduité, et toutes les feuilles de notation clôturées.
          </div>
          <a href={`/api/cursus/${cursusId}/export-dossier`} target="_blank" rel="noreferrer" style={{ background: "#C8102E", color: "white", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
            📦 Télécharger le ZIP
          </a>
        </div>
        <div style={cardDocStyle}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>📄</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Programme complet</div>
          <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 12, lineHeight: 1.5 }}>
            PDF officiel avec toutes les journées, créneaux et intervenants — à envoyer aux étudiants et à l&apos;université.
          </div>
          <a href={`/api/pdf/cursus-programme/${cursusId}`} target="_blank" rel="noreferrer" style={{ background: "#C8102E", color: "white", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
            📥 Télécharger
          </a>
        </div>

        <div style={cardDocStyle}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>✉️</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Envoyer le programme</div>
          <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 12, lineHeight: 1.5 }}>
            Diffusion email à toute l&apos;équipe (± étudiants) avec le programme en pièce jointe.
          </div>
          <button
            disabled={busy === "doc-envoi"}
            onClick={async () => {
              const inclureEtudiants = confirm("Envoyer aussi aux étudiants ?\nOK = équipe + étudiants · Annuler = équipe seulement");
              setBusy("doc-envoi");
              const r = await api(`/api/cursus/${cursusId}/envoyer-programme`, "POST", { inclureEtudiants });
              if (r) alert(`Envoyé à ${r.envoyes} destinataire(s).`);
              setBusy(null);
            }}
            style={{ background: "transparent", color: "#C8102E", border: "1.5px solid #C8102E", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            {busy === "doc-envoi" ? "Envoi…" : "✉️ Envoyer"}
          </button>
        </div>

        <div style={cardDocStyle}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>🌐</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Page publique du DU</div>
          <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 12, lineHeight: 1.5 }}>
            Lien à partager pour communication externe (visible uniquement si le DU est publié en public).
          </div>
          <a href={`/du/${cursusSlug}`} target="_blank" rel="noreferrer" style={{ background: "transparent", color: "#C8102E", border: "1.5px solid #C8102E", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
            🔗 Ouvrir
          </a>
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6A6A6A", marginBottom: 10 }}>
        Documents par journée
      </div>
      <div style={{ background: "white", borderRadius: 12, border: "1px solid #E0E0E0", overflow: "hidden" }}>
        {journees.length === 0 && <div style={{ padding: "20px 22px", color: "#6A6A6A", fontSize: 13 }}>Aucune journée pour l&apos;instant.</div>}
        {journees.map((j, i) => (
          <div key={j.id} style={{ padding: "12px 20px", borderBottom: i < journees.length - 1 ? "1px solid #F5F5F5" : "none", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0F0F0F" }}>Journée {i + 1} — {fdate(j.date)}</div>
              <div style={{ fontSize: 11, color: "#6A6A6A" }}>{j.heureDebut}–{j.heureFin}</div>
            </div>
            <a href={`/api/pdf/feuille-presence/${j.id}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 600, color: "#C8102E", textDecoration: "none", border: "1.5px solid #C8102E", borderRadius: 6, padding: "4px 10px" }}>
              📋 Feuille de présence
            </a>
            <Link href={`/formateur/formations/${j.id}`} style={{ fontSize: 12, fontWeight: 600, color: "#6A6A6A", textDecoration: "none" }}>
              Machinerie journée →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Onglet Validation du DU ─────────────────────────────────────────────────

type ValidationModule = {
  id: string; type: string; intitule: string;
  dateEpreuve: string | null; infos: string | null;
  coefficient: number; noteMax: number; seuilValidation: number | null;
  cloture: boolean; clotureAt: string | null; clotureExportUrl: string | null;
  nbNotesSaisies: number; nbNotesTotal: number;
};

const MODALITES_VALIDATION = [
  { v: "ECRIT", t: "Examen écrit", i: "📝" },
  { v: "ORAL", t: "Examen oral", i: "🗣️" },
  { v: "MEMOIRE", t: "Mémoire", i: "📄" },
  { v: "SOUTENANCE", t: "Soutenance", i: "🎤" },
  { v: "STAGE", t: "Stage clinique", i: "🏥" },
  { v: "ASSIDUITE", t: "Assiduité", i: "✅" },
  { v: "AUTRE", t: "Autre modalité", i: "•" },
];

function ValidationTab({ cursusId, nbEtudiants, api, busy, setBusy }: {
  cursusId: string;
  nbEtudiants: number;
  api: (path: string, method: string, body?: unknown) => Promise<Record<string, unknown> | null>;
  busy: string | null;
  setBusy: (b: string | null) => void;
}) {
  const [modules, setModules] = useState<ValidationModule[] | null>(null);
  const [openFeuille, setOpenFeuille] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch(`/api/cursus/${cursusId}/validation`);
    if (r.ok) setModules(((await r.json()).modules as ValidationModule[]) ?? []);
  }, [cursusId]);

  useEffect(() => { load(); }, [load]);

  const modulesByType = new Set((modules ?? []).map((m) => m.type));

  if (modules === null) return <div style={{ padding: 40, textAlign: "center", color: "#6A6A6A" }}>Chargement…</div>;

  return (
    <div>
      <div style={{ fontSize: 13, color: "#6A6A6A", marginBottom: 20, lineHeight: 1.6, maxWidth: 720 }}>
        Configurez les modalités de validation du DU. Chaque modalité activée devient un module de notation :
        vous y programmez la date, saisissez les notes, puis clôturez avec un PDF archivé.
        <strong> Toutes les saisies sont journalisées</strong> (auteur, horodatage, valeur précédente)
        — anti-effacement et anti-piratage.
      </div>

      {/* Ajout d'une modalité */}
      <div style={{ background: "white", borderRadius: 12, border: "1px solid #E0E0E0", padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8, color: "#6A6A6A" }}>
          Ajouter une modalité de validation
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {MODALITES_VALIDATION.map((m) => (
            <button
              key={m.v}
              disabled={busy === `add-${m.v}`}
              onClick={async () => {
                const intitule = prompt(`Intitulé du module « ${m.t} » (ex : "Examen écrit final") ?`, m.t);
                if (!intitule?.trim()) return;
                setBusy(`add-${m.v}`);
                const r = await api(`/api/cursus/${cursusId}/validation`, "POST", { type: m.v, intitule });
                if (r) await load();
                setBusy(null);
              }}
              style={{
                background: modulesByType.has(m.v) ? "#f0f0f0" : "#fff5f6",
                border: `1.5px solid ${modulesByType.has(m.v) ? "#DDD" : "#C8102E"}`,
                color: modulesByType.has(m.v) ? "#999" : "#C8102E",
                borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {m.i} {m.t}{modulesByType.has(m.v) ? " ✓" : " +"}
            </button>
          ))}
        </div>
      </div>

      {modules.length === 0 && (
        <div style={{ background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: 10, padding: "14px 18px", fontSize: 13, color: "#5d4037" }}>
          Aucune modalité de validation configurée. Choisissez ci-dessus les évaluations qui composeront le DU.
        </div>
      )}

      {modules.map((m) => {
        const now = new Date();
        const dateOK = m.dateEpreuve ? new Date(m.dateEpreuve).getTime() <= now.getTime() : false;
        const modalite = MODALITES_VALIDATION.find((x) => x.v === m.type);
        return (
          <div key={m.id} style={{ background: "white", borderRadius: 12, border: "1px solid #E0E0E0", padding: "18px 22px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#C8102E", marginBottom: 3 }}>
                  {modalite?.i} {modalite?.t ?? m.type}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0F0F0F" }}>{m.intitule}</div>
              </div>
              {m.cloture ? (
                <span className="pill pill-gray">🔒 Clôturé le {new Date(m.clotureAt!).toLocaleDateString("fr-FR")}</span>
              ) : m.nbNotesSaisies > 0 ? (
                <span className="pill pill-orange">{m.nbNotesSaisies}/{m.nbNotesTotal || nbEtudiants} note(s) saisie(s)</span>
              ) : (
                <span className="pill pill-gray">À noter</span>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 12 }}>
              <ChampDateEpreuve module={m} cursusId={cursusId} onSaved={load} />
              <ChampBaremes module={m} cursusId={cursusId} onSaved={load} />
              <ChampSeuil module={m} cursusId={cursusId} onSaved={load} />
            </div>

            {m.infos && (
              <div style={{ marginTop: 10, fontSize: 12, color: "#6A6A6A", whiteSpace: "pre-wrap", background: "#F9F7F4", borderRadius: 6, padding: "8px 12px" }}>
                {m.infos}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              {!m.cloture && (
                <button
                  disabled={!dateOK}
                  title={dateOK ? "Ouvrir la feuille de notation" : "Disponible à partir de la date d'épreuve"}
                  onClick={() => setOpenFeuille(m.id)}
                  style={{
                    background: dateOK ? "#C8102E" : "#DDD", color: "white",
                    border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700,
                    cursor: dateOK ? "pointer" : "not-allowed", fontFamily: "inherit",
                  }}
                >
                  📝 Feuille de notation
                </button>
              )}
              {m.cloture && m.clotureExportUrl && (
                <a href={m.clotureExportUrl} target="_blank" rel="noreferrer" style={{ background: "#2e7d32", color: "white", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                  📄 Télécharger le PDF archivé
                </a>
              )}
              {!m.cloture && (
                <button
                  onClick={async () => {
                    if (!confirm("Supprimer ce module ? Les notes déjà saisies seront perdues.")) return;
                    await api(`/api/cursus/${cursusId}/validation/${m.id}`, "DELETE");
                    await load();
                  }}
                  style={{ background: "transparent", color: "#c62828", border: "1.5px solid #ffcdd2", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                >
                  🗑 Supprimer
                </button>
              )}
            </div>
          </div>
        );
      })}

      {openFeuille && (
        <FeuilleNotation
          cursusId={cursusId}
          moduleId={openFeuille}
          onClose={() => setOpenFeuille(null)}
          onCloture={() => { setOpenFeuille(null); load(); }}
        />
      )}
    </div>
  );
}

function ChampDateEpreuve({ module: m, cursusId, onSaved }: { module: ValidationModule; cursusId: string; onSaved: () => Promise<void> }) {
  const [v, setV] = useState(m.dateEpreuve ? m.dateEpreuve.slice(0, 10) : "");
  return (
    <div>
      <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 3 }}>Date de l&apos;épreuve</div>
      <input
        type="date"
        value={v}
        disabled={m.cloture}
        onChange={(e) => setV(e.target.value)}
        onBlur={async () => {
          if (v !== (m.dateEpreuve?.slice(0, 10) ?? "")) {
            await fetch(`/api/cursus/${cursusId}/validation/${m.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "editer", dateEpreuve: v || null }),
            });
            await onSaved();
          }
        }}
        style={{ width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 6, padding: "6px 10px", fontSize: 12, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
      />
    </div>
  );
}

function ChampBaremes({ module: m, cursusId, onSaved }: { module: ValidationModule; cursusId: string; onSaved: () => Promise<void> }) {
  const [noteMax, setNoteMax] = useState(m.noteMax);
  const [coef, setCoef] = useState(m.coefficient);
  return (
    <div>
      <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 3 }}>Barème & coefficient</div>
      <div style={{ display: "flex", gap: 6 }}>
        <input type="number" value={noteMax} disabled={m.cloture} onChange={(e) => setNoteMax(Number(e.target.value))}
          onBlur={async () => {
            if (noteMax !== m.noteMax) {
              await fetch(`/api/cursus/${cursusId}/validation/${m.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "editer", noteMax }) });
              await onSaved();
            }
          }}
          style={{ flex: 1, minWidth: 0, border: "1.5px solid #E0E0E0", borderRadius: 6, padding: "6px 10px", fontSize: 12, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
          placeholder="Note max" />
        <input type="number" value={coef} step="0.5" disabled={m.cloture} onChange={(e) => setCoef(Number(e.target.value))}
          onBlur={async () => {
            if (coef !== m.coefficient) {
              await fetch(`/api/cursus/${cursusId}/validation/${m.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "editer", coefficient: coef }) });
              await onSaved();
            }
          }}
          style={{ flex: 1, minWidth: 0, border: "1.5px solid #E0E0E0", borderRadius: 6, padding: "6px 10px", fontSize: 12, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
          placeholder="Coef" />
      </div>
    </div>
  );
}

function ChampSeuil({ module: m, cursusId, onSaved }: { module: ValidationModule; cursusId: string; onSaved: () => Promise<void> }) {
  const [v, setV] = useState(m.seuilValidation?.toString() ?? "");
  return (
    <div>
      <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 3 }}>Seuil de validation (optionnel)</div>
      <input
        type="number"
        value={v}
        step="0.5"
        disabled={m.cloture}
        onChange={(e) => setV(e.target.value)}
        onBlur={async () => {
          const num = v ? Number(v) : null;
          if (num !== m.seuilValidation) {
            await fetch(`/api/cursus/${cursusId}/validation/${m.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "editer", seuilValidation: num }) });
            await onSaved();
          }
        }}
        style={{ width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 6, padding: "6px 10px", fontSize: 12, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
        placeholder={`ex : ${Math.round(m.noteMax / 2)}`}
      />
    </div>
  );
}

// ─── Feuille de notation (modale) ────────────────────────────────────────────

function FeuilleNotation({ cursusId, moduleId, onClose, onCloture }: {
  cursusId: string; moduleId: string; onClose: () => void; onCloture: () => void;
}) {
  type Ligne = { participantId: string; nom: string; email: string; note: number | null; commentaire: string };
  const [data, setData] = useState<{ module: { intitule: string; noteMax: number; seuilValidation: number | null; cloture: boolean }; lignes: Ligne[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [status, setStatus] = useState<Record<string, "saving" | "saved" | "error">>({});

  const load = useCallback(async () => {
    const r = await fetch(`/api/cursus/${cursusId}/validation/${moduleId}`);
    if (r.ok) setData(await r.json());
  }, [cursusId, moduleId]);

  useEffect(() => { load(); }, [load]);

  async function saveLigne(participantId: string, patch: Partial<Pick<Ligne, "note" | "commentaire">>) {
    setStatus((s) => ({ ...s, [participantId]: "saving" }));
    const r = await fetch(`/api/cursus/${cursusId}/validation/${moduleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, ...patch }),
    });
    if (r.ok) setStatus((s) => ({ ...s, [participantId]: "saved" }));
    else {
      const err = await r.json().catch(() => ({}));
      setStatus((s) => ({ ...s, [participantId]: "error" }));
      alert(err.error ?? "Erreur");
    }
  }

  function updateLocal(participantId: string, patch: Partial<Ligne>) {
    setData((d) => d ? { ...d, lignes: d.lignes.map((l) => l.participantId === participantId ? { ...l, ...patch } : l) } : d);
    if (timers.current[participantId]) clearTimeout(timers.current[participantId]);
    timers.current[participantId] = setTimeout(() => saveLigne(participantId, patch), 800);
  }

  if (!data) return null;
  const mod = data.module;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 300, display: "flex", alignItems: "stretch", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 16, maxWidth: 900, width: "100%", maxHeight: "95vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #E0E0E0", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#C8102E" }}>📝 Feuille de notation</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#0F0F0F", marginTop: 2 }}>{mod.intitule}</div>
            <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 3 }}>
              Sur {mod.noteMax}{mod.seuilValidation != null ? ` · seuil ${mod.seuilValidation}` : ""} · les modifications sont enregistrées automatiquement
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Fermer</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 24px" }}>
          {data.lignes.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "#9A9A9A" }}>Aucun étudiant inscrit au cursus.</div>
          )}
          {data.lignes.map((l) => (
            <div key={l.participantId} style={{ display: "grid", gridTemplateColumns: "1fr 100px 2fr auto", gap: 10, alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F5F5F5" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0F0F0F" }}>{l.nom}</div>
                <div style={{ fontSize: 10, color: "#9A9A9A" }}>{l.email}</div>
              </div>
              <input
                type="number"
                step="0.25"
                min={0}
                max={mod.noteMax}
                value={l.note ?? ""}
                disabled={mod.cloture}
                onChange={(e) => updateLocal(l.participantId, { note: e.target.value === "" ? null : Number(e.target.value) })}
                placeholder="—"
                style={{ border: `1.5px solid ${l.note != null && mod.seuilValidation != null && l.note < mod.seuilValidation ? "#c62828" : "#E0E0E0"}`, borderRadius: 6, padding: "6px 10px", fontSize: 14, fontWeight: 700, fontFamily: "inherit", outline: "none", textAlign: "center", color: l.note != null ? (mod.seuilValidation != null && l.note < mod.seuilValidation ? "#c62828" : "#2e7d32") : "#0F0F0F" }}
              />
              <input
                type="text"
                value={l.commentaire}
                disabled={mod.cloture}
                onChange={(e) => updateLocal(l.participantId, { commentaire: e.target.value })}
                placeholder="Commentaire (optionnel)"
                style={{ border: "1.5px solid #E0E0E0", borderRadius: 6, padding: "6px 10px", fontSize: 12, fontFamily: "inherit", outline: "none" }}
              />
              <span style={{ fontSize: 11, color: status[l.participantId] === "saved" ? "#2e7d32" : status[l.participantId] === "saving" ? "#6A6A6A" : status[l.participantId] === "error" ? "#c62828" : "#CCC", minWidth: 24, textAlign: "center" }}>
                {status[l.participantId] === "saved" ? "✓" : status[l.participantId] === "saving" ? "…" : status[l.participantId] === "error" ? "!" : ""}
              </span>
            </div>
          ))}
        </div>

        {!mod.cloture && (
          <div style={{ padding: "14px 24px", borderTop: "1px solid #E0E0E0", background: "#fff8e1", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12, color: "#5d4037", lineHeight: 1.5, flex: 1, minWidth: 200 }}>
              🔒 <strong>Clôturer</strong> génère un PDF archive horodaté et verrouille la saisie. L&apos;historique
              complet des modifications reste conservé côté serveur pour audit.
            </div>
            <button
              disabled={busy}
              onClick={async () => {
                if (!confirm("Clôturer définitivement ce module ?\n\nAprès clôture :\n• plus aucune modification possible\n• un PDF archive est généré et téléchargeable\n• l'historique reste consultable côté serveur")) return;
                setBusy(true);
                const r = await fetch(`/api/cursus/${cursusId}/validation/${moduleId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "cloturer" }),
                });
                setBusy(false);
                if (r.ok) {
                  const d = await r.json();
                  window.open(d.exportUrl, "_blank");
                  onCloture();
                } else {
                  alert("Erreur lors de la clôture");
                }
              }}
              style={{ background: busy ? "#999" : "#c62828", color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: busy ? "not-allowed" : "pointer", fontFamily: "inherit" }}
            >
              {busy ? "Clôture…" : "🔒 Clôturer et exporter le PDF"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ParametresTab({ cursusId, cursus, enseignants, onSaved, onDeleted, api, busy, setBusy }: {
  cursusId: string;
  cursus: ApiData["cursus"];
  enseignants: Enseignant[];
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
    emargementMode: cursus.emargementMode ?? "DEMI_JOURNEE",
    orgNom: cursus.orgNom ?? "",
    orgLogoBase64: cursus.orgLogoBase64 ?? "",
    masquerMM: cursus.masquerMM ?? false,
    organisateursTexte: cursus.organisateursTexte ?? "",
    contactNom: cursus.contactNom ?? "",
    contactEmail: cursus.contactEmail ?? "",
    contactTelephone: cursus.contactTelephone ?? "",
    capaciteMax: cursus.capaciteMax?.toString() ?? "",
    volumeHoraireAttendu: cursus.volumeHoraireAttendu?.toString() ?? "",
    prerequis: cursus.prerequis ?? "",
    publicVise: cursus.publicVise ?? "",
  });
  const [modeleBusy, setModeleBusy] = useState(false);
  const [orgaBusy, setOrgaBusy] = useState<string | null>(null);

  async function toggleOrganisateur(eid: string, next: boolean) {
    setOrgaBusy(eid);
    await api(`/api/cursus/${cursusId}/enseignants/${eid}`, "PATCH", { estOrganisateur: next });
    await onSaved();
    setOrgaBusy(null);
  }

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

      <div style={{ marginBottom: 18, background: "#F9F7F4", borderRadius: 10, padding: "14px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>🎯 Prérequis &amp; public visé</div>
        <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 10, lineHeight: 1.5 }}>
          Affichés sur la page publique du DU, au-dessus du bouton « Déposer sa candidature ».
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 3 }}>Public visé</div>
            <textarea
              value={form.publicVise}
              onChange={(e) => setForm((s) => ({ ...s, publicVise: e.target.value }))}
              placeholder={"Médecins généralistes\nInternes en 3e cycle de médecine générale"}
              style={{ ...inputStyle, width: "100%", boxSizing: "border-box", minHeight: 70, resize: "vertical" }}
            />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 3 }}>Prérequis</div>
            <textarea
              value={form.prerequis}
              onChange={(e) => setForm((s) => ({ ...s, prerequis: e.target.value }))}
              placeholder={"Doctorat en médecine\nExpérience clinique d'au moins 1 an"}
              style={{ ...inputStyle, width: "100%", boxSizing: "border-box", minHeight: 70, resize: "vertical" }}
            />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 18, background: "#F9F7F4", borderRadius: 10, padding: "14px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>🎓 Comité d&apos;organisation</div>
        <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 10, lineHeight: 1.5 }}>
          Affiché sur le programme et les documents. Cochez les enseignants qui font partie du comité,
          et ajoutez au besoin des noms libres (ex : membres du comité scientifique non enseignants).
        </div>
        {enseignants.filter((e) => e.role !== "SECRETAIRE").length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {enseignants.filter((e) => e.role !== "SECRETAIRE").map((e) => (
              <label
                key={e.id}
                style={{
                  display: "flex", alignItems: "center", gap: 7, fontSize: 12, cursor: orgaBusy === e.id ? "wait" : "pointer",
                  background: e.estOrganisateur ? "#fff5f6" : "white", border: `1.5px solid ${e.estOrganisateur ? "#C8102E" : "#E0E0E0"}`,
                  borderRadius: 100, padding: "5px 12px",
                }}
              >
                <input
                  type="checkbox"
                  checked={e.estOrganisateur}
                  disabled={orgaBusy === e.id}
                  onChange={(ev) => toggleOrganisateur(e.id, ev.target.checked)}
                />
                {e.nom ?? e.email}
              </label>
            ))}
          </div>
        )}
        <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 4 }}>Autres organisateurs (un par ligne)</div>
        <textarea
          value={form.organisateursTexte}
          onChange={(e) => setForm((s) => ({ ...s, organisateursTexte: e.target.value }))}
          placeholder={"Pr. Jean Dupont (président du comité scientifique)\nDr Anne Martin (CHU de Lyon)"}
          style={{ ...inputStyle, width: "100%", boxSizing: "border-box", minHeight: 60, resize: "vertical" }}
        />
      </div>

      <div style={{ marginBottom: 18, background: "#F9F7F4", borderRadius: 10, padding: "14px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>📇 Contact du DU</div>
        <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 10, lineHeight: 1.5 }}>
          Affiché sur le programme (ex : secrétariat pédagogique) pour que les étudiants et intervenants sachent qui contacter.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <input type="text" placeholder="Nom (ex : Secrétariat pédagogique)" value={form.contactNom} onChange={(e) => setForm((s) => ({ ...s, contactNom: e.target.value }))} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
          <input type="email" placeholder="Email de contact" value={form.contactEmail} onChange={(e) => setForm((s) => ({ ...s, contactEmail: e.target.value }))} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
          <input type="text" placeholder="Téléphone" value={form.contactTelephone} onChange={(e) => setForm((s) => ({ ...s, contactTelephone: e.target.value }))} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
        <input type="text" placeholder="Lieu (établissement)" value={form.lieuNom} onChange={(e) => setForm((s) => ({ ...s, lieuNom: e.target.value }))} style={inputStyle} />
        <input type="text" placeholder="Adresse" value={form.lieuAdresse} onChange={(e) => setForm((s) => ({ ...s, lieuAdresse: e.target.value }))} style={inputStyle} />
        <input type="text" placeholder="Ville" value={form.lieuVille} onChange={(e) => setForm((s) => ({ ...s, lieuVille: e.target.value }))} style={inputStyle} />
      </div>
      <div style={{ display: "flex", gap: 24, marginBottom: 14, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Capacité maximale (étudiants)</div>
          <input
            type="number" min={0} placeholder="Ex : 30"
            value={form.capaciteMax}
            onChange={(e) => setForm((s) => ({ ...s, capaciteMax: e.target.value }))}
            style={{ ...inputStyle, width: 140 }}
          />
          <div style={{ fontSize: 11, color: "#9A9A9A", marginTop: 4, maxWidth: 220 }}>
            Utilisée pour le taux de remplissage affiché sur le tableau de bord multi-DU.
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Volume horaire attendu (heures)</div>
          <input
            type="number" min={0} step={0.5} placeholder="Ex : 42.5"
            value={form.volumeHoraireAttendu}
            onChange={(e) => setForm((s) => ({ ...s, volumeHoraireAttendu: e.target.value }))}
            style={{ ...inputStyle, width: 140 }}
          />
          <div style={{ fontSize: 11, color: "#9A9A9A", marginTop: 4, maxWidth: 260 }}>
            Comparé au volume réel des créneaux dans l&apos;onglet Journées &amp; créneaux.
          </div>
        </div>
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
      <div style={{ marginBottom: 18, background: "#F9F7F4", borderRadius: 10, padding: "14px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>🏛 Organisation (marque blanche)</div>
        <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 12, lineHeight: 1.5 }}>
          Nom et logo de l&apos;organisation qui délivre l&apos;enseignement — remplacent Masterclass Médical
          en tête de tous les documents PDF (programme, notation, attestations) et sur la page publique. Le logo Masterclass
          Médical est repoussé en pied de page « Avec l&apos;aide de… », sauf si vous cochez la case pour tout masquer.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 3 }}>Nom du fournisseur</div>
            <input value={form.orgNom} onChange={(e) => setForm((s) => ({ ...s, orgNom: e.target.value }))} placeholder="Ex : Sorbonne Université — DU d'échographie" style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 3 }}>Logo (PNG ou JPG, ≤ 500 Ko)</div>
            {form.orgLogoBase64 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.orgLogoBase64.startsWith("data:") ? form.orgLogoBase64 : `data:image/png;base64,${form.orgLogoBase64}`} alt="Logo" style={{ height: 40, background: "white", border: "1px solid #EBEBEB", borderRadius: 6, padding: 4 }} />
                <button type="button" onClick={() => setForm((s) => ({ ...s, orgLogoBase64: "" }))} style={{ background: "transparent", border: "1.5px solid #ffcdd2", color: "#c62828", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Retirer</button>
              </div>
            ) : (
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff5f6", color: "#C8102E", border: "1.5px dashed #C8102E", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                📎 Choisir un logo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.size > 500 * 1024) { alert("Logo trop volumineux (max 500 Ko)"); return; }
                    const r = new FileReader();
                    r.onload = () => setForm((s) => ({ ...s, orgLogoBase64: r.result as string }));
                    r.readAsDataURL(f);
                  }}
                  style={{ display: "none" }}
                />
              </label>
            )}
          </div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer", marginTop: 6 }}>
          <input type="checkbox" checked={form.masquerMM} onChange={(e) => setForm((s) => ({ ...s, masquerMM: e.target.checked }))} />
          Masquer toute mention de Masterclass Médical sur les documents (marque blanche stricte)
        </label>
      </div>
      <div style={{ marginBottom: 18, background: "#F9F7F4", borderRadius: 10, padding: "14px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>✍️ Mode d&apos;émargement</div>
        <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 10, lineHeight: 1.5 }}>
          Détermine qui déclenche l&apos;émargement et la validité du QR code des étudiants.
        </div>
        {[
          { v: "PAR_COURS", t: "À chaque cours", d: "Chaque enseignant génère et affiche son propre QR code — les étudiants émargent à chaque intervention." },
          { v: "DEMI_JOURNEE", t: "Matin & après-midi", d: "Deux QR codes par jour, valides toute la demi-journée — c'est l'enseignant du premier créneau de chaque demi-journée qui les active." },
          { v: "JOUR", t: "Une fois par jour", d: "Un seul QR code valable toute la journée — c'est l'enseignant du premier créneau du matin qui l'active." },
        ].map((opt) => (
          <label key={opt.v} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: "pointer", background: form.emargementMode === opt.v ? "#fff5f6" : "transparent", border: `1.5px solid ${form.emargementMode === opt.v ? "#C8102E" : "transparent"}`, marginBottom: 5 }}>
            <input
              type="radio"
              name="emargementMode"
              checked={form.emargementMode === opt.v}
              onChange={() => setForm((s) => ({ ...s, emargementMode: opt.v }))}
              style={{ marginTop: 3 }}
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0F0F0F" }}>{opt.t}</div>
              <div style={{ fontSize: 12, color: "#6A6A6A", marginTop: 1, lineHeight: 1.5 }}>{opt.d}</div>
            </div>
          </label>
        ))}
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
          style={btnGhost}
          disabled={modeleBusy}
          onClick={async () => {
            const nom = prompt("Nom du modèle (ex : DU Échographie — trame type)", cursus.titre);
            if (!nom?.trim()) return;
            setModeleBusy(true);
            const ok = await api(`/api/cursus-templates`, "POST", { cursusId, nom: nom.trim() });
            setModeleBusy(false);
            if (ok) alert("Modèle enregistré — disponible lors de la création d'un nouveau DU.");
          }}
        >
          {modeleBusy ? "Enregistrement…" : "📐 Enregistrer comme modèle"}
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
