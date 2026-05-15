import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader } from "../shared/Header";
import { base, GRAY, LIGHT_GRAY, OFF_WHITE, BLACK, RED } from "../shared/styles";
import type { CompanyData, FormateurData, FormationData, EmargementData } from "../shared/types";

const s = StyleSheet.create({
  table: { marginTop: 12 },
  thead: {
    flexDirection: "row",
    backgroundColor: BLACK,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  th: { fontSize: 8, color: "white", fontFamily: "Helvetica-Bold", paddingHorizontal: 8 },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
    minHeight: 32,
    alignItems: "center",
  },
  trAlt: { backgroundColor: OFF_WHITE },
  td: { fontSize: 8, color: BLACK, paddingHorizontal: 8, paddingVertical: 6 },
  colNom: { flex: 3 },
  colRPPS: { width: 90 },
  colCheck: { width: 70, alignItems: "center" },
  checkBox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: LIGHT_GRAY,
    borderRadius: 3,
  },
  checkBoxFilled: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: RED,
    borderRadius: 3,
    backgroundColor: "#fff0f2",
    justifyContent: "center",
    alignItems: "center",
  },
  signatureCell: { flex: 2, paddingHorizontal: 8 },
  signatureLineBox: {
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
    height: 24,
    marginHorizontal: 4,
  },
  summaryBox: {
    backgroundColor: OFF_WHITE,
    borderRadius: 6,
    padding: 12,
    marginTop: 24,
    flexDirection: "row",
    gap: 20,
  },
  summaryItem: { flex: 1 },
  summaryLabel: { fontSize: 8, color: GRAY, marginBottom: 4 },
  summaryValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: BLACK },
  certifBox: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    borderRadius: 6,
    padding: 16,
  },
  certifText: { fontSize: 8, color: GRAY, lineHeight: 1.6 },
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

