"use client";

import Link from "next/link";
import { use, useState } from "react";

type ProgramSlot = {
  time: string;
  title: string;
  desc?: string;
  type: string;
  typeCss: string;
};

type FormationDetail = {
  slug: string;
  specialty: string;
  date: string;
  dateShort: string;
  hours: string;
  placesLeft: number;
  placesMax: number;
  placesReserved: number;
  title: string;
  titleSerifPart: string;
  sub: string;
  duration: string;
  city: string;
  venue: string;
  venueRoom: string;
  venueAddress: string;
  level: string;
  price: number;
  formateurInitials: string;
  formateurName: string;
  formateurSpec: string;
  formateurRating: string;
  formateurBio: string;
  formateurStats: { val: string; label: string }[];
  coiText: string;
  programme: ProgramSlot[];
  objectifs: string[];
  biblio: string[];
  lieuFeatures: string[];
  transports: { icon: string; title: string; val: string; sub: string }[];
  infos: { icon: string; title: string; val: string; sub: string }[];
  docs: string[];
};

const DETAILS: Record<string, FormationDetail> = {
  "cardiologie-interventionnelle-techniques-avancees-2026": {
    slug: "cardiologie-interventionnelle-techniques-avancees-2026",
    specialty: "Cardiologie",
    date: "15 novembre 2026",
    dateShort: "15 nov. 2026",
    hours: "08h30–17h30",
    placesLeft: 3,
    placesMax: 15,
    placesReserved: 12,
    title: "Cardiologie interventionnelle",
    titleSerifPart: "Techniques avancées 2026",
    sub: "Une journée intensive pour maîtriser les techniques de coronarographie diagnostique et interventionnelle, animée par des experts de référence.",
    duration: "7 heures",
    city: "Lyon",
    venue: "Marriott Lyon Cité Internationale",
    venueRoom: "Salle Rhône",
    venueAddress: "70 Quai Charles de Gaulle, 69006 Lyon",
    level: "intermédiaire",
    price: 450,
    formateurInitials: "PD",
    formateurName: "Dr. Pierre Dumont",
    formateurSpec: "Cardiologue interventionnel · CHU de Lyon-Sud · Service de Cardiologie",
    formateurRating: "⭐ 4.9 · 12 formations · 18 ans d'expérience",
    formateurBio:
      "Cardiologue interventionnel au CHU de Lyon-Sud depuis 2008, le Dr. Dumont est spécialisé dans la prise en charge des syndromes coronariens aigus et des techniques de revascularisation complexes. Auteur de 34 publications internationales, il intervient régulièrement dans des congrès européens de cardiologie (EuroPCR, ESC Congress).",
    formateurStats: [
      { val: "12", label: "Formations" },
      { val: "4.9", label: "Note moyenne" },
      { val: "18", label: "Ans d'expérience" },
      { val: "34", label: "Publications" },
    ],
    coiText:
      "Le Dr. Pierre Dumont déclare avoir des liens d'intérêt avec les sociétés suivantes en rapport avec le contenu de cette formation : Medtronic (consultant, frais de congrès) · Abbott Vascular (honoraires de formation). Cette déclaration a été établie conformément aux recommandations du Conseil National de l'Ordre des Médecins.",
    objectifs: [
      "Maîtriser les indications et contre-indications de la coronarographie diagnostique et interventionnelle",
      "Interpréter les résultats angiographiques et adapter la stratégie de revascularisation au profil du patient",
      "Gérer les complications péri-procédurales et connaître les protocoles d'urgence associés",
      "Intégrer les dernières recommandations ESC/ACC dans votre pratique quotidienne",
    ],
    programme: [
      { time: "08h30 – 09h00", title: "Accueil & café", desc: "Émargement et distribution des supports de cours.", type: "Accueil", typeCss: "type-pause" },
      { time: "09h00 – 10h30", title: "Indications & contre-indications de la coronarographie", desc: "Présentation théorique : indications actuelles, stratification du risque, contre-indications absolues et relatives.", type: "Cours magistral", typeCss: "type-cours" },
      { time: "10h30 – 10h45", title: "Pause café", type: "Pause", typeCss: "type-pause" },
      { time: "10h45 – 12h30", title: "Interprétation angiographique — cas cliniques", desc: "Analyse de 8 cas cliniques : lecture des images, scoring SYNTAX, décision thérapeutique en groupe.", type: "Atelier pratique", typeCss: "type-atelier" },
      { time: "12h30 – 13h30", title: "Déjeuner (inclus)", type: "Pause", typeCss: "type-pause" },
      { time: "13h30 – 15h30", title: "Stratégies de revascularisation — table ronde", desc: "Discussion interactive : CABG vs PCI, lésions complexes, décision heart team.", type: "Table ronde", typeCss: "type-table" },
      { time: "15h30 – 17h00", title: "Gestion des complications péri-procédurales", desc: "Protocoles d'urgence, no-reflow, perforation coronaire, tamponnade — simulation sur cas.", type: "Cours + simulation", typeCss: "type-cours" },
      { time: "17h00 – 17h30", title: "Synthèse & évaluation", desc: "Récapitulatif des points clés, questions/réponses, remise des attestations.", type: "Clôture", typeCss: "type-cours" },
    ],
    biblio: [
      "Neumann FJ, et al. 2018 ESC/EACTS Guidelines on myocardial revascularization. Eur Heart J. 2019;40(2):87-165.",
      "Collet JP, et al. 2020 ESC Guidelines for the management of acute coronary syndromes. Eur Heart J. 2021;42(14):1289-1367.",
      "Lawton JS, et al. 2021 ACC/AHA/SCAI Guideline for Coronary Artery Revascularization. J Am Coll Cardiol. 2022;79(2):e21-e129.",
      "Mehran R, et al. Standardized Bleeding Definitions for Cardiovascular Clinical Trials. Circulation. 2011;123(23):2736-47.",
    ],
    lieuFeatures: ["🚗 Parking disponible", "🚇 T1 Cité Internationale", "📶 Wi-Fi haut débit", "🎤 Sono & micro", "📽️ Vidéoprojecteur", "🍽️ Restauration incluse"],
    transports: [
      { icon: "🚇", title: "Tramway", val: "T1 — Cité Internationale", sub: "Arrêt à 2 min à pied de l'hôtel" },
      { icon: "🚗", title: "Parking", val: "Parking Cité Internationale", sub: "Accès direct depuis l'hôtel" },
      { icon: "✈️", title: "Aéroport", val: "Lyon-Saint Exupéry", sub: "30 min en Rhônexpress" },
      { icon: "🚄", title: "Gare", val: "Lyon Part-Dieu", sub: "20 min en tramway T1" },
    ],
    infos: [
      { icon: "📄", title: "Attestation", val: "Envoyée sous 24h", sub: "PDF nominatif envoyé par email après la formation" },
      { icon: "💳", title: "Paiement", val: "Sécurisé en ligne", sub: "Carte bancaire via Stripe · Facture PDF immédiate" },
      { icon: "❌", title: "Annulation", val: "Remboursement J-14", sub: "Remboursement intégral si annulation 14 jours avant" },
      { icon: "🎯", title: "Public cible", val: "Médecins spécialistes", sub: "Niveau intermédiaire requis · RPPS recommandé" },
      { icon: "📋", title: "Convention", val: "Signature électronique", sub: "Convention de formation envoyée via YouSign" },
      { icon: "🍽️", title: "Restauration", val: "Incluse", sub: "Pause café matin + déjeuner pris en charge" },
    ],
    docs: [
      "Convention de formation",
      "Facture participant PDF",
      "Programme officiel PDF",
      "Attestation de participation",
      "Questionnaire de satisfaction",
    ],
  },
};

