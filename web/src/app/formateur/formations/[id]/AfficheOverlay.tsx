"use client";

import { useState, useRef } from "react";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_EXTS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_MB = 6;

interface Props {
  formationId: string;
  defaultTitre: string;
  defaultDescription: string;
  onClose: () => void;
}

export default function AfficheOverlay({ formationId, defaultTitre, defaultDescription, onClose }: Props) {
  const [titre, setTitre] = useState(defaultTitre);
  const [description, setDescription] = useState(defaultDescription.slice(0, 300));
  const [infoPratiques, setInfoPratiques] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    setImageError(null);
    setDownloadUrl(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError("Format non supporté. Utilisez JPG, PNG ou WEBP.");
      e.target.value = "";
      return;
    }
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      setImageError("Extension non reconnue.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setImageError(`Fichier trop volumineux (max ${MAX_MB} Mo).`);
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") {
        setImageDataUrl(ev.target.result);
        setDownloadUrl(null);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleGenerate() {
    setGenerating(true);
    setDownloadUrl(null);
    try {
      const res = await fetch(`/api/pdf/affiche/${formationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: titre.trim() || undefined,
          description: description.trim() || undefined,
          infoPratiques: infoPratiques.trim() || undefined,
          imageBase64: imageDataUrl || undefined,
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        alert(`Erreur : ${msg}`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch {
      alert("Une erreur réseau est survenue.");
    } finally {
      setGenerating(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 8,
    padding: "8px 12px", fontSize: 13, fontFamily: "inherit", outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: "#444", marginBottom: 6, display: "block" };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "white", borderRadius: 16, width: "100%", maxWidth: 680,
        maxHeight: "90vh", overflow: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #EBEBEB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Générer l&apos;affiche A4</div>
            <div style={{ fontSize: 12, color: "#6A6A6A", marginTop: 2 }}>Personnalisez votre affiche avant de la télécharger</div>
          </div>
          <button onClick={onClose} style={{ background: "#F5F5F5", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 16, cursor: "pointer", fontFamily: "inherit", color: "#444" }}>✕</button>
        </div>

        {/* Form */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Titre */}
          <div>
            <label style={labelStyle}>Titre de l&apos;affiche</label>
            <input
              value={titre}
              onChange={(e) => { setTitre(e.target.value); setDownloadUrl(null); }}
              maxLength={120}
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description / accroche <span style={{ fontWeight: 400, color: "#6A6A6A" }}>(pré-remplie, modifiable)</span></label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); setDownloadUrl(null); }}
              rows={4}
              maxLength={400}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
            />
            <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 3, textAlign: "right" }}>{description.length}/400</div>
          </div>

          {/* Infos pratiques */}
          <div>
            <label style={labelStyle}>Informations pratiques <span style={{ fontWeight: 400, color: "#6A6A6A" }}>(restauration, accès, tenue, matériel…)</span></label>
            <textarea
              value={infoPratiques}
              onChange={(e) => { setInfoPratiques(e.target.value); setDownloadUrl(null); }}
              rows={3}
              maxLength={300}
              placeholder="Ex : Déjeuner inclus · Stationnement gratuit sur place · Tenue décontractée"
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
            />
          </div>

          {/* Image upload */}
          <div>
            <label style={labelStyle}>Image de couverture <span style={{ fontWeight: 400, color: "#6A6A6A" }}>(optionnelle — JPG, PNG, WEBP, max {MAX_MB} Mo)</span></label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: "2px dashed #E0E0E0", borderRadius: 10, padding: "16px 20px",
                cursor: "pointer", textAlign: "center", background: "#FAFAFA",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#C8102E")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E0E0E0")}
            >
              {imageDataUrl ? (
                <div>
                  <img src={imageDataUrl} alt="Aperçu" style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 6, marginBottom: 8 }} />
                  <div style={{ fontSize: 12, color: "#6A6A6A" }}>Cliquer pour changer l&apos;image</div>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "#6A6A6A" }}>
                  🖼️ Cliquez ou glissez une image ici
                  <div style={{ fontSize: 11, marginTop: 4 }}>JPG · PNG · WEBP — max {MAX_MB} Mo</div>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              style={{ display: "none" }}
              onChange={handleImage}
            />
            {imageError && (
              <div style={{ background: "#fff0f0", border: "1px solid #fca5a5", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#b91c1c", marginTop: 8 }}>
                ⚠️ {imageError}
              </div>
            )}
            {imageDataUrl && (
              <button
                type="button"
                onClick={() => { setImageDataUrl(null); if (fileRef.current) fileRef.current.value = ""; setDownloadUrl(null); }}
                style={{ fontSize: 11, color: "#6A6A6A", background: "none", border: "none", cursor: "pointer", marginTop: 4, fontFamily: "inherit" }}
              >
                ✕ Supprimer l&apos;image
              </button>
            )}
          </div>

          {/* QR code info */}
          <div style={{ background: "#f0f7ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#1e40af" }}>
            🔗 Un QR code pointant vers la page d&apos;inscription sera automatiquement ajouté à l&apos;affiche.
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #EBEBEB", display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "10px 0", background: "white", border: "1.5px solid #E0E0E0", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#444" }}
          >
            Annuler
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              flex: 2, padding: "10px 0", background: generating ? "#e88" : "#C8102E", color: "white",
              border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700,
              cursor: generating ? "wait" : "pointer", fontFamily: "inherit",
            }}
          >
            {generating ? "Génération en cours…" : "🖼️ Générer l'affiche PDF"}
          </button>
          {downloadUrl && (
            <a
              href={downloadUrl}
              download={`affiche-${formationId}.pdf`}
              style={{
                flex: 2, padding: "10px 0", background: "#16a34a", color: "white",
                border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit", textDecoration: "none",
                textAlign: "center",
              }}
            >
              ⬇️ Télécharger le PDF
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
