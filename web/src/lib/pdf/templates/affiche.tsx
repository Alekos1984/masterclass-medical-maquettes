import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { RED, BLACK, GRAY, OFF_WHITE, WHITE, LIGHT_GRAY } from "../shared/styles";
import type { CompanyData, FormateurData, FormationData } from "../shared/types";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: BLACK,
    backgroundColor: WHITE,
  },
  // Top red band
  topBand: {
    backgroundColor: RED,
    paddingTop: 48,
    paddingBottom: 40,
    paddingHorizontal: 48,
  },
  specialty: {
    fontSize: 9,
    color: "rgba(255,255,255,0.65)",
    textTransform: "uppercase",
    letterSpacing: 2.5,
    marginBottom: 12,
    fontFamily: "Helvetica-Bold",
  },
  mainTitle: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
    lineHeight: 1.15,
    letterSpacing: -1,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.5,
  },
  // Content area
  content: {
    padding: 48,
    flex: 1,
  },
  // Info grid
  infoGrid: {
    flexDirection: "row",
    gap: 0,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    borderRadius: 8,
    overflow: "hidden",
  },
  infoItem: {
    flex: 1,
    padding: 20,
    borderRightWidth: 1,
    borderRightColor: LIGHT_GRAY,
    alignItems: "center",
  },
  infoItemLast: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  infoIcon: { fontSize: 20, marginBottom: 6 },
  infoLabel: { fontSize: 8, color: GRAY, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  infoValue: { fontSize: 12, fontFamily: "Helvetica-Bold", color: BLACK, textAlign: "center" },
  infoSub: { fontSize: 9, color: GRAY, textAlign: "center", marginTop: 2 },
  // Formateur card
  formateurCard: {
    backgroundColor: OFF_WHITE,
    borderRadius: 10,
    padding: 24,
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
    marginBottom: 28,
  },
  formateurAvatar: {
    width: 56,
    height: 56,
    borderRadius: 100,
    backgroundColor: RED,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  formateurInitials: { fontSize: 18, fontFamily: "Helvetica-Bold", color: WHITE },
  formateurName: { fontSize: 15, fontFamily: "Helvetica-Bold", color: BLACK },
  formateurRole: { fontSize: 10, color: GRAY, marginTop: 2 },
  // Objectifs
  objectifRow: { flexDirection: "row", gap: 10, marginBottom: 8, alignItems: "flex-start" },
  objectifDot: {
    width: 6,
    height: 6,
    borderRadius: 100,
    backgroundColor: RED,
    marginTop: 3,
    flexShrink: 0,
  },
  objectifText: { fontSize: 10, color: BLACK, flex: 1, lineHeight: 1.5 },
  // CTA bottom
  ctaRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: LIGHT_GRAY,
  },
  priceTag: {
    backgroundColor: RED,
    borderRadius: 8,
    padding: "14 24",
    alignItems: "center",
  },
  priceValue: { fontSize: 20, fontFamily: "Helvetica-Bold", color: WHITE },
  priceLabel: { fontSize: 8, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: 1 },
  registrationBox: {
    flex: 1,
    borderWidth: 2,
    borderColor: BLACK,
    borderRadius: 8,
    padding: "14 20",
  },
  registrationTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: BLACK, marginBottom: 2 },
  registrationUrl: { fontSize: 9, color: GRAY },
  // Footer
  pageFooter: {
    backgroundColor: BLACK,
    paddingVertical: 14,
    paddingHorizontal: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerOrg: { fontSize: 9, color: "rgba(255,255,255,0.6)" },
  footerDecl: { fontSize: 8, color: "rgba(255,255,255,0.35)" },
});

interface Props {
  company: CompanyData;
  formateur: FormateurData;
  formation: FormationData;
  marketingText?: { headline?: string; accroche?: string };
  registrationUrl?: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const NIVEAU_LABELS: Record<string, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  expert: "Expert",
};

