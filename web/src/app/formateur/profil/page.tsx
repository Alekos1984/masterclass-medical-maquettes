"use client";

import { useState } from "react";

type TabId = "identite" | "scientifique" | "legal" | "securite";

const tabs: { id: TabId; label: string }[] = [
  { id: "identite", label: "👤 Identité" },
  { id: "scientifique", label: "🔬 Scientifique" },
  { id: "legal", label: "⚖️ Informations légales" },
  { id: "securite", label: "🔒 Sécurité" },
];

const formations_acad = [
  { title: "Doctorat en médecine — Université Claude Bernard Lyon 1", sub: "1994 – 2001" },
  { title: "DESC Cardiologie et maladies vasculaires", sub: "2001 – 2007 · CHU Lyon" },
  { title: "Fellowship en Cardiologie Interventionnelle", sub: "2007 – 2008 · Hôpital Bichat, Paris" },
];

const experiences = [
  { title: "Praticien Hospitalier — CHU de Lyon-Sud", sub: "Depuis 2008 · Service de Cardiologie Interventionnelle" },
  { title: "Chef de Clinique — CHU de Lyon-Sud", sub: "2008 – 2012" },
];

const publications = [
  { title: "Long-term outcomes of primary PCI in elderly patients with STEMI", sub: "Eur Heart J. 2023 · DOI: 10.1093/eurheartj/ehad302" },
  { title: "Radial vs femoral access in complex coronary interventions", sub: "JACC Cardiovasc Interv. 2022 · DOI: 10.1016/j.jcin.2022.04.012" },
  { title: "OCT-guided stenting in left main disease", sub: "EuroIntervention. 2021 · DOI: 10.4244/EIJ-D-21-00032" },
];

