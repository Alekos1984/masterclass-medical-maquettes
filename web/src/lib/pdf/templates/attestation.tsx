import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader } from "../shared/Header";
import { base, RED, GRAY, LIGHT_GRAY, OFF_WHITE, BLACK } from "../shared/styles";
import type { CompanyData, FormateurData, FormationData, ParticipantData } from "../shared/types";

const s = StyleSheet.create({
  centerBox: {
    marginVertical: 32,
    padding: 32,
    backgroundColor: OFF_WHITE,
    borderRadius: 12,
    alignItems: "center",
  },
  attesteLabel: { fontSize: 10, color: GRAY, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 },
  nomParticipant: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: BLACK,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  nomTitre: { fontSize: 13, color: GRAY, marginBottom: 24 },
  participatedLabel: { fontSize: 11, color: GRAY, marginBottom: 8, textAlign: "center" },
  formationTitre: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: RED,
    textAlign: "center",
    marginBottom: 4,
  },
  formationMeta: { fontSize: 10, color: GRAY, textAlign: "center" },
  stampBox: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: RED,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  stampText: { fontSize: 8, color: RED, fontFamily: "Helvetica-Bold", textAlign: "center", letterSpacing: 0.5 },
  signatureGrid: { flexDirection: "row", gap: 20, marginTop: 32 },
  signatureBlock: { flex: 1 },
  signatureBox: {
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    borderRadius: 6,
    padding: 12,
    height: 80,
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
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function AttestationPdf({ company, formateur, formation, participant }: Props) {
  return (
    <Document title={`Attestation — ${participant.nom}`} author={company.raisonSociale}>
      <Page size="A4" style={base.page}>
        <PdfHeader company={company} docLabel="ATTESTATION DE PARTICIPATION" />

        <Text style={[base.docTitle, { textAlign: "center", marginBottom: 4 }]}>
          Attestation de participation
        </Text>
        <Text style={[base.docSubtitle, { textAlign: "center" }]}>
          Formation professionnelle continue
        </Text>

        {/* Main attestation block */}
        <View style={s.centerBox}>
          <Text style={s.attesteLabel}>Nous attestons que</Text>
          <Text style={s.nomParticipant}>
            {participant.titre ? `${participant.titre} ` : ""}{participant.nom}
          </Text>
          {participant.specialite && (
            <Text style={s.nomTitre}>{participant.specialite}{participant.rpps ? ` — RPPS ${participant.rpps}` : ""}</Text>
          )}
          <Text style={s.participatedLabel}>a suivi et participé à la formation :</Text>
          <Text style={s.formationTitre}>{formation.titre}</Text>
          <Text style={s.formationMeta}>
            {formatDate(formation.date)} — {formation.heureDebut} à {formation.heureFin} ({formation.dureeHeures}h)
          </Text>
          {formation.lieuNom && (
            <Text style={[s.formationMeta, { marginTop: 4 }]}>
              {formation.lieuNom}{formation.lieuVille ? `, ${formation.lieuVille}` : ""}
            </Text>
          )}
          <View style={s.stampBox}>
            <Text style={s.stampText}>{"ATTESTATION\nOFFICIELLE"}</Text>
          </View>
        </View>

        {/* Details */}
        <Text style={base.sectionTitle}>Détail de la formation</Text>
        <View style={base.infoRow}>
          <Text style={base.infoLabel}>Intitulé</Text>
          <Text style={base.infoValue}>{formation.titre}</Text>
        </View>
        <View style={base.infoRow}>
          <Text style={base.infoLabel}>Spécialité</Text>
          <Text style={base.infoValue}>{formation.specialite}</Text>
        </View>
        <View style={base.infoRow}>
          <Text style={base.infoLabel}>Durée</Text>
          <Text style={base.infoValue}>{formation.dureeHeures} heure(s)</Text>
        </View>
        <View style={base.infoRow}>
          <Text style={base.infoLabel}>Date</Text>
          <Text style={base.infoValue}>{formatDate(formation.date)}</Text>
        </View>
        <View style={base.infoRow}>
          <Text style={base.infoLabel}>Intervenant</Text>
          <Text style={base.infoValue}>{formateur.titre ? `${formateur.titre} ` : ""}{formateur.nom}{formateur.specialite ? `, ${formateur.specialite}` : ""}</Text>
        </View>
        <View style={base.infoRow}>
          <Text style={base.infoLabel}>Organisme</Text>
          <Text style={base.infoValue}>{company.raisonSociale}{company.siret ? ` — SIRET ${company.siret}` : ""}</Text>
        </View>

        {/* Objectives */}
        <Text style={base.sectionTitle}>Objectifs atteints</Text>
        {formation.objectifs.map((obj, i) => (
          <View key={i} style={{ flexDirection: "row", marginBottom: 4, gap: 8 }}>
            <Text style={{ fontSize: 9, color: RED }}>✓</Text>
            <Text style={{ fontSize: 9, color: BLACK, lineHeight: 1.5, flex: 1 }}>{obj}</Text>
          </View>
        ))}

        {/* Signatures */}
        <View style={s.signatureGrid}>
          <View style={s.signatureBlock}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>L'organisme de formation</Text>
            <Text style={{ fontSize: 8, color: GRAY, marginBottom: 8 }}>
              {company.representantLegal ?? company.raisonSociale}
            </Text>
            <View style={s.signatureBox}>
              <Text style={{ fontSize: 8, color: GRAY }}>Signature et cachet</Text>
            </View>
            <Text style={{ fontSize: 7, color: GRAY }}>Le {formatDate(new Date().toISOString())}</Text>
          </View>
          <View style={s.signatureBlock}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>Le formateur</Text>
            <Text style={{ fontSize: 8, color: GRAY, marginBottom: 8 }}>
              {formateur.titre ? `${formateur.titre} ` : ""}{formateur.nom}
            </Text>
            <View style={s.signatureBox}>
              <Text style={{ fontSize: 8, color: GRAY }}>Signature</Text>
            </View>
            <Text style={{ fontSize: 7, color: GRAY }}>Le {formatDate(new Date().toISOString())}</Text>
          </View>
        </View>

        <View style={base.footer} fixed>
          <Text style={base.footerText}>{company.raisonSociale}{company.siret ? ` — SIRET ${company.siret}` : ""}</Text>
          <Text style={base.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
        </View>
      </Page>
    </Document>
  );
}