export function FeuillePresencePdf({ company, formateur, formation, emargements }: Props) {
  const presentsMatin = emargements.filter((e) => e.presentMatin).length;
  const presentsAM = emargements.filter((e) => e.presentApresMidi).length;

  return (
    <Document title={`Feuille de présence — ${formation.titre}`} author={company.raisonSociale}>
      <Page size="A4" style={[base.page, { paddingHorizontal: 36 }]} orientation="landscape">
        <PdfHeader company={company} docLabel="FEUILLE DE PRÉSENCE" />

        <Text style={base.docTitle}>Feuille de présence certifiée</Text>
        <Text style={base.docSubtitle}>{formation.titre}</Text>

        {/* Formation info */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <View style={base.infoRow}>
            <Text style={base.infoLabel}>Date</Text>
            <Text style={base.infoValue}>{formatDate(formation.date)}</Text>
          </View>
          <View style={base.infoRow}>
            <Text style={base.infoLabel}>Horaires</Text>
            <Text style={base.infoValue}>{formation.heureDebut} – {formation.heureFin}</Text>
          </View>
          <View style={base.infoRow}>
            <Text style={base.infoLabel}>Lieu</Text>
            <Text style={base.infoValue}>{formation.lieuNom ?? "À confirmer"}{formation.lieuVille ? `, ${formation.lieuVille}` : ""}</Text>
          </View>
          <View style={base.infoRow}>
            <Text style={base.infoLabel}>Formateur</Text>
            <Text style={base.infoValue}>{formateur.titre ? `${formateur.titre} ` : ""}{formateur.nom}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={s.table}>
          <View style={s.thead}>
            <Text style={[s.th, s.colNom]}>Participant</Text>
            <Text style={[s.th, s.colRPPS]}>N° RPPS</Text>
            <Text style={[s.th, s.colCheck]}>Matin ✓</Text>
            <Text style={[s.th, s.signatureCell]}>Signature matin</Text>
            <Text style={[s.th, s.colCheck]}>Après-midi ✓</Text>
            <Text style={[s.th, s.signatureCell]}>Signature après-midi</Text>
          </View>

          {emargements.map((e, i) => (
            <View key={i} style={[s.tr, i % 2 === 1 ? s.trAlt : {}]} wrap={false}>
              <View style={[s.colNom, { paddingHorizontal: 8, paddingVertical: 4 }]}>
                <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: BLACK }}>
                  {e.participant.titre ? `${e.participant.titre} ` : ""}{e.participant.nom}
                </Text>
                {e.participant.specialite && (
                  <Text style={{ fontSize: 7, color: GRAY }}>{e.participant.specialite}</Text>
                )}
              </View>
              <Text style={[s.td, s.colRPPS]}>{e.participant.rpps ?? "—"}</Text>
              <View style={[s.colCheck, { justifyContent: "center", alignItems: "center", paddingVertical: 4 }]}>
                {e.presentMatin ? (
                  <View style={s.checkBoxFilled}>
                    <Text style={{ fontSize: 10, color: RED, fontFamily: "Helvetica-Bold" }}>✓</Text>
                  </View>
                ) : (
                  <View style={s.checkBox} />
                )}
              </View>
              <View style={[s.signatureCell, { justifyContent: "flex-end", paddingVertical: 4 }]}>
                {e.signatureMatin ? (
                  <Text style={{ fontSize: 7, color: GRAY }}>{new Date(e.signatureMatin).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</Text>
                ) : (
                  <View style={s.signatureLineBox} />
                )}
              </View>
              <View style={[s.colCheck, { justifyContent: "center", alignItems: "center", paddingVertical: 4 }]}>
                {e.presentApresMidi ? (
                  <View style={s.checkBoxFilled}>
                    <Text style={{ fontSize: 10, color: RED, fontFamily: "Helvetica-Bold" }}>✓</Text>
                  </View>
                ) : (
                  <View style={s.checkBox} />
                )}
              </View>
              <View style={[s.signatureCell, { justifyContent: "flex-end", paddingVertical: 4 }]}>
                {e.signatureApresMidi ? (
                  <Text style={{ fontSize: 7, color: GRAY }}>{new Date(e.signatureApresMidi).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</Text>
                ) : (
                  <View style={s.signatureLineBox} />
                )}
              </View>
            </View>
          ))}

          {/* Empty rows if needed */}
          {emargements.length < 8 && Array.from({ length: 8 - emargements.length }).map((_, i) => (
            <View key={`empty-${i}`} style={[s.tr, (emargements.length + i) % 2 === 1 ? s.trAlt : {}]}>
              <View style={[s.colNom, { paddingHorizontal: 8, paddingVertical: 4 }]}>
                <View style={{ height: 16, borderBottomWidth: 1, borderBottomColor: LIGHT_GRAY }} />
              </View>
              <Text style={[s.td, s.colRPPS]}></Text>
              <View style={[s.colCheck, { justifyContent: "center", alignItems: "center", paddingVertical: 4 }]}>
                <View style={s.checkBox} />
              </View>
              <View style={s.signatureCell}><View style={s.signatureLineBox} /></View>
              <View style={[s.colCheck, { justifyContent: "center", alignItems: "center", paddingVertical: 4 }]}>
                <View style={s.checkBox} />
              </View>
              <View style={s.signatureCell}><View style={s.signatureLineBox} /></View>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={s.summaryBox}>
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Participants inscrits</Text>
            <Text style={s.summaryValue}>{emargements.length}</Text>
          </View>
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Présents matin</Text>
            <Text style={s.summaryValue}>{presentsMatin}</Text>
          </View>
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Présents après-midi</Text>
            <Text style={s.summaryValue}>{presentsAM}</Text>
          </View>
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Taux présence</Text>
            <Text style={s.summaryValue}>
              {emargements.length > 0
                ? Math.round(((presentsMatin + presentsAM) / (emargements.length * 2)) * 100)
                : 0}%
            </Text>
          </View>
        </View>

        {/* Certification */}
        <View style={s.certifBox}>
          <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: BLACK, marginBottom: 6 }}>
            Certification du formateur
          </Text>
          <Text style={s.certifText}>
            Je soussigné(e) {formateur.titre ? `${formateur.titre} ` : ""}{formateur.nom}, formateur certifie l'exactitude
            des présences consignées dans ce document pour la formation «{formation.titre}» du {formatDate(formation.date)}.
          </Text>
          <View style={{ flexDirection: "row", gap: 40, marginTop: 16 }}>
            <View>
              <Text style={{ fontSize: 8, color: GRAY, marginBottom: 20 }}>Date : {formatDate(new Date().toISOString())}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 8, color: GRAY, marginBottom: 20 }}>Signature du formateur :</Text>
              <View style={{ width: 150, borderBottomWidth: 1, borderBottomColor: LIGHT_GRAY }} />
            </View>
          </View>
        </View>

        <View style={base.footer} fixed>
          <Text style={base.footerText}>{company.raisonSociale} — Feuille de présence officielle</Text>
          <Text style={base.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
        </View>
      </Page>
    </Document>
  );
}
