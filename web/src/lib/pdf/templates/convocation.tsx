import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader } from "../shared/Header";
import { base, RED, GRAY, LIGHT_GRAY, OFF_WHITE, BLACK } from "../shared/styles";
import type { CompanyData, FormateurData, FormationData, ParticipantData } from "../shared/types";

const s = StyleSheet.create({
  refBox: {
    backgroundColor: OFF_WHITE,
    borderRadius: 4,
    padding: 8,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  refLabel: { fontSize: 8, color: GRAY },
  refValue: { fontSize: 8, color: BLACK, fontFamily: "Helvetica-Bold" },
  recipientBox: {
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    borderRadius: 6,
    padding: 16,
    marginBottom: 24,
    maxWidth: 240,
    alignSelf: "flex-end",
  },
  recipientLabel: { fontSize: 8, color: GRAY, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 },
  infoRow: { flexDirection: "row", marginBottom: 8 },
  infoLabel: { width: 130, fontSize: 9, color: GRAY },
  infoValue: { flex: 1, fontSize: 9, color: BLACK },
  practicalBox: {
    backgroundColor: "#fff0f2",
    borderRadius: 6,
    padding: 14,
    marginTop: 20,
    borderLeftWidth: 3,
    borderLeftColor: RED,
  },
  practicalTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: RED, marginBottom: 8 },
  practicalItem: { flexDirection: "row", marginBottom: 5, gap: 8 },
  practicalText: { fontSize: 9, color: BLACK, flex: 1, lineHeight: 1.5 },
  legalBox: {
    backgroundColor: OFF_WHITE,
    borderRadius: 6,
    padding: 10,
    marginTop: 20,
  },
  legalText: { fontSize: 7.5, color: GRAY, lineHeight: 1.7 },
  signatureGrid: { flexDirection: "row", gap: 20, marginTop: 28 },
  signatureBlock: { flex: 1 },
  signatureBox: {
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    borderRadius: 6,
    padding: 12,
    height: 70,
    justifyContent: "flex-end",
    marginBottom: 6,
  },
});

interface Props {
  company: CompanyData;
  formateur: FormateurData;
  formation: FormationData;
  participant: ParticipantData;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}