// Fallback for unknown slugs
function buildFallback(slug: string): FormationDetail {
  return {
    slug,
    specialty: "Médecine générale",
    date: "À venir",
    dateShort: "À venir",
    hours: "09h00–17h00",
    placesLeft: 5,
    placesMax: 15,
    placesReserved: 10,
    title: slug.replace(/-/g, " "),
    titleSerifPart: "Formation médicale",
    sub: "Une formation médicale de qualité animée par des experts de référence.",
    duration: "7 heures",
    city: "Paris",
    venue: "Hôtel de Ville",
    venueRoom: "Salle principale",
    venueAddress: "Paris, France",
    level: "intermédiaire",
    price: 400,
    formateurInitials: "DR",
    formateurName: "Dr. Expert",
    formateurSpec: "Spécialiste · CHU France",
    formateurRating: "⭐ 4.8 · 8 formations · 12 ans d'expérience",
    formateurBio: "Expert reconnu dans sa spécialité, intervenant régulier dans des congrès nationaux et internationaux.",
    formateurStats: [
      { val: "8", label: "Formations" },
      { val: "4.8", label: "Note moyenne" },
      { val: "12", label: "Ans d'expérience" },
      { val: "20", label: "Publications" },
    ],
    coiText: "Aucun lien d'intérêt déclaré en rapport avec le contenu de cette formation.",
    objectifs: [
      "Acquérir les connaissances théoriques essentielles de la spécialité",
      "Développer une approche clinique structurée et rigoureuse",
      "Appliquer les recommandations actuelles dans la pratique quotidienne",
      "Partager des cas cliniques avec des experts du domaine",
    ],
    programme: [
      { time: "09h00 – 09h30", title: "Accueil & café", type: "Accueil", typeCss: "type-pause" },
      { time: "09h30 – 12h30", title: "Module 1 — Fondamentaux", desc: "Présentation théorique et cas cliniques.", type: "Cours magistral", typeCss: "type-cours" },
      { time: "12h30 – 13h30", title: "Déjeuner (inclus)", type: "Pause", typeCss: "type-pause" },
      { time: "13h30 – 16h30", title: "Module 2 — Pratique avancée", desc: "Ateliers pratiques en petits groupes.", type: "Atelier pratique", typeCss: "type-atelier" },
      { time: "16h30 – 17h00", title: "Synthèse & évaluation", desc: "Questions/réponses, remise des attestations.", type: "Clôture", typeCss: "type-cours" },
    ],
    biblio: ["Références bibliographiques disponibles dans les supports de cours remis le jour de la formation."],
    lieuFeatures: ["📶 Wi-Fi haut débit", "🎤 Sono & micro", "📽️ Vidéoprojecteur", "🍽️ Restauration incluse"],
    transports: [
      { icon: "🚇", title: "Métro", val: "Ligne principale", sub: "Accès facile en transports en commun" },
      { icon: "🚗", title: "Parking", val: "Parking à proximité", sub: "Plusieurs parkings disponibles" },
    ],
    infos: [
      { icon: "📄", title: "Attestation", val: "Envoyée sous 24h", sub: "PDF nominatif envoyé par email après la formation" },
      { icon: "💳", title: "Paiement", val: "Sécurisé en ligne", sub: "Carte bancaire via Stripe · Facture PDF immédiate" },
      { icon: "❌", title: "Annulation", val: "Remboursement J-14", sub: "Remboursement intégral si annulation 14 jours avant" },
      { icon: "🎯", title: "Public cible", val: "Médecins spécialistes", sub: "RPPS recommandé" },
    ],
    docs: [
      "Convention de formation",
      "Facture participant PDF",
      "Programme officiel PDF",
      "Attestation de participation",
    ],
  };
}

