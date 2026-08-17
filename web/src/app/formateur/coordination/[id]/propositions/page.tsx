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

  if (error) return <div style={{ padding: 60, textAlign: "center", color: "#c62828" }}>{error}</div>;
  if (!data) return <div style={{ padding: 60, textAlign: "center", color: "#6A6A6A" }}>Chargement…</div>;

  const lienConfirmation = typeof window !== "undefined" ? `${window.location.origin}/cursus/confirmation/${id}` : "";

  const lignes = data.enseignants
    .filter((e) => e.role !== "SECRETAIRE")
    .flatMap((e) =>
      data.journees.flatMap((j) =>
        j.slots
          .filter((s) => s.enseignantId === e.id)
          .map((s) => {
            const lieu = s.enVisio
              ? "Visioconférence"
              : [s.lieuNom || j.lieuNom, s.salle ? `salle ${s.salle}` : null].filter(Boolean).join(" — ");
            const message = genererMessagePropositionCreneau({
              enseignantNomCivilite: e.nomCivilite,
              cursusTitre: data.cursus.titre,
              cursusAnnee: data.cursus.annee,
              coordinateurNom: data.cursus.coordinateurNom,
              creneaux: [{ titre: s.titre, dateStr: fdate(j.date), heureDebut: s.heureDebut, heureFin: s.heureFin }],
            }) + `\n\nRépondre en ligne (sans compte à créer) : ${lienConfirmation}`;
            return {
              key: `${j.id}:${s.slotId}`,
              enseignantNom: e.nomCivilite,
              email: e.email,
              titre: s.titre,
              dateStr: fdate(j.date),
              heureDebut: s.heureDebut,
              heureFin: s.heureFin,
              lieu,
              statut: s.confirmationStatut,
              message,
            };
          })
      )
    );

  return (
    <div style={{ minHeight: "100vh", background: "#F9F7F4", fontFamily: "var(--font-sans, 'DM Sans', sans-serif)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 80px" }}>
        <Link href={`/formateur/coordination/${id}`} style={{ fontSize: 13, color: "#6A6A6A", textDecoration: "none" }}>← Retour au DU</Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "10px 0 4px" }}>
          Propositions de créneaux — {data.cursus.titre}{data.cursus.annee ? ` · ${data.cursus.annee}` : ""}
        </h1>
        <p style={{ fontSize: 13, color: "#6A6A6A", marginBottom: 24, lineHeight: 1.6 }}>
          Un message prêt à l&apos;emploi par créneau — copiez l&apos;email et le message, puis collez-les dans votre client de messagerie habituel.
        </p>

        {lignes.length === 0 && (
          <div style={{ background: "white", borderRadius: 14, border: "1px dashed #E0E0E0", padding: "36px 24px", textAlign: "center", color: "#6A6A6A" }}>
            Aucun créneau affecté à un enseignant pour l&apos;instant.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {lignes.map((l) => {
            const pill = statutLabel(l.statut);
            return (
              <div key={l.key} style={{ background: "white", borderRadius: 14, border: "1px solid #E0E0E0", padding: "18px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#0F0F0F" }}>{l.enseignantNom}</div>
                  <span className={`pill ${pill.className}`}>{pill.label}</span>
                </div>

                <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 2 }}>Cours prévu</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0F0F0F", marginBottom: 10 }}>{l.titre}</div>

                <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 2 }}>Créneau prévu</div>
                <div style={{ fontSize: 13, color: "#444", marginBottom: 14 }}>
                  📅 {l.dateStr} · 🕐 {l.heureDebut}–{l.heureFin}{l.lieu ? ` · 📍 ${l.lieu}` : ""}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 13, color: "#0F0F0F", flex: 1, minWidth: 180 }}>✉️ {l.email}</div>
                  <button style={btnGhost} onClick={() => copier(`email-${l.key}`, l.email)}>
                    {copiedKey === `email-${l.key}` ? "✓ Copié" : "📋 Copier l'email"}
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 12, color: "#6A6A6A" }}>Message</div>
                  <button style={btnGhost} onClick={() => copier(`msg-${l.key}`, l.message)}>
                    {copiedKey === `msg-${l.key}` ? "✓ Copié" : "📋 Copier le message"}
                  </button>
                </div>
                <div style={{ background: "#F9F7F4", borderRadius: 8, padding: "12px 14px", fontSize: 12.5, color: "#444", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {l.message}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
