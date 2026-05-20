"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import VoiceInputButton from "@/components/VoiceInputButton";
import { SPECIALITES_OPTIONS } from "@/lib/specialites";

const STEPS = [
  { num: 1, label: "Étape 1", title: "Informations" },
  { num: 2, label: "Étape 2", title: "Lieu" },
  { num: 3, label: "Étape 3", title: "Contenu" },
  { num: 4, label: "Étape 4", title: "Tarification" },
];

const FORMATS = [
  { value: "masterclass", label: "Masterclass", sub: "Format court : de 1h à 1 journée" },
  { value: "atelier", label: "Atelier pratique", sub: "Hands-on, petits groupes" },
  { value: "symposium", label: "Symposium", sub: "Multi-intervenants" },
  { value: "seminaire", label: "Séminaire", sub: "2 jours ou plus" },
];

const DUREES = [
  { val: "1h", label: "Conférence" },
  { val: "2h", label: "Atelier court" },
  { val: "3h", label: "Atelier" },
  { val: "4h", label: "Demi-journée" },
  { val: "7h", label: "Journée" },
  { val: "14h", label: "2 jours" },
  { val: "21h", label: "3 jours" },
  { val: "Autre", label: "Personnalisé" },
];

const EQUIPEMENTS = [
  "Vidéoprojecteur / écran",
  "Sono / micro",
  "Tableau blanc / paperboard",
  "Connexion Wi-Fi haut débit",
  "Matériel de simulation",
  "Salle de pause séparée",
];

