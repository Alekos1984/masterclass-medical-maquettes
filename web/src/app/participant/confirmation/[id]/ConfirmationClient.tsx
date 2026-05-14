"use client";

import { useState } from "react";
import Link from "next/link";

type ConfirmationData = {
  inscriptionId: string;
  formationTitre: string;
  formationDateLong: string;
  formationDateShort: string;
  heureDebut: string;
  heureFin: string;
  dureeHeures: number;
  lieuNom: string | null;
  lieuAdresse: string | null;
  lieuVille: string | null;
  lieuSalle: string | null;
  lieuFeatures: string[];
  formateurDisplay: string;
  formateurSpec: string;
  montantHT: number;
  conventionSignee: boolean;
  attestationUrl: string | null;
  factureUrl: string | null;
  numeroFacture: string | null;
  participantEmail: string;
  annulationDate: string;
  placesRestantes: number;
};

interface Props {
  data: ConfirmationData;
}

const stepColors: Record<string, { bg: string; color: string }> = {
  done: { bg: "#e8f5e9", color: "#2e7d32" },
  soon: { bg: "#fff3e0", color: "#e65100" },
  later: { bg: "var(--off-white)", color: "var(--gray)" },
};

const badgeColors: Record<string, { bg: string; color: string }> = {
  done: { bg: "#e8f5e9", color: "#2e7d32" },
  soon: { bg: "#fff3e0", color: "#e65100" },
  auto: { bg: "#e3f2fd", color: "#1565c0" },
};