function formatDateLong(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function ConvocationPdf({ company, formateur, formation, participant }: Props) {
  const refNum = `CONV-${formation.id.slice(0, 6).toUpperCase()}-${participant.nom.slice(0, 3).toUpperCase()}`;
  const today = new Date().toISOString();

  return (
    <Document title={`Convocation — ${participant.nom}`} author={company.raisonSociale}>
      <Page size="A4" style={base.page}>
        <PdfHeader company={company} docLabel="CONVOCATION À UNE ACTION DE FORMATION" />

        {/* Référence + date */}
        <View style={s.refBox}>
          <View>
            <Text style={s.refLabel}>Réf.</Text>
            <Text style={s.refValue}>{refNum}</Text>
          </View>
          <View>
            <Text style={s.refLabel}>Date d'émission</Text>
            <Text style={s.refValue}>{formatDate(today)}</Text>
          </View>
          <View>
            <Text style={s.refLabel}>Base légale</Text>
            <Text style={s.refValue}>Art. L6353-1 Code du travail</Text>
          </View>
        </View>

        {/* Destinataire */}
        <View style={s.recipientBox}>
          <Text style={s.recipientLabel}>Destinataire</Text>
          <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: BLACK }}>
            {participant.titre ? `${participant.titre} ` : ""}{participant.nom}
          </Text>
          {participant.specialite && (
            <Text style={{ fontSize: 9, color: GRAY, marginTop: 2 }}>{participant.specialite}</Text>
          )}
          {participant.adresse && (
            <Text style={{ fontSize: 9, color: GRAY, marginTop: 4 }}>{participant.adresse}</Text>
          )}
          {(participant.codePostal || participant.ville) && (
            <Text style={{ fontSize: 9, color: GRAY }}>{participant.codePostal} {participant.ville}</Text>
          )}
        </View>

        {/* Objet */}
        <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: BLACK, marginBottom: 12 }}>
          Objet : Convocation à la formation «{formation.titre}»
        </Text>

        <Text style={{ fontSize: 9, color: BLACK, lineHeight: 1.7, marginBottom: 16 }}>
          {formateur.titre ? formateur.titre + " " : ""}{formateur.nom} a l'honneur de convoquer {participant.titre ? participant.titre + " " : ""}{participant.nom} à la formation professionnelle continue dont les modalités sont précisées ci-dessous.
        </Text>

        {/* Détails formation */}
        <Text style={base.sectionTitle}>Détails de la formation</Text>
        <View style={s.infoRow}><Text style={s.infoLabel}>Intitulé</Text><Text style={s.infoValue}>{formation.titre}</Text></View>
        <View style={s.infoRow}><Text style={s.infoLabel}>Date</Text><Text style={s.infoValue}>{formatDateLong(formation.date)}</Text></View>
        <View style={s.infoRow}><Text style={s.infoLabel}>Horaires</Text><Text style={s.infoValue}>{formation.heureDebut} – {formation.heureFin} ({formation.dureeHeures}h)</Text></View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Lieu</Text>
          <Text style={s.infoValue}>
            {formation.lieuNom ? `${formation.lieuNom}\n${formation.lieuAdresse ?? ""}\n${formation.lieuVille ?? ""}` : "Lieu en cours de confirmation"}
          </Text>
        </View>
        {formation.lieuSalle && (
          <View style={s.infoRow}><Text style={s.infoLabel}>Salle</Text><Text style={s.infoValue}>{formation.lieuSalle}</Text></View>
        )}
        <View style={s.infoRow}><Text style={s.infoLabel}>Intervenant</Text><Text style={s.infoValue}>{formateur.titre ? `${formateur.titre} ` : ""}{formateur.nom}{formateur.specialite ? `, ${formateur.specialite}` : ""}</Text></View>
        <View style={s.infoRow}><Text style={s.infoLabel}>Spécialité</Text><Text style={s.infoValue}>{formation.specialite}</Text></View>

        {/* Informations pratiques */}
        <View style={s.practicalBox}>
          <Text style={s.practicalTitle}>Informations pratiques</Text>
          {[
            { icon: "-", text: `Veuillez vous présenter à ${formation.heureDebut} afin de permettre un démarrage ponctuel.` },
            { icon: "-", text: "Munissez-vous d'une pièce d'identité ou de votre carte professionnelle." },
            { icon: "-", text: "La signature de la feuille de présence est obligatoire le matin et l'après-midi." },
            { icon: "-", text: `En cas d'empêchement de dernière minute, prévenez-nous dès que possible : ${company.email ?? company.phone ?? "contact@masterclassmedical.fr"}.` },
          ].map((item, i) => (
            <View key={i} style={s.practicalItem}>
              <Text style={{ fontSize: 9, width: 14 }}>{item.icon}</Text>
              <Text style={s.practicalText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Objectifs */}
        <Text style={base.sectionTitle}>Objectifs de la formation</Text>
        {formation.objectifs.slice(0, 4).map((obj, i) => (
          <View key={i} style={{ flexDirection: "row", marginBottom: 4, gap: 8 }}>
            <Text style={{ fontSize: 9, color: RED }}>→</Text>
            <Text style={{ fontSize: 9, color: BLACK, flex: 1, lineHeight: 1.5 }}>{obj}</Text>
          </View>
        ))}

        {/* Mentions légales */}
        <View style={s.legalBox}>
          <Text style={s.legalText}>
            Toute absence doit être signalée dans les meilleurs délais. Cette convocation vaut autorisation d'absence
            pour raison de formation professionnelle continue conformément à l'article L6353-1 du Code du travail.
            {"\n"}{company.raisonSociale}{company.siret ? ` — SIRET ${company.siret}` : ""}{company.numeroDeclaration ? ` — N° déclaration activité ${company.numeroDeclaration}` : ""}.
          </Text>
        </View>

        {/* Signature */}
        <View style={s.signatureGrid}>
          <View style={s.signatureBlock}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>{formateur.titre ? formateur.titre + " " : ""}{formateur.nom}</Text>
            <Text style={{ fontSize: 8, color: GRAY, marginBottom: 8 }}>{formateur.specialite ?? "Formateur"}</Text>
            <View style={s.signatureBox}><Text style={{ fontSize: 8, color: GRAY }}>Signature et cachet</Text></View>
            <Text style={{ fontSize: 7, color: GRAY }}>Fait à _________, le {formatDate(today)}</Text>
          </View>
          <View style={s.signatureBlock}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>Le/la participant(e)</Text>
            <Text style={{ fontSize: 8, color: GRAY, marginBottom: 8 }}>
              {participant.titre ? `${participant.titre} ` : ""}{participant.nom}{"\n"}Accusé de réception
            </Text>
            <View style={s.signatureBox}><Text style={{ fontSize: 8, color: GRAY }}>Signature</Text></View>
            <Text style={{ fontSize: 7, color: GRAY }}>Le ____/____/________</Text>
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
