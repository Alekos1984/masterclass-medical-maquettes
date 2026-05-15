import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader } from "../shared/Header";
import { base, RED, GRAY, LIGHT_GRAY, OFF_WHITE, BLACK } from "../shared/styles";
import type { CompanyData, FormateurData, FormationData, EmargementData } from "../shared/types";

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
  certifBox: {
    backgroundColor: OFF_WHITE,
    borderRadius: 10,
    padding: 24,
    marginVertical: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
  },
  certifTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: BLACK,
    marginBottom: 4,
    textAlign: "center",
  },
  certifSub: { fontSize: 9, color: GRAY, textAlign: "center", marginBottom: 16 },
  certifLabel: {
    fontSize: 7,
    color: GRAY,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 6,
    textAlign: "center",
  },
  certifHighlight: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: RED,
    textAlign: "center",
    marginBottom: 4,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 0,
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    borderRadius: 6,
    overflow: "hidden",
    marginVertical: 16,
  },
  summaryItem: {
    flex: 1,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: LIGHT_GRAY,
    alignItems: "center",
  },
  summaryItemLast: { flex: 1, padding: 12, alignItems: "center" },
  summaryVal: { fontSize: 16, fontFamily: "Helvetica-Bold", color: BLACK },
  summaryLbl: { fontSize: 7, color: GRAY, textAlign: "center", marginTop: 2 },
  participantRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  legalBox: {
    backgroundColor: OFF_WHITE,
    borderRadius: 6,
    padding: 10,
    marginTop: 16,
  },
  legalText: { fontSize: 7.5, color: GRAY, lineHeight: 1.7 },
  signatureGrid: { flexDirection: "row", gap: 20, marginTop: 24 },
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
  emargements: EmargementData[];
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export function CertificatRealisationPdf({ company, formateur, formation, emargements }: Props) {
  const refNum = `CERT-${formation.id.slice(0, 8).toUpperCase()}`;
  const presents = emargements.filter((e) => e.presentMatin || e.presentApresMidi).length;
  const presentsFull = emargements.filter((e) => e.presentMatin && e.presentApresMidi).length;
  const today = new Date().toISOString();

  return (
    <Document title={`Certificat de réalisation — ${formation.titre}`} author={company.raisonSociale}>
      <Page size="A4" style={base.page}>
        <PdfHeader company={company} docLabel="CERTIFICAT DE RÉALISATION" />

        {/* Référence */}
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

        <Text style={base.docTitle}>Certificat de réalisation</Text>
        <Text style={[base.docSubtitle, { marginBottom: 0 }]}>Action de formation professionnelle continue</Text>

        {/* Bloc principal de certification */}
        <View style={s.certifBox}>
          <Text style={s.certifLabel}>L'organisme de formation</Text>
          <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold", color: BLACK, marginBottom: 2, textAlign: "center" }}>
            {company.raisonSociale}
          </Text>
          {company.siret && (
            <Text style={{ fontSize: 8, color: GRAY, marginBottom: 12, textAlign: "center" }}>
              SIRET {company.siret}{company.numeroDeclaration ? ` — N° déclaration activité ${company.numeroDeclaration}` : ""}
            </Text>
          )}
          <Text style={s.certifSub}>certifie avoir dispensé et réalisé l'action de formation suivante :</Text>
          <Text style={s.certifHighlight}>{formation.titre}</Text>
          <Text style={{ fontSize: 9, color: GRAY, textAlign: "center", marginBottom: 4 }}>
            {formation.specialite} — {formation.dureeHeures}h
          </Text>
          <Text style={{ fontSize: 9, color: BLACK, textAlign: "center" }}>
            Le {formatDate(formation.date)} · {formation.heureDebut} – {formation.heureFin}
          </Text>
          {formation.lieuNom && (
            <Text style={{ fontSize: 9, color: GRAY, textAlign: "center", marginTop: 2 }}>
              {formation.lieuNom}{formation.lieuVille ? `, ${formation.lieuVille}` : ""}
            </Text>
          )}
        </View>

        {/* Chiffres clés */}
        <View style={s.summaryGrid}>
          <View style={s.summaryItem}>
            <Text style={s.summaryVal}>{emargements.length}</Text>
            <Text style={s.summaryLbl}>Participants inscrits</Text>
          </View>
          <View style={s.summaryItem}>
            <Text style={s.summaryVal}>{presents}</Text>
            <Text style={s.summaryLbl}>Participants présents</Text>
          </View>
          <View style={s.summaryItem}>
            <Text style={s.summaryVal}>{presentsFull}</Text>
            <Text style={s.summaryLbl}>Journée complète</Text>
          </View>
          <View style={s.summaryItemLast}>
            <Text style={s.summaryVal}>{formation.dureeHeures}h</Text>
            <Text style={s.summaryLbl}>Durée réalisée</Text>
          </View>
        </View>

        {/* Formateur */}
        <Text style={base.sectionTitle}>Intervenant</Text>
        <View style={base.infoRow}>
          <Text style={base.infoLabel}>Formateur</Text>
          <Text style={base.infoValue}>{formateur.titre ? `${formateur.titre} ` : ""}{formateur.nom}{formateur.specialite ? `, ${formateur.specialite}` : ""}</Text>
        </View>
        {formateur.rpps && (
          <View style={base.infoRow}>
            <Text style={base.infoLabel}>N° RPPS</Text>
            <Text style={base.infoValue}>{formateur.rpps}</Text>
          </View>
        )}

        {/* Participants présents */}
        <Text style={base.sectionTitle}>Liste des participants présents ({presents})</Text>
        <View style={{ backgroundColor: OFF_WHITE, borderRadius: 4, overflow: "hidden" }}>
          <View style={[s.participantRow, { backgroundColor: BLACK }]}>
            <Text style={[{ width: 180, fontSize: 8, fontFamily: "Helvetica-Bold", color: "white", paddingHorizontal: 8 }]}>Nom</Text>
            <Text style={[{ width: 140, fontSize: 8, fontFamily: "Helvetica-Bold", color: "white" }]}>Spécialité</Text>
            <Text style={[{ flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", color: "white" }]}>Présence</Text>
          </View>
          {emargements
            .filter((e) => e.presentMatin || e.presentApresMidi)
            .map((e, i) => (
              <View key={i} style={[s.participantRow, i % 2 === 1 ? { backgroundColor: "white" } : {}]}>
                <Text style={{ width: 180, fontSize: 9, color: BLACK, paddingHorizontal: 8 }}>
                  {e.participant.titre ? `${e.participant.titre} ` : ""}{e.participant.nom}
                </Text>
                <Text style={{ width: 140, fontSize: 9, color: GRAY }}>{e.participant.specialite ?? "—"}</Text>
                <Text style={{ flex: 1, fontSize: 9, color: BLACK }}>
                  {e.presentMatin && e.presentApresMidi ? "Journée complète" : e.presentMatin ? "Matin uniquement" : "Après-midi uniquement"}
                </Text>
              </View>
            ))}
        </View>

        {/* Objectifs atteints */}
        <Text style={base.sectionTitle}>Objectifs pédagogiques réalisés</Text>
        {formation.objectifs.map((obj, i) => (
          <View key={i} style={{ flexDirection: "row", marginBottom: 4, gap: 8 }}>
            <Text style={{ fontSize: 9, color: RED }}>✓</Text>
            <Text style={{ fontSize: 9, color: BLACK, flex: 1, lineHeight: 1.5 }}>{obj}</Text>
          </View>
        ))}

        {/* Mentions légales */}
        <View style={s.legalBox}>
          <Text style={s.legalText}>
            Ce certificat de réalisation est établi conformément à l'article L6353-1 du Code du travail.
            Il atteste que l'action de formation a été effectivement dispensée et que les heures indiquées ont été réalisées.
            Ce document peut être transmis à l'OPCO ou à l'employeur dans le cadre d'une demande de prise en charge.
            {"\n"}{company.raisonSociale}{company.siret ? ` — SIRET ${company.siret}` : ""}{company.numeroDeclaration ? ` — N° déclaration activité ${company.numeroDeclaration}` : ""}.
          </Text>
        </View>

        {/* Signatures */}
        <View style={s.signatureGrid}>
          <View style={s.signatureBlock}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>Le formateur</Text>
            <Text style={{ fontSize: 8, color: GRAY, marginBottom: 8 }}>{formateur.titre ? `${formateur.titre} ` : ""}{formateur.nom}</Text>
            <View style={s.signatureBox}><Text style={{ fontSize: 8, color: GRAY }}>Signature</Text></View>
            <Text style={{ fontSize: 7, color: GRAY }}>Le {formatDate(today)}</Text>
          </View>
          <View style={s.signatureBlock}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>L'organisme de formation</Text>
            <Text style={{ fontSize: 8, color: GRAY, marginBottom: 8 }}>{company.representantLegal ?? company.raisonSociale}</Text>
            <View style={s.signatureBox}><Text style={{ fontSize: 8, color: GRAY }}>Signature et cachet</Text></View>
            <Text style={{ fontSize: 7, color: GRAY }}>Le {formatDate(today)}</Text>
          </View>
        </View>

        <View style={base.footer} fixed>
          <Text style={base.footerText}>{refNum} — {company.raisonSociale} — Certificat de réalisation Art. L6353-1 Code du travail</Text>
          <Text style={base.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
        </View>
      </Page>
    </Document>
  );
}