export default function FormateurProfilPage() {
  const [activeTab, setActiveTab] = useState<TabId>("identite");
  const [saved, setSaved] = useState(false);

  function saveProfile() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 9,
    padding: "9px 12px", fontSize: 13, fontFamily: "inherit",
    color: "var(--black)", background: "white", outline: "none",
  };

  const fieldStyle: React.CSSProperties = { marginBottom: 16 };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5 };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Mon profil</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--gray)" }}>Profil public :</span>
          <a href="#" style={{ fontSize: 12, color: "var(--red)", fontWeight: 600, textDecoration: "none" }}>
            Voir mon profil public →
          </a>
        </div>
      </div>

      <div className="content" style={{ paddingBottom: 80 }}>

        {/* PROFILE HEADER */}
        <div style={{
          background: "white", border: "1px solid #E0E0E0", borderRadius: 16,
          padding: 24, marginBottom: 20, display: "flex", alignItems: "center", gap: 20,
        }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg,var(--red),#ff6b7a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 700, color: "white",
            }}>PD</div>
            <div style={{
              position: "absolute", bottom: 0, right: 0, width: 24, height: 24,
              borderRadius: "50%", background: "var(--red)", border: "2px solid white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, cursor: "pointer",
            }}>✏️</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 3 }}>Dr. Pierre Dumont</div>
            <div style={{ fontSize: 14, color: "var(--gray)", marginBottom: 8 }}>Cardiologue interventionnel · CHU de Lyon-Sud</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span className="pill pill-green">✓ Profil vérifié</span>
              <span style={{ fontSize: 11, color: "var(--gray)" }}>4 formations · Note 4.9/5</span>
            </div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "conic-gradient(var(--red) 0% 85%, #EBEBEB 85% 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 6px",
            }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>85%</div>
            </div>
            <div style={{ fontSize: 11, color: "var(--gray)" }}>Complétude</div>
            <div style={{ fontSize: 10, color: "var(--red)", marginTop: 2 }}>+ Publications</div>
          </div>
        </div>

        {/* TABS */}
        <div style={{
          background: "white", border: "1px solid #E0E0E0", borderRadius: 12,
          padding: 3, display: "flex", gap: 2, marginBottom: 20,
        }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                flex: 1, padding: "8px 10px", borderRadius: 9, fontSize: 12, fontWeight: 600,
                cursor: "pointer", textAlign: "center", border: "none", fontFamily: "inherit",
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
            <div className="card-header"><span className="card-title">Informations personnelles</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div style={fieldStyle}><label style={labelStyle}>Civilité</label><select style={inputStyle}><option>Dr.</option><option>Pr.</option></select></div>
              <div style={fieldStyle}><label style={labelStyle}>Prénom</label><input type="text" defaultValue="Pierre" style={inputStyle} /></div>
              <div style={fieldStyle}><label style={labelStyle}>Nom</label><input type="text" defaultValue="Dumont" style={inputStyle} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 0 }}>
              <div style={fieldStyle}><label style={labelStyle}>Email</label><input type="email" defaultValue="pierre.dumont@chu-lyon.fr" style={inputStyle} /></div>
              <div style={fieldStyle}><label style={labelStyle}>Téléphone <span style={{ color: "var(--gray)", fontWeight: 400, fontSize: 11 }}>(non public)</span></label><input type="text" defaultValue="06 12 34 56 78" style={inputStyle} /></div>
            </div>
            <div style={{ height: 1, background: "#EBEBEB", margin: "16px 0" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={fieldStyle}><label style={labelStyle}>Spécialité principale</label><select style={inputStyle}><option>Cardiologie</option><option>Neurologie</option></select></div>
              <div style={fieldStyle}><label style={labelStyle}>Sous-spécialité <span style={{ color: "var(--gray)", fontWeight: 400, fontSize: 11 }}>(optionnel)</span></label><input type="text" defaultValue="Cardiologie interventionnelle" style={inputStyle} /></div>
            </div>
            <div style={fieldStyle}><label style={labelStyle}>Établissement principal</label><input type="text" defaultValue="CHU de Lyon-Sud — Service de Cardiologie Interventionnelle" style={inputStyle} /></div>
            <div style={fieldStyle}><label style={labelStyle}>Années d&apos;expérience</label><input type="number" defaultValue={18} style={{ ...inputStyle, maxWidth: 120 }} /></div>
            <div style={fieldStyle}><label style={labelStyle}>Thématiques d&apos;expertise</label><input type="text" defaultValue="Coronarographie, Stenting, Revascularisation, Syndromes coronariens aigus" style={inputStyle} /></div>
            <div style={fieldStyle}><label style={labelStyle}>Biographie <span style={{ color: "var(--gray)", fontWeight: 400, fontSize: 11 }}>(visible sur vos landing pages)</span></label>
              <textarea defaultValue="Cardiologue interventionnel au CHU de Lyon-Sud depuis 2008, spécialisé dans la prise en charge des syndromes coronariens aigus et des techniques de revascularisation complexes." style={{ ...inputStyle, minHeight: 100, resize: "vertical", lineHeight: 1.6 }} />
            </div>
            <div style={{ height: 1, background: "#EBEBEB", margin: "16px 0" }} />
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Liens professionnels</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div style={fieldStyle}><label style={labelStyle}>LinkedIn</label><input type="url" defaultValue="linkedin.com/in/pierre-dumont-cardio" style={inputStyle} /></div>
              <div style={fieldStyle}><label style={labelStyle}>ResearchGate</label><input type="url" placeholder="researchgate.net/profile/…" style={inputStyle} /></div>
              <div style={fieldStyle}><label style={labelStyle}>PubMed</label><input type="url" placeholder="ncbi.nlm.nih.gov/…" style={inputStyle} /></div>
            </div>
          </div>
        )}

        {/* SCIENTIFIQUE */}
        {activeTab === "scientifique" && (
          <>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">
                <span className="card-title">Formations académiques</span>
                <button style={{ background: "white", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "var(--gray)", fontFamily: "inherit" }}>+ Ajouter</button>
              </div>
              {formations_acad.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", border: "1.5px solid #E0E0E0", borderRadius: 10, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: "var(--gray)", marginTop: 2 }}>{item.sub}</div>
                  </div>
                  <button style={{ background: "transparent", border: "none", color: "var(--gray)", cursor: "pointer", fontSize: 16 }}>×</button>
                </div>
              ))}
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">
                <span className="card-title">Expériences professionnelles</span>
                <button style={{ background: "white", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "var(--gray)", fontFamily: "inherit" }}>+ Ajouter</button>
              </div>
              {experiences.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", border: "1.5px solid #E0E0E0", borderRadius: 10, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: "var(--gray)", marginTop: 2 }}>{item.sub}</div>
                  </div>
                  <button style={{ background: "transparent", border: "none", color: "var(--gray)", cursor: "pointer", fontSize: 16 }}>×</button>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">Publications <span style={{ fontWeight: 400, fontSize: 11, color: "var(--gray)" }}>(34 référencées)</span></span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={{ background: "white", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "var(--gray)", fontFamily: "inherit" }}>Import PubMed</button>
                  <button style={{ background: "white", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "var(--gray)", fontFamily: "inherit" }}>+ Ajouter</button>
                </div>
              </div>
              {publications.map((pub, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", border: "1.5px solid #E0E0E0", borderRadius: 10, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{pub.title}</div>
                    <div style={{ fontSize: 12, color: "var(--gray)", marginTop: 2 }}>{pub.sub}</div>
                  </div>
                  <button style={{ background: "transparent", border: "none", color: "var(--gray)", cursor: "pointer", fontSize: 16 }}>×</button>
                </div>
              ))}
              <button style={{
                display: "flex", alignItems: "center", gap: 7, background: "transparent",
                border: "1.5px dashed #E0E0E0", borderRadius: 9, padding: "9px 14px",
                fontSize: 12, fontWeight: 600, color: "var(--gray)", cursor: "pointer",
                width: "100%", fontFamily: "inherit", marginTop: 8,
              }}>
                + Ajouter une publication
              </button>
            </div>
          </>
        )}

        {/* LÉGAL */}
        {activeTab === "legal" && (
          <>
            <div style={{ background: "#e3f2fd", border: "1.5px solid #90caf9", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#1565c0", marginBottom: 16 }}>
              ℹ️ Ces informations sont utilisées pour la facturation, le calcul de TVA et la génération de documents officiels. Elles ne sont pas affichées publiquement.
            </div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><span className="card-title">Statut juridique & facturation</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={fieldStyle}><label style={labelStyle}>Statut juridique</label>
                  <select style={inputStyle}><option>Médecin libéral</option><option>Auto-entrepreneur</option><option>SASU</option></select>
                </div>
                <div style={fieldStyle}><label style={labelStyle}>Raison sociale <span style={{ color: "var(--gray)", fontWeight: 400, fontSize: 11 }}>(si société)</span></label><input type="text" placeholder="Ex : Cabinet du Dr. Dumont SAS" style={inputStyle} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={fieldStyle}><label style={labelStyle}>SIRET</label><input type="text" defaultValue="12345678901234" style={inputStyle} /></div>
                <div style={fieldStyle}><label style={labelStyle}>Numéro de déclaration d&apos;activité</label><input type="text" placeholder="11 chiffres — Préfecture" style={inputStyle} /></div>
              </div>
              <div style={fieldStyle}><label style={labelStyle}>TVA intracommunautaire <span style={{ color: "var(--gray)", fontWeight: 400, fontSize: 11 }}>(si applicable)</span></label><input type="text" placeholder="FR00000000000" style={inputStyle} /></div>
              <div style={{ height: 1, background: "#EBEBEB", margin: "16px 0" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", border: "1.5px solid #E0E0E0", borderRadius: 9 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Exonération de TVA</div>
                  <div style={{ fontSize: 12, color: "var(--gray)", marginTop: 2 }}>Article 261-4-4° du CGI — Formations professionnelles continues</div>
                </div>
                <div style={{ position: "relative", width: 42, height: 24, flexShrink: 0 }}>
                  <div style={{ position: "absolute", inset: 0, background: "var(--red)", borderRadius: 100 }} />
                  <div style={{ position: "absolute", width: 18, height: 18, left: 21, top: 3, background: "white", borderRadius: "50%" }} />
                </div>
              </div>
            </div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><span className="card-title">Adresse de facturation</span></div>
              <div style={fieldStyle}><label style={labelStyle}>Adresse</label><input type="text" defaultValue="12 Rue de la Cardiologue" style={inputStyle} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div style={fieldStyle}><label style={labelStyle}>Code postal</label><input type="text" defaultValue="69005" style={inputStyle} /></div>
                <div style={fieldStyle}><label style={labelStyle}>Ville</label><input type="text" defaultValue="Lyon" style={inputStyle} /></div>
                <div style={fieldStyle}><label style={labelStyle}>Pays</label><select style={inputStyle}><option>France</option><option>Belgique</option></select></div>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">Coordonnées bancaires (virement)</span></div>
              <div style={{ background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#795548", marginBottom: 16 }}>
                🔒 Ces informations sont chiffrées et utilisées uniquement pour les virements de revenus de formations.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={fieldStyle}><label style={labelStyle}>IBAN</label><input type="text" placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX" style={inputStyle} /></div>
                <div style={fieldStyle}><label style={labelStyle}>BIC / SWIFT</label><input type="text" placeholder="BNPAFRPP" style={inputStyle} /></div>
              </div>
              <div style={fieldStyle}><label style={labelStyle}>Titulaire du compte</label><input type="text" defaultValue="Dr. Pierre Dumont" style={inputStyle} /></div>
            </div>
          </>
        )}

        {/* SÉCURITÉ */}
        {activeTab === "securite" && (
          <>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><span className="card-title">Mot de passe</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={fieldStyle}><label style={labelStyle}>Mot de passe actuel</label><input type="password" placeholder="••••••••••" style={inputStyle} /></div>
                <div />
                <div style={fieldStyle}><label style={labelStyle}>Nouveau mot de passe</label><input type="password" placeholder="••••••••••" style={inputStyle} /></div>
                <div style={fieldStyle}><label style={labelStyle}>Confirmer</label><input type="password" placeholder="••••••••••" style={inputStyle} /></div>
              </div>
              <button style={{ background: "var(--red)", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 8 }}>
                Mettre à jour le mot de passe
              </button>
            </div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><span className="card-title">Notifications email</span></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Nouvelle inscription", sub: "Recevez un email à chaque nouvelle inscription", checked: true },
                  { label: "Devis disponible", sub: "Notification quand un devis de salle est prêt", checked: true },
                  { label: "Résumé hebdomadaire", sub: "Récap de vos formations chaque lundi matin", checked: false },
                ].map((n, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", border: "1.5px solid #E0E0E0", borderRadius: 9 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{n.label}</div>
                      <div style={{ fontSize: 12, color: "var(--gray)" }}>{n.sub}</div>
                    </div>
                    <input type="checkbox" defaultChecked={n.checked} style={{ width: 18, height: 18, accentColor: "var(--red)" }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ border: "1px solid #ffebee" }}>
              <div className="card-header"><span className="card-title" style={{ color: "#c62828" }}>Zone de danger</span></div>
              <button style={{ background: "#ffebee", color: "#c62828", border: "1.5px solid #ef9a9a", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Désactiver mon compte
              </button>
            </div>
          </>
        )}
      </div>

      {/* SAVE BAR */}
      <div style={{
        position: "sticky", bottom: 0, background: "white", borderTop: "1px solid #E0E0E0",
        padding: "12px 28px", display: "flex", justifyContent: "flex-end", gap: 10,
      }}>
        <button style={{ background: "white", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "var(--gray)" }}>
          Annuler les modifications
        </button>
        <button
          onClick={saveProfile}
          style={{
            background: saved ? "#2e7d32" : "var(--red)", color: "white", border: "none",
            borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {saved ? "✓ Enregistré !" : "✓ Enregistrer le profil"}
        </button>
      </div>
    </>
  );
}
