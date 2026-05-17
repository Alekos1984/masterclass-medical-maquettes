"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatutFormation } from "@/generated/prisma/enums";
import VoiceInputButton from "@/components/VoiceInputButton";
import AfficheOverlay from "./AfficheOverlay";

function niveauLabel(n: string) {
  return ({ tous: "Tous niveaux", debutant: "Débutant", intermediaire: "Intermédiaire", avance: "Avancé", expert: "Expert" } as Record<string, string>)[n] ?? n;
}

type Inscription = {
  id: string;
  createdAt: string;
  statut: string;
  convocationSignee: boolean;
  conventionSignee: boolean;
  paiementId: string | null;
  participant: {
    name: string;
    email: string;
    specialite: string | null;
    ville: string | null;
  };
};

type ProgrammeSlot = {
  time: string;
  title: string;
  description?: string;
  type?: string;
};

type FormationDetail = {
  id: string;
  titre: string;
  specialite: string;
  niveau: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  dureeHeures: number;
  placesTotal: number;
  placesRestantes: number;
  lieuVille: string | null;
  lieuNom: string | null;
  prixHT: number;
  gratuite: boolean;
  statut: string;
  description: string;
  objectifs: string[];
  programme: ProgrammeSlot[];
  satisfactionsCount: number;
  emargementsCount: number;
  inscriptions: Inscription[];
  demandeSalle: { statut: string; notes: string | null } | null;
  publicCible: string;
  restauration: string;
  formatFormation: string;
  minParticipants: number;
  equipements: string[];
  sessionStatus: string | null;
  sessionLog?: { type: string; time: string }[] | null;
  sessionStartedAt?: string | null;
  sessionEndedAt?: string | null;
  pvSigne?: boolean | null;
  pvSigneAt?: string | null;
  bilanSigne?: boolean | null;
  bilanSigneAt?: string | null;
  certificatSigne?: boolean | null;
  certificatSigneAt?: string | null;
  emargements?: {
    id: string;
    inscriptionId: string;
    participantName: string;
    presentMatin: boolean;
    presentApresMidi: boolean;
    pvParticipantSignedAt: string | null;
    correctionJustification: string | null;
  }[];
  emargementSigne?: boolean;
  emargementSigneAt?: string | null;
};

function PillStatus({ status }: { status: string }) {
  if (status === "CONFIRMEE" || status === "Payé" || status === "Signée")
    return <span className="pill pill-green">{status === "CONFIRMEE" ? "Payé" : status}</span>;
  if (status === "EN_ATTENTE_PAIEMENT" || status === "En attente")
    return <span className="pill pill-orange">En attente</span>;
  return <span className="pill pill-gray">{status}</span>;
}

