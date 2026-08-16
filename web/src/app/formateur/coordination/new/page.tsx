"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SPECIALITES_OPTIONS } from "@/lib/specialites";

const inputStyle: React.CSSProperties = {
  width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 10, padding: "10px 14px",
  fontSize: 14, fontFamily: "inherit", color: "#0F0F0F", background: "white", outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#0F0F0F", marginBottom: 6 };
const cardStyle: React.CSSProperties = { background: "white", borderRadius: 16, padding: "28px 32px", marginBottom: 20, border: "1px solid #E0E0E0" };
const cardTitleStyle: React.CSSProperties = { fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6A6A6A", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #EBEBEB" };

type CertifBlocOption = { code: string; ordre: number; titre: string; emoji: string };
type Template = { id: string; nom: string; specialite: string | null; description: string | null; createdAt: string };

export default function NouveauCursusPage() {
  const router = useRouter();
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [specialite, setSpecialite] = useState("");
  const [annee, setAnnee] = useState("");
  const [publique, setPublique] = useState(false);
  const [inscriptionMode, setInscriptionMode] = useState<"IMPORT" | "PAYANT">("IMPORT");
  const [prixHT, setPrixHT] = useState("");
  const [lieuNom, setLieuNom] = useState("");
  const [lieuAdresse, setLieuAdresse] = useState("");
  const [lieuVille, setLieuVille] = useState("");
  const [certifBlocs, setCertifBlocs] = useState<CertifBlocOption[]>([]);
  const [certifBloc, setCertifBloc] = useState("");
  const [certifAction, setCertifAction] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateId, setTemplateId] = useState("");

  useEffect(() => {
    fetch("/api/certification/referentiel")
      .then((r) => r.json())
      .then((d) => setCertifBlocs(d.blocs ?? []))
      .catch(() => {});
    fetch("/api/cursus-templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates ?? []))
      .catch(() => {});
  }, []);

  function appliquerTemplate(id: string) {
    setTemplateId(id);
    const t = templates.find((tp) => tp.id === id);
    if (!t) return;
    if (t.specialite) setSpecialite(t.specialite);
    if (t.description) setDescription(t.description);
  }

  async function submit() {
    if (!titre.trim()) { setError("Le titre est obligatoire"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/cursus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre, description, specialite, annee, publique, inscriptionMode,
          prixHT: inscriptionMode === "PAYANT" ? prixHT : null,
          lieuNom, lieuAdresse, lieuVille,
          certifBlocCode: certifBloc || null,
          certifActionTitre: certifAction || null,
          templateId: templateId || null,
        }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? "Erreur"); return; }
      router.push(`/formateur/coordination/${d.id}`);
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/formateur/coordination" style={{ fontSize: 13, color: "#6A6A6A", textDecoration: "none" }}>← Coordination</Link>
          <div style={{ width: 1, height: 18, background: "#E0E0E0" }} />
          <div className="topbar-title">Nouveau DU / cursus</div>
        </div>
      </div>
      <div className="content" style={{ maxWidth: 820 }}>
        {templates.length > 0 && (
          <div style={{ ...cardStyle, border: "1.5px solid #C8102E", background: "#fff5f6" }}>
            <div style={cardTitleStyle}>📐 Partir d&apos;un modèle <span style={{ color: "#9A9A9A", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optionnel)</span></div>
            <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 14, lineHeight: 1.5 }}>
              Réutilisez le comité d&apos;organisation, le contact, le mode d&apos;émargement et les blocs de validation
              d&apos;un modèle déjà enregistré.
            </div>
            <select value={templateId} onChange={(e) => appliquerTemplate(e.target.value)} style={inputStyle}>
              <option value="">— Repartir de zéro —</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
            </select>
          </div>
        )}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Informations générales</div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Titre de l&apos;enseignement <span style={{ color: "#C8102E" }}>*</span></label>
            <input type="text" placeholder="Ex : DU d'échocardiographie clinique" value={titre} onChange={(e) => setTitre(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>Spécialité</label>
              <select value={specialite} onChange={(e) => setSpecialite(e.target.value)} style={inputStyle}>{SPECIALITES_OPTIONS}</select>
            </div>
            <div>
              <label style={labelStyle}>Année universitaire</label>
              <input type="text" placeholder="2026-2027" value={annee} onChange={(e) => setAnnee(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              placeholder="Objectifs et contenu de l'enseignement — repris sur le programme PDF et la page publique."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...inputStyle, minHeight: 110, resize: "vertical", lineHeight: 1.6 }}
            />
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitleStyle}>Visibilité &amp; inscriptions</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", border: "1.5px solid #E0E0E0", borderRadius: 10, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Affichage public</div>
              <div style={{ fontSize: 12, color: "#6A6A6A", marginTop: 1 }}>
                Public : page visible par tous. Privé : accessible uniquement aux invités et inscrits.
              </div>
            </div>
            <div
              onClick={() => setPublique((v) => !v)}
              style={{ width: 42, height: 24, borderRadius: 100, background: publique ? "#C8102E" : "#D0D0D0", position: "relative", cursor: "pointer", flexShrink: 0, transition: "background 0.2s" }}
            >
              <div style={{ position: "absolute", width: 18, height: 18, left: publique ? 21 : 3, top: 3, background: "white", borderRadius: "50%", transition: "left 0.2s" }} />
            </div>
          </div>
          <div style={{ display: "flex", border: "1.5px solid #E0E0E0", borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
            <button
              onClick={() => setInscriptionMode("IMPORT")}
              style={{ flex: 1, padding: 11, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", fontFamily: "inherit", color: inscriptionMode === "IMPORT" ? "white" : "#6A6A6A", background: inscriptionMode === "IMPORT" ? "#C8102E" : "transparent" }}
            >
              Import de la liste étudiante
            </button>
            <button
              onClick={() => setInscriptionMode("PAYANT")}
              style={{ flex: 1, padding: 11, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", fontFamily: "inherit", color: inscriptionMode === "PAYANT" ? "white" : "#6A6A6A", background: inscriptionMode === "PAYANT" ? "#C8102E" : "transparent" }}
            >
              Inscription payante en ligne
            </button>
          </div>
          {inscriptionMode === "IMPORT" ? (
            <div style={{ fontSize: 12, color: "#6A6A6A", lineHeight: 1.5 }}>
              Les frais d&apos;inscription sont gérés par l&apos;université : vous importez la liste des étudiants,
              leurs comptes sont créés et inscrits à toutes les journées automatiquement.
            </div>
          ) : (
            <div>
              <label style={labelStyle}>Prix du cursus (HT, par étudiant)</label>
              <input type="number" placeholder="Ex : 800" value={prixHT} onChange={(e) => setPrixHT(e.target.value)} style={{ ...inputStyle, width: 200 }} />
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <div style={cardTitleStyle}>Lieu par défaut <span style={{ color: "#9A9A9A", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(pré-rempli sur les journées présentiel)</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <input type="text" placeholder="Établissement (ex : Faculté de médecine)" value={lieuNom} onChange={(e) => setLieuNom(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Adresse" value={lieuAdresse} onChange={(e) => setLieuAdresse(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Ville" value={lieuVille} onChange={(e) => setLieuVille(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitleStyle}>🎖️ Certification périodique <span style={{ color: "#9A9A9A", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optionnel)</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Bloc du référentiel</label>
              <select value={certifBloc} onChange={(e) => setCertifBloc(e.target.value)} style={inputStyle}>
                <option value="">— Non rattaché —</option>
                {certifBlocs.map((b) => <option key={b.code} value={b.code}>{b.emoji} Bloc {b.ordre} — {b.titre}</option>)}
              </select>
            </div>
            {certifBloc && (
              <div>
                <label style={labelStyle}>Intitulé de l&apos;action</label>
                <input type="text" placeholder="Ex : Formation universitaire diplômante (DU)" value={certifAction} onChange={(e) => setCertifAction(e.target.value)} style={inputStyle} />
              </div>
            )}
          </div>
          {certifBloc && (
            <div style={{ marginTop: 12, background: "#e8f5e9", borderRadius: 10, padding: "10px 16px", fontSize: 12, color: "#1b5e20" }}>
              ✨ Les étudiants médecins recevront automatiquement leurs justificatifs de certification.
            </div>
          )}
        </div>

        {error && (
          <div style={{ background: "#ffebee", color: "#c62828", borderRadius: 10, padding: "12px 16px", fontSize: 13, marginBottom: 16 }}>{error}</div>
        )}
        <button
          onClick={submit}
          disabled={saving}
          style={{ background: saving ? "#999" : "#C8102E", color: "white", border: "none", borderRadius: 100, padding: "14px 40px", fontSize: 15, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", marginBottom: 60 }}
        >
          {saving ? "Création…" : "Créer le cursus →"}
        </button>
      </div>
    </>
  );
}