type Tab = "programme" | "formateur" | "lieu" | "infos";

export default function FormationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const formation = DETAILS[slug] ?? buildFallback(slug);
  const [activeTab, setActiveTab] = useState<Tab>("programme");

  const fillPct = Math.round((formation.placesReserved / formation.placesMax) * 100);

  return (
    <>
      {/* NAV */}
      <nav style={{
        background: "#0F0F0F",
        padding: "0 40px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#C8102E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "white" }}>M</div>
          <span style={{ fontSize: "1rem", fontWeight: 800, color: "white" }}>Masterclass Médical</span>
        </Link>
        <Link href="/formations" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
          ← Catalogue des formations
        </Link>
      </nav>

      {/* HERO */}
      <div style={{
        background: "linear-gradient(135deg, #080810 0%, #1a0408 50%, #0a1018 100%)",
        padding: "48px 40px 0",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Grid overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(200,16,46,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(200,16,46,0.055) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />
        {/* Glow */}
        <div style={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 440,
          height: 440,
          background: "radial-gradient(circle, rgba(200,16,46,0.18) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "1fr 320px", gap: 40, alignItems: "start" }}>
          {/* Left */}
          <div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
              Formations → {formation.specialty}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              <span style={{ padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: "rgba(200,16,46,0.15)", border: "1px solid rgba(200,16,46,0.35)", color: "#ff8a96" }}>
                {formation.specialty}
              </span>
              <span style={{ padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.65)" }}>
                📅 {formation.date}
              </span>
              {formation.placesLeft <= 3 && (
                <span style={{ padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: "rgba(46,204,113,0.12)", border: "1px solid rgba(46,204,113,0.3)", color: "#7fe5a0" }}>
                  ● {formation.placesLeft} places restantes
                </span>
              )}
            </div>
            <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 800, color: "white", lineHeight: 1.1, letterSpacing: -1, marginBottom: 12 }}>
              {formation.title}<br />
              <span style={{ fontFamily: "var(--font-serif, 'Instrument Serif', serif)", fontStyle: "italic", fontWeight: 400, color: "#ff8a96" }}>
                {formation.titleSerifPart}
              </span>
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.48)", lineHeight: 1.7, marginBottom: 24, maxWidth: 500 }}>
              {formation.sub}
            </p>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
                🕐 <strong style={{ color: "white", fontWeight: 600 }}>{formation.duration}</strong> · Journée
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
                📍 <strong style={{ color: "white", fontWeight: 600 }}>{formation.city}</strong> · {formation.venue}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
                👥 <strong style={{ color: "white", fontWeight: 600 }}>{formation.placesMax} max</strong> · Format premium
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
                🎓 Niveau <strong style={{ color: "white", fontWeight: 600 }}>{formation.level}</strong>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #C8102E, #ff6b7a)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "white", flexShrink: 0 }}>
                {formation.formateurInitials}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{formation.formateurName}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{formation.formateurSpec}</div>
                <div style={{ fontSize: 11, color: "#ffd700", marginTop: 2 }}>{formation.formateurRating}</div>
              </div>
            </div>
          </div>

          {/* Hero Card */}
          <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#0F0F0F", letterSpacing: -1, marginBottom: 2 }}>
              {formation.price} € <span style={{ fontSize: 14, fontWeight: 400, color: "#6A6A6A", letterSpacing: 0 }}>HT / participant</span>
            </div>
            <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 14 }}>Exonéré de TVA (art. 261-4-4° CGI)</div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                <span style={{ color: "#6A6A6A" }}>Places réservées</span>
                <span style={{ fontWeight: 700, color: "#0F0F0F" }}>{formation.placesReserved} / {formation.placesMax}</span>
              </div>
              <div style={{ background: "#EBEBEB", borderRadius: 100, height: 5, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 100, background: "linear-gradient(90deg, #C8102E, #E8394A)", width: `${fillPct}%` }} />
              </div>
              {formation.placesLeft <= 5 && (
                <div style={{ fontSize: 11, color: "#C8102E", fontWeight: 600, marginTop: 4 }}>
                  ⚡ Plus que {formation.placesLeft} places disponibles
                </div>
              )}
            </div>
            <Link
              href="/auth/inscription/participant"
              style={{
                display: "block",
                width: "100%",
                background: "#C8102E",
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: 13,
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "inherit",
                marginBottom: 8,
                boxShadow: "0 4px 14px rgba(200,16,46,0.3)",
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              S&apos;inscrire maintenant →
            </Link>
            <button style={{
              width: "100%",
              background: "transparent",
              color: "#6A6A6A",
              border: "1.5px solid #E0E0E0",
              borderRadius: 10,
              padding: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}>
              Poser une question
            </button>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #EBEBEB" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6A6A6A", marginBottom: 6 }}>
                📅 <span><strong style={{ color: "#0F0F0F" }}>{formation.dateShort}</strong> · {formation.hours}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6A6A6A", marginBottom: 6 }}>
                📍 <span>{formation.city} · <strong style={{ color: "#0F0F0F" }}>{formation.venue}, {formation.venueRoom}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6A6A6A", marginBottom: 6 }}>
                🍽️ <span>Pause café + <strong style={{ color: "#0F0F0F" }}>déjeuner inclus</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6A6A6A" }}>
                📄 <span><strong style={{ color: "#0F0F0F" }}>Attestation</strong> envoyée sous 24h</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 10, paddingTop: 10, borderTop: "1px solid #EBEBEB", textAlign: "center" }}>
              🔒 Paiement sécurisé · Remboursement J-14
            </div>
          </div>
        </div>
      </div>

      {/* TABS BAR */}
      <div style={{ background: "white", borderBottom: "1px solid #E0E0E0", position: "sticky", top: 64, zIndex: 90 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px", display: "flex" }}>
          {(["programme", "formateur", "lieu", "infos"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "16px 20px",
                fontSize: 14,
                fontWeight: 600,
                color: activeTab === tab ? "#0F0F0F" : "#6A6A6A",
                cursor: "pointer",
                borderBottom: `3px solid ${activeTab === tab ? "#C8102E" : "transparent"}`,
                background: "none",
                border: "none",
                borderBottom: `3px solid ${activeTab === tab ? "#C8102E" : "transparent"}`,
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                userSelect: "none",
              } as React.CSSProperties}
            >
              {tab === "programme" ? "Programme" : tab === "formateur" ? "Formateur" : tab === "lieu" ? "Lieu" : "Infos pratiques"}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 40, paddingTop: 40, paddingBottom: 60 }}>
          <div>
            {/* PROGRAMME TAB */}
            {activeTab === "programme" && (
              <div>
                <div className="section-eyebrow">Contenu</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0F0F0F", letterSpacing: -0.3, marginBottom: 16 }}>Présentation & objectifs</div>
                <p style={{ fontSize: 14, color: "#6A6A6A", lineHeight: 1.75, marginBottom: 16 }}>
                  La cardiologie interventionnelle connaît des évolutions majeures dans la prise en charge des syndromes coronariens aigus et chroniques. Cette masterclass propose une mise à jour complète des pratiques de coronarographie diagnostique et interventionnelle.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
                  {formation.objectifs.map((obj, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 16px", background: "#F9F7F4", borderRadius: 12, borderLeft: "3px solid #C8102E" }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#C8102E", color: "white", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        {i + 1}
                      </div>
                      <div style={{ fontSize: 13, color: "#0F0F0F", lineHeight: 1.55, fontWeight: 500 }}>{obj}</div>
                    </div>
                  ))}
                </div>

                <div style={{ height: 1, background: "#EBEBEB", margin: "28px 0" }} />
                <div className="section-eyebrow">Déroulé</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0F0F0F", letterSpacing: -0.3, marginBottom: 16 }}>Programme de la journée</div>
                <div>
                  {formation.programme.map((slot, i) => (
                    <div key={i} style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: i < formation.programme.length - 1 ? "1px solid #EBEBEB" : "none" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#C8102E", minWidth: 100, flexShrink: 0, paddingTop: 2 }}>{slot.time}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0F0F0F", marginBottom: 3 }}>{slot.title}</div>
                        {slot.desc && <div style={{ fontSize: 13, color: "#6A6A6A", lineHeight: 1.5 }}>{slot.desc}</div>}
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 100,
                          marginTop: 5,
                          display: "inline-block",
                          ...(slot.typeCss === "type-cours" ? { background: "#e3f2fd", color: "#1565c0" } :
                            slot.typeCss === "type-atelier" ? { background: "#fce4ec", color: "#880e4f" } :
                            slot.typeCss === "type-pause" ? { background: "#f3e5f5", color: "#6a1b9a" } :
                            { background: "#e8f5e9", color: "#1b5e20" }),
                        }}>
                          {slot.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ height: 1, background: "#EBEBEB", margin: "28px 0" }} />
                <div className="section-eyebrow">Références</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0F0F0F", letterSpacing: -0.3, marginBottom: 16 }}>Bibliographie scientifique</div>
                <div>
                  {formation.biblio.map((ref, i) => (
                    <div key={i} style={{ fontSize: 13, color: "#6A6A6A", lineHeight: 1.5, padding: "10px 0 10px 14px", borderBottom: i < formation.biblio.length - 1 ? "1px solid #EBEBEB" : "none", position: "relative" }}>
                      <div style={{ position: "absolute", left: 0, top: 18, width: 5, height: 5, borderRadius: "50%", background: "#C8102E" }} />
                      {ref}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FORMATEUR TAB */}
            {activeTab === "formateur" && (
              <div>
                <div className="section-eyebrow">Votre formateur</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0F0F0F", letterSpacing: -0.3, marginBottom: 16 }}>Qui anime cette masterclass ?</div>
                <div style={{ background: "#F9F7F4", borderRadius: 16, padding: 24, marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #C8102E, #ff6b7a)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22, color: "white", flexShrink: 0 }}>
                      {formation.formateurInitials}
                    </div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: "#0F0F0F", marginBottom: 2 }}>{formation.formateurName}</div>
                      <div style={{ fontSize: 13, color: "#6A6A6A" }}>{formation.formateurSpec}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 20, marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #E0E0E0" }}>
                    {formation.formateurStats.map((stat) => (
                      <div key={stat.label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#0F0F0F" }}>{stat.val}</div>
                        <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 1 }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 13, color: "#6A6A6A", lineHeight: 1.65 }}>{formation.formateurBio}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <a href="#" style={{ fontSize: 12, fontWeight: 600, color: "#0F0F0F", border: "1px solid #E0E0E0", borderRadius: 8, padding: "5px 10px", textDecoration: "none" }}>🔗 LinkedIn</a>
                    <a href="#" style={{ fontSize: 12, fontWeight: 600, color: "#0F0F0F", border: "1px solid #E0E0E0", borderRadius: 8, padding: "5px 10px", textDecoration: "none" }}>🔬 ResearchGate</a>
                    <a href="#" style={{ fontSize: 12, fontWeight: 600, color: "#0F0F0F", border: "1px solid #E0E0E0", borderRadius: 8, padding: "5px 10px", textDecoration: "none" }}>📚 PubMed</a>
                  </div>
                </div>

                <div style={{ height: 1, background: "#EBEBEB", margin: "28px 0" }} />
                <div className="section-eyebrow">Transparence</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0F0F0F", letterSpacing: -0.3, marginBottom: 16 }}>Déclaration de conflits d&apos;intérêt</div>
                <div style={{ background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: 12, padding: "14px 18px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#795548", marginBottom: 6 }}>⚠️ Liens d&apos;intérêt déclarés</div>
                  <div style={{ fontSize: 13, color: "#795548", lineHeight: 1.6 }}>{formation.coiText}</div>
                </div>
              </div>
            )}

            {/* LIEU TAB */}
            {activeTab === "lieu" && (
              <div>
                <div className="section-eyebrow">Lieu de la formation</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0F0F0F", letterSpacing: -0.3, marginBottom: 16 }}>Où se déroule la masterclass ?</div>
                <div style={{ border: "1px solid #E0E0E0", borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
                  <div style={{ width: "100%", height: 160, background: "linear-gradient(135deg, #e8eaf6, #c5cae9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#5c6bc0", fontSize: 13, fontWeight: 600 }}>
                    📍 {formation.venue} · Vue carte interactive
                  </div>
                  <div style={{ padding: 18 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0F0F0F", marginBottom: 3 }}>{formation.venue}</div>
                    <div style={{ fontSize: 13, color: "#6A6A6A", marginBottom: 10 }}>{formation.venueAddress} · {formation.venueRoom}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {formation.lieuFeatures.map((f) => (
                        <span key={f} style={{ fontSize: 12, color: "#6A6A6A", background: "#F9F7F4", border: "1px solid #EBEBEB", borderRadius: 6, padding: "3px 9px" }}>{f}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, background: "#EBEBEB", margin: "28px 0" }} />
                <div className="section-eyebrow">Accès</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0F0F0F", letterSpacing: -0.3, marginBottom: 16 }}>Comment venir ?</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {formation.transports.map((t) => (
                    <div key={t.title} style={{ background: "#F9F7F4", borderRadius: 12, padding: 14 }}>
                      <div style={{ fontSize: 18, marginBottom: 6 }}>{t.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#6A6A6A", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>{t.title}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0F0F0F" }}>{t.val}</div>
                      <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 2, lineHeight: 1.4 }}>{t.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INFOS TAB */}
            {activeTab === "infos" && (
              <div>
                <div className="section-eyebrow">Tout ce qu&apos;il faut savoir</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0F0F0F", letterSpacing: -0.3, marginBottom: 16 }}>Informations pratiques</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {formation.infos.map((info) => (
                    <div key={info.title} style={{ background: "#F9F7F4", borderRadius: 12, padding: 14 }}>
                      <div style={{ fontSize: 18, marginBottom: 6 }}>{info.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#6A6A6A", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>{info.title}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0F0F0F" }}>{info.val}</div>
                      <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 2, lineHeight: 1.4 }}>{info.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div style={{ position: "sticky", top: 120 }}>
            <div style={{ background: "white", border: "1.5px solid #E0E0E0", borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#0F0F0F", letterSpacing: -1, marginBottom: 2 }}>
                {formation.price} € <span style={{ fontSize: 13, fontWeight: 400, color: "#6A6A6A", letterSpacing: 0 }}>HT</span>
              </div>
              <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 12 }}>Exonéré de TVA (art. 261-4-4° CGI)</div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: "#6A6A6A" }}>Places réservées</span>
                  <span style={{ fontWeight: 700, color: "#0F0F0F" }}>{formation.placesReserved} / {formation.placesMax}</span>
                </div>
                <div style={{ background: "#EBEBEB", borderRadius: 100, height: 5, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 100, background: "linear-gradient(90deg, #C8102E, #E8394A)", width: `${fillPct}%` }} />
                </div>
                {formation.placesLeft <= 5 && (
                  <div style={{ fontSize: 11, color: "#C8102E", fontWeight: 600, marginTop: 4 }}>
                    ⚡ Plus que {formation.placesLeft} places disponibles
                  </div>
                )}
              </div>
              <Link
                href="/auth/inscription/participant"
                style={{
                  display: "block",
                  width: "100%",
                  background: "#C8102E",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  padding: 13,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  marginBottom: 8,
                  boxShadow: "0 4px 14px rgba(200,16,46,0.3)",
                  textAlign: "center",
                  textDecoration: "none",
                }}
              >
                S&apos;inscrire maintenant →
              </Link>
              <button style={{ width: "100%", background: "transparent", color: "#6A6A6A", border: "1.5px solid #E0E0E0", borderRadius: 10, padding: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Poser une question
              </button>
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #EBEBEB" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6A6A6A", marginBottom: 6 }}>
                  📅 <span><strong style={{ color: "#0F0F0F" }}>{formation.dateShort}</strong> · {formation.hours}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6A6A6A", marginBottom: 6 }}>
                  📍 <span>{formation.city} · <strong style={{ color: "#0F0F0F" }}>{formation.venue}</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6A6A6A", marginBottom: 6 }}>
                  🍽️ <span>Pause café + <strong style={{ color: "#0F0F0F" }}>déjeuner inclus</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6A6A6A" }}>
                  📄 <span><strong style={{ color: "#0F0F0F" }}>Attestation</strong> envoyée sous 24h</span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 10, paddingTop: 10, borderTop: "1px solid #EBEBEB", textAlign: "center" }}>
                🔒 Paiement sécurisé · Remboursement J-14
              </div>
            </div>

            <div style={{ background: "#F9F7F4", borderRadius: 14, padding: 18, marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6A6A6A", marginBottom: 10 }}>Documents remis</div>
              {formation.docs.map((doc) => (
                <div key={doc} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#0F0F0F", marginBottom: 7 }}>
                  <span style={{ color: "#2e7d32", fontSize: 14 }}>✓</span> {doc}
                </div>
              ))}
            </div>

            <div style={{ background: "#F9F7F4", borderRadius: 14, padding: 16, marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6A6A6A", marginBottom: 8 }}>Partager cette formation</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {["LinkedIn", "Copier", "Email"].map((btn) => (
                  <button key={btn} style={{ flex: 1, padding: 8, borderRadius: 8, border: "1.5px solid #E0E0E0", background: "white", fontSize: 11, fontWeight: 600, color: "#6A6A6A", cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>
                    {btn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#0F0F0F", padding: "28px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: "#C8102E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white" }}>M</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>Masterclass Médical</span>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/formations" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Catalogue des formations</Link>
            <Link href="/auth/inscription/formateur" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Devenir formateur</Link>
            <a href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>CGU</a>
            <a href="mailto:contact@masterclassmedical.fr" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
}