export function AffichePdf({ company, formateur, formation, marketingText, registrationUrl }: Props) {
  const headline = marketingText?.headline ?? formation.titre;
  const accroche = marketingText?.accroche ?? formation.description.slice(0, 200) + (formation.description.length > 200 ? "…" : "");

  return (
    <Document title={`Affiche — ${formation.titre}`} author={company.raisonSociale}>
      <Page size="A4" style={s.page}>
        {/* Top red band */}
        <View style={s.topBand}>
          <Text style={s.specialty}>{formation.specialite} · {NIVEAU_LABELS[formation.niveau] ?? formation.niveau}</Text>
          <Text style={s.mainTitle}>{headline}</Text>
          <Text style={s.tagline}>{accroche}</Text>
        </View>

        <View style={s.content}>
          {/* Key info grid */}
          <View style={s.infoGrid}>
            <View style={s.infoItem}>
              <Text style={s.infoIcon}>📅</Text>
              <Text style={s.infoLabel}>Date</Text>
              <Text style={s.infoValue}>
                {new Date(formation.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
              </Text>
              <Text style={s.infoSub}>{new Date(formation.date).getFullYear()}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoIcon}>🕐</Text>
              <Text style={s.infoLabel}>Horaires</Text>
              <Text style={s.infoValue}>{formation.heureDebut}</Text>
              <Text style={s.infoSub}>à {formation.heureFin} ({formation.dureeHeures}h)</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoIcon}>📍</Text>
              <Text style={s.infoLabel}>Lieu</Text>
              <Text style={s.infoValue}>{formation.lieuNom ?? "À définir"}</Text>
              <Text style={s.infoSub}>{formation.lieuVille ?? ""}</Text>
            </View>
            <View style={s.infoItemLast}>
              <Text style={s.infoIcon}>👥</Text>
              <Text style={s.infoLabel}>Places</Text>
              <Text style={s.infoValue}>{formation.placesRestantes}</Text>
              <Text style={s.infoSub}>disponibles sur {formation.placesTotal}</Text>
            </View>
          </View>

          {/* Formateur */}
          <View style={s.formateurCard}>
            <View style={s.formateurAvatar}>
              <Text style={s.formateurInitials}>{initials(formateur.nom)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 8, color: GRAY, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                Intervenant
              </Text>
              <Text style={s.formateurName}>{formateur.titre ? `${formateur.titre} ` : ""}{formateur.nom}</Text>
              <Text style={s.formateurRole}>{formateur.specialite ?? ""}{formateur.rpps ? ` — RPPS ${formateur.rpps}` : ""}</Text>
            </View>
          </View>

          {/* Objectifs */}
          <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: GRAY, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>
            Ce que vous allez apprendre
          </Text>
          {formation.objectifs.slice(0, 4).map((obj, i) => (
            <View key={i} style={s.objectifRow}>
              <View style={s.objectifDot} />
              <Text style={s.objectifText}>{obj}</Text>
            </View>
          ))}

          {/* CTA */}
          <View style={s.ctaRow}>
            <View style={s.priceTag}>
              <Text style={s.priceValue}>{formation.prixHT.toFixed(0)} €</Text>
              <Text style={s.priceLabel}>HT par personne</Text>
              {formation.exonerationTVA && (
                <Text style={{ fontSize: 7, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>TVA exonérée</Text>
              )}
            </View>
            <View style={s.registrationBox}>
              <Text style={s.registrationTitle}>Inscription en ligne</Text>
              <Text style={s.registrationUrl}>
                {registrationUrl ?? `masterclassmedical.fr/formations/${formation.id}`}
              </Text>
              <Text style={{ fontSize: 8, color: GRAY, marginTop: 4 }}>
                Paiement sécurisé · Places limitées
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={s.pageFooter}>
          <Text style={s.footerOrg}>{company.raisonSociale}</Text>
          {company.numeroDeclaration && (
            <Text style={s.footerDecl}>N° déclaration activité : {company.numeroDeclaration}</Text>
          )}
          {company.siteWeb && <Text style={s.footerDecl}>{company.siteWeb}</Text>}
        </View>
      </Page>
    </Document>
  );
}