export default function NouvelleFormationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [format, setFormat] = useState("masterclass");
  const [duree, setDuree] = useState("7h");
  const [maxPart, setMaxPart] = useState(15);
  const [minPart, setMinPart] = useState(8);
  const [locationMode, setLocationMode] = useState<"new" | "existing">("new");
  const [checkedEquip, setCheckedEquip] = useState<string[]>(["Vidéoprojecteur / écran", "Sono / micro"]);
  const [restauration, setRestauration] = useState(true);
  const [checkedResto, setCheckedResto] = useState<string[]>(["Pause café matin", "Déjeuner"]);
  const [prixType, setPrixType] = useState<"payant" | "gratuit">("payant");
  const [niveau, setNiveau] = useState<string>("intermediaire");
  const [publicCible, setPublicCible] = useState<string>("Médecins spécialistes");
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  type DemandeSalleItem = { id: string; statut: string; hotelNom: string | null; notes: string | null; devisHT: number | null; dateDevis: string | null; createdAt: string; formation: { titre: string; date: string } };
  const [demandesSalle, setDemandesSalle] = useState<DemandeSalleItem[]>([]);
  const [demandesSalleLoading, setDemandesSalleLoading] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState<string | null>(null);
  const [objectifsAiLoading, setObjectifsAiLoading] = useState(false);
  const [programmeAiLoading, setProgrammeAiLoading] = useState(false);
  const [programmeAi, setProgrammeAi] = useState<string[]>([]);
  const [reformulerObjectifsLoading, setReformulerObjectifsLoading] = useState(false);
  const [reformulerDescLoading, setReformulerDescLoading] = useState(false);

  async function reformulerObjectifs() {
    if (!objectives) return;
    setReformulerObjectifsLoading(true);
    try {
      const res = await fetch("/api/ai/reformuler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texte: objectives, type: "objectifs" }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setObjectives(data.texte ?? objectives);
    } catch {
      alert("Erreur lors de la reformulation.");
    } finally {
      setReformulerObjectifsLoading(false);
    }
  }

  async function reformulerDescription() {
    if (!description) return;
    setReformulerDescLoading(true);
    try {
      const res = await fetch("/api/ai/reformuler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texte: description, type: "description" }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDescription(data.texte ?? description);
    } catch {
      alert("Erreur lors de la reformulation.");
    } finally {
      setReformulerDescLoading(false);
    }
  }

  // Form fields
  const [titre, setTitre] = useState("");
  const [thematique, setThematique] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [ville, setVille] = useState("");
  const [nomEtablissement, setNomEtablissement] = useState("");
  const [datesFlexibles, setDatesFlexibles] = useState(true);
  const [prix, setPrix] = useState("");
  const [objectives, setObjectives] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (locationMode !== "existing") return;
    setDemandesSalleLoading(true);
    fetch("/api/formateur/demandes-salle")
      .then((r) => r.json())
      .then((d) => setDemandesSalle(d.demandes ?? []))
      .catch(() => {})
      .finally(() => setDemandesSalleLoading(false));
  }, [locationMode]);

  const goTo = (step: number) => {
    if (step >= 1 && step <= STEPS.length) setCurrentStep(step);
  };

  const toggleEquip = (item: string) => {
    setCheckedEquip((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const toggleResto = (item: string) => {
    setCheckedResto((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const inputStyle = {
    width: "100%",
    border: "1.5px solid #E0E0E0",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 14,
    fontFamily: "inherit",
    color: "#0F0F0F",
    background: "white",
    outline: "none",
  };

  const labelStyle = {
    display: "block" as const,
    fontSize: 13,
    fontWeight: 600 as const,
    color: "#0F0F0F",
    marginBottom: 6,
  };

  const fieldStyle = { marginBottom: 20 };

  return (
    <>
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
          <div className="topbar-title">Nouvelle formation</div>
        </div>
        <div className="topbar-right">
          <button
            style={{
              background: "transparent",
              color: "#6A6A6A",
              border: "1.5px solid #E0E0E0",
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Enregistrer le brouillon
          </button>
        </div>
      </div>

      {/* STEPPER */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #E0E0E0",
          padding: "0 28px",
          display: "flex",
          alignItems: "stretch",
        }}
      >
        {STEPS.map((step, i) => {
          const isActive = currentStep === step.num;
          const isDone = currentStep > step.num;
          return (
            <div key={step.num} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && (
                <div style={{ width: 1, background: "#E0E0E0", margin: "0 2px", alignSelf: "stretch" }} />
              )}
              <button
                onClick={() => goTo(step.num)}
                style={{
                  flex: 1,
                  padding: "16px 20px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                  borderBottom: isActive
                    ? "3px solid #C8102E"
                    : isDone
                    ? "3px solid #EBEBEB"
                    : "3px solid transparent",
                  fontFamily: "inherit",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isDone ? 14 : 12,
                    fontWeight: 700,
                    flexShrink: 0,
                    background: isActive ? "#C8102E" : isDone ? "#e8f5e9" : "transparent",
                    border: isActive || isDone ? "none" : "1.5px solid #E0E0E0",
                    color: isActive ? "white" : isDone ? "#2e7d32" : "#6A6A6A",
                  }}
                >
                  {isDone ? "✓" : step.num}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      textTransform: "uppercase" as const,
                      letterSpacing: 1,
                      color: isActive ? "#C8102E" : isDone ? "#2e7d32" : "#6A6A6A",
                      fontWeight: 600,
                    }}
                  >
                    {step.label}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: isActive ? "#0F0F0F" : "#6A6A6A",
                    }}
                  >
                    {step.title}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* CONTENT AREA */}
      <div className="content" style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* ===== ÉTAPE 1 : INFORMATIONS ===== */}
        {currentStep === 1 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: "#C8102E", marginBottom: 6 }}>
              Nouvelle formation
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#0F0F0F", letterSpacing: "-0.5px", marginBottom: 4 }}>
              Informations essentielles
            </div>
            <div style={{ fontSize: 14, color: "#6A6A6A", marginBottom: 28, lineHeight: 1.5 }}>
              Décrivez votre formation en quelques informations clés. Ces éléments apparaîtront sur la landing page publique.
            </div>

            {/* TITRE & THEMATIQUE */}
            <div style={{ background: "white", borderRadius: 16, padding: "28px 32px", marginBottom: 20, border: "1px solid #E0E0E0" }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, color: "#6A6A6A", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #EBEBEB" }}>
                Titre &amp; thématique
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Titre de la formation <span style={{ color: "#C8102E" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex : Cardiologie interventionnelle — Techniques avancées 2026"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  style={inputStyle}
                />
                <div style={{ fontSize: 12, color: "#6A6A6A", marginTop: 5, lineHeight: 1.4 }}>
                  Soyez précis et accrocheur — c&apos;est le premier élément vu par les participants.
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>
                    Thématique <span style={{ color: "#C8102E" }}>*</span>
                  </label>
                  <select
                    value={thematique}
                    onChange={(e) => setThematique(e.target.value)}
                    style={inputStyle}
                  >
                    {SPECIALITES_OPTIONS}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>
                    Sous-thématique{" "}
                    <span style={{ color: "#6A6A6A", fontWeight: 400, fontSize: 12 }}>(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : Coronarographie, Stenting…"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* FORMAT & DUREE */}
            <div style={{ background: "white", borderRadius: 16, padding: "28px 32px", marginBottom: 20, border: "1px solid #E0E0E0" }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, color: "#6A6A6A", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #EBEBEB" }}>
                Format &amp; durée
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Format de la formation <span style={{ color: "#C8102E" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
                  {FORMATS.map((f) => (
                    <div
                      key={f.value}
                      onClick={() => setFormat(f.value)}
                      style={{
                        border: `1.5px solid ${format === f.value ? "#C8102E" : "#E0E0E0"}`,
                        background: format === f.value ? "#fff5f6" : "white",
                        borderRadius: 10,
                        padding: "12px 16px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        flex: 1,
                        minWidth: 120,
                        transition: "border-color 0.15s, background 0.15s",
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          border: `2px solid ${format === f.value ? "#C8102E" : "#E0E0E0"}`,
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "border-color 0.15s",
                        }}
                      >
                        {format === f.value && (
                          <div
                            style={{ width: 8, height: 8, borderRadius: "50%", background: "#C8102E" }}
                          />
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0F0F0F" }}>{f.label}</div>
                        <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 1 }}>{f.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Durée de la formation <span style={{ color: "#C8102E" }}>*</span>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {DUREES.map((d) => (
                    <div
                      key={d.val}
                      onClick={() => setDuree(d.val)}
                      style={{
                        border: `1.5px solid ${duree === d.val ? "#C8102E" : "#E0E0E0"}`,
                        background: duree === d.val ? "#fff5f6" : "white",
                        borderRadius: 10,
                        padding: "10px 8px",
                        textAlign: "center" as const,
                        cursor: "pointer",
                        transition: "border-color 0.15s, background 0.15s",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: duree === d.val ? "#C8102E" : "#0F0F0F",
                        }}
                      >
                        {d.val}
                      </div>
                      <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 2 }}>{d.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>
                    Niveau requis <span style={{ color: "#C8102E" }}>*</span>
                  </label>
                  <select style={inputStyle} value={niveau} onChange={(e) => setNiveau(e.target.value)}>
                    <option value="tous">Tous niveaux</option>
                    <option value="debutant">Débutant</option>
                    <option value="intermediaire">Intermédiaire</option>
                    <option value="avance">Avancé</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>
                    Public cible <span style={{ color: "#C8102E" }}>*</span>
                  </label>
                  <select style={inputStyle} value={publicCible} onChange={(e) => setPublicCible(e.target.value)}>
                    <option value="Médecins généralistes">Médecins généralistes</option>
                    <option value="Médecins spécialistes">Médecins spécialistes</option>
                    <option value="Internes">Internes</option>
                    <option value="Tout professionnel de santé">Tout professionnel de santé</option>
                  </select>
                </div>
              </div>
            </div>

            {/* DATES */}
            <div style={{ background: "white", borderRadius: 16, padding: "28px 32px", marginBottom: 20, border: "1px solid #E0E0E0" }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, color: "#6A6A6A", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #EBEBEB" }}>
                Dates souhaitées
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>
                    Date de début <span style={{ color: "#C8102E" }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    Date de fin <span style={{ color: "#C8102E" }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#6A6A6A", marginBottom: 14, lineHeight: 1.4 }}>
                Ces dates sont indicatives — elles seront confirmées lors de la validation du devis de salle.
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  border: "1.5px solid #E0E0E0",
                  borderRadius: 10,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Dates flexibles</div>
                  <div style={{ fontSize: 12, color: "#6A6A6A", marginTop: 1 }}>
                    Vous acceptez un décalage de ± 2 semaines si la salle n&apos;est pas disponible
                  </div>
                </div>
                <div
                  onClick={() => setDatesFlexibles((v) => !v)}
                  style={{
                    width: 42,
                    height: 24,
                    borderRadius: 100,
                    background: datesFlexibles ? "#C8102E" : "#D0D0D0",
                    position: "relative" as const,
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    style={{
                      position: "absolute" as const,
                      width: 18,
                      height: 18,
                      left: datesFlexibles ? 21 : 3,
                      top: 3,
                      background: "white",
                      borderRadius: "50%",
                      transition: "left 0.2s",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* PARTICIPANTS & TARIFICATION */}
            <div style={{ background: "white", borderRadius: 16, padding: "28px 32px", marginBottom: 80, border: "1px solid #E0E0E0" }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, color: "#6A6A6A", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #EBEBEB" }}>
                Participants &amp; tarification
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>
                    Nombre maximum de participants <span style={{ color: "#C8102E" }}>*</span>
                  </label>
                  <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #E0E0E0", borderRadius: 10, overflow: "hidden", width: "fit-content" }}>
                    <button
                      onClick={() => setMaxPart((v) => Math.max(1, v - 1))}
                      style={{
                        width: 40, height: 40, border: "none", background: "#F9F7F4", cursor: "pointer",
                        fontSize: 18, fontWeight: 300, color: "#0F0F0F", display: "flex", alignItems: "center",
                        justifyContent: "center", fontFamily: "inherit",
                      }}
                    >
                      −
                    </button>
                    <span style={{ padding: "0 20px", fontSize: 15, fontWeight: 700, minWidth: 60, textAlign: "center" as const }}>
                      {maxPart}
                    </span>
                    <button
                      onClick={() => setMaxPart((v) => v + 1)}
                      style={{
                        width: 40, height: 40, border: "none", background: "#F9F7F4", cursor: "pointer",
                        fontSize: 18, fontWeight: 300, color: "#0F0F0F", display: "flex", alignItems: "center",
                        justifyContent: "center", fontFamily: "inherit",
                      }}
                    >
                      +
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: "#6A6A6A", marginTop: 5 }}>
                    Recommandé : 10–25 pour une masterclass premium.
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>
                    Nombre minimum pour maintien{" "}
                    <span style={{ color: "#6A6A6A", fontWeight: 400, fontSize: 12 }}>(optionnel)</span>
                  </label>
                  <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #E0E0E0", borderRadius: 10, overflow: "hidden", width: "fit-content" }}>
                    <button
                      onClick={() => setMinPart((v) => Math.max(1, v - 1))}
                      style={{
                        width: 40, height: 40, border: "none", background: "#F9F7F4", cursor: "pointer",
                        fontSize: 18, fontWeight: 300, color: "#0F0F0F", display: "flex", alignItems: "center",
                        justifyContent: "center", fontFamily: "inherit",
                      }}
                    >
                      −
                    </button>
                    <span style={{ padding: "0 20px", fontSize: 15, fontWeight: 700, minWidth: 60, textAlign: "center" as const }}>
                      {minPart}
                    </span>
                    <button
                      onClick={() => setMinPart((v) => v + 1)}
                      style={{
                        width: 40, height: 40, border: "none", background: "#F9F7F4", cursor: "pointer",
                        fontSize: 18, fontWeight: 300, color: "#0F0F0F", display: "flex", alignItems: "center",
                        justifyContent: "center", fontFamily: "inherit",
                      }}
                    >
                      +
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: "#6A6A6A", marginTop: 5 }}>
                    En dessous de ce seuil, vous pourrez annuler la session.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== ÉTAPE 2 : LIEU ===== */}
        {currentStep === 2 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: "#C8102E", marginBottom: 6 }}>
              Nouvelle formation
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#0F0F0F", letterSpacing: "-0.5px", marginBottom: 4 }}>
              Lieu de la formation
            </div>
            <div style={{ fontSize: 14, color: "#6A6A6A", marginBottom: 28, lineHeight: 1.5 }}>
              Choisissez un lieu existant ou soumettez une nouvelle demande de salle. Notre équipe vous contacte sous 72h avec un devis.
            </div>

            {/* MODE SELECTION */}
            <div style={{ background: "white", borderRadius: 16, padding: "28px 32px", marginBottom: 20, border: "1px solid #E0E0E0" }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, color: "#6A6A6A", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #EBEBEB" }}>
                Mode de sélection du lieu
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div
                  onClick={() => setLocationMode("new")}
                  style={{
                    border: `2px solid ${locationMode === "new" ? "#C8102E" : "#E0E0E0"}`,
                    background: locationMode === "new" ? "#fff5f6" : "white",
                    borderRadius: 14,
                    padding: "20px 22px",
                    cursor: "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 10 }}>🏨</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: locationMode === "new" ? "#C8102E" : "#0F0F0F", marginBottom: 4 }}>
                    Nouvelle demande de salle
                  </div>
                  <div style={{ fontSize: 12, color: "#6A6A6A", lineHeight: 1.5 }}>
                    Vous choisissez la ville et le type d&apos;établissement. Notre équipe obtient un devis sous 72h.
                  </div>
                </div>
                <div
                  onClick={() => setLocationMode("existing")}
                  style={{
                    border: `2px solid ${locationMode === "existing" ? "#C8102E" : "#E0E0E0"}`,
                    background: locationMode === "existing" ? "#fff5f6" : "white",
                    borderRadius: 14,
                    padding: "20px 22px",
                    cursor: "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 10 }}>📋</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: locationMode === "existing" ? "#C8102E" : "#0F0F0F", marginBottom: 4 }}>
                    Utiliser une demande existante
                  </div>
                  <div style={{ fontSize: 12, color: "#6A6A6A", lineHeight: 1.5 }}>
                    Vous avez déjà soumis une demande de salle en attente ou avec devis reçu.
                  </div>
                </div>
              </div>
            </div>

            {locationMode === "new" && (
              <>
                {/* ALERT */}
                <div
                  style={{
                    background: "#fff8e1",
                    border: "1.5px solid #ffe082",
                    borderRadius: 12,
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  <div style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⏱</div>
                  <div style={{ fontSize: 13, color: "#5d4037", lineHeight: 1.55 }}>
                    <strong>Garantie 72h.</strong> Une fois votre demande soumise, notre équipe contacte l&apos;établissement et vous transmet un devis dans les 72 heures ouvrées.
                  </div>
                </div>

                {/* LOCALISATION */}
                <div style={{ background: "white", borderRadius: 16, padding: "28px 32px", marginBottom: 20, border: "1px solid #E0E0E0" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, color: "#6A6A6A", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #EBEBEB" }}>
                    Localisation
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={labelStyle}>Ville <span style={{ color: "#C8102E" }}>*</span></label>
                      <input
                        type="text"
                        placeholder="Ex : Lyon, Paris, Bordeaux…"
                        value={ville}
                        onChange={(e) => setVille(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Pays <span style={{ color: "#C8102E" }}>*</span></label>
                      <select style={inputStyle}>
                        <option>France</option>
                        <option>Belgique</option>
                        <option>Suisse</option>
                        <option>Luxembourg</option>
                        <option>Autre</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Type d&apos;établissement <span style={{ color: "#C8102E" }}>*</span></label>
                      <select style={inputStyle}>
                        <option value="">Sélectionner</option>
                        <option>Hôtel (salle de conférence)</option>
                        <option>Centre de congrès</option>
                        <option>Clinique / Hôpital</option>
                        <option>Université / Faculté</option>
                        <option>Autre</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={labelStyle}>
                        Nom de l&apos;établissement souhaité{" "}
                        <span style={{ color: "#6A6A6A", fontWeight: 400, fontSize: 12 }}>(optionnel)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ex : Marriott Lyon, Palais des Congrès…"
                        value={nomEtablissement}
                        onChange={(e) => setNomEtablissement(e.target.value)}
                        style={inputStyle}
                      />
                      <div style={{ fontSize: 12, color: "#6A6A6A", marginTop: 5 }}>
                        Si vous avez une préférence. Sinon nous cherchons le meilleur disponible.
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Capacité souhaitée <span style={{ color: "#C8102E" }}>*</span></label>
                      <select
                        value={
                          maxPart < 10 ? "Moins de 10 personnes"
                          : maxPart <= 25 ? "10 à 25 personnes"
                          : maxPart <= 50 ? "25 à 50 personnes"
                          : maxPart <= 100 ? "50 à 100 personnes"
                          : "Plus de 100 personnes"
                        }
                        onChange={() => {}}
                        style={{ ...inputStyle, background: "#F9F7F4", color: "#444" }}
                      >
                        <option>Moins de 10 personnes</option>
                        <option>10 à 25 personnes</option>
                        <option>25 à 50 personnes</option>
                        <option>50 à 100 personnes</option>
                        <option>Plus de 100 personnes</option>
                      </select>
                      <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 4 }}>
                        Calculé depuis le nombre max de participants
                      </div>
                    </div>
                  </div>
                </div>

                {/* EQUIPEMENTS */}
                <div style={{ background: "white", borderRadius: 16, padding: "28px 32px", marginBottom: 80, border: "1px solid #E0E0E0" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, color: "#6A6A6A", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #EBEBEB" }}>
                    Équipements &amp; services
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>
                      Équipements requis{" "}
                      <span style={{ color: "#6A6A6A", fontWeight: 400, fontSize: 12 }}>(optionnel)</span>
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {EQUIPEMENTS.map((eq) => {
                        const checked = checkedEquip.includes(eq);
                        return (
                          <div
                            key={eq}
                            onClick={() => toggleEquip(eq)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "11px 14px",
                              border: `1.5px solid ${checked ? "#C8102E" : "#E0E0E0"}`,
                              background: checked ? "#fff5f6" : "white",
                              borderRadius: 10,
                              cursor: "pointer",
                              transition: "border-color 0.15s, background 0.15s",
                            }}
                          >
                            <div
                              style={{
                                width: 18,
                                height: 18,
                                border: `2px solid ${checked ? "#C8102E" : "#E0E0E0"}`,
                                background: checked ? "#C8102E" : "transparent",
                                borderRadius: 4,
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "background 0.15s, border-color 0.15s",
                              }}
                            >
                              {checked && (
                                <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>✓</span>
                              )}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>{eq}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ height: 1, background: "#EBEBEB", margin: "20px 0" }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", border: "1.5px solid #E0E0E0", borderRadius: 10, marginBottom: restauration ? 10 : 0 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>Restauration souhaitée</div>
                      <div style={{ fontSize: 12, color: "#6A6A6A", marginTop: 1 }}>
                        Pause café, déjeuner ou dîner à inclure dans le devis
                      </div>
                    </div>
                    <div
                      onClick={() => setRestauration(!restauration)}
                      style={{
                        width: 42,
                        height: 24,
                        borderRadius: 100,
                        background: restauration ? "#C8102E" : "#EBEBEB",
                        position: "relative" as const,
                        cursor: "pointer",
                        flexShrink: 0,
                        transition: "background 0.2s",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute" as const,
                          width: 18,
                          height: 18,
                          left: restauration ? 21 : 3,
                          top: 3,
                          background: "white",
                          borderRadius: "50%",
                          transition: "left 0.2s",
                        }}
                      />
                    </div>
                  </div>
                  {restauration && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      {["Pause café matin", "Déjeuner", "Pause café après-midi"].map((r) => {
                        const checked = checkedResto.includes(r);
                        return (
                          <div
                            key={r}
                            onClick={() => toggleResto(r)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "11px 14px",
                              border: `1.5px solid ${checked ? "#C8102E" : "#E0E0E0"}`,
                              background: checked ? "#fff5f6" : "white",
                              borderRadius: 10,
                              cursor: "pointer",
                            }}
                          >
                            <div
                              style={{
                                width: 18,
                                height: 18,
                                border: `2px solid ${checked ? "#C8102E" : "#E0E0E0"}`,
                                background: checked ? "#C8102E" : "transparent",
                                borderRadius: 4,
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {checked && <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>✓</span>}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>{r}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {locationMode === "existing" && (
              <div style={{ background: "white", borderRadius: 16, padding: "28px 32px", marginBottom: 80, border: "1px solid #E0E0E0" }}>
                <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, color: "#6A6A6A", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #EBEBEB" }}>
                  Vos demandes de salle en cours
                </div>
                {demandesSalleLoading ? (
                  <div style={{ textAlign: "center", padding: "20px 0", color: "#6A6A6A", fontSize: 13 }}>Chargement…</div>
                ) : demandesSalle.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px 0", color: "#6A6A6A", fontSize: 13 }}>
                    Aucune demande de salle existante.<br />Soumettez une nouvelle demande ci-dessous.
                  </div>
                ) : (
                  demandesSalle.map((item) => {
                    const statutLabels: Record<string, { label: string; bg: string; color: string }> = {
                      EN_ATTENTE: { label: "En attente", bg: "#fff3e0", color: "#e65100" },
                      CONTACT_HOTEL: { label: "Hôtel contacté", bg: "#e3f2fd", color: "#1565c0" },
                      DEVIS_RECU: { label: "Devis reçu", bg: "#e8f5e9", color: "#2e7d32" },
                      VALIDE: { label: "Validé", bg: "#e8f5e9", color: "#2e7d32" },
                      TRANSMIS_FORMATEUR: { label: "Transmis", bg: "#e8f5e9", color: "#2e7d32" },
                      PAYE: { label: "Payé", bg: "#e8f5e9", color: "#2e7d32" },
                    };
                    const s = statutLabels[item.statut] ?? { label: item.statut, bg: "#f5f5f5", color: "#6A6A6A" };
                    const isSelected = selectedDemande === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedDemande(isSelected ? null : item.id)}
                        style={{
                          border: `1.5px solid ${isSelected ? "#C8102E" : "#E0E0E0"}`,
                          background: isSelected ? "#fff5f6" : "white",
                          borderRadius: 12,
                          padding: "16px 18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          marginBottom: 10,
                          transition: "border-color 0.15s",
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 0.8, padding: "3px 9px", borderRadius: 100, background: s.bg, color: s.color }}>
                              {s.label}
                            </span>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#0F0F0F", marginTop: 4 }}>
                            {item.hotelNom ?? "Salle sans nom"}
                          </div>
                          <div style={{ fontSize: 12, color: "#6A6A6A", marginTop: 2 }}>
                            {item.formation.titre} · {new Date(item.formation.date).toLocaleDateString("fr-FR")}
                            {item.devisHT ? ` · Devis : ${item.devisHT.toLocaleString("fr-FR")} € HT` : ""}
                          </div>
                        </div>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${isSelected ? "#C8102E" : "#E0E0E0"}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {isSelected && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#C8102E" }} />}
                        </div>
                      </div>
                    );
                  })
                )}
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #EBEBEB", fontSize: 13, color: "#6A6A6A" }}>
                  Vous ne voyez pas votre salle ?{" "}
                  <button
                    onClick={() => setLocationMode("new")}
                    style={{ color: "#C8102E", fontWeight: 600, cursor: "pointer", background: "none", border: "none", fontFamily: "inherit", fontSize: 13 }}
                  >
                    Soumettre une nouvelle demande →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== ÉTAPE 3 : CONTENU PÉDAGOGIQUE ===== */}
        {currentStep === 3 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: "#C8102E", marginBottom: 6 }}>
              Nouvelle formation
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#0F0F0F", letterSpacing: "-0.5px", marginBottom: 4 }}>
              Contenu pédagogique
            </div>
            <div style={{ fontSize: 14, color: "#6A6A6A", marginBottom: 28, lineHeight: 1.5 }}>
              Définissez les objectifs, le programme et la description de votre formation.
            </div>

            <div style={{ background: "white", borderRadius: 16, padding: "28px 32px", marginBottom: 20, border: "1px solid #E0E0E0" }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, color: "#6A6A6A", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #EBEBEB" }}>
                Objectifs pédagogiques
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Objectifs <span style={{ color: "#C8102E" }}>*</span>
                </label>
                <textarea
                  placeholder="Ex : Maîtriser les techniques de coronarographie avancée&#10;Comprendre les indications du stenting coronarien&#10;Analyser les cas cliniques complexes"
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  style={{ ...inputStyle, minHeight: 120, resize: "vertical" as const, lineHeight: 1.6 }}
                />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6, gap: 8, flexWrap: "wrap" as const }}>
                  <div style={{ fontSize: 12, color: "#6A6A6A" }}>
                    Listez 3 à 5 objectifs mesurables. Un par ligne.
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <VoiceInputButton onTranscript={(t) => setObjectives((prev) => prev ? prev + "\n" + t : t)} />
                    <button
                      type="button"
                      disabled={reformulerObjectifsLoading || !objectives}
                      onClick={reformulerObjectifs}
                      style={{
                        background: reformulerObjectifsLoading ? "#E0E0E0" : "#fff5f6",
                        color: reformulerObjectifsLoading ? "#6A6A6A" : "#C8102E",
                        border: "1.5px solid #C8102E",
                        borderRadius: 8,
                        padding: "6px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: reformulerObjectifsLoading || !objectives ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        flexShrink: 0,
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      {reformulerObjectifsLoading ? "Reformulation…" : "✨ Reformuler avec l'IA"}
                    </button>
                    <button
                      type="button"
                      disabled={objectifsAiLoading}
                      onClick={async () => {
                        setObjectifsAiLoading(true);
                        try {
                          const res = await fetch("/api/ai/objectifs", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ objectifsRaw: objectives, titre }),
                          });
                          if (!res.ok) throw new Error("Erreur serveur");
                          const data = await res.json();
                          setObjectives(Array.isArray(data.objectifs) ? data.objectifs.join("\n") : data.objectifs);
                        } catch {
                          alert("Erreur lors de la génération des objectifs.");
                        } finally {
                          setObjectifsAiLoading(false);
                        }
                      }}
                      style={{
                        background: objectifsAiLoading ? "#E0E0E0" : "#fff5f6",
                        color: objectifsAiLoading ? "#6A6A6A" : "#C8102E",
                        border: "1.5px solid #C8102E",
                        borderRadius: 8,
                        padding: "6px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: objectifsAiLoading ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        flexShrink: 0,
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      {objectifsAiLoading ? "Génération…" : "✨ Améliorer avec l'IA"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: "white", borderRadius: 16, padding: "28px 32px", marginBottom: 80, border: "1px solid #E0E0E0" }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, color: "#6A6A6A", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #EBEBEB" }}>
                Description de la formation
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Description <span style={{ color: "#C8102E" }}>*</span>
                </label>
                <textarea
                  placeholder="Décrivez votre formation en détail : contexte, public visé, méthodes pédagogiques utilisées, ce que les participants vont apprendre…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ ...inputStyle, minHeight: 160, resize: "vertical" as const, lineHeight: 1.6 }}
                />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6, gap: 8, flexWrap: "wrap" as const }}>
                  <div style={{ fontSize: 12, color: "#6A6A6A" }}>
                    Cette description apparaîtra sur la landing page publique de votre formation.
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <VoiceInputButton onTranscript={(t) => setDescription((prev) => prev ? prev + " " + t : t)} />
                    <button
                      type="button"
                      disabled={reformulerDescLoading || !description}
                      onClick={reformulerDescription}
                      style={{
                        background: reformulerDescLoading ? "#E0E0E0" : "#fff5f6",
                        color: reformulerDescLoading ? "#6A6A6A" : "#C8102E",
                        border: "1.5px solid #C8102E",
                        borderRadius: 8,
                        padding: "6px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: reformulerDescLoading || !description ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        flexShrink: 0,
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      {reformulerDescLoading ? "Reformulation…" : "✨ Reformuler avec l'IA"}
                    </button>
                    <button
                      type="button"
                      disabled={programmeAiLoading}
                      onClick={async () => {
                        setProgrammeAiLoading(true);
                        setProgrammeAi([]);
                        try {
                          const dureeHeures = parseInt(duree.replace("h", "")) || 7;
                          const res = await fetch("/api/ai/programme", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              titre,
                              description,
                              dureeHeures,
                              heureDebut: "08:30",
                              objectifs: objectives.split("\n").filter(Boolean),
                            }),
                          });
                          if (!res.ok) throw new Error("Erreur serveur");
                          const data = await res.json();
                          if (Array.isArray(data.programme)) {
                            setProgrammeAi(data.programme);
                          }
                        } catch {
                          alert("Erreur lors de la génération du programme.");
                        } finally {
                          setProgrammeAiLoading(false);
                        }
                      }}
                      style={{
                        background: programmeAiLoading ? "#E0E0E0" : "#fff5f6",
                        color: programmeAiLoading ? "#6A6A6A" : "#C8102E",
                        border: "1.5px solid #C8102E",
                        borderRadius: 8,
                        padding: "6px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: programmeAiLoading ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        flexShrink: 0,
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      {programmeAiLoading ? "Génération…" : "✨ Générer le programme IA"}
                    </button>
                  </div>
                </div>
                {programmeAi.length > 0 && (
                  <div style={{ marginTop: 14, border: "1.5px solid #C8102E", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ background: "#fff5f6", padding: "8px 14px", fontSize: 11, fontWeight: 700, color: "#C8102E", textTransform: "uppercase" as const, letterSpacing: 0.8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span>Programme généré par l&apos;IA</span>
                      <button
                        type="button"
                        onClick={() => setProgrammeAi([])}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#C8102E", fontFamily: "inherit" }}
                      >
                        ✕
                      </button>
                    </div>
                    <div style={{ padding: "10px 14px" }}>
                      {programmeAi.map((item, i) => (
                        <div key={i} style={{ fontSize: 13, color: "#0F0F0F", padding: "6px 0", borderBottom: i < programmeAi.length - 1 ? "1px solid #EBEBEB" : "none", lineHeight: 1.5 }}>
                          {typeof item === "string" ? item : JSON.stringify(item)}
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "#F9F7F4", padding: "8px 14px", borderTop: "1px solid #E0E0E0" }}>
                      <textarea
                        readOnly
                        value={JSON.stringify(programmeAi, null, 2)}
                        style={{ width: "100%", border: "none", outline: "none", fontSize: 11, fontFamily: "monospace", background: "transparent", color: "#6A6A6A", resize: "none" as const, minHeight: 80, lineHeight: 1.5 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== ÉTAPE 4 : TARIFICATION ===== */}
        {currentStep === 4 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: "#C8102E", marginBottom: 6 }}>
              Nouvelle formation
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#0F0F0F", letterSpacing: "-0.5px", marginBottom: 4 }}>
              Tarification &amp; options
            </div>
            <div style={{ fontSize: 14, color: "#6A6A6A", marginBottom: 28, lineHeight: 1.5 }}>
              Définissez le prix de votre formation et les options de paiement.
            </div>

            <div style={{ background: "white", borderRadius: 16, padding: "28px 32px", marginBottom: 20, border: "1px solid #E0E0E0" }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, color: "#6A6A6A", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #EBEBEB" }}>
                Type de tarification
              </div>
              <div style={fieldStyle}>
                <div
                  style={{
                    display: "flex",
                    border: "1.5px solid #E0E0E0",
                    borderRadius: 10,
                    overflow: "hidden",
                    marginBottom: 20,
                  }}
                >
                  <button
                    onClick={() => setPrixType("payant")}
                    style={{
                      flex: 1,
                      padding: 10,
                      textAlign: "center" as const,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      color: prixType === "payant" ? "white" : "#6A6A6A",
                      background: prixType === "payant" ? "#C8102E" : "transparent",
                      border: "none",
                      fontFamily: "inherit",
                      transition: "background 0.15s, color 0.15s",
                    }}
                  >
                    Formation payante
                  </button>
                  <button
                    onClick={() => setPrixType("gratuit")}
                    style={{
                      flex: 1,
                      padding: 10,
                      textAlign: "center" as const,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      color: prixType === "gratuit" ? "white" : "#6A6A6A",
                      background: prixType === "gratuit" ? "#C8102E" : "transparent",
                      border: "none",
                      fontFamily: "inherit",
                      transition: "background 0.15s, color 0.15s",
                    }}
                  >
                    Formation gratuite
                  </button>
                </div>
                {prixType === "payant" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={labelStyle}>
                        Prix par participant (HT) <span style={{ color: "#C8102E" }}>*</span>
                      </label>
                      <input
                        type="number"
                        placeholder="Ex : 450"
                        value={prix}
                        onChange={(e) => setPrix(e.target.value)}
                        style={inputStyle}
                      />
                      <div style={{ fontSize: 12, color: "#6A6A6A", marginTop: 5 }}>
                        La commission plateforme de 20% HT sera déduite de ce montant.
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>
                        Taux TVA <span style={{ color: "#C8102E" }}>*</span>
                      </label>
                      <select style={inputStyle}>
                        <option>Exonéré de TVA (art. 261-4-4° CGI)</option>
                        <option>20% TVA</option>
                      </select>
                      <div style={{ fontSize: 12, color: "#6A6A6A", marginTop: 5 }}>
                        Selon votre statut juridique renseigné dans votre profil.
                      </div>
                    </div>
                  </div>
                )}
                {prixType === "payant" && prix && (
                  <div
                    style={{
                      marginTop: 20,
                      background: "#F9F7F4",
                      borderRadius: 10,
                      padding: "14px 16px",
                    }}
                  >
                    <div style={{ fontSize: 13, color: "#6A6A6A", marginBottom: 8 }}>Estimation revenus</div>
                    {[
                      { label: "Prix brut HT", val: `${prix} € × ${maxPart} max` },
                      { label: "Commission plateforme (20%)", val: `− ${Math.round(Number(prix) * 0.2)} €` },
                      { label: "Revenus nets estimés (max)", val: `${Math.round(Number(prix) * 0.8 * maxPart)} € HT` },
                    ].map((r, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: i < 2 ? 6 : 0,
                          paddingTop: i === 2 ? 8 : 0,
                          borderTop: i === 2 ? "1px solid #E0E0E0" : "none",
                          fontSize: i === 2 ? 14 : 13,
                          fontWeight: i === 2 ? 700 : 400,
                        }}
                      >
                        <span style={{ color: "#6A6A6A" }}>{r.label}</span>
                        <span style={{ color: "#0F0F0F", fontWeight: 600 }}>{r.val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SUBMIT ZONE */}
            <div
              style={{
                background: "#0F0F0F",
                borderRadius: 16,
                padding: 32,
                textAlign: "center" as const,
                marginBottom: 80,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, color: "white", letterSpacing: "-0.3px", marginBottom: 8 }}>
                Prêt à soumettre votre formation ?
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 24, lineHeight: 1.6 }}>
                Notre équipe recevra votre demande et vous contactera sous 72h avec un devis de salle. Votre formation sera publiée après validation du devis et paiement.
              </div>
              {submitError && (
                <div style={{ background: "#ffebee", color: "#c62828", borderRadius: 8, padding: "10px 16px", fontSize: 13, marginBottom: 16 }}>
                  {submitError}
                </div>
              )}
              <button
                disabled={submitLoading}
                onClick={async () => {
                  setSubmitError("");
                  setSubmitLoading(true);
                  try {
                    const res = await fetch("/api/formations", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        titre, thematique, format, duree,
                        dateDebut, dateFin, maxPart, minPart,
                        ville, nomEtablissement, datesFlexibles,
                        checkedEquip, restauration, checkedResto,
                        objectives, description, prixType, prix,
                        niveau, publicCible,
                      }),
                    });
                    if (res.ok) {
                      setShowSuccess(true);
                    } else {
                      const data = await res.json();
                      setSubmitError(data.error ?? "Erreur lors de la soumission");
                    }
                  } catch {
                    setSubmitError("Erreur réseau, veuillez réessayer");
                  } finally {
                    setSubmitLoading(false);
                  }
                }}
                style={{
                  background: submitLoading ? "#999" : "#C8102E",
                  color: "white",
                  border: "none",
                  borderRadius: 100,
                  padding: "16px 48px",
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: submitLoading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  boxShadow: "0 8px 24px rgba(200,16,46,0.35)",
                  transition: "background 0.15s",
                }}
              >
                {submitLoading ? "Envoi en cours…" : "Soumettre la formation →"}
              </button>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 12 }}>
                Vous recevrez un email de confirmation. La formation sera sauvegardée comme brouillon jusqu&apos;à la validation du devis.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM BAR */}
      <div
        style={{
          background: "white",
          borderTop: "1px solid #E0E0E0",
          padding: "16px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky" as const,
          bottom: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          {currentStep > 1 && (
            <button
              onClick={() => goTo(currentStep - 1)}
              style={{
                background: "transparent",
                color: "#6A6A6A",
                border: "1.5px solid #E0E0E0",
                borderRadius: 100,
                padding: "11px 22px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ← Étape précédente
            </button>
          )}
          <button
            style={{
              background: "transparent",
              color: "#6A6A6A",
              border: "1.5px solid #E0E0E0",
              borderRadius: 100,
              padding: "11px 22px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Enregistrer le brouillon
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "#6A6A6A" }}>
            Étape <strong style={{ color: "#0F0F0F" }}>{currentStep}</strong> sur{" "}
            <strong style={{ color: "#0F0F0F" }}>{STEPS.length}</strong>
          </span>
          {currentStep < STEPS.length && (
            <button
              onClick={() => goTo(currentStep + 1)}
              style={{
                background: "#C8102E",
                color: "white",
                border: "none",
                borderRadius: 100,
                padding: "12px 28px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background 0.15s",
              }}
            >
              Étape suivante →
            </button>
          )}
        </div>
      </div>

      {/* SUCCESS OVERLAY */}
      {showSuccess && (
        <div
          style={{
            position: "fixed" as const,
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowSuccess(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 24,
              padding: "48px 40px",
              maxWidth: 480,
              width: "90%",
              textAlign: "center" as const,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#e8f5e9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                margin: "0 auto 20px",
              }}
            >
              ✅
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0F0F0F", letterSpacing: "-0.5px", marginBottom: 10 }}>
              Formation soumise !
            </div>
            <div style={{ fontSize: 14, color: "#6A6A6A", lineHeight: 1.65, marginBottom: 28 }}>
              Votre demande a bien été reçue. Notre équipe vous contacte sous 72h avec un devis de salle. Vous recevrez un email de confirmation.
            </div>
            <Link
              href="/formateur/dashboard"
              style={{
                background: "#0F0F0F",
                color: "white",
                border: "none",
                borderRadius: 100,
                padding: "13px 32px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Retour au dashboard
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
