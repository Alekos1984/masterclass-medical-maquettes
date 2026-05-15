import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader } from "../shared/Header";
import { base, RED, GRAY, LIGHT_GRAY, OFF_WHITE, BLACK } from "../shared/styles";
import type { CompanyData, FormateurData, FormationData } from "../shared/types";

const s = StyleSheet.create({
  infoGrid: { flexDirection: "row", gap: 12, marginBottom: 20 },
  infoCard: {
    flex: 1,
    backgroundColor: OFF_WHITE,
    borderRadius: 6,
    padding: 12,
  },
  infoCardLabel: { fontSize: 7, color: GRAY, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  infoCardValue: { fontSize: 11, fontFamily: "Helvetica-Bold", color: BLACK },
  infoCardSub: { fontSize: 8, color: GRAY, marginTop: 2 },
  objectifRow: { flexDirection: "row", marginBottom: 6, gap: 8 },
  objectifBullet: {
    width: 18,
    height: 18,
    backgroundColor: "#fff0f2",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  objectifBulletText: { fontSize: 7, color: RED, fontFamily: "Helvetica-Bold" },
  objectifText: { fontSize: 9, color: BLACK, lineHeight: 1.5, flex: 1 },
  progItem: {
    flexDirection: "row",
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
  },
  progHeure: {
    width: 60,
    paddingVertical: 8,
    paddingRight: 12,
    fontSize: 8,
    color: GRAY,
    flexShrink: 0,
  },
  progContent: { flex: 1, paddingVertical: 8, paddingLeft: 12, borderLeftWidth: 2 },
  progTitre: { fontSize: 9, fontFamily: "Helvetica-Bold", color: BLACK },
  progDesc: { fontSize: 8, color: GRAY, marginTop: 2, lineHeight: 1.4 },
  typeColors: {
    cours: RED,
    atelier: "#2563eb",
    pause: LIGHT_GRAY,
    evaluation: "#7c3aed",
    autre: GRAY,
  } as Record<string, string>,
  legalBox: {
    backgroundColor: OFF_WHITE,
    borderRadius: 6,
    padding: 12,
    marginTop: 16,
  },
  legalText: { fontSize: 8, color: GRAY, lineHeight: 1.6 },
});

interface Props {
  company: CompanyData;
  formateur: FormateurData;
  formation: FormationData;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const NIVEAU_LABELS: Record<string, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  expert: "Expert",
};

export function ProgrammePdf({ company, formateur, formation }: Props) {
  return (
    <Document
      title={`Programme — ${formation.titre}`}
      author={company.raisonSociale}
      subject="Programme de formation professionnelle"
    >
      <Page size="A4" style={base.page}>
        <PdfHeader company={company} docLabel="PROGRAMME DE FORMATION" />

        {/* Title */}
        <Text style={base.docTitle}>{formation.titre}</Text>
        <Text style={base.docSubtitle}>{formation.specialite}</Text>

        {/* Key info cards */}
        <View style={s.infoGrid}>
          <View style={s.infoCard}>
            <Text style={s.infoCardLabel}>Date</Text>
            <Text style={s.infoCardValue}>{formatDate(formation.date)}</Text>
            <Text style={s.infoCardSub}>{formation.heureDebut} – {formation.heureFin}</Text>
          </View>
          <View style={s.infoCard}>
            <Text style={s.infoCardLabel}>Durée</Text>
            <Text style={s.infoCardValue}>{formation.dureeHeures}h</Text>
            <Text style={s.infoCardSub}>Niveau {NIVEAU_LABELS[formation.niveau] ?? formation.niveau}</Text>
          </View>
          <View style={s.infoCard}>
            <Text style={s.infoCardLabel}>Lieu</Text>
            <Text style={s.infoCardValue}>{formation.lieuNom ?? "À confirmer"}</Text>
            <Text style={s.infoCardSub}>{formation.lieuVille ?? ""}</Text>
          </View>
          <View style={s.infoCard}>
            <Text style={s.infoCardLabel}>Places</Text>
            <Text style={s.infoCardValue}>{formation.placesTotal}</Text>
            <Text style={s.infoCardSub}>participants max.</Text>
          </View>
        </View>

        {/* Formateur */}
        <Text style={base.sectionTitle}>Intervenant</Text>
        <View style={[base.infoRow]}>
          <Text style={base.infoLabel}>Nom</Text>
          <Text style={base.infoValue}>{formateur.titre ? `${formateur.titre} ` : ""}{formateur.nom}</Text>
        </View>
        {formateur.specialite && (
          <View style={base.infoRow}>
            <Text style={base.infoLabel}>Spécialité</Text>
            <Text style={base.infoValue}>{formateur.specialite}</Text>
          </View>
        )}
        {formateur.rpps && (
          <View style={base.infoRow}>
            <Text style={base.infoLabel}>N° RPPS</Text>
            <Text style={base.infoValue}>{formateur.rpps}</Text>
          </View>
        )}

        {/* Description */}
        <Text style={base.sectionTitle}>Présentation</Text>
        <Text style={{ fontSize: 9, color: BLACK, lineHeight: 1.65 }}>{formation.description}</Text>

        {/* Objectifs */}
        <Text style={base.sectionTitle}>Objectifs pédagogiques</Text>
        {formation.objectifs.map((obj, i) => (
          <View key={i} style={s.objectifRow}>
            <View style={s.objectifBullet}>
              <Text style={s.objectifBulletText}>{i + 1}</Text>
            </View>
            <Text style={s.objectifText}>{obj}</Text>
          </View>
        ))}

        {/* Public & Prérequis */}
        <Text style={base.sectionTitle}>Public visé et prérequis</Text>
        <View style={base.infoRow}>
          <Text style={base.infoLabel}>Public visé</Text>
          <Text style={base.infoValue}>Professionnels de santé</Text>
        </View>
        <View style={base.infoRow}>
          <Text style={base.infoLabel}>Prérequis</Text>
          <Text style={base.infoValue}>Exercice d'une profession de santé</Text>
        </View>

        {/* Programme */}
        <Text style={base.sectionTitle}>Programme détaillé</Text>
        {formation.programme.map((item, i) => {
          const color = s.typeColors[item.type] ?? GRAY;
          return (
            <View key={i} style={s.progItem} wrap={false}>
              <Text style={s.progHeure}>{item.heure}</Text>
              <View style={[s.progContent, { borderLeftColor: color }]}>
                <Text style={s.progTitre}>{item.titre}</Text>
                {item.description && <Text style={s.progDesc}>{item.description}</Text>}
              </View>
            </View>
          );
        })}

        {/* Méthodes pédagogiques */}
        <Text style={base.sectionTitle}>Méthodes pédagogiques</Text>
        <Text style={{ fontSize: 9, color: BLACK, lineHeight: 1.65 }}>
          Exposés magistraux, études de cas cliniques, ateliers pratiques, discussions interactives entre pairs.
          Supports projetés et remis aux participants. Évaluation continue par quiz et cas cliniques.
        </Text>

        {/* Tarif */}
        <Text style={base.sectionTitle}>Tarification</Text>
        <View style={base.infoRow}>
          <Text style={base.infoLabel}>Tarif</Text>
          <Text style={base.infoValue}>{formation.prixHT.toFixed(2)} €{formation.exonerationTVA ? " HT" : " HT + TVA"}</Text>
        </View>
        {formation.exonerationTVA && (
          <View style={base.infoRow}>
            <Text style={base.infoLabel}>TVA</Text>
            <Text style={base.infoValue}>Exonérée — Art. 261-4-4° du CGI</Text>
          </View>
        )}

        {/* Mentions légales */}
        <View style={s.legalBox}>
          <Text style={s.legalText}>
            Formation réalisée par {company.raisonSociale}
            {company.siret ? `, SIRET ${company.siret}` : ""}
            {company.numeroDeclaration ? `, N° déclaration d'activité ${company.numeroDeclaration}` : ""}.
            {"\n"}Cette formation est éligible à la prise en charge par les OPCO dans le cadre du plan de développement des compétences.
          </Text>
        </View>

        {/* Footer */}
        <View style={base.footer} fixed>
          <Text style={base.footerText}>
            {company.raisonSociale}{company.siret ? ` — SIRET ${company.siret}` : ""}
          </Text>
          <Text style={base.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
        </View>
      </Page>
    </Document>
  );
}
