"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { genererMessagePropositionCreneau } from "@/lib/proposition-message";

type Slot = {
  slotId: string; heureDebut: string; heureFin: string; titre: string; type: string;
  enseignantId: string | null; lieuNom?: string | null; salle?: string | null; enVisio?: boolean;
  confirmationStatut?: "PROPOSE" | "CONFIRME" | "DECLINE" | null;
};
type Journee = { id: string; date: string; lieuNom: string | null; lieuVille: string | null; slots: Slot[] };
type Enseignant = { id: string; email: string; nom: string | null; role: string; nomCivilite: string };
type ApiData = {
  cursus: { titre: string; annee: string | null; coordinateurNom: string };
  journees: Journee[];
  enseignants: Enseignant[];
};

function fdate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function statutLabel(statut?: "PROPOSE" | "CONFIRME" | "DECLINE" | null) {
  if (statut === "CONFIRME") return { label: "Confirmé", className: "pill-green" };
  if (statut === "DECLINE") return { label: "Décliné", className: "pill-gray" };
  if (statut === "PROPOSE") return { label: "Proposé", className: "pill-orange" };
  return { label: "Non demandé", className: "pill-gray" };
}

const btnGhost: React.CSSProperties = {
  background: "transparent", color: "#444", border: "1.5px solid #E0E0E0", borderRadius: 8,
  padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
};

export default function PropositionsExportPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ApiData | null>(null);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [registres, setRegistres] = useState<Record<string, "vouvoiement" | "tutoiement">>({});

  useEffect(() => {
    fetch(`/api/cursus/${id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) setError(d.error ?? "Erreur");
        else setData(d);
      })
      .catch(() => setError("Erreur réseau"));
  }, [id]);

  function copier(key: string, texte: string) {
    navigator.clipboard.writeText(texte);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
  }

  async function logCopie(enseignantId: string, message: string) {
    try {
      await fetch(`/api/cursus/${id}/log-proposition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enseignantId, mode: "copie", message }),
      });
    } catch { /* best-effort */ }
  }

  if (error) return <div style={{ padding: 60, textAlign: "center", color: "#c62828" }}>{error}</div>;
  if (!data) return <div style={{ padding: 60, textAlign: "center", color: "#6A6A6A" }}>Chargement…</div>;

  const lienConfirmation = typeof window !== "undefined" ? `${window.location.origin}/cursus/confirmation/${id}` : "";

  // Un seul bloc par enseignant, regroupant TOUS ses créneaux dans un seul email/message.
  const blocs = data.enseignants
    .filter((e) => e.role !== "SECRETAIRE")
    .map((e) => {
      const creneaux = data.journees.flatMap((j) =>
        j.slots
          .filter((s) => s.enseignantId === e.id)
          .map((s) => {
            const lieu = s.enVisio
              ? "Visioconférence"
              : [s.lieuNom || j.lieuNom, s.salle ? `salle ${s.salle}` : null].filter(Boolean).join(" — ");
            return {
              titre: s.titre, dateStr: fdate(j.date), heureDebut: s.heureDebut, heureFin: s.heureFin,
              lieu, statut: s.confirmationStatut,
            };
          })
      );
      if (creneaux.length === 0) return null;
      const registre = registres[e.id] ?? "vouvoiement";
      const message = genererMessagePropositionCreneau({
        enseignantNom: e.nom ?? e.email,
        enseignantNomCivilite: e.nomCivilite,
        cursusTitre: data.cursus.titre,
        cursusAnnee: data.cursus.annee,
        coordinateurNom: data.cursus.coordinateurNom,
        creneaux,
        registre,
      }) + `\n\nRépondre en ligne (sans compte à créer) : ${lienConfirmation}`;
      return { key: e.id, enseignantId: e.id, enseignantNom: e.nomCivilite, email: e.email, creneaux, message, registre };
    })
    .filter((b): b is NonNullable<typeof b> => b !== null);

  return (
    <div style={{ minHeight: "100vh", background: "#F9F7F4", fontFamily: "var(--font-sans, 'DM Sans', sans-serif)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 80px" }}>
        <Link href={`/formateur/coordination/${id}`} style={{ fontSize: 13, color: "#6A6A6A", textDecoration: "none" }}>← Retour au DU</Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "10px 0 4px" }}>
          Propositions de créneaux — {data.cursus.titre}{data.cursus.annee ? ` · ${data.cursus.annee}` : ""}
        </h1>
        <p style={{ fontSize: 13, color: "#6A6A6A", marginBottom: 24, lineHeight: 1.6 }}>
          Un message par enseignant, regroupant tous ses créneaux — copiez l&apos;email et le message, puis collez-les dans votre client de messagerie habituel.
        </p>

        {blocs.length === 0 && (
          <div style={{ background: "white", borderRadius: 14, border: "1px dashed #E0E0E0", padding: "36px 24px", textAlign: "center", color: "#6A6A6A" }}>
            Aucun créneau affecté à un enseignant pour l&apos;instant.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {blocs.map((b) => (
            <div key={b.key} style={{ background: "white", borderRadius: 14, border: "1px solid #E0E0E0", padding: "18px 22px" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0F0F0F", marginBottom: 10 }}>{b.enseignantNom}</div>

              <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 4 }}>
                {b.creneaux.length > 1 ? `Cours prévus (${b.creneaux.length})` : "Cours prévu"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                {b.creneaux.map((c, i) => {
                  const pill = statutLabel(c.statut);
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, background: "#F9F7F4", borderRadius: 8, padding: "8px 12px" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0F0F0F" }}>{c.titre}</div>
                        <div style={{ fontSize: 12, color: "#6A6A6A" }}>📅 {c.dateStr} · 🕐 {c.heureDebut}–{c.heureFin}{c.lieu ? ` · 📍 ${c.lieu}` : ""}</div>
                      </div>
                      <span className={`pill ${pill.className}`}>{pill.label}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                <div style={{ fontSize: 13, color: "#0F0F0F", flex: 1, minWidth: 180 }}>✉️ {b.email}</div>
                <button style={btnGhost} onClick={() => copier(`email-${b.key}`, b.email)}>
                  {copiedKey === `email-${b.key}` ? "✓ Copié" : "📋 Copier l'email"}
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontSize: 12, color: "#6A6A6A" }}>Message</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    title="Basculer vouvoiement / tutoiement"
                    style={{ background: b.registre === "tutoiement" ? "#fff5f6" : "white", border: `1.5px solid ${b.registre === "tutoiement" ? "#C8102E" : "#E0E0E0"}`, borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: b.registre === "tutoiement" ? "#C8102E" : "#6A6A6A" }}
                    onClick={() => setRegistres((s) => ({ ...s, [b.enseignantId]: b.registre === "tutoiement" ? "vouvoiement" : "tutoiement" }))}
                  >
                    🗣️ Tutoiement {b.registre === "tutoiement" ? "activé" : ""}
                  </button>
                  <button
                    style={btnGhost}
                    onClick={async () => {
                      copier(`msg-${b.key}`, b.message);
                      await logCopie(b.enseignantId, b.message);
                    }}
                  >
                    {copiedKey === `msg-${b.key}` ? "✓ Copié" : "📋 Copier le message"}
                  </button>
                </div>
              </div>
              <div style={{ background: "#F9F7F4", borderRadius: 8, padding: "12px 14px", fontSize: 12.5, color: "#444", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {b.message}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
