import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader } from "../shared/Header";
import { base, GRAY, LIGHT_GRAY, OFF_WHITE, BLACK, RED } from "../shared/styles";
import type { CompanyData, FormateurData, FormationData, ParticipantData, InscriptionData } from "../shared/types";

const s = StyleSheet.create({
  partiesGrid: { flexDirection: "row", gap: 12, marginBottom: 12 },
  partieCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    borderRadius: 6,
    padding: 12,
  },
  partieCardTitle: { fontSize: 8, color: RED, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  articleTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: BLACK, marginTop: 16, marginBottom: 6 },
  articleText: { fontSize: 9, color: BLACK, lineHeight: 1.65 },
  signatureGrid: { flexDirection: "row", gap: 20, marginTop: 32 },
  signatureBlock: { flex: 1 },
  signatureBoxBig: {
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    borderRadius: 6,
    padding: 12,
    height: 100,
    justifyContent: "flex-end",
    marginBottom: 6,
  },
  refBox: {
    backgroundColor: OFF_WHITE,
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  refLabel: { fontSize: 8, color: GRAY },
  refValue: { fontSize: 8, color: BLACK, fontFamily: "Helvetica-Bold" },
});

interface Props {
  company: CompanyData;
  formateur: FormateurData;
  formation: FormationData;
  participant: ParticipantData;
  inscription: InscriptionData;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function ConventionPdf({ company, formateur, formation, participant, inscription }: Props) {
  const refNum = `CONV-${inscription.id.slice(0, 8).toUpperCase()}`;

  return (
    <Document title={`Convention — ${formation.titre}`} author={company.raisonSociale}>
      <Page size="A4" style={base.page}>
        <PdfHeader company={company} docLabel="CONVENTION DE FORMATION PROFESSIONNELLE" />

        <Text style={base.docTitle}>Convention individuelle de formation</Text>
        <Text style={base.docSubtitle}>
          Établie conformément à la loi n° 2018-771 du 5 septembre 2018 pour la liberté de choisir son avenir professionnel
        </Text>

        {/* Référence */}
        <View style={s.refBox}>
          <Text style={s.refLabel}>Référence convention</Text>
          <Text style={s.refValue}>{refNum}</Text>
          <Text style={s.refLabel}>Date d'émission</Text>
          <Text style={s.refValue}>{formatDate(new Date().toISOString())}</Text>
        </View>

        {/* Parties */}
        <Text style={base.sectionTitle}>Entre les parties</Text>
        <View style={s.partiesGrid}>
          <View style={s.partieCard}>
            <Text style={s.partieCardTitle}>L'organisme de formation</Text>
            <View style={base.infoRow}>
              <Text style={base.infoLabel}>Raison sociale</Text>
              <Text style={base.infoValue}>{company.raisonSociale}</Text>
            </View>
            {company.siret && (
              <View style={base.infoRow}>
                <Text style={base.infoLabel}>SIRET</Text>
                <Text style={base.infoValue}>{company.siret}</Text>
              </View>
            )}
            {company.numeroDeclaration && (
              <View style={base.infoRow}>
                <Text style={base.infoLabel}>N° déclaration</Text>
                <Text style={base.infoValue}>{company.numeroDeclaration}</Text>
              </View>
            )}
            {company.adresse && (
              <View style={base.infoRow}>
                <Text style={base.infoLabel}>Adresse</Text>
                <Text style={base.infoValue}>{company.adresse}, {company.codePostal} {company.ville}</Text>
              </View>
            )}
            {company.representantLegal && (
              <View style={base.infoRow}>
                <Text style={base.infoLabel}>Représentant légal</Text>
                <Text style={base.infoValue}>{company.representantLegal}</Text>
              </View>
            )}
          </View>
          <View style={s.partieCard}>
            <Text style={s.partieCardTitle}>Le stagiaire</Text>
            <View style={base.infoRow}>
              <Text style={base.infoLabel}>Nom</Text>
              <Text style={base.infoValue}>{participant.titre ? `${participant.titre} ` : ""}{participant.nom}</Text>
            </View>
            {participant.specialite && (
              <View style={base.infoRow}>
                <Text style={base.infoLabel}>Spécialité</Text>
                <Text style={base.infoValue}>{participant.specialite}</Text>
              </View>
            )}
            {participant.rpps && (
              <View style={base.infoRow}>
                <Text style={base.infoLabel}>N° RPPS</Text>
                <Text style={base.infoValue}>{participant.rpps}</Text>
              </View>
            )}
            <View style={base.infoRow}>
              <Text style={base.infoLabel}>Email</Text>
              <Text style={base.infoValue}>{participant.email}</Text>
            </View>
            {participant.adresse && (
              <View style={base.infoRow}>
                <Text style={base.infoLabel}>Adresse</Text>
                <Text style={base.infoValue}>{participant.adresse}, {participant.codePostal} {participant.ville}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Articles */}
        <Text style={s.articleTitle}>Article 1 — Objet</Text>
        <Text style={s.articleText}>
          La présente convention a pour objet la participation de {participant.nom} à la formation intitulée «{" "}
          {formation.titre} », organisée par {company.raisonSociale} et animée par{" "}
          {formateur.titre ? `${formateur.titre} ` : ""}{formateur.nom}.
        </Text>

        <Text style={s.articleTitle}>Article 2 — Nature et durée de la formation</Text>
        <View style={base.infoRow}>
          <Text style={base.infoLabel}>Intitulé</Text>
          <Text style={base.infoValue}>{formation.titre}</Text>
        </View>
        <View style={base.infoRow}>
          <Text style={base.infoLabel}>Date</Text>
          <Text style={base.infoValue}>{formatDate(formation.date)} — {formation.heureDebut} à {formation.heureFin}</Text>
        </View>
        <View style={base.infoRow}>
          <Text style={base.infoLabel}>Durée</Text>
          <Text style={base.infoValue}>{formation.dureeHeures} heure(s)</Text>
        </View>
        <View style={base.infoRow}>
          <Text style={base.infoLabel}>Lieu</Text>
          <Text style={base.infoValue}>{formation.lieuNom ? `${formation.lieuNom}, ${formation.lieuAdresse ?? ""}, ${formation.lieuVille ?? ""}` : "À confirmer"}</Text>
        </View>

        <Text style={s.articleTitle}>Article 3 — Programme et objectifs</Text>
        <Text style={s.articleText}>
          Les objectifs pédagogiques et le programme détaillé figurent en annexe de la présente convention.
          {"\n"}Objectifs : {formation.objectifs.join(" ; ")}.
        </Text>

        <Text style={s.articleTitle}>Article 4 — Prix et modalités de règlement</Text>
        <View style={base.infoRow}>
          <Text style={base.infoLabel}>Montant HT</Text>
          <Text style={base.infoValue}>{inscription.montantHT.toFixed(2)} €</Text>
        </View>
        <View style={base.infoRow}>
          <Text style={base.infoLabel}>TVA</Text>
          <Text style={base.infoValue}>{formation.exonerationTVA ? "Exonérée — Art. 261-4-4° CGI" : "20%"}</Text>
        </View>
        <Text style={[s.articleText, { marginTop: 6 }]}>
          Le règlement est effectué en ligne par carte bancaire via la plateforme sécurisée Stripe au moment de l'inscription.
        </Text>

        <Text style={s.articleTitle}>Article 5 — Conditions d'annulation et de remboursement</Text>
        <Text style={s.articleText}>
          Toute annulation effectuée plus de 14 jours avant la date de la formation donne droit à un remboursement intégral.
          En deçà de ce délai, aucun remboursement ne sera effectué sauf en cas d'annulation par l'organisme ou de force majeure.
          {"\n"}En cas d'annulation par l'organisme, les participants seront intégralement remboursés.
        </Text>

        <Text style={s.articleTitle}>Article 6 — Litiges</Text>
        <Text style={s.articleText}>
          En cas de litige, les parties s'engagent à rechercher une solution amiable avant tout recours juridictionnel.
          À défaut, les tribunaux compétents seront ceux du ressort du siège social de l'organisme de formation.
        </Text>

        {/* Signatures */}
        <View style={s.signatureGrid}>
          <View style={s.signatureBlock}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 6 }}>
              L'organisme de formation
            </Text>
            <Text style={{ fontSize: 8, color: GRAY, marginBottom: 8 }}>
              {company.representantLegal ?? company.raisonSociale}
            </Text>
            <View style={s.signatureBoxBig}>
              <Text style={{ fontSize: 8, color: GRAY }}>Signature et cachet</Text>
            </View>
            <Text style={{ fontSize: 7, color: GRAY }}>Fait à {company.ville ?? "___"}, le {formatDate(new Date().toISOString())}</Text>
          </View>
          <View style={s.signatureBlock}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 6 }}>
              Le stagiaire
            </Text>
            <Text style={{ fontSize: 8, color: GRAY, marginBottom: 8 }}>
              {participant.nom} — Lu et approuvé
            </Text>
            <View style={s.signatureBoxBig}>
              <Text style={{ fontSize: 8, color: GRAY }}>Signature</Text>
            </View>
            <Text style={{ fontSize: 7, color: GRAY }}>Fait à _________, le {formatDate(new Date().toISOString())}</Text>
          </View>
        </View>

        <View style={base.footer} fixed>
          <Text style={base.footerText}>{refNum} — {company.raisonSociale}</Text>
          <Text style={base.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
        </View>
      </Page>
    </Document>
  );
}
