import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader } from "../shared/Header";
import { base, GRAY, LIGHT_GRAY, OFF_WHITE, BLACK } from "../shared/styles";
import type { CompanyData } from "../shared/types";

const s = StyleSheet.create({
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: LIGHT_GRAY },
  cellDate: { flex: 1, paddingVertical: 7, fontSize: 9, color: BLACK },
  cellPresence: { width: 90, paddingVertical: 7, fontSize: 9, textAlign: "center" },
  statBox: { backgroundColor: OFF_WHITE, borderRadius: 6, padding: 14, marginVertical: 14, flexDirection: "row", justifyContent: "space-around" },
  statVal: { fontSize: 16, fontFamily: "Helvetica-Bold", color: BLACK, textAlign: "center" },
  statLabel: { fontSize: 7, color: GRAY, textTransform: "uppercase", letterSpacing: 1, textAlign: "center", marginTop: 3 },
});

export type AssiduiteData = {
  etudiantNom: string;
  cursusTitre: string;
  annee: string | null;
  coordinateurNom: string;
  journees: { dateStr: string; matin: boolean; apresMidi: boolean }[];
  tauxPresence: number; // 0..100
};

export function AssiduitePdf({ company, data }: { company: CompanyData; data: AssiduiteData }) {
  return (
    <Document title={`Attestation d'assiduité — ${data.etudiantNom}`} author={company.raisonSociale}>
      <Page size="A4" style={base.page}>
        <PdfHeader company={company} docLabel="ATTESTATION D'ASSIDUITÉ" />
        <Text style={base.docTitle}>Attestation d&apos;assiduité</Text>
        <Text style={base.docSubtitle}>{data.cursusTitre}{data.annee ? ` — ${data.annee}` : ""}</Text>

        <Text style={{ fontSize: 9, color: BLACK, lineHeight: 1.7, marginTop: 8 }}>
          Je soussigné·e {data.coordinateurNom}, coordinateur·rice de l&apos;enseignement « {data.cursusTitre} »,
          atteste que <Text style={{ fontFamily: "Helvetica-Bold" }}>{data.etudiantNom}</Text> a suivi les
          enseignements ci-dessous avec le relevé de présence suivant :
        </Text>

        <View style={s.statBox}>
          <View>
            <Text style={s.statVal}>{data.journees.length}</Text>
            <Text style={s.statLabel}>Journées</Text>
          </View>
          <View>
            <Text style={s.statVal}>{data.tauxPresence}%</Text>
            <Text style={s.statLabel}>Taux de présence</Text>
          </View>
        </View>

        <View style={[s.row, { borderBottomColor: BLACK }]}>
          <Text style={[s.cellDate, { fontFamily: "Helvetica-Bold", fontSize: 8 }]}>Journée</Text>
          <Text style={[s.cellPresence, { fontFamily: "Helvetica-Bold", fontSize: 8 }]}>Matin</Text>
          <Text style={[s.cellPresence, { fontFamily: "Helvetica-Bold", fontSize: 8 }]}>Après-midi</Text>
        </View>
        {data.journees.map((j, i) => (
          <View key={i} style={s.row}>
            <Text style={s.cellDate}>{j.dateStr}</Text>
            <Text style={[s.cellPresence, { color: j.matin ? "#2e7d32" : "#c62828" }]}>{j.matin ? "Présent·e" : "Absent·e"}</Text>
            <Text style={[s.cellPresence, { color: j.apresMidi ? "#2e7d32" : "#c62828" }]}>{j.apresMidi ? "Présent·e" : "Absent·e"}</Text>
          </View>
        ))}

        <Text style={{ fontSize: 8, color: GRAY, marginTop: 20 }}>
          Fait le {new Date().toLocaleDateString("fr-FR")} — document généré par la plateforme {company.raisonSociale},
          sur la base des émargements numériques horodatés.
        </Text>

        <View style={base.footer} fixed>
          <Text style={base.footerText}>{company.raisonSociale} — Attestation d&apos;assiduité</Text>
          <Text style={base.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
        </View>
      </Page>
    </Document>
  );
}