export default function ConfirmationClient({ data }: Props) {
  const [calAdded, setCalAdded] = useState(false);

  const {
    formationTitre,
    formationDateLong,
    heureDebut,
    heureFin,
    dureeHeures,
    lieuNom,
    lieuAdresse,
    lieuVille,
    lieuSalle,
    lieuFeatures,
    formateurDisplay,
    formateurSpec,
    montantHT,
    conventionSignee,
    attestationUrl,
    factureUrl,
    numeroFacture,
    participantEmail,
    annulationDate,
    placesRestantes,
    inscriptionId,
  } = data;

  const lieuDisplayFull = [lieuNom, lieuAdresse, lieuVille]
    .filter(Boolean)
    .join(", ");
  const lieuDisplayShort = [lieuNom, lieuSalle ? `Salle ${lieuSalle}` : null]
    .filter(Boolean)
    .join(" · ");

  const steps = [
    {
      num: "✓",
      style: "done",
      title: "Inscription et paiement confirmés",
      sub: `Votre paiement de ${montantHT.toLocaleString("fr-FR")} € HT a été validé.${factureUrl ? " La facture PDF est disponible ci-dessous." : ""}`,
      badge: "✓ Maintenant",
      badgeClass: "done",
    },
    {
      num: "✓",
      style: "done",
      title: "Email de confirmation envoyé",
      sub: `Programme détaillé, adresse, plan d'accès et vos coordonnées de participant dans votre boîte mail.`,
      badge: "✓ Envoyé à l'instant",
      badgeClass: "done",
    },
    {
      num: conventionSignee ? "✓" : "3",
      style: conventionSignee ? "done" : "soon",
      title: "Convention de formation à signer",
      sub: conventionSignee
        ? "Convention signée."
        : "Vous allez recevoir dans quelques minutes un email YouSign pour signer électroniquement votre convention de formation (obligatoire).",
      badge: conventionSignee ? "✓ Signée" : "✓ Email YouSign en route",
      badgeClass: conventionSignee ? "done" : "done",
    },
    {
      num: "4",
      style: "soon",
      title: "Rappel J-7 automatique",
      sub: `Vous recevrez l'adresse exacte, le plan d'accès, les horaires précis et le programme final.`,
      badge: "J-7 automatique",
      badgeClass: "soon",
    },
    {
      num: "5",
      style: "soon",
      title: "Lien d'émargement le jour J",
      sub: `Le jour de la formation au matin, vous recevrez un lien unique et sécurisé pour confirmer votre présence.`,
      badge: data.formationDateShort,
      badgeClass: "soon",
    },
    {
      num: "6",
      style: "later",
      title: "Attestation de participation",
      sub: attestationUrl
        ? "Votre attestation de participation est disponible."
        : "Dans les 24h suivant la formation, votre attestation nominative PDF sera envoyée automatiquement.",
      badge: attestationUrl ? "✓ Disponible" : "⚡ Automatique · J+1",
      badgeClass: attestationUrl ? "done" : "auto",
    },
  ];

  const docs = [
    {
      icon: "📄",
      name: "Facture PDF",
      status: factureUrl
        ? `✓ Disponible${numeroFacture ? ` · ${numeroFacture}` : ""}`
        : "⏳ En cours de génération",
      ready: !!factureUrl,
      url: factureUrl,
    },
    {
      icon: "📋",
      name: "Programme officiel",
      status: "✓ Disponible",
      ready: true,
      url: null,
    },
    {
      icon: "📜",
      name: "Convention de formation",
      status: conventionSignee
        ? "✓ Signée"
        : "⏳ Signature YouSign en attente",
      ready: conventionSignee,
      url: null,
    },
    {
      icon: "🎓",
      name: "Attestation de participation",
      status: attestationUrl
        ? "✓ Disponible"
        : "⏳ Disponible après la formation",
      ready: !!attestationUrl,
      url: attestationUrl,
    },
  ];

  return (
    <>
      {/* SUCCESS HERO */}
      <div
        style={{
          background: "linear-gradient(135deg,#032b0a,#051a10)",
          padding: "56px 40px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            left: "50%",
            transform: "translateX(-50%)",
            width: 400,
            height: 400,
            background:
              "radial-gradient(circle,rgba(46,204,113,0.15) 0%,transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(46,204,113,0.15)",
            border: "2px solid rgba(46,204,113,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            margin: "0 auto 20px",
            position: "relative",
            zIndex: 1,
          }}
        >
          ✓
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#4caf50",
            marginBottom: 10,
            position: "relative",
            zIndex: 1,
          }}
        >
          Inscription confirmée
        </div>
        <h1
          style={{
            fontSize: "clamp(1.8rem,3.5vw,2.8rem)",
            fontWeight: 800,
            color: "white",
            lineHeight: 1.1,
            letterSpacing: -1,
            marginBottom: 8,
            position: "relative",
            zIndex: 1,
          }}
        >
          Votre place est{" "}
          <em
            style={{
              fontFamily: "Georgia, serif",
              fontWeight: 400,
              color: "#a5d6a7",
              fontStyle: "italic",
            }}
          >
            réservée !
          </em>
        </h1>
        {participantEmail && (
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.5)",
              position: "relative",
              zIndex: 1,
            }}
          >
            Un email de confirmation vous a été envoyé à{" "}
            <strong style={{ color: "rgba(255,255,255,0.7)" }}>
              {participantEmail}
            </strong>
          </p>
        )}
      </div>

      {/* CONTENT */}
      <div
        style={{ maxWidth: 860, margin: "0 auto", padding: "32px 40px 60px" }}
      >
        {/* CONFIRMATION CARD */}
        <div
          style={{
            background: "white",
            border: "1.5px solid #c8e6c9",
            borderRadius: 16,
            padding: "28px 32px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: "1px solid #EBEBEB",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#e8f5e9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              🎓
            </div>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#2e7d32",
                  letterSpacing: 0.5,
                }}
              >
                ✓ Réf. inscription : {inscriptionId.slice(0, 12).toUpperCase()} · Paiement confirmé
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: -0.3,
                  marginTop: 2,
                }}
              >
                {formationTitre}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  color: "var(--gray)",
                  marginBottom: 8,
                }}
              >
                Formation
              </div>
              {[
                {
                  icon: "📅",
                  val: formationDateLong,
                  sub: `${heureDebut} – ${heureFin}`,
                },
                lieuNom
                  ? {
                      icon: "📍",
                      val: lieuNom,
                      sub: [lieuAdresse, lieuVille].filter(Boolean).join(", "),
                    }
                  : lieuVille
                  ? {
                      icon: "📍",
                      val: lieuVille,
                      sub: lieuSalle ?? "",
                    }
                  : null,
                {
                  icon: "🕐",
                  val: `${dureeHeures} heures`,
                  sub: "",
                },
              ]
                .filter(Boolean)
                .map((r, i, arr) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      padding: "5px 0",
                      borderBottom:
                        i < arr.length - 1 ? "1px solid #EBEBEB" : "none",
                    }}
                  >
                    <span
                      style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}
                    >
                      {r!.icon}
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          lineHeight: 1.4,
                        }}
                      >
                        {r!.val}
                      </div>
                      {r!.sub && (
                        <div style={{ fontSize: 11, color: "var(--gray)" }}>
                          {r!.sub}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  color: "var(--gray)",
                  marginBottom: 8,
                }}
              >
                Formateur &amp; paiement
              </div>
              {[
                {
                  icon: "👨‍⚕️",
                  val: formateurDisplay,
                  sub: formateurSpec,
                },
                {
                  icon: "💳",
                  val: `${montantHT.toLocaleString("fr-FR")} € HT payés`,
                  sub: "Exonéré de TVA",
                },
                factureUrl
                  ? {
                      icon: "📄",
                      val: "Facture PDF disponible",
                      sub: numeroFacture ?? "",
                    }
                  : null,
                {
                  icon: "❌",
                  val: "Annulation remboursée jusqu'au",
                  sub: annulationDate + " (J-14)",
                },
              ]
                .filter(Boolean)
                .map((r, i, arr) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      padding: "5px 0",
                      borderBottom:
                        i < arr.length - 1 ? "1px solid #EBEBEB" : "none",
                    }}
                  >
                    <span
                      style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}
                    >
                      {r!.icon}
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          lineHeight: 1.4,
                        }}
                      >
                        {r!.val}
                      </div>
                      {r!.sub && (
                        <div style={{ fontSize: 11, color: "var(--gray)" }}>
                          {r!.sub}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* NEXT STEPS */}
        <div
          style={{
            background: "white",
            border: "1px solid #E0E0E0",
            borderRadius: 16,
            padding: "24px 28px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: -0.3,
              marginBottom: 20,
            }}
          >
            Ce qui se passe maintenant
          </div>
          {steps.map((s, i) => {
            const numStyle = stepColors[s.style];
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 16,
                  marginBottom: i < steps.length - 1 ? 16 : 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                      background: numStyle.bg,
                      color: numStyle.color,
                    }}
                  >
                    {s.num}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      style={{
                        width: 1.5,
                        background: "#EBEBEB",
                        flex: 1,
                        margin: "3px 0",
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1, paddingTop: 2 }}>
                  <div
                    style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}
                  >
                    {s.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--gray)",
                      lineHeight: 1.5,
                    }}
                  >
                    {s.sub}
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 100,
                      display: "inline-block",
                      marginTop: 4,
                      background: badgeColors[s.badgeClass].bg,
                      color: badgeColors[s.badgeClass].color,
                    }}
                  >
                    {s.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* DOCUMENTS */}
        <div
          style={{
            background: "white",
            border: "1px solid #E0E0E0",
            borderRadius: 16,
            padding: "24px 28px",
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>
            Vos documents
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            {docs.map((d, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  border: `1.5px solid ${d.ready ? "#c8e6c9" : "#E0E0E0"}`,
                  borderRadius: 10,
                  opacity: d.ready ? 1 : 0.6,
                }}
              >
                <div style={{ fontSize: 18, flexShrink: 0 }}>{d.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{d.name}</div>
                  <div
                    style={{
                      fontSize: 10,
                      marginTop: 2,
                      color: d.ready ? "#2e7d32" : "var(--gray)",
                    }}
                  >
                    {d.status}
                  </div>
                </div>
                {d.ready && d.url && (
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      marginLeft: "auto",
                      fontSize: 12,
                      color: "var(--red)",
                      cursor: "pointer",
                      fontWeight: 600,
                      flexShrink: 0,
                      textDecoration: "none",
                    }}
                  >
                    ↓
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* LIEU */}
        {(lieuNom || lieuVille) && (
          <div
            style={{
              background: "white",
              border: "1px solid #E0E0E0",
              borderRadius: 16,
              overflow: "hidden",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: "100%",
                height: 140,
                background: "linear-gradient(135deg,#e8eaf6,#c5cae9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#5c6bc0",
                fontSize: 13,
                fontWeight: 600,
                position: "relative",
              }}
            >
              📍 {lieuDisplayShort || lieuVille}
            </div>
            <div
              style={{
                padding: "18px 22px",
                display: "flex",
                gap: 20,
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    marginBottom: 3,
                  }}
                >
                  {lieuNom ?? lieuVille}
                </div>
                {lieuDisplayFull && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--gray)",
                      marginBottom: 8,
                    }}
                  >
                    {lieuDisplayFull}
                  </div>
                )}
                {lieuFeatures.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 5,
                    }}
                  >
                    {lieuFeatures.map((f, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: 11,
                          color: "var(--gray)",
                          background: "var(--off-white)",
                          border: "1px solid #EBEBEB",
                          borderRadius: 5,
                          padding: "2px 8px",
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div
                style={{
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <button
                  style={{
                    background: "var(--red)",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    padding: "9px 16px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                  }}
                >
                  🗺️ Itinéraire
                </button>
                <button
                  onClick={() => {
                    setCalAdded(true);
                    setTimeout(() => setCalAdded(false), 2000);
                  }}
                  style={{
                    background: calAdded ? "#e8f5e9" : "white",
                    color: calAdded ? "#2e7d32" : "var(--gray)",
                    border: `1.5px solid ${calAdded ? "#c8e6c9" : "#E0E0E0"}`,
                    borderRadius: 8,
                    padding: "8px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                  }}
                >
                  {calAdded ? "✓ Ajouté" : "📅 Ajouter au calendrier"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SHARE */}
        <div
          style={{
            background: "var(--off-white)",
            border: "1px solid #E0E0E0",
            borderRadius: 12,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 13 }}>
            Partagez cette formation avec vos confrères
            {placesRestantes > 0 ? (
              <>
                {" · "}
                <strong>{placesRestantes} place{placesRestantes > 1 ? "s" : ""} restante{placesRestantes > 1 ? "s" : ""}</strong>
              </>
            ) : null}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["LinkedIn", "Copier le lien", "Email"].map((b, i) => (
              <button
                key={i}
                style={{
                  border: "1.5px solid #E0E0E0",
                  background: "white",
                  borderRadius: 7,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: "var(--gray)",
                }}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* BOTTOM ACTIONS */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            href="/participant/dashboard"
            style={{
              background: "var(--black)",
              color: "white",
              border: "none",
              borderRadius: 10,
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            📋 Voir mon espace participant →
          </Link>
          <Link
            href="/formations"
            style={{
              background: "white",
              color: "var(--gray)",
              border: "1.5px solid #E0E0E0",
              borderRadius: 10,
              padding: "11px 22px",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            🔍 Trouver d&apos;autres formations
          </Link>
        </div>
      </div>
    </>
  );
}