export default function FormateurDetailClient({ formation }: { formation: FormationDetail }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("inscrits");
  const [statut, setStatut] = useState(formation.statut);
  const [convocationState, setConvocationState] = useState<Record<string, boolean>>(
    Object.fromEntries(formation.inscriptions.map((i) => [i.id, i.convocationSignee]))
  );
  const [conventionState, setConventionState] = useState<Record<string, boolean>>(
    Object.fromEntries(formation.inscriptions.map((i) => [i.id, i.conventionSignee]))
  );
  const [afficheOverlayOpen, setAfficheOverlayOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<string | null>(formation.sessionStatus);
  const [sessionMenuOpen, setSessionMenuOpen] = useState(false);
  const [reopening, setReopening] = useState(false);
  const sessionMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sessionMenuOpen) return;
    function onClick(e: MouseEvent) {
      if (sessionMenuRef.current && !sessionMenuRef.current.contains(e.target as Node)) {
        setSessionMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [sessionMenuOpen]);

  async function reopenSession() {
    setReopening(true);
    try {
      const res = await fetch(`/api/formateur/formations/${formation.id}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reopen" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Erreur lors de la réouverture");
        return;
      }
      const data = await res.json();
      setSessionStatus(data.sessionStatus);
      setSessionMenuOpen(false);
      router.push(`/formateur/formations/${formation.id}/live`);
    } catch {
      alert("Erreur réseau");
    } finally {
      setReopening(false);
    }
  }

  async function resetSessionFromDetail() {
    if (!window.confirm("Remettre la session à zéro ? Le journal de session sera effacé.")) return;
    const res = await fetch(`/api/formateur/formations/${formation.id}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    if (res.ok) {
      setSessionStatus(null);
      setSessionMenuOpen(false);
    }
  }

  async function signerConvocation(inscriptionId: string) {
    const res = await fetch(`/api/formateur/formations/${formation.id}/inscriptions/${inscriptionId}/signer-convocation`, { method: "POST" });
    if (res.ok) setConvocationState((prev) => ({ ...prev, [inscriptionId]: true }));
  }

  async function signerConvention(inscriptionId: string) {
    const res = await fetch(`/api/formateur/formations/${formation.id}/inscriptions/${inscriptionId}/signer-convention`, { method: "POST" });
    if (res.ok) setConventionState((prev) => ({ ...prev, [inscriptionId]: true }));
  }

  // View/Sign overlay state
  const [viewDoc, setViewDoc] = useState<"pv" | "pv-suivi" | "bilan" | "certificat" | "emargement" | null>(null);

  // Overlay local field state — pre-populated from formation data
  const [pvFields, setPvFields] = useState({
    objectifsAtteints: (formation.objectifs ?? []).join("\n"),
    observations: formation.description ?? "",
    acquis: "",
  });
  const [bilanFields, setBilanFields] = useState({
    resume: formation.description ?? "",
    recommandations: "",
    pointsForts: (formation.objectifs ?? []).join("\n"),
  });
  const [acquisLoading, setAcquisLoading] = useState(false);

  // Sign state for official documents
  const [signState, setSignState] = useState({
    pvSigne: formation.pvSigne ?? false,
    pvSigneAt: formation.pvSigneAt ?? null,
    bilanSigne: formation.bilanSigne ?? false,
    bilanSigneAt: formation.bilanSigneAt ?? null,
    certificatSigne: formation.certificatSigne ?? false,
    certificatSigneAt: formation.certificatSigneAt ?? null,
    emargementSigne: formation.emargementSigne ?? false,
    emargementSigneAt: formation.emargementSigneAt ?? null,
  });

  // Emargement correction state
  const [correctionState, setCorrectionState] = useState<{
    [id: string]: { open: boolean; presentMatin: boolean; presentApresMidi: boolean; justification: string };
  }>({});


  async function signDocs(docs: "pv" | "bilan" | "certificat" | "emargement" | "all") {
    const body: Record<string, unknown> = { docs };
    if (docs === "pv" || docs === "all") body.pvContent = pvFields;
    if (docs === "bilan" || docs === "all") body.bilanContent = bilanFields;
    const res = await fetch(`/api/formateur/formations/${formation.id}/sign-docs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      setSignState((prev) => ({ ...prev, ...data }));
    }
  }

  async function resetSignatures() {
    if (!confirm("Réinitialiser toutes les signatures ? Les PDF seront vidés de leur signature et vous pourrez signer à nouveau.")) return;
    const res = await fetch(`/api/formateur/formations/${formation.id}/reset-signatures`, { method: "POST" });
    if (res.ok) {
      setSignState({
        pvSigne: false, pvSigneAt: null,
        bilanSigne: false, bilanSigneAt: null,
        certificatSigne: false, certificatSigneAt: null,
        emargementSigne: false, emargementSigneAt: null,
      });
    }
  }

  // Modifier tab state
  const [descriptionText, setDescriptionText] = useState(formation.description ?? "");
  const [objectifsText, setObjectifsText] = useState((formation.objectifs ?? []).join("\n"));
  const [programmeText, setProgrammeText] = useState(
    (formation.programme ?? [])
      .map((s) => `${s.time} | ${s.title} | ${s.description ?? ""} | ${s.type ?? "Cours magistral"}`)
      .join("\n")
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [savedState, setSavedState] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [reformulerLoading, setReformulerLoading] = useState<string | null>(null);
  const [infosState, setInfosState] = useState({
    titre: formation.titre,
    specialite: formation.specialite,
    niveau: formation.niveau,
    date: formation.date.slice(0, 10),
    heureDebut: formation.heureDebut,
    heureFin: formation.heureFin,
    dureeHeures: formation.dureeHeures,
    placesTotal: formation.placesTotal,
    minParticipants: formation.minParticipants,
    prixHT: formation.prixHT,
    formatFormation: formation.formatFormation,
    restauration: formation.restauration,
    publicCible: formation.publicCible,
    equipements: formation.equipements,
  });

  async function patchFormation(payload: Record<string, unknown>) {
    const res = await fetch(`/api/formateur/formations/${formation.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Erreur lors de la sauvegarde");
  }

  async function saveDescription() {
    setSaving("description");
    try {
      await patchFormation({ description: descriptionText });
      setSavedState("description");
      setTimeout(() => setSavedState((s) => s === "description" ? null : s), 2500);
    } catch {
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(null);
    }
  }

  async function saveObjectifs() {
    setSaving("objectifs");
    try {
      const objectifs = objectifsText.split("\n").filter(Boolean);
      await patchFormation({ objectifs });
      setSavedState("objectifs");
      setTimeout(() => setSavedState((s) => s === "objectifs" ? null : s), 2500);
    } catch {
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(null);
    }
  }

  async function saveProgramme() {
    setSaving("programme");
    try {
      const programme = programmeText
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const parts = line.split(" | ");
          return {
            time: parts[0]?.trim() ?? "",
            title: parts[1]?.trim() ?? "",
            description: parts[2]?.trim() ?? "",
            type: parts[3]?.trim() ?? "Cours magistral",
          };
        });
      await patchFormation({ programme });
      setSavedState("programme");
      setTimeout(() => setSavedState((s) => s === "programme" ? null : s), 2500);
    } catch {
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(null);
    }
  }

  async function saveInfosGenerales() {
    setSaving("infos");
    try {
      await patchFormation({
        titre: infosState.titre,
        specialite: infosState.specialite,
        niveau: infosState.niveau,
        date: infosState.date,
        heureDebut: infosState.heureDebut,
        heureFin: infosState.heureFin,
        dureeHeures: Number(infosState.dureeHeures),
        placesTotal: Number(infosState.placesTotal),
        minParticipants: Number(infosState.minParticipants),
        prixHT: Number(infosState.prixHT),
        formatFormation: infosState.formatFormation,
        restauration: infosState.restauration,
        publicCible: infosState.publicCible,
        equipements: infosState.equipements,
      });
      setSavedState("infos");
      setTimeout(() => setSavedState((s) => s === "infos" ? null : s), 2500);
    } catch {
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(null);
    }
  }

  async function reformuler(type: "description" | "objectifs" | "programme", texte: string, setter: (v: string) => void) {
    setReformulerLoading(type);
    try {
      const res = await fetch("/api/ai/reformuler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texte, type }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setter(data.texte ?? texte);
    } catch {
      alert("Erreur lors de la reformulation.");
    } finally {
      setReformulerLoading(null);
    }
  }

  async function genererObjectifsIA() {
    setAiLoading("objectifs");
    try {
      const res = await fetch("/api/ai/objectifs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: formation.titre,
          specialite: formation.specialite,
          objectifsRaw: objectifsText,
          description: descriptionText,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const lines: string[] = Array.isArray(data) ? data : Array.isArray(data.objectifs) ? data.objectifs : [];
      setObjectifsText(lines.join("\n"));
    } catch {
      alert("Erreur lors de la génération IA.");
    } finally {
      setAiLoading(null);
    }
  }

  async function genererProgrammeIA() {
    setAiLoading("programme");
    try {
      const objectifs = objectifsText.split("\n").filter(Boolean);
      const res = await fetch("/api/ai/programme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: formation.titre,
          specialite: formation.specialite,
          dureeHeures: formation.dureeHeures,
          heureDebut: formation.heureDebut,
          description: descriptionText,
          objectifs,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const slots: ProgrammeSlot[] = Array.isArray(data) ? data : Array.isArray(data.programme) ? data.programme : [];
      const text = slots
        .map((s) => {
          const title = s.title ?? (s as unknown as Record<string, string>).titre ?? "";
          return `${s.time} | ${title} | ${s.description ?? ""} | ${s.type ?? "Cours magistral"}`;
        })
        .join("\n");
      setProgrammeText(text);
    } catch {
      alert("Erreur lors de la génération IA.");
    } finally {
      setAiLoading(null);
    }
  }

  async function publierFormation() {
    setPublishing(true);
    try {
      const res = await fetch(`/api/formateur/formations/${formation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: "PUBLIEE" }),
      });
      if (res.ok) setStatut("PUBLIEE");
      else alert("Erreur lors de la publication.");
    } finally {
      setPublishing(false);
    }
  }

  const inscrits = formation.inscriptions.length;
  const dateFormatted = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(formation.date));

  const revenusHT = formation.inscriptions
    .filter((i) => i.statut === "CONFIRMEE")
    .reduce((sum, i) => sum + formation.prixHT, 0);

  const isPubilee = statut === StatutFormation.PUBLIEE;
  const canPublish = ["BROUILLON", "EN_ATTENTE_SALLE", "SALLE_CONFIRMEE"].includes(statut);

  const TABS = [
    { key: "inscrits", label: `👥 Inscrits (${inscrits})` },
    { key: "documents", label: "📄 Documents" },
    { key: "emargement", label: "✍️ Émargement" },
    { key: "evaluations", label: "⭐ Évaluations" },
    { key: "infos", label: "ℹ️ Informations" },
    { key: "modifier", label: "✏️ Modifier" },
  ];

  const cardStyle = {
    background: "white",
    border: "1px solid #E0E0E0",
    borderRadius: 12,
    padding: "18px 20px",
    marginBottom: 16,
  };

  function statutPill(statut: string) {
    switch (statut) {
      case StatutFormation.PUBLIEE: return <span className="pill pill-green">Publiée</span>;
      case StatutFormation.BROUILLON: return <span className="pill pill-gray">Brouillon</span>;
      case StatutFormation.COMPLETE: return <span className="pill pill-blue">Complète</span>;
      case StatutFormation.ANNULEE: return <span className="pill pill-gray">Annulée</span>;
      default: return <span className="pill pill-gray">{statut}</span>;
    }
  }

  return (
    <>
      {/* Document view/sign overlay */}
      {viewDoc !== null && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setViewDoc(null)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 999,
            }}
          />
          {/* Panel */}
          <div
            style={{
              position: "fixed", right: 0, top: 0, height: "100vh", width: "70%",
              background: "white", zIndex: 1000, overflowY: "auto",
              boxShadow: "-4px 0 32px rgba(0,0,0,0.15)",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #E0E0E0" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#0F0F0F" }}>
                  {viewDoc === "pv" ? "Procès-verbal de formation" : viewDoc === "pv-suivi" ? "Suivi des PV — signatures participants" : viewDoc === "bilan" ? "Bilan pédagogique" : viewDoc === "emargement" ? "Émargement consolidé" : "Certificat de réalisation"}
                </div>
                <div style={{ fontSize: 12, color: "#6A6A6A", marginTop: 2 }}>
                  {formation.titre} · {new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(formation.date))}
                  {formation.lieuNom ? ` · ${formation.lieuNom}` : formation.lieuVille ? ` · ${formation.lieuVille}` : ""}
                  {` · ${formation.dureeHeures}h`}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewDoc(null)}
                style={{
                  background: "#F5F5F5", border: "none", borderRadius: 8,
                  width: 36, height: 36, fontSize: 18, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit",
                }}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "24px", flex: 1 }}>
              {/* Common metadata */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {[
                  { key: "Formation", val: formation.titre },
                  { key: "Date", val: new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(formation.date)) },
                  { key: "Lieu", val: formation.lieuNom ?? formation.lieuVille ?? "—" },
                  { key: "Durée", val: `${formation.dureeHeures}h` },
                ].map((r, i) => (
                  <div key={i} style={{ background: "#F9F7F4", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: "#6A6A6A", marginBottom: 2 }}>{r.key}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0F0F0F" }}>{r.val}</div>
                  </div>
                ))}
              </div>

              {/* PV Suivi — participant signature tracking */}
              {viewDoc === "pv-suivi" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {!signState.pvSigne && (
                    <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#856404" }}>
                      ⚠️ Le formateur n'a pas encore signé le PV. Les participants ne peuvent pas signer tant que la signature du formateur n'est pas apposée.
                    </div>
                  )}
                  {(formation.emargements ?? []).filter(e => e.presentMatin || e.presentApresMidi).length === 0 ? (
                    <div style={{ fontSize: 13, color: "#6A6A6A", padding: "20px 0" }}>Aucun participant n'a émargé pour cette formation.</div>
                  ) : (
                    (formation.emargements ?? [])
                      .filter(e => e.presentMatin || e.presentApresMidi)
                      .map(e => (
                        <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", border: "1.5px solid #E0E0E0", borderRadius: 10, background: e.pvParticipantSignedAt ? "#f0fdf4" : "white" }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700 }}>{e.participantName}</div>
                            <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 2 }}>
                              {e.presentMatin && e.presentApresMidi ? "Journée complète" : e.presentMatin ? "Matin uniquement" : "Après-midi uniquement"}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {e.pvParticipantSignedAt ? (
                              <>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#2e7d32" }}>
                                  ✓ Signé le {new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(e.pvParticipantSignedAt))}
                                </span>
                                <a
                                  href={`/api/pdf/pv-formation/${formation.id}/participant/${e.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ fontSize: 12, fontWeight: 700, color: "#C8102E", textDecoration: "none", background: "#fff5f6", border: "1px solid #C8102E", borderRadius: 6, padding: "5px 10px" }}
                                >
                                  ⬇ PV co-signé
                                </a>
                              </>
                            ) : (
                              <span style={{ fontSize: 12, fontWeight: 600, color: "#f97316" }}>⏳ En attente</span>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                  {/* Formateur signs here if not yet done */}
                  {!signState.pvSigne && (
                    <button
                      type="button"
                      onClick={async () => { await signDocs("pv"); }}
                      style={{ marginTop: 8, background: "#C8102E", color: "white", border: "none", borderRadius: 8, padding: "11px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      ✍️ Signer le PV (formateur)
                    </button>
                  )}
                  {signState.pvSigne && (
                    <div style={{ fontSize: 12, color: "#2e7d32", fontWeight: 600, marginTop: 4 }}>
                      ✓ Votre signature apposée le {new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(signState.pvSigneAt!))}
                    </div>
                  )}
                </div>
              )}

              {/* PV fields */}
              {viewDoc === "pv" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {signState.pvSigne && (
                    <div style={{ background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#5d4037" }}>
                      🔒 Document signé — champs en lecture seule. Utilisez &quot;Réinitialiser les signatures&quot; pour modifier.
                    </div>
                  )}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Objectifs atteints</label>
                    <textarea
                      value={pvFields.objectifsAtteints}
                      onChange={(e) => !signState.pvSigne && setPvFields((f) => ({ ...f, objectifsAtteints: e.target.value }))}
                      rows={4}
                      readOnly={signState.pvSigne}
                      placeholder="Décrivez les objectifs atteints lors de la formation..."
                      style={{ width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", background: signState.pvSigne ? "#F9F7F4" : "white", color: signState.pvSigne ? "#6A6A6A" : "inherit" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Observations</label>
                    <textarea
                      value={pvFields.observations}
                      onChange={(e) => !signState.pvSigne && setPvFields((f) => ({ ...f, observations: e.target.value }))}
                      rows={4}
                      readOnly={signState.pvSigne}
                      placeholder="Observations du formateur sur le déroulement..."
                      style={{ width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", background: signState.pvSigne ? "#F9F7F4" : "white", color: signState.pvSigne ? "#6A6A6A" : "inherit" }}
                    />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                      <label style={{ fontSize: 12, fontWeight: 600 }}>Acquis de la formation</label>
                      <button
                        type="button"
                        onClick={async () => {
                          setAcquisLoading(true);
                          try {
                            const res = await fetch("/api/formateur/ai/acquis", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                titre: formation.titre,
                                objectifs: formation.objectifs ?? [],
                                description: formation.description ?? "",
                              }),
                            });
                            if (!res.ok) throw new Error();
                            const data = await res.json() as { acquis: string };
                            setPvFields((f) => ({ ...f, acquis: data.acquis }));
                          } catch {
                            alert("Erreur lors de la génération IA.");
                          } finally {
                            setAcquisLoading(false);
                          }
                        }}
                        disabled={acquisLoading}
                        style={{
                          background: "white", color: "#6A6A6A", border: "1.5px solid #E0E0E0",
                          borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 600,
                          cursor: acquisLoading ? "not-allowed" : "pointer", fontFamily: "inherit",
                        }}
                      >
                        {acquisLoading ? "Génération…" : "✨ Générer avec l'IA"}
                      </button>
                    </div>
                    <textarea
                      value={pvFields.acquis}
                      onChange={(e) => setPvFields((f) => ({ ...f, acquis: e.target.value }))}
                      rows={4}
                      placeholder="Acquis de la formation pour les participants..."
                      style={{ width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Participants présents ({formation.inscriptions.length})</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {formation.inscriptions.map((insc, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#F9F7F4", borderRadius: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{insc.participant.name}</span>
                          {insc.participant.specialite && <span style={{ fontSize: 11, color: "#6A6A6A" }}>{insc.participant.specialite}</span>}
                        </div>
                      ))}
                      {formation.inscriptions.length === 0 && <div style={{ fontSize: 13, color: "#6A6A6A" }}>Aucun participant inscrit</div>}
                    </div>
                  </div>
                  {/* Signatures des participants */}
                  {(formation.emargements ?? []).length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Signatures des participants</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {(formation.emargements ?? [])
                          .filter((e) => e.presentMatin || e.presentApresMidi)
                          .map((e) => (
                            <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#F9F7F4", borderRadius: 8 }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{e.participantName}</div>
                                <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 2 }}>
                                  {e.presentMatin && e.presentApresMidi ? "Journée complète" : e.presentMatin ? "Matin" : "Après-midi"}
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {e.pvParticipantSignedAt ? (
                                  <>
                                    <span style={{ fontSize: 12, color: "#2e7d32", fontWeight: 600 }}>
                                      ✓ Signé le {new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(e.pvParticipantSignedAt))}
                                    </span>
                                    <a
                                      href={`/api/pdf/pv-formation/${formation.id}/participant/${e.id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ fontSize: 11, color: "#C8102E", fontWeight: 700, textDecoration: "none" }}
                                    >
                                      ⬇ Télécharger PV co-signé
                                    </a>
                                  </>
                                ) : (
                                  <span style={{ fontSize: 12, color: "#f97316", fontWeight: 600 }}>⏳ En attente de signature</span>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bilan fields */}
              {viewDoc === "bilan" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {signState.bilanSigne && (
                    <div style={{ background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#5d4037" }}>
                      🔒 Document signé — champs en lecture seule. Utilisez &quot;Réinitialiser les signatures&quot; pour modifier.
                    </div>
                  )}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Résumé</label>
                    <textarea
                      value={bilanFields.resume}
                      onChange={(e) => !signState.bilanSigne && setBilanFields((f) => ({ ...f, resume: e.target.value }))}
                      rows={4}
                      readOnly={signState.bilanSigne}
                      placeholder="Résumé du bilan pédagogique..."
                      style={{ width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", background: signState.bilanSigne ? "#F9F7F4" : "white", color: signState.bilanSigne ? "#6A6A6A" : "inherit" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Recommandations</label>
                    <textarea
                      value={bilanFields.recommandations}
                      onChange={(e) => !signState.bilanSigne && setBilanFields((f) => ({ ...f, recommandations: e.target.value }))}
                      rows={4}
                      readOnly={signState.bilanSigne}
                      placeholder="Recommandations pour les prochaines sessions..."
                      style={{ width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", background: signState.bilanSigne ? "#F9F7F4" : "white", color: signState.bilanSigne ? "#6A6A6A" : "inherit" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Points forts</label>
                    <textarea
                      value={bilanFields.pointsForts}
                      onChange={(e) => !signState.bilanSigne && setBilanFields((f) => ({ ...f, pointsForts: e.target.value }))}
                      rows={4}
                      readOnly={signState.bilanSigne}
                      placeholder="Points forts de la formation..."
                      style={{ width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", background: signState.bilanSigne ? "#F9F7F4" : "white", color: signState.bilanSigne ? "#6A6A6A" : "inherit" }}
                    />
                  </div>
                </div>
              )}

              {/* Certificat fields */}
              {viewDoc === "certificat" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Objectifs réalisés</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {(formation.objectifs ?? []).map((obj, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 12px", background: "#F9F7F4", borderRadius: 8 }}>
                          <span style={{ color: "#2e7d32", fontWeight: 700, marginTop: 1 }}>✓</span>
                          <span style={{ fontSize: 13 }}>{obj}</span>
                        </div>
                      ))}
                      {(formation.objectifs ?? []).length === 0 && <div style={{ fontSize: 13, color: "#6A6A6A" }}>Aucun objectif défini</div>}
                    </div>
                  </div>
                  {(formation.sessionStartedAt || formation.sessionEndedAt) && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {formation.sessionStartedAt && (
                        <div style={{ background: "#F9F7F4", borderRadius: 8, padding: "10px 12px" }}>
                          <div style={{ fontSize: 10, color: "#6A6A6A", marginBottom: 2 }}>Début de session</div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(formation.sessionStartedAt))}</div>
                        </div>
                      )}
                      {formation.sessionEndedAt && (
                        <div style={{ background: "#F9F7F4", borderRadius: 8, padding: "10px 12px" }}>
                          <div style={{ fontSize: 10, color: "#6A6A6A", marginBottom: 2 }}>Fin de session</div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(formation.sessionEndedAt))}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Emargement consolidé overlay */}
              {viewDoc === "emargement" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ fontSize: 13, color: "#6A6A6A", marginBottom: 4 }}>
                    Liste des inscriptions avec présences et corrections possibles.
                  </div>
                  {(formation.emargements ?? []).length === 0 ? (
                    <div style={{ fontSize: 13, color: "#6A6A6A", textAlign: "center" as const, padding: "24px 0" }}>
                      Aucun émargement enregistré pour cette formation.
                    </div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#F9F7F4" }}>
                          <th style={{ fontSize: 11, fontWeight: 700, padding: "8px 10px", textAlign: "left" as const, borderBottom: "1px solid #E0E0E0" }}>Participant</th>
                          <th style={{ fontSize: 11, fontWeight: 700, padding: "8px 10px", textAlign: "center" as const, borderBottom: "1px solid #E0E0E0" }}>Matin</th>
                          <th style={{ fontSize: 11, fontWeight: 700, padding: "8px 10px", textAlign: "center" as const, borderBottom: "1px solid #E0E0E0" }}>Après-midi</th>
                          <th style={{ fontSize: 11, fontWeight: 700, padding: "8px 10px", textAlign: "center" as const, borderBottom: "1px solid #E0E0E0" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(formation.emargements ?? []).map((e) => {
                          const cs = correctionState[e.id];
                          return (
                            <>
                              <tr key={e.id} style={{ borderBottom: "1px solid #F0F0F0" }}>
                                <td style={{ padding: "10px 10px", fontSize: 13, fontWeight: 600 }}>{e.participantName}</td>
                                <td style={{ padding: "10px 10px", textAlign: "center" as const, fontSize: 14 }}>
                                  {e.presentMatin ? "✓" : "✗"}
                                </td>
                                <td style={{ padding: "10px 10px", textAlign: "center" as const, fontSize: 14 }}>
                                  {e.presentApresMidi ? "✓" : "✗"}
                                </td>
                                <td style={{ padding: "10px 10px", textAlign: "center" as const }}>
                                  <button
                                    type="button"
                                    onClick={() => setCorrectionState((prev) => ({
                                      ...prev,
                                      [e.id]: prev[e.id]?.open
                                        ? { ...prev[e.id], open: false }
                                        : { open: true, presentMatin: e.presentMatin, presentApresMidi: e.presentApresMidi, justification: e.correctionJustification ?? "" },
                                    }))}
                                    style={{
                                      background: "white", color: "#0F0F0F", border: "1.5px solid #E0E0E0",
                                      borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600,
                                      cursor: "pointer", fontFamily: "inherit",
                                    }}
                                  >
                                    ✏️ Corriger
                                  </button>
                                </td>
                              </tr>
                              {cs?.open && (
                                <tr key={`${e.id}-correction`}>
                                  <td colSpan={4} style={{ padding: "12px 10px", background: "#FFF8E1", borderBottom: "1px solid #E0E0E0" }}>
                                    <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                                      <div style={{ display: "flex", gap: 16 }}>
                                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                                          <input
                                            type="checkbox"
                                            checked={cs.presentMatin}
                                            onChange={(ev) => setCorrectionState((prev) => ({ ...prev, [e.id]: { ...prev[e.id], presentMatin: ev.target.checked } }))}
                                          />
                                          Présent matin
                                        </label>
                                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                                          <input
                                            type="checkbox"
                                            checked={cs.presentApresMidi}
                                            onChange={(ev) => setCorrectionState((prev) => ({ ...prev, [e.id]: { ...prev[e.id], presentApresMidi: ev.target.checked } }))}
                                          />
                                          Présent après-midi
                                        </label>
                                      </div>
                                      <textarea
                                        value={cs.justification}
                                        onChange={(ev) => setCorrectionState((prev) => ({ ...prev, [e.id]: { ...prev[e.id], justification: ev.target.value } }))}
                                        rows={2}
                                        placeholder="Justification de la correction (min. 10 caractères)..."
                                        style={{ width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 6, padding: "8px 10px", fontSize: 12, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                                      />
                                      <div style={{ display: "flex", gap: 8 }}>
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            const res = await fetch(`/api/formateur/formations/${formation.id}/emargement-correction`, {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({
                                                emargementId: e.id,
                                                presentMatin: cs.presentMatin,
                                                presentApresMidi: cs.presentApresMidi,
                                                justification: cs.justification,
                                              }),
                                            });
                                            if (!res.ok) {
                                              const err = await res.json().catch(() => ({})) as { error?: string };
                                              alert(err.error ?? "Erreur");
                                              return;
                                            }
                                            setCorrectionState((prev) => ({ ...prev, [e.id]: { ...prev[e.id], open: false } }));
                                          }}
                                          style={{
                                            background: "#0F0F0F", color: "white", border: "none", borderRadius: 6,
                                            padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                                          }}
                                        >
                                          ✓ Valider la correction
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setCorrectionState((prev) => ({ ...prev, [e.id]: { ...prev[e.id], open: false } }))}
                                          style={{
                                            background: "white", color: "#6A6A6A", border: "1.5px solid #E0E0E0", borderRadius: 6,
                                            padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                          }}
                                        >
                                          Annuler
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>

            {/* Footer action */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid #E0E0E0" }}>
              {(() => {
                if (viewDoc === "emargement") {
                  const isSigned = signState.emargementSigne;
                  const signedAt = signState.emargementSigneAt;
                  if (isSigned) {
                    return (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#e8f5e9", borderRadius: 8, fontSize: 13, color: "#2e7d32", fontWeight: 600 }}>
                        ✓ Signé le {signedAt ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(signedAt)) : "—"}
                      </div>
                    );
                  }
                  return (
                    <button
                      type="button"
                      onClick={async () => { await signDocs("emargement"); }}
                      style={{
                        background: "#0F0F0F", color: "white", border: "none", borderRadius: 8,
                        padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      ✍️ Signer l&apos;émargement
                    </button>
                  );
                }
                if (viewDoc === "pv-suivi") return null;
                const isSigned =
                  viewDoc === "pv" ? signState.pvSigne :
                  viewDoc === "bilan" ? signState.bilanSigne :
                  signState.certificatSigne;
                const signedAt =
                  viewDoc === "pv" ? signState.pvSigneAt :
                  viewDoc === "bilan" ? signState.bilanSigneAt :
                  signState.certificatSigneAt;
                if (isSigned) {
                  return (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#e8f5e9", borderRadius: 8, fontSize: 13, color: "#2e7d32", fontWeight: 600 }}>
                      ✓ Signé le {signedAt ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(signedAt)) : "—"}
                    </div>
                  );
                }
                return (
                  <button
                    type="button"
                    onClick={async () => {
                      if (viewDoc) await signDocs(viewDoc as "pv" | "bilan" | "certificat" | "emargement");
                      setViewDoc(null);
                    }}
                    style={{
                      background: "#0F0F0F", color: "white", border: "none", borderRadius: 8,
                      padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    ✍️ Signer numériquement ce document
                  </button>
                );
              })()}
            </div>
          </div>
        </>
      )}

      {/* TOPBAR */}
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/formateur/formations"
            style={{ fontSize: 13, color: "#6A6A6A", textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}
          >
            ← Mes formations
          </Link>
          <div style={{ width: 1, height: 18, background: "#E0E0E0" }} />
          <div className="topbar-title">{formation.titre}</div>
          {sessionStatus === "TERMINEE" && (
            <span className="pill pill-gray" style={{ fontSize: 11 }}>Terminée</span>
          )}
        </div>
        <div className="topbar-right">
          {statutPill(statut)}
          {isPubilee && (
            <>
              {sessionStatus === "EN_COURS" ? (
                <Link
                  href={`/formateur/formations/${formation.id}/live`}
                  style={{
                    background: "#22c55e", color: "white", border: "none", borderRadius: 8,
                    padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                    fontFamily: "inherit", display: "inline-flex", alignItems: "center",
                    gap: 6, textDecoration: "none",
                  }}
                >
                  ● Session en cours
                </Link>
              ) : sessionStatus === "EN_PAUSE" ? (
                <div ref={sessionMenuRef} style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Link
                    href={`/formateur/formations/${formation.id}/live`}
                    style={{
                      background: "#f97316", color: "white", border: "none", borderRadius: 8,
                      padding: "8px 14px", fontSize: 13, fontWeight: 700,
                      display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none",
                    }}
                  >
                    ⏸ En pause
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSessionMenuOpen((v) => !v)}
                    aria-label="Options session"
                    style={{
                      background: "#EBEBEB", color: "#444", border: "none", borderRadius: 8,
                      padding: "8px 10px", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    ⚙️
                  </button>
                  {sessionMenuOpen && (
                    <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 6, background: "white", border: "1px solid #E0E0E0", borderRadius: 8, boxShadow: "0 6px 18px rgba(0,0,0,0.08)", padding: 6, zIndex: 30, minWidth: 200 }}>
                      <button type="button" onClick={resetSessionFromDetail} style={{ background: "transparent", border: "none", width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#C8102E" }}>
                        ↺ Remettre à zéro
                      </button>
                    </div>
                  )}
                </div>
              ) : sessionStatus === "TERMINEE" ? (
                <div ref={sessionMenuRef} style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ background: "#EBEBEB", color: "#444", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
                    ✓ Session terminée
                  </span>
                  <button type="button" onClick={() => setSessionMenuOpen((v) => !v)} aria-label="Options session" style={{ background: "#EBEBEB", color: "#444", border: "none", borderRadius: 8, padding: "8px 10px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                    ⚙️
                  </button>
                  {sessionMenuOpen && (
                    <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 6, background: "white", border: "1px solid #E0E0E0", borderRadius: 8, boxShadow: "0 6px 18px rgba(0,0,0,0.08)", padding: 6, zIndex: 30, minWidth: 200 }}>
                      <button type="button" onClick={reopenSession} disabled={reopening} style={{ background: "transparent", border: "none", width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: reopening ? "not-allowed" : "pointer", fontFamily: "inherit", color: "#0F0F0F" }}>
                        {reopening ? "Réouverture…" : "↻ Rouvrir la session"}
                      </button>
                      <button type="button" onClick={resetSessionFromDetail} style={{ background: "transparent", border: "none", width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#C8102E" }}>
                        ↺ Remettre à zéro
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={`/formateur/formations/${formation.id}/live`}
                  style={{
                    background: "#0F0F0F", color: "white", border: "none", borderRadius: 8,
                    padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                    fontFamily: "inherit", display: "inline-flex", alignItems: "center",
                    gap: 6, textDecoration: "none",
                  }}
                >
                  ▶ Lancer la formation
                </Link>
              )}
              <Link
                href={`/formateur/emargement/${formation.id}`}
                style={{
                  background: "#C8102E", color: "white", border: "none", borderRadius: 8,
                  padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  fontFamily: "inherit", display: "inline-flex", alignItems: "center",
                  gap: 6, textDecoration: "none",
                }}
              >
                ✍️ Émargement
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="content">
        {/* HERO */}
        <div
          style={{
            background: "linear-gradient(135deg, #080810, #1a0408)",
            borderRadius: 16,
            padding: "24px 28px",
            marginBottom: 20,
            position: "relative" as const,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute" as const, top: -40, right: -40,
              width: 200, height: 200,
              background: "radial-gradient(circle, rgba(200,16,46,0.18) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ fontSize: 20, fontWeight: 800, color: "white", letterSpacing: "-0.5px", marginBottom: 6 }}>
            {formation.titre}
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" as const, marginBottom: 16 }}>
            {[
              `📅 ${dateFormatted}`,
              formation.lieuNom
                ? `📍 ${formation.lieuVille} · ${formation.lieuNom}`
                : formation.lieuVille
                ? `📍 ${formation.lieuVille}`
                : "📍 Lieu en cours de confirmation",
              `🕐 ${formation.dureeHeures}h`,
              `🎓 ${niveauLabel(formation.niveau)}`,
            ].map((m, i) => (
              <span key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 5 }}>
                {m}
              </span>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { val: String(inscrits), label: `Inscrits / ${formation.placesTotal}` },
              { val: String(formation.placesRestantes), label: "Places restantes" },
              { val: formation.gratuite ? "Gratuit" : `${revenusHT.toLocaleString("fr-FR")} €`, label: "Revenus bruts HT", small: revenusHT > 9999 },
              {
                val: (() => {
                  const diff = Math.ceil((new Date(formation.date).getTime() - Date.now()) / 86400000);
                  return diff > 0 ? `${diff}j` : diff === 0 ? "Aujourd'hui" : "Passée";
                })(),
                label: "Avant la formation",
              },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: s.small ? 16 : 20, fontWeight: 800, color: "white", letterSpacing: "-0.5px" }}>
                  {s.val}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TABS BAR */}
        <div
          style={{
            background: "white", border: "1px solid #E0E0E0", borderRadius: 12,
            padding: 3, display: "flex", gap: 2, marginBottom: 20,
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                color: activeTab === tab.key ? "white" : "#6A6A6A",
                background: activeTab === tab.key ? "#C8102E" : "transparent",
                border: "none", cursor: "pointer", textAlign: "center" as const,
                fontFamily: "inherit", transition: "background 0.15s, color 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* PANEL: INSCRITS */}
        {activeTab === "inscrits" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <div style={cardStyle}>
              <div className="card-header">
                <span className="card-title">Liste des participants</span>
                {inscrits > 0 && (
                  <button
                    style={{
                      background: "white", color: "#6A6A6A", border: "1.5px solid #E0E0E0",
                      borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    📥 Exporter CSV
                  </button>
                )}
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span>Places occupées</span>
                  <span style={{ fontWeight: 700 }}>{inscrits} / {formation.placesTotal}</span>
                </div>
                <div style={{ background: "#EBEBEB", borderRadius: 100, height: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 100, background: "#C8102E", width: `${formation.placesTotal > 0 ? Math.round((inscrits / formation.placesTotal) * 100) : 0}%` }} />
                </div>
              </div>
              {inscrits === 0 ? (
                <div style={{ padding: "32px 0", textAlign: "center" as const, color: "#6A6A6A" }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>👥</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0F0F0F", marginBottom: 4 }}>
                    Aucun participant inscrit
                  </div>
                  <div style={{ fontSize: 12 }}>
                    {formation.statut === "BROUILLON"
                      ? "Les inscriptions ouvrent après la publication de la formation."
                      : "Les participants apparaîtront ici après leur inscription."}
                  </div>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Participant</th>
                      <th>Inscription</th>
                      <th>Paiement</th>
                      <th>Convention</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formation.inscriptions.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="td-name">{p.participant.name}</div>
                          <div className="td-sub">
                            {[p.participant.specialite, p.participant.ville].filter(Boolean).join(" · ") || p.participant.email}
                          </div>
                        </td>
                        <td>{new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(p.createdAt))}</td>
                        <td><PillStatus status={p.statut} /></td>
                        <td><PillStatus status={p.conventionSignee ? "Signée" : "En attente"} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div>
              <div style={cardStyle}>
                <div className="card-header">
                  <span className="card-title">Résumé financier</span>
                </div>
                {[
                  { key: "Prix unitaire HT", val: formation.gratuite ? "Gratuit" : `${formation.prixHT.toLocaleString("fr-FR")} €` },
                  { key: "Inscrits payés", val: String(formation.inscriptions.filter((i) => i.statut === "CONFIRMEE").length) },
                  { key: "Revenus bruts HT", val: formation.gratuite ? "—" : `${revenusHT.toLocaleString("fr-FR")} €` },
                  { key: "Commission (20%)", val: formation.gratuite ? "—" : `− ${Math.round(revenusHT * 0.2).toLocaleString("fr-FR")} €`, red: !formation.gratuite },
                  { key: "Revenus nets HT", val: formation.gratuite ? "—" : `${Math.round(revenusHT * 0.8).toLocaleString("fr-FR")} €`, green: !formation.gratuite, big: true },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < 4 ? "1px solid #EBEBEB" : "none", fontSize: 12 }}>
                    <span style={{ color: "#6A6A6A" }}>{r.key}</span>
                    <span style={{ fontWeight: 600, color: (r as { red?: boolean }).red ? "#C8102E" : (r as { green?: boolean }).green ? "#2e7d32" : "#0F0F0F", fontSize: (r as { big?: boolean }).big ? 15 : 12 }}>
                      {r.val}
                    </span>
                  </div>
                ))}
                <div style={{ marginTop: 12, padding: "10px 12px", background: "#e8f5e9", borderRadius: 8, fontSize: 12, color: "#2e7d32" }}>
                  Versement estimé sous 7 jours après la formation.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL: DOCUMENTS */}
        {activeTab === "documents" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Avant la formation */}
            <div style={cardStyle}>
              <div className="card-header">
                <span className="card-title">Avant la formation</span>
                <span style={{ fontSize: 11, color: "#6A6A6A" }}>Disponibles dès maintenant</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <a
                  href={`/api/pdf/programme/${formation.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", border: "1.5px solid #E0E0E0", borderRadius: 10, textDecoration: "none", color: "#0F0F0F" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C8102E"; e.currentTarget.style.background = "#fff5f6"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E0E0E0"; e.currentTarget.style.background = "white"; }}
                >
                  <span style={{ fontSize: 20 }}>📄</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>Programme officiel</div>
                    <div style={{ fontSize: 10, color: "#6A6A6A", marginTop: 1 }}>Format Qualiopi</div>
                  </div>
                  <span style={{ fontSize: 11, color: "#C8102E", fontWeight: 700 }}>PDF ↗</span>
                </a>
                <button
                  type="button"
                  onClick={() => setAfficheOverlayOpen(true)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", border: "1.5px solid #E0E0E0", borderRadius: 10, background: "white", cursor: "pointer", fontFamily: "inherit", color: "#0F0F0F", textAlign: "left" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C8102E"; e.currentTarget.style.background = "#fff5f6"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E0E0E0"; e.currentTarget.style.background = "white"; }}
                >
                  <span style={{ fontSize: 20 }}>🖼️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>Affiche A4</div>
                    <div style={{ fontSize: 10, color: "#6A6A6A", marginTop: 1 }}>Personnaliser et télécharger</div>
                  </div>
                  <span style={{ fontSize: 11, color: "#C8102E", fontWeight: 700 }}>⚙️</span>
                </button>
              </div>
            </div>

            {/* Convocations individuelles */}
            {formation.inscriptions.filter((i) => i.statut === "CONFIRMEE").length > 0 && (
              <div style={cardStyle}>
                <div className="card-header">
                  <span className="card-title">Convocations individuelles</span>
                  <span style={{ fontSize: 11, color: "#6A6A6A" }}>
                    {formation.inscriptions.filter((i) => i.statut === "CONFIRMEE" && convocationState[i.id]).length}
                    /{formation.inscriptions.filter((i) => i.statut === "CONFIRMEE").length} envoyées
                  </span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #EBEBEB" }}>
                      <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, padding: "6px 0", color: "#6A6A6A" }}>Participant</th>
                      <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, padding: "6px 0", color: "#6A6A6A" }}>Statut</th>
                      <th style={{ textAlign: "right", fontSize: 11, fontWeight: 600, padding: "6px 0", color: "#6A6A6A" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formation.inscriptions.filter((i) => i.statut === "CONFIRMEE").map((insc) => (
                      <tr key={insc.id} style={{ borderBottom: "1px solid #F5F5F5" }}>
                        <td style={{ padding: "10px 0", fontSize: 13 }}>
                          <div style={{ fontWeight: 600 }}>{insc.participant.name}</div>
                          <div style={{ fontSize: 11, color: "#6A6A6A" }}>{insc.participant.email}</div>
                        </td>
                        <td style={{ padding: "10px 0" }}>
                          {convocationState[insc.id] ? (
                            <span style={{ fontSize: 12, color: "#2e7d32", fontWeight: 600 }}>✓ Envoyée</span>
                          ) : (
                            <span style={{ fontSize: 12, color: "#6A6A6A" }}>En attente</span>
                          )}
                        </td>
                        <td style={{ padding: "10px 0", textAlign: "right", display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <a href={`/api/pdf/convocation/${insc.id}`} target="_blank" rel="noopener noreferrer" style={{ border: "1.5px solid #E0E0E0", background: "white", borderRadius: 7, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "none", color: "#0F0F0F" }}>
                            PDF ↗
                          </a>
                          {!convocationState[insc.id] ? (
                            <button
                              type="button"
                              onClick={() => signerConvocation(insc.id)}
                              style={{ background: "#1565c0", color: "white", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                            >
                              ✍️ Marquer comme envoyée
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: "#2e7d32", padding: "5px 10px" }}>✓</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Conventions individuelles */}
            {formation.inscriptions.filter((i) => i.statut === "CONFIRMEE").length > 0 && (
              <div style={cardStyle}>
                <div className="card-header">
                  <span className="card-title">Conventions individuelles de formation</span>
                  <span style={{ fontSize: 11, color: "#6A6A6A" }}>
                    {formation.inscriptions.filter((i) => i.statut === "CONFIRMEE" && conventionState[i.id]).length}
                    /{formation.inscriptions.filter((i) => i.statut === "CONFIRMEE").length} signées
                  </span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #EBEBEB" }}>
                      <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, padding: "6px 0", color: "#6A6A6A" }}>Participant</th>
                      <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, padding: "6px 0", color: "#6A6A6A" }}>Statut</th>
                      <th style={{ textAlign: "right", fontSize: 11, fontWeight: 600, padding: "6px 0", color: "#6A6A6A" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formation.inscriptions.filter((i) => i.statut === "CONFIRMEE").map((insc) => (
                      <tr key={insc.id} style={{ borderBottom: "1px solid #F5F5F5" }}>
                        <td style={{ padding: "10px 0", fontSize: 13 }}>
                          <div style={{ fontWeight: 600 }}>{insc.participant.name}</div>
                          <div style={{ fontSize: 11, color: "#6A6A6A" }}>{insc.participant.email}</div>
                        </td>
                        <td style={{ padding: "10px 0" }}>
                          {conventionState[insc.id] ? (
                            <span style={{ fontSize: 12, color: "#2e7d32", fontWeight: 600 }}>✓ Signée</span>
                          ) : (
                            <span style={{ fontSize: 12, color: "#6A6A6A" }}>En attente</span>
                          )}
                        </td>
                        <td style={{ padding: "10px 0", textAlign: "right" }}>
                          {!conventionState[insc.id] ? (
                            <button
                              type="button"
                              onClick={() => signerConvention(insc.id)}
                              style={{ background: "#C8102E", color: "white", border: "none", borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                            >
                              ✍️ Signer numériquement
                            </button>
                          ) : (
                            <a href={`/api/pdf/convention/${insc.id}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#C8102E", fontWeight: 600, textDecoration: "none" }}>
                              PDF ↗
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Signature des documents officiels */}
            <div style={cardStyle}>
              <div className="card-header">
                <span className="card-title">Signature des documents officiels</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {(signState.pvSigne || signState.bilanSigne || signState.certificatSigne || signState.emargementSigne) && (
                    <button
                      type="button"
                      onClick={resetSignatures}
                      style={{
                        background: "white", color: "#C8102E", border: "1.5px solid #ffc5cc",
                        borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      ↺ Réinitialiser les signatures
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm("Signer numériquement le PV, le bilan et le certificat de réalisation ?")) return;
                      await signDocs("all");
                    }}
                    style={{
                      background: "#2e7d32", color: "white", border: "none", borderRadius: 8,
                      padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    ✅ Tout signer
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {([
                  { key: "pv" as const, label: "PV de formation", signed: signState.pvSigne, signedAt: signState.pvSigneAt },
                  { key: "bilan" as const, label: "Bilan pédagogique", signed: signState.bilanSigne, signedAt: signState.bilanSigneAt },
                  { key: "certificat" as const, label: "Certificat de réalisation", signed: signState.certificatSigne, signedAt: signState.certificatSigneAt },
                  { key: "emargement" as const, label: "Feuille d'émargement", signed: signState.emargementSigne, signedAt: signState.emargementSigneAt },
                ] as Array<{ key: "pv" | "bilan" | "certificat" | "emargement"; label: string; signed: boolean; signedAt: string | null }>).map((doc, i, arr) => (
                  <div
                    key={doc.key}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: i < arr.length - 1 ? "1px solid #EBEBEB" : "none",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{doc.label}</div>
                      <div style={{ fontSize: 11, marginTop: 2 }}>
                        {doc.signed ? (
                          <span style={{ color: "#2e7d32" }}>
                            ✓ Signé le {new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(doc.signedAt!))}
                          </span>
                        ) : (
                          <span style={{ color: "#6A6A6A" }}>○ Non signé</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => setViewDoc(doc.key)}
                        style={{
                          background: "white", color: "#0F0F0F", border: "1.5px solid #E0E0E0",
                          borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600,
                          cursor: "pointer", fontFamily: "inherit",
                        }}
                      >
                        {doc.signed ? "👁 Voir" : "✍️ Voir & Signer"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Après la formation */}
            <div style={cardStyle}>
              <div className="card-header">
                <span className="card-title">Après la formation</span>
                <span style={{ fontSize: 11, color: "#6A6A6A" }}>
                  {formation.emargementsCount > 0 ? `${formation.emargementsCount} émargements` : "Disponibles après émargement"}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { icon: "✅", label: "Feuille de présence", href: `/api/pdf/feuille-presence/${formation.id}`, sub: "Certifiée demi-journée", signed: false },
                  { icon: "📜", label: "Certificat de réalisation", href: `/api/pdf/certificat-realisation/${formation.id}`, sub: "Art. L6353-1 Code du travail", signed: signState.certificatSigne },
                  { icon: "📝", label: "Questionnaire satisfaction", href: `/api/pdf/questionnaire/${formation.id}`, sub: "Envoyé aux participants J+1", signed: false },
                  { icon: "📊", label: "Bilan pédagogique", href: `/api/pdf/bilan/${formation.id}?ai=true`, sub: formation.satisfactionsCount > 0 ? `${formation.satisfactionsCount} réponses · Analyse IA` : "Disponible J+3", signed: signState.bilanSigne },
                ].map((doc) => (
                  <div key={doc.href} style={{ position: "relative" }}>
                    {doc.signed && (
                      <span style={{
                        position: "absolute", top: -7, right: 8, zIndex: 1,
                        background: "#16a34a", color: "#fff", fontSize: 9, fontWeight: 700,
                        padding: "2px 6px", borderRadius: 10, letterSpacing: 0.3,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                      }}>✓ Signé</span>
                    )}
                    <a
                      href={doc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                        border: doc.signed ? "1.5px solid #16a34a" : "1.5px solid #E0E0E0",
                        borderRadius: 10, textDecoration: "none",
                        color: "#0F0F0F", transition: "border-color 0.15s, background 0.15s",
                        background: doc.signed ? "#f0fdf4" : "white",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C8102E"; e.currentTarget.style.background = "#fff5f6"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = doc.signed ? "#16a34a" : "#E0E0E0"; e.currentTarget.style.background = doc.signed ? "#f0fdf4" : "white"; }}
                    >
                      <span style={{ fontSize: 20 }}>{doc.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{doc.label}</div>
                        {doc.sub && <div style={{ fontSize: 10, color: "#6A6A6A", marginTop: 1 }}>{doc.sub}</div>}
                      </div>
                      <span style={{ fontSize: 11, color: "#C8102E", fontWeight: 700 }}>PDF ↗</span>
                    </a>
                  </div>
                ))}
                {/* PV — opens overlay instead of direct PDF */}
                <div style={{ position: "relative" }}>
                  {signState.pvSigne && (
                    <span style={{
                      position: "absolute", top: -7, right: 8, zIndex: 1,
                      background: "#16a34a", color: "#fff", fontSize: 9, fontWeight: 700,
                      padding: "2px 6px", borderRadius: 10, letterSpacing: 0.3,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                    }}>✓ Signé</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setViewDoc("pv-suivi")}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", width: "100%",
                      border: signState.pvSigne ? "1.5px solid #16a34a" : "1.5px solid #E0E0E0",
                      borderRadius: 10, textDecoration: "none",
                      color: "#0F0F0F", background: signState.pvSigne ? "#f0fdf4" : "white",
                      cursor: "pointer", fontFamily: "inherit",
                      transition: "border-color 0.15s, background 0.15s", textAlign: "left" as const,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C8102E"; e.currentTarget.style.background = "#fff5f6"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = signState.pvSigne ? "#16a34a" : "#E0E0E0"; e.currentTarget.style.background = signState.pvSigne ? "#f0fdf4" : "white"; }}
                  >
                    <span style={{ fontSize: 20 }}>📋</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>Suivi des PV</div>
                      <div style={{ fontSize: 10, color: "#6A6A6A", marginTop: 1 }}>Signatures participants</div>
                    </div>
                    <span style={{ fontSize: 11, color: "#C8102E", fontWeight: 700 }}>→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Par participant */}
            {formation.inscriptions.length > 0 && (
              <div style={cardStyle}>
                <div className="card-header">
                  <span className="card-title">Documents par participant</span>
                  <span style={{ fontSize: 11, color: "#6A6A6A" }}>Convention · Convocation · Attestation · Facture</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Participant</th>
                      <th>Statut</th>
                      <th>Documents</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formation.inscriptions.map((insc) => (
                      <tr key={insc.id}>
                        <td>
                          <div className="td-name">{insc.participant.name}</div>
                          <div className="td-sub">{insc.participant.email}</div>
                        </td>
                        <td><PillStatus status={insc.statut} /></td>
                        <td>
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const }}>
                            <a href={`/api/pdf/convocation/${insc.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: 11, padding: "4px 8px" }}>Convocation</a>
                            <a href={`/api/pdf/convention/${insc.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: 11, padding: "4px 8px" }}>Convention</a>
                            {insc.statut === "CONFIRMEE" && (
                              <a href={`/api/pdf/attestation/${insc.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: 11, padding: "4px 8px" }}>Attestation</a>
                            )}
                            {insc.paiementId && (
                              <a href={`/api/pdf/facture/${insc.paiementId}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: 11, padding: "4px 8px" }}>Facture</a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PANEL: EMARGEMENT */}
        {activeTab === "emargement" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <div style={cardStyle}>
              <div className="card-header">
                <span className="card-title">Statut émargement</span>
              </div>
              <div style={{ background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: 10, padding: "14px 16px", marginBottom: 16, fontSize: 13, color: "#795548" }}>
                <strong>Session non ouverte.</strong> Vous pourrez ouvrir l&apos;émargement le jour de la formation. Chaque participant recevra un lien unique sécurisé par email.
              </div>
              {[
                { val: String(inscrits), label: "Participants à émarger" },
                { val: "0", label: "Présences confirmées" },
              ].map((badge, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#F9F7F4", borderRadius: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#0F0F0F" }}>{badge.val}</div>
                    <div style={{ fontSize: 12, color: "#6A6A6A" }}>{badge.label}</div>
                  </div>
                </div>
              ))}
              {isPubilee && (
                <div style={{ marginTop: 16 }}>
                  <Link
                    href={`/formateur/emargement/${formation.id}`}
                    style={{ background: "#C8102E", color: "white", border: "none", borderRadius: 8, padding: "12px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
                  >
                    ✍️ Ouvrir la session d&apos;émargement
                  </Link>
                  <div style={{ fontSize: 11, color: "#6A6A6A", textAlign: "center" as const, marginTop: 6 }}>
                    Disponible le jour de la formation · {dateFormatted}
                  </div>
                </div>
              )}
            </div>
            <div style={cardStyle}>
              <div className="card-header"><span className="card-title">Comment ça marche</span></div>
              <div style={{ fontSize: 13, color: "#6A6A6A", lineHeight: 1.7 }}>
                <strong style={{ color: "#0F0F0F" }}>1.</strong> Ouvrez la session le matin<br />
                <strong style={{ color: "#0F0F0F" }}>2.</strong> Chaque participant reçoit un lien unique<br />
                <strong style={{ color: "#0F0F0F" }}>3.</strong> Il clique et confirme sa présence<br />
                <strong style={{ color: "#0F0F0F" }}>4.</strong> Vous suivez en temps réel<br />
                <strong style={{ color: "#0F0F0F" }}>5.</strong> Clôturez en fin de journée<br />
                <strong style={{ color: "#0F0F0F" }}>6.</strong> Feuille de présence certifiée générée
              </div>
            </div>
          </div>
        )}

        {/* PANEL: EVALUATIONS */}
        {activeTab === "evaluations" && (
          <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ textAlign: "center" as const, padding: "40px 20px", color: "#6A6A6A" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0F0F0F", marginBottom: 6 }}>
                Les évaluations seront disponibles après la formation
              </div>
              <div style={{ fontSize: 13 }}>
                Les participants reçoivent le questionnaire de satisfaction automatiquement à J+1. La synthèse sera disponible ici à J+3.
              </div>
            </div>
          </div>
        )}

        {/* PANEL: MODIFIER */}
        {activeTab === "modifier" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, alignItems: "start" }}>
            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Description */}
              <div style={cardStyle}>
                <div className="card-header">
                  <span className="card-title">Description</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <VoiceInputButton onTranscript={(t) => setDescriptionText((prev) => prev ? prev + " " + t : t)} />
                    <button
                      className="btn btn-ghost"
                      onClick={() => reformuler("description", descriptionText, setDescriptionText)}
                      disabled={reformulerLoading === "description" || !descriptionText}
                    >
                      {reformulerLoading === "description" ? "Reformulation…" : "✨ Reformuler avec l'IA"}
                    </button>
                  </div>
                </div>
                <textarea
                  value={descriptionText}
                  onChange={(e) => setDescriptionText(e.target.value)}
                  rows={5}
                  style={{
                    width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 8,
                    padding: "10px 12px", fontSize: 13, fontFamily: "inherit",
                    resize: "vertical", marginBottom: 10, boxSizing: "border-box",
                    outline: "none",
                  }}
                  placeholder="Décrivez votre formation..."
                />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="btn btn-red"
                    onClick={saveDescription}
                    disabled={saving === "description"}
                    style={{ background: savedState === "description" ? "#2e7d32" : "#C8102E" }}
                  >
                    {saving === "description" ? "Sauvegarde…" : savedState === "description" ? "✓ Sauvegardé" : "💾 Sauvegarder"}
                  </button>
                </div>
              </div>

              {/* Objectifs */}
              <div style={cardStyle}>
                <div className="card-header">
                  <span className="card-title">Objectifs pédagogiques</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <VoiceInputButton onTranscript={(t) => setObjectifsText((prev) => prev ? prev + "\n" + t : t)} />
                    <button
                      className="btn btn-ghost"
                      onClick={() => reformuler("objectifs", objectifsText, setObjectifsText)}
                      disabled={reformulerLoading === "objectifs" || !objectifsText}
                    >
                      {reformulerLoading === "objectifs" ? "Reformulation…" : "✨ Reformuler avec l'IA"}
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={genererObjectifsIA}
                      disabled={aiLoading === "objectifs"}
                    >
                      {aiLoading === "objectifs" ? "Génération…" : "✨ Générer avec l'IA"}
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 8 }}>
                  Un objectif par ligne
                </div>
                <textarea
                  value={objectifsText}
                  onChange={(e) => setObjectifsText(e.target.value)}
                  rows={6}
                  style={{
                    width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 8,
                    padding: "10px 12px", fontSize: 13, fontFamily: "inherit",
                    resize: "vertical", marginBottom: 10, boxSizing: "border-box",
                    outline: "none",
                  }}
                  placeholder="Ex: Maîtriser les gestes de premiers secours&#10;Connaître les protocoles d'urgence"
                />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="btn btn-red"
                    onClick={saveObjectifs}
                    disabled={saving === "objectifs"}
                    style={{ background: savedState === "objectifs" ? "#2e7d32" : "#C8102E" }}
                  >
                    {saving === "objectifs" ? "Sauvegarde…" : savedState === "objectifs" ? "✓ Sauvegardé" : "💾 Sauvegarder"}
                  </button>
                </div>
              </div>

              {/* Programme */}
              <div style={cardStyle}>
                <div className="card-header">
                  <span className="card-title">Programme</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <VoiceInputButton onTranscript={(t) => setProgrammeText((prev) => prev ? prev + "\n" + t : t)} />
                    <button
                      className="btn btn-ghost"
                      onClick={() => reformuler("programme", programmeText, setProgrammeText)}
                      disabled={reformulerLoading === "programme" || !programmeText}
                    >
                      {reformulerLoading === "programme" ? "Reformulation…" : "✨ Reformuler avec l'IA"}
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={genererProgrammeIA}
                      disabled={aiLoading === "programme"}
                    >
                      {aiLoading === "programme" ? "Génération…" : "✨ Générer le programme IA"}
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 8 }}>
                  Format : <code>HH:MM–HH:MM | Titre | Description | Type</code> — une ligne par créneau
                </div>
                <textarea
                  value={programmeText}
                  onChange={(e) => setProgrammeText(e.target.value)}
                  rows={8}
                  style={{
                    width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 8,
                    padding: "10px 12px", fontSize: 12, fontFamily: "monospace",
                    resize: "vertical", marginBottom: 10, boxSizing: "border-box",
                    outline: "none",
                  }}
                  placeholder="08:30–09:00 | Accueil et introduction | Présentation des participants | Cours magistral"
                />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="btn btn-red"
                    onClick={saveProgramme}
                    disabled={saving === "programme"}
                    style={{ background: savedState === "programme" ? "#2e7d32" : "#C8102E" }}
                  >
                    {saving === "programme" ? "Sauvegarde…" : savedState === "programme" ? "✓ Sauvegardé" : "💾 Sauvegarder"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div style={{ position: "sticky", top: 80 }}>
              {/* Informations générales */}
              <div style={cardStyle}>
                <div className="card-header">
                  <span className="card-title">Informations générales</span>
                </div>
                {(() => {
                  const inputStyle: React.CSSProperties = { width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "9px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
                  const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, marginTop: 10 };
                  const SPECIALITES = [
                    "Addictologie","Allergologie","Anesthésiologie","Cardiologie","Chirurgie","Dentisterie","Dermatologie","Endocrinologie","Gastro-entérologie","Génétique","Gériatrie","Gynécologie-Obstétrique","Hématologie","Hépatologie","Immunologie","Infectiologie","Médecine de la douleur","Médecine de la reproduction","Médecine du sommeil","Médecine du sport","Médecine du travail","Médecine d'urgence","Médecine générale","Médecine intensive et réanimation","Médecine interne","Médecine palliative","Médecine physique et réadaptation","Médecine vasculaire","Néphrologie","Neurochirurgie","Neurologie","Nutrition","Oncologie","Ophtalmologie","ORL","Orthopédie","Pédiatrie","Pharmacologie","Pneumologie","Psychiatrie","Radiologie","Radiothérapie","Rhumatologie","Urologie",
                  ];
                  const EQUIPEMENTS_OPTIONS = [
                    "Vidéoprojecteur / écran",
                    "Sono / micro",
                    "Wi-Fi haut débit",
                    "Tableau blanc",
                    "Matériel de simulation",
                  ];
                  return (
                    <>
                      <label style={labelStyle}>Titre</label>
                      <input type="text" value={infosState.titre} onChange={e => setInfosState(s => ({...s, titre: e.target.value}))} style={inputStyle} />

                      <label style={labelStyle}>Thématique</label>
                      <select value={infosState.specialite} onChange={e => setInfosState(s => ({...s, specialite: e.target.value}))} style={inputStyle}>
                        {SPECIALITES.map(sp => <option key={sp} value={sp}>{sp}</option>)}
                      </select>

                      <label style={labelStyle}>Niveau</label>
                      <select value={infosState.niveau} onChange={e => setInfosState(s => ({...s, niveau: e.target.value}))} style={inputStyle}>
                        <option value="tous">Tous niveaux</option>
                        <option value="debutant">Débutant</option>
                        <option value="intermediaire">Intermédiaire</option>
                        <option value="avance">Avancé</option>
                        <option value="expert">Expert</option>
                      </select>

                      <label style={labelStyle}>Format</label>
                      <select value={infosState.formatFormation} onChange={e => setInfosState(s => ({...s, formatFormation: e.target.value}))} style={inputStyle}>
                        <option value="masterclass">Masterclass</option>
                        <option value="atelier">Atelier pratique</option>
                        <option value="conference">Conférence</option>
                        <option value="symposium">Symposium</option>
                      </select>

                      <label style={labelStyle}>Date</label>
                      <input type="date" value={infosState.date} onChange={e => setInfosState(s => ({...s, date: e.target.value}))} style={inputStyle} />

                      <label style={labelStyle}>Horaires</label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <input type="time" value={infosState.heureDebut} onChange={e => setInfosState(s => ({...s, heureDebut: e.target.value}))} style={inputStyle} placeholder="Début" />
                        <input type="time" value={infosState.heureFin} onChange={e => setInfosState(s => ({...s, heureFin: e.target.value}))} style={inputStyle} placeholder="Fin" />
                      </div>

                      <label style={labelStyle}>Durée</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input type="number" value={infosState.dureeHeures} min={1} max={14} onChange={e => setInfosState(s => ({...s, dureeHeures: Number(e.target.value)}))} style={{ ...inputStyle, width: "auto", flex: 1 }} />
                        <span style={{ fontSize: 13, color: "#6A6A6A", whiteSpace: "nowrap" }}>heures</span>
                      </div>

                      <label style={labelStyle}>Participants max</label>
                      <input type="number" value={infosState.placesTotal} min={1} max={50} onChange={e => setInfosState(s => ({...s, placesTotal: Number(e.target.value)}))} style={inputStyle} />

                      <label style={labelStyle}>Participants min</label>
                      <input type="number" value={infosState.minParticipants} min={1} max={50} onChange={e => setInfosState(s => ({...s, minParticipants: Number(e.target.value)}))} style={inputStyle} />

                      <label style={labelStyle}>Prix HT (€)</label>
                      <input type="number" value={infosState.prixHT} min={0} step={10} onChange={e => setInfosState(s => ({...s, prixHT: Number(e.target.value)}))} style={inputStyle} />

                      <label style={labelStyle}>Public cible</label>
                      <select value={infosState.publicCible} onChange={e => setInfosState(s => ({...s, publicCible: e.target.value}))} style={inputStyle}>
                        <option value="">— Sélectionner —</option>
                        <option value="Médecins généralistes">Médecins généralistes</option>
                        <option value="Médecins spécialistes">Médecins spécialistes</option>
                        <option value="Internes">Internes</option>
                        <option value="Tout professionnel de santé">Tout professionnel de santé</option>
                      </select>

                      <label style={labelStyle}>Restauration</label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                        {["Pause café matin", "Déjeuner", "Pause café après-midi"].map((r) => {
                          const checked = (infosState.restauration ?? "").split(" + ").map(s => s.trim()).filter(Boolean).includes(r);
                          return (
                            <label key={r} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setInfosState(s => {
                                    const items = (s.restauration ?? "").split(" + ").map(x => x.trim()).filter(Boolean);
                                    const next = items.includes(r) ? items.filter(x => x !== r) : [...items, r];
                                    return { ...s, restauration: next.join(" + ") };
                                  });
                                }}
                              />
                              {r}
                            </label>
                          );
                        })}
                      </div>

                      <label style={labelStyle}>Équipements</label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                        {EQUIPEMENTS_OPTIONS.map(eq => (
                          <label key={eq} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={infosState.equipements.includes(eq)}
                              onChange={() => {
                                setInfosState(s => ({
                                  ...s,
                                  equipements: s.equipements.includes(eq)
                                    ? s.equipements.filter(e => e !== eq)
                                    : [...s.equipements, eq],
                                }));
                              }}
                            />
                            {eq}
                          </label>
                        ))}
                      </div>

                      <button
                        className="btn btn-red"
                        onClick={saveInfosGenerales}
                        disabled={saving === "infos"}
                        style={{ background: savedState === "infos" ? "#2e7d32" : "#C8102E", width: "100%", marginTop: 12 }}
                      >
                        {saving === "infos" ? "Sauvegarde…" : savedState === "infos" ? "✓ Sauvegardé" : "💾 Sauvegarder les infos"}
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* PANEL: INFOS */}
        {activeTab === "infos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={cardStyle}>
              <div className="card-header">
                <span className="card-title">Informations générales</span>
                {canPublish && (
                  <button
                    onClick={publierFormation}
                    disabled={publishing}
                    style={{
                      background: "#C8102E", color: "white", border: "none", borderRadius: 8,
                      padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
                      fontFamily: "inherit", opacity: publishing ? 0.7 : 1,
                    }}
                  >
                    {publishing ? "Publication…" : "🚀 Publier la formation"}
                  </button>
                )}
                {isPubilee && (
                  <span className="pill pill-green" style={{ fontSize: 11 }}>✓ Publiée</span>
                )}
              </div>
              {[
                { key: "Titre", val: formation.titre },
                { key: "Thématique", val: formation.specialite || "—" },
                { key: "Durée", val: `${formation.dureeHeures}h` },
                { key: "Date", val: dateFormatted },
                { key: "Lieu", val: formation.lieuNom ? `${formation.lieuVille} · ${formation.lieuNom}` : formation.lieuVille ?? "En cours de confirmation" },
                { key: "Participants", val: `Max ${formation.placesTotal}` },
                { key: "Prix HT", val: formation.gratuite ? "Gratuit" : `${formation.prixHT.toLocaleString("fr-FR")} €` },
                { key: "Niveau", val: niveauLabel(formation.niveau) },
              ].map((r, i, arr) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid #EBEBEB" : "none", fontSize: 12, gap: 12 }}>
                  <span style={{ color: "#6A6A6A", flexShrink: 0 }}>{r.key}</span>
                  <span style={{ fontWeight: 600, color: "#0F0F0F", textAlign: "right" as const, lineHeight: 1.4 }}>{r.val}</span>
                </div>
              ))}
            </div>
            <div style={cardStyle}>
              <div className="card-header">
                <span className="card-title">Demande de salle</span>
              </div>
              {formation.demandeSalle ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #EBEBEB", fontSize: 12 }}>
                    <span style={{ color: "#6A6A6A" }}>Statut</span>
                    <span style={{ fontWeight: 600, color: formation.demandeSalle.statut === "EN_ATTENTE" ? "#795548" : "#2e7d32" }}>
                      {formation.demandeSalle.statut === "EN_ATTENTE" ? "En attente" : formation.demandeSalle.statut}
                    </span>
                  </div>
                  {formation.demandeSalle.notes && (
                    <div style={{ marginTop: 10, padding: "10px 12px", background: "#F9F7F4", borderRadius: 8, fontSize: 12, color: "#444", lineHeight: 1.7, whiteSpace: "pre-line" as const }}>
                      {formation.demandeSalle.notes}
                    </div>
                  )}
                  <div style={{ marginTop: 12, padding: "10px 12px", background: "#fff8e1", borderRadius: 8, fontSize: 12, color: "#795548" }}>
                    Notre équipe vous contactera sous 72h avec un devis de salle.
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "#6A6A6A" }}>Aucune demande de salle associée.</div>
              )}
            </div>
          </div>
          {/* Session log card */}
          <div style={cardStyle}>
            <div className="card-header">
              <span className="card-title">Journal de session</span>
            </div>
            {(() => {
              const log = formation.sessionLog ?? [];
              const logTypeLabel: Record<string, string> = {
                start: "▶ Démarrage",
                pause: "⏸ Pause",
                resume: "▶ Reprise",
                stop: "⏹ Arrêt",
                reset: "↺ Remise à zéro",
                reopen: "↩ Réouverture",
              };
              if (log.length === 0) {
                return <div style={{ fontSize: 13, color: "#6A6A6A" }}>Aucun événement enregistré</div>;
              }
              return (
                <div>
                  {log.map((entry, i) => {
                    const d = new Date(entry.time);
                    const day = String(d.getDate()).padStart(2, "0");
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const year = d.getFullYear();
                    const hh = String(d.getHours()).padStart(2, "0");
                    const mm = String(d.getMinutes()).padStart(2, "0");
                    const timeStr = `${day}/${month}/${year} ${hh}:${mm}`;
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < log.length - 1 ? "1px solid #EBEBEB" : "none", fontSize: 12, gap: 12 }}>
                        <span style={{ fontWeight: 600, color: "#0F0F0F" }}>{logTypeLabel[entry.type] ?? entry.type}</span>
                        <span style={{ color: "#6A6A6A", fontVariantNumeric: "tabular-nums" }}>{timeStr}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
          </div>
        )}
      </div>

      {afficheOverlayOpen && (
        <AfficheOverlay
          formationId={formation.id}
          defaultTitre={formation.titre}
          defaultDescription={formation.description}
          onClose={() => setAfficheOverlayOpen(false)}
        />
      )}
    </>
  );
}
