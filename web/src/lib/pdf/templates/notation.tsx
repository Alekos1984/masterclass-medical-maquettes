import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader } from "../shared/Header";
import { base, GRAY, LIGHT_GRAY, OFF_WHITE, BLACK } from "../shared/styles";
import type { CompanyData } from "../shared/types";

const s = StyleSheet.create({
  metaRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  metaBox: { flex: 1, backgroundColor: OFF_WHITE, borderRadius: 6, padding: 10 },
  metaLabel: { fontSize: 7, color: GRAY, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 },
  metaValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: BLACK },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: LIGHT_GRAY },
  cellNom: { flex: 2, paddingVertical: 6, paddingHorizontal: 6, fontSize: 9 },
  cellNote: { width: 60, paddingVertical: 6, paddingHorizontal: 6, fontSize: 10, fontFamily: "Helvetica-Bold", textAlign: "center" },
  cellComm: { flex: 3, paddingVertical: 6, paddingHorizontal: 6, fontSize: 8, color: GRAY },
});

export type NotationData = {
  cursusTitre: string;
  cursusAnnee: string | null;
  moduleIntitule: string;
  moduleType: string;
  dateEpreuve: string | null;
  noteMax: number;
  seuilValidation: number | null;
  coordinateurNom: string;
  clotureAt: string;
  lignes: { nom: string; email: string; note: number | null; commentaire: string }[];
};

export function NotationPdf({ company, data }: { company: CompanyData; data: NotationData }) {
  const moyenne = (() => {
    const notes = data.lignes.map((l) => l.note).filter((n): n is number => typeof n === "number");
    if (notes.length === 0) return null;
    return notes.reduce((a, b) => a + b, 0) / notes.length;
  })();
  const admis = data.seuilValidation != null
    ? data.lignes.filter((l) => l.note != null && l.note >= data.seuilValidation!).length
    : null;

  return (
    <Document title={`Feuille de notation — ${data.moduleIntitule}`} author={company.raisonSociale}>
      <Page size="A4" style={base.page}>
        <PdfHeader company={company} docLabel="FEUILLE DE NOTATION — CLÔTURÉE" />
        <Text style={base.docTitle}>{data.moduleIntitule}</Text>
        <Text style={base.docSubtitle}>
          {data.cursusTitre}{data.cursusAnnee ? ` — ${data.cursusAnnee}` : ""} · Coordination : {data.coordinateurNom}
        </Text>

        <View style={s.metaRow}>
          <View style={s.metaBox}>
            <Text style={s.metaLabel}>Modalité</Text>
            <Text style={s.metaValue}>{data.moduleType}</Text>
          </View>
          <View style={s.metaBox}>
            <Text style={s.metaLabel}>Date de l&apos;épreuve</Text>
            <Text style={s.metaValue}>
              {data.dateEpreuve ? new Date(data.dateEpreuve).toLocaleDateString("fr-FR") : "—"}
            </Text>
          </View>
          <View style={s.metaBox}>
            <Text style={s.metaLabel}>Barème</Text>
            <Text style={s.metaValue}>Sur {data.noteMax}{data.seuilValidation != null ? ` · seuil ${data.seuilValidation}` : ""}</Text>
          </View>
          <View style={s.metaBox}>
            <Text style={s.metaLabel}>Clôturée le</Text>
            <Text style={s.metaValue}>{new Date(data.clotureAt).toLocaleString("fr-FR")}</Text>
          </View>
        </View>

        <View style={[s.row, { borderBottomColor: BLACK }]}>
          <Text style={[s.cellNom, { fontFamily: "Helvetica-Bold", fontSize: 8 }]}>Étudiant·e</Text>
          <Text style={[s.cellNote, { fontFamily: "Helvetica-Bold", fontSize: 8 }]}>Note</Text>
          <Text style={[s.cellComm, { fontFamily: "Helvetica-Bold", fontSize: 8 }]}>Commentaire</Text>
        </View>
        {data.lignes.map((l, i) => (
          <View key={i} style={s.row}>
            <View style={s.cellNom}>
              <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: BLACK }}>{l.nom}</Text>
              <Text style={{ fontSize: 7, color: GRAY, marginTop: 1 }}>{l.email}</Text>
            </View>
            <Text style={[s.cellNote, {
              color: l.note == null ? GRAY : (data.seuilValidation != null && l.note < data.seuilValidation ? "#c62828" : "#2e7d32"),
            }]}>
              {l.note != null ? `${l.note} / ${data.noteMax}` : "—"}
            </Text>
            <Text style={s.cellComm}>{l.commentaire || "—"}</Text>
          </View>
        ))}

        {moyenne !== null && (
          <View style={{ marginTop: 12, backgroundColor: OFF_WHITE, borderRadius: 6, padding: 10, flexDirection: "row", justifyContent: "space-around" }}>
            <View>
              <Text style={s.metaLabel}>Moyenne</Text>
              <Text style={s.metaValue}>{moyenne.toFixed(2)} / {data.noteMax}</Text>
            </View>
            {admis !== null && (
              <View>
                <Text style={s.metaLabel}>Admis</Text>
                <Text style={s.metaValue}>{admis} / {data.lignes.length}</Text>
              </View>
            )}
          </View>
        )}

        <Text style={{ fontSize: 7, color: GRAY, marginTop: 16, lineHeight: 1.5 }}>
          Ce document constitue l&apos;archive officielle des notes du module clôturé. Toute modification
          ultérieure est journalisée en base et ne peut altérer le présent PDF. Un historique complet des
          saisies (auteur, horodatage, valeur précédente) est conservé côté serveur à des fins d&apos;audit.
        </Text>

        <View style={base.footer} fixed>
          <Text style={base.footerText}>{company.raisonSociale} — Feuille de notation clôturée</Text>
          <Text style={base.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
        </View>
      </Page>
    </Document>
  );
}
