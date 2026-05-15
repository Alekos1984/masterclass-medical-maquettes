"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 24,
            color: (hovered || value) >= star ? "#ffc107" : "#E0E0E0",
            padding: "0 2px",
            lineHeight: 1,
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function SatisfactionPage({ params }: { params: Promise<{ inscriptionId: string }> }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const inscriptionId = resolvedParams.inscriptionId;

  const [form, setForm] = useState({
    noteGlobal: 0,
    noteContenu: 0,
    noteFormateur: 0,
    noteOrganisation: 0,
    noteSupport: 0,
    objectifsAtteints: null as boolean | null,
    recommanderait: null as boolean | null,
    pointsForts: "",
    pointsAmelioration: "",
    commentaireLibre: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.noteGlobal === 0) { setError("Veuillez donner une note globale."); return; }
    if (form.objectifsAtteints === null) { setError("Veuillez indiquer si les objectifs ont été atteints."); return; }
    if (form.recommanderait === null) { setError("Veuillez indiquer si vous recommanderiez cette formation."); return; }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/participant/satisfaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inscriptionId, ...form }),
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => router.push("/participant/dashboard"), 2000);
      } else {
        const data = await res.json().catch(() => ({})) as { error?: string };
        setError(data.error ?? "Une erreur est survenue.");
      }
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1.5px solid #E0E0E0",
    borderRadius: 9,
    padding: "9px 12px",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 8,
  };

  const fieldStyle: React.CSSProperties = { marginBottom: 20 };

  const cardStyle: React.CSSProperties = {
    background: "white",
    border: "1px solid #E0E0E0",
    borderRadius: 12,
    padding: "20px 24px",
    marginBottom: 16,
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 600, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Merci pour votre retour !</div>
          <div style={{ fontSize: 14, color: "#6A6A6A" }}>Votre questionnaire a bien été envoyé. Vous allez être redirigé vers votre tableau de bord.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px 80px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.3, marginBottom: 6 }}>
          Questionnaire de satisfaction
        </div>
        <div style={{ fontSize: 13, color: "#6A6A6A" }}>
          Votre avis nous aide à améliorer la qualité de nos formations.
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Notes */}
        <div style={cardStyle}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Évaluations (1 à 5 étoiles)</div>

          {[
            { key: "noteGlobal" as const, label: "Note globale" },
            { key: "noteContenu" as const, label: "Contenu de la formation" },
            { key: "noteFormateur" as const, label: "Qualité du formateur" },
            { key: "noteOrganisation" as const, label: "Organisation" },
            { key: "noteSupport" as const, label: "Support pédagogique" },
          ].map(({ key, label }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: key !== "noteSupport" ? "1px solid #EBEBEB" : "none" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
              <StarRating
                value={form[key]}
                onChange={(v) => setForm(prev => ({ ...prev, [key]: v }))}
              />
            </div>
          ))}
        </div>

        {/* Oui/Non questions */}
        <div style={cardStyle}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Questions générales</div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Les objectifs pédagogiques ont-ils été atteints ?</label>
            <div style={{ display: "flex", gap: 10 }}>
              {[{ val: true, label: "Oui" }, { val: false, label: "Non" }].map(({ val, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, objectifsAtteints: val }))}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    border: "1.5px solid",
                    borderColor: form.objectifsAtteints === val ? (val ? "#2e7d32" : "#c62828") : "#E0E0E0",
                    background: form.objectifsAtteints === val ? (val ? "#e8f5e9" : "#ffebee") : "white",
                    color: form.objectifsAtteints === val ? (val ? "#2e7d32" : "#c62828") : "#6A6A6A",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Recommanderiez-vous cette formation à un confrère ?</label>
            <div style={{ display: "flex", gap: 10 }}>
              {[{ val: true, label: "Oui" }, { val: false, label: "Non" }].map(({ val, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, recommanderait: val }))}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    border: "1.5px solid",
                    borderColor: form.recommanderait === val ? (val ? "#2e7d32" : "#c62828") : "#E0E0E0",
                    background: form.recommanderait === val ? (val ? "#e8f5e9" : "#ffebee") : "white",
                    color: form.recommanderait === val ? (val ? "#2e7d32" : "#c62828") : "#6A6A6A",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Texte libre */}
        <div style={cardStyle}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Commentaires</div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Points forts <span style={{ fontWeight: 400, color: "#6A6A6A", fontSize: 12 }}>(optionnel)</span></label>
            <textarea
              value={form.pointsForts}
              onChange={(e) => setForm(prev => ({ ...prev, pointsForts: e.target.value }))}
              rows={3}
              placeholder="Ce qui vous a particulièrement plu..."
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Points d&apos;amélioration <span style={{ fontWeight: 400, color: "#6A6A6A", fontSize: 12 }}>(optionnel)</span></label>
            <textarea
              value={form.pointsAmelioration}
              onChange={(e) => setForm(prev => ({ ...prev, pointsAmelioration: e.target.value }))}
              rows={3}
              placeholder="Ce qui pourrait être amélioré..."
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 0 }}>
            <label style={labelStyle}>Commentaire libre <span style={{ fontWeight: 400, color: "#6A6A6A", fontSize: 12 }}>(optionnel)</span></label>
            <textarea
              value={form.commentaireLibre}
              onChange={(e) => setForm(prev => ({ ...prev, commentaireLibre: e.target.value }))}
              rows={4}
              placeholder="Toute autre remarque..."
              style={inputStyle}
            />
          </div>
        </div>

        {error && (
          <div style={{ background: "#ffebee", border: "1.5px solid #ef9a9a", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#c62828", marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            background: "#C8102E",
            color: "white",
            border: "none",
            borderRadius: 10,
            padding: "14px 20px",
            fontSize: 14,
            fontWeight: 700,
            cursor: submitting ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? "Envoi en cours…" : "Envoyer mon questionnaire"}
        </button>
      </form>
    </div>
  );
}
