"use client";

import { useState } from "react";

type TabId = "identite" | "scientifique" | "legal" | "securite";

const tabs: { id: TabId; label: string }[] = [
  { id: "identite", label: "👤 Identité" },
  { id: "scientifique", label: "🔬 Scientifique" },
  { id: "legal", label: "⚖️ Informations légales" },
  { id: "securite", label: "🔒 Sécurité" },
];

type ProfileData = {
  titre: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialite: string;
  adresse: string;
  ville: string;
  codePostal: string;
  bio: string;
  experienceAns: number;
  publications: number;
  linkedinUrl: string;
  researchgateUrl: string;
  pubmedUrl: string;
  siret: string;
  raisonSociale: string;
  iban: string;
  bic: string;
  statutAbonnement: string;
  rpps: string;
};

interface Props {
  profileData: ProfileData;
}

export default function ProfilClient({ profileData }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("identite");
  const [saved, setSaved] = useState(false);

  function saveProfile() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1.5px solid #E0E0E0",
    borderRadius: 9,
    padding: "9px 12px",
    fontSize: 13,
    fontFamily: "inherit",
    color: "var(--black)",
    background: "white",
    outline: "none",
  };

  const fieldStyle: React.CSSProperties = { marginBottom: 16 };
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 5,
  };

  return (
    <>
      {/* TABS */}
      <div
        style={{
          background: "white",
          border: "1px solid #E0E0E0",
          borderRadius: 12,
          padding: 3,
          display: "flex",
          gap: 2,
          marginBottom: 20,
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 9,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "center",
              border: "none",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              background: activeTab === t.id ? "var(--red)" : "transparent",
              color: activeTab === t.id ? "white" : "var(--gray)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* IDENTITÉ */}
      {activeTab === "identite" && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Informations personnelles</span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
            }}
          >
            <div style={fieldStyle}>
              <label style={labelStyle}>Civilité</label>
              <select style={inputStyle} defaultValue={profileData.titre || "Dr."}>
                <option>Dr.</option>
                <option>Pr.</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Prénom</label>
              <input
                type="text"
                defaultValue={profileData.firstName}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Nom</label>
              <input
                type="text"
                defaultValue={profileData.lastName}
                style={inputStyle}
              />
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginTop: 0,
            }}
          >
            <div style={fieldStyle}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                defaultValue={profileData.email}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>
                Téléphone{" "}
                <span
                  style={{
                    color: "var(--gray)",
                    fontWeight: 400,
                    fontSize: 11,
                  }}
                >
                  (non public)
                </span>
              </label>
              <input
                type="text"
                defaultValue={profileData.phone}
                placeholder="06 00 00 00 00"
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ height: 1, background: "#EBEBEB", margin: "16px 0" }} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <div style={fieldStyle}>
              <label style={labelStyle}>Spécialité principale</label>
              <input
                type="text"
                defaultValue={profileData.specialite}
                placeholder="Ex : Cardiologie"
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>
                RPPS{" "}
                <span
                  style={{
                    color: "var(--gray)",
                    fontWeight: 400,
                    fontSize: 11,
                  }}
                >
                  (optionnel)
                </span>
              </label>
              <input
                type="text"
                defaultValue={profileData.rpps}
                placeholder="11 chiffres"
                style={inputStyle}
              />
            </div>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Années d&apos;expérience</label>
            <input
              type="number"
              defaultValue={profileData.experienceAns || ""}
              placeholder="0"
              style={{ ...inputStyle, maxWidth: 120 }}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>
              Biographie{" "}
              <span
                style={{ color: "var(--gray)", fontWeight: 400, fontSize: 11 }}
              >
                (visible sur vos landing pages)
              </span>
            </label>
            <textarea
              defaultValue={profileData.bio}
              placeholder="Décrivez votre parcours et expertise..."
              style={{
                ...inputStyle,
                minHeight: 100,
                resize: "vertical",
                lineHeight: 1.6,
              }}
            />
          </div>
          <div style={{ height: 1, background: "#EBEBEB", margin: "16px 0" }} />
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
            Liens professionnels
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
            }}
          >
            <div style={fieldStyle}>
              <label style={labelStyle}>LinkedIn</label>
              <input
                type="url"
                defaultValue={profileData.linkedinUrl}
                placeholder="linkedin.com/in/…"
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>ResearchGate</label>
              <input
                type="url"
                defaultValue={profileData.researchgateUrl}
                placeholder="researchgate.net/profile/…"
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>PubMed</label>
              <input
                type="url"
                defaultValue={profileData.pubmedUrl}
                placeholder="ncbi.nlm.nih.gov/…"
                style={inputStyle}
              />
            </div>
          </div>
        </div>
      )}

      {/* SCIENTIFIQUE */}
      {activeTab === "scientifique" && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title">Publications scientifiques</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  style={{
                    background: "white",
                    border: "1.5px solid #E0E0E0",
                    borderRadius: 8,
                    padding: "5px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "var(--gray)",
                    fontFamily: "inherit",
                  }}
                >
                  Import PubMed
                </button>
                <button
                  style={{
                    background: "white",
                    border: "1.5px solid #E0E0E0",
                    borderRadius: 8,
                    padding: "5px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "var(--gray)",
                    fontFamily: "inherit",
                  }}
                >
                  + Ajouter
                </button>
              </div>
            </div>
            {profileData.publications > 0 ? (
              <div
                style={{
                  padding: "16px",
                  background: "var(--off-white)",
                  borderRadius: 10,
                  textAlign: "center",
                }}
              >
                <div
                  style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}
                >
                  {profileData.publications}
                </div>
                <div style={{ fontSize: 12, color: "var(--gray)" }}>
                  publication{profileData.publications > 1 ? "s" : ""}{" "}
                  référencée{profileData.publications > 1 ? "s" : ""}
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "32px 20px",
                  textAlign: "center",
                  color: "var(--gray)",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>📚</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  Aucune publication renseignée
                </div>
                <div style={{ fontSize: 12 }}>
                  Ajoutez vos publications ou importez-les depuis PubMed.
                </div>
              </div>
            )}
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: "transparent",
                border: "1.5px dashed #E0E0E0",
                borderRadius: 9,
                padding: "9px 14px",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--gray)",
                cursor: "pointer",
                width: "100%",
                fontFamily: "inherit",
                marginTop: 8,
              }}
            >
              + Ajouter une publication
            </button>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Expérience</span>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Années d&apos;expérience</label>
              <input
                type="number"
                defaultValue={profileData.experienceAns || ""}
                placeholder="0"
                style={{ ...inputStyle, maxWidth: 120 }}
              />
            </div>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: "transparent",
                border: "1.5px dashed #E0E0E0",
                borderRadius: 9,
                padding: "9px 14px",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--gray)",
                cursor: "pointer",
                width: "100%",
                fontFamily: "inherit",
              }}
            >
              + Ajouter une expérience professionnelle
            </button>
          </div>
        </>
      )}

      {/* LÉGAL */}
      {activeTab === "legal" && (
        <>
          <div
            style={{
              background: "#e3f2fd",
              border: "1.5px solid #90caf9",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 13,
              color: "#1565c0",
              marginBottom: 16,
            }}
          >
            ℹ️ Ces informations sont utilisées pour la facturation, le calcul de
            TVA et la génération de documents officiels. Elles ne sont pas
            affichées publiquement.
          </div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title">Statut juridique &amp; facturation</span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div style={fieldStyle}>
                <label style={labelStyle}>Statut juridique</label>
                <select style={inputStyle}>
                  <option>Médecin libéral</option>
                  <option>Auto-entrepreneur</option>
                  <option>SASU</option>
                </select>
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Raison sociale{" "}
                  <span
                    style={{
                      color: "var(--gray)",
                      fontWeight: 400,
                      fontSize: 11,
                    }}
                  >
                    (si société)
                  </span>
                </label>
                <input
                  type="text"
                  defaultValue={profileData.raisonSociale}
                  placeholder="Ex : Cabinet du Dr. … SAS"
                  style={inputStyle}
                />
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div style={fieldStyle}>
                <label style={labelStyle}>SIRET</label>
                <input
                  type="text"
                  defaultValue={profileData.siret}
                  placeholder="14 chiffres"
                  style={inputStyle}
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Numéro de déclaration d&apos;activité
                </label>
                <input
                  type="text"
                  placeholder="11 chiffres — Préfecture"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title">Adresse de facturation</span>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Adresse</label>
              <input
                type="text"
                defaultValue={profileData.adresse}
                placeholder="Ex : 12 Rue de la Santé"
                style={inputStyle}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 16,
              }}
            >
              <div style={fieldStyle}>
                <label style={labelStyle}>Code postal</label>
                <input
                  type="text"
                  defaultValue={profileData.codePostal}
                  style={inputStyle}
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Ville</label>
                <input
                  type="text"
                  defaultValue={profileData.ville}
                  style={inputStyle}
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Pays</label>
                <select style={inputStyle}>
                  <option>France</option>
                  <option>Belgique</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                Coordonnées bancaires (virement)
              </span>
            </div>
            <div
              style={{
                background: "#fff8e1",
                border: "1.5px solid #ffe082",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 13,
                color: "#795548",
                marginBottom: 16,
              }}
            >
              🔒 Ces informations sont chiffrées et utilisées uniquement pour
              les virements de revenus de formations.
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div style={fieldStyle}>
                <label style={labelStyle}>IBAN</label>
                <input
                  type="text"
                  defaultValue={profileData.iban}
                  placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                  style={inputStyle}
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>BIC / SWIFT</label>
                <input
                  type="text"
                  defaultValue={profileData.bic}
                  placeholder="BNPAFRPP"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* SÉCURITÉ */}
      {activeTab === "securite" && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title">Mot de passe</span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div style={fieldStyle}>
                <label style={labelStyle}>Mot de passe actuel</label>
                <input
                  type="password"
                  placeholder="••••••••••"
                  style={inputStyle}
                />
              </div>
              <div />
              <div style={fieldStyle}>
                <label style={labelStyle}>Nouveau mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••••"
                  style={inputStyle}
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Confirmer</label>
                <input
                  type="password"
                  placeholder="••••••••••"
                  style={inputStyle}
                />
              </div>
            </div>
            <button
              style={{
                background: "var(--red)",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                marginTop: 8,
              }}
            >
              Mettre à jour le mot de passe
            </button>
          </div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title">Notifications email</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                {
                  label: "Nouvelle inscription",
                  sub: "Recevez un email à chaque nouvelle inscription",
                  checked: true,
                },
                {
                  label: "Devis disponible",
                  sub: "Notification quand un devis de salle est prêt",
                  checked: true,
                },
                {
                  label: "Résumé hebdomadaire",
                  sub: "Récap de vos formations chaque lundi matin",
                  checked: false,
                },
              ].map((n, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    border: "1.5px solid #E0E0E0",
                    borderRadius: 9,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {n.label}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--gray)" }}>
                      {n.sub}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={n.checked}
                    style={{ width: 18, height: 18, accentColor: "var(--red)" }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ border: "1px solid #ffebee" }}>
            <div className="card-header">
              <span className="card-title" style={{ color: "#c62828" }}>
                Zone de danger
              </span>
            </div>
            <button
              style={{
                background: "#ffebee",
                color: "#c62828",
                border: "1.5px solid #ef9a9a",
                borderRadius: 8,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Désactiver mon compte
            </button>
          </div>
        </>
      )}

      {/* SAVE BAR */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "white",
          borderTop: "1px solid #E0E0E0",
          padding: "12px 28px",
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
        }}
      >
        <button
          style={{
            background: "white",
            border: "1.5px solid #E0E0E0",
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            color: "var(--gray)",
          }}
        >
          Annuler les modifications
        </button>
        <button
          onClick={saveProfile}
          style={{
            background: saved ? "#2e7d32" : "var(--red)",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {saved ? "✓ Enregistré !" : "✓ Enregistrer le profil"}
        </button>
      </div>
    </>
  );
}
