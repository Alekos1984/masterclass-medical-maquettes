import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader, PdfMMFootnote, type BrandingInfo } from "../shared/Header";
import { base, RED, GRAY, LIGHT_GRAY, OFF_WHITE, BLACK } from "../shared/styles";
import type { CompanyData } from "../shared/types";

const s = StyleSheet.create({
  journeeTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: BLACK, marginTop: 16, marginBottom: 2 },
  journeeMeta: { fontSize: 8, color: GRAY, marginBottom: 6 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: LIGHT_GRAY },
  heure: { width: 70, paddingVertical: 6, fontSize: 8, color: GRAY },
  contenu: { flex: 1, paddingVertical: 6 },
  titre: { fontSize: 9, fontFamily: "Helvetica-Bold", color: BLACK },
  desc: { fontSize: 8, color: GRAY, marginTop: 1, lineHeight: 1.4 },
  prof: { width: 120, paddingVertical: 6, fontSize: 8, color: RED, textAlign: "right" },
  infoBox: { backgroundColor: OFF_WHITE, borderRadius: 6, padding: 10, marginBottom: 6 },
});

export type CursusProgrammeData = {
  titre: string;
  annee: string | null;
  specialite: string;
  description: string;
  coordinateurNom: string;
  organisateurs: string[]; // enseignants cochés "organisateur" + lignes libres, fusionnés
  secretaires: string[]; // noms des secrétaires pédagogiques
  contactNom: string | null;
  contactEmail: string | null;
  contactTelephone: string | null;
  journees: {
    dateStr: string;
    heureDebut: string;
    heureFin: string;
    modalite: string;
    lieu: string;
    slots: { heureDebut: string; heureFin: string; titre: string; description: string; type: string; enseignantNom: string | null; lieuNom?: string | null; salle?: string | null; enVisio?: boolean }[];
  }[];
};

export function CursusProgrammePdf({ company, cursus, branding }: { company: CompanyData; cursus: CursusProgrammeData; branding?: BrandingInfo }) {
  return (
    <Document title={`Programme — ${cursus.titre}`} author={company.raisonSociale}>
      <Page size="A4" style={base.page}>
        <PdfHeader company={company} docLabel="PROGRAMME D'ENSEIGNEMENT" branding={branding} />
        <Text style={base.docTitle}>{cursus.titre}</Text>
        <Text style={base.docSubtitle}>
          {cursus.specialite}{cursus.annee ? ` — ${cursus.annee}` : ""} · Coordination : {cursus.coordinateurNom}
        </Text>

        {cursus.description ? (
          <View style={s.infoBox}>
            <Text style={{ fontSize: 8, color: BLACK, lineHeight: 1.5 }}>{cursus.description}</Text>
          </View>
        ) : <View style={{ height: 0 }} />}

        {(cursus.organisateurs.length > 0 || cursus.secretaires.length > 0 || cursus.contactNom || cursus.contactEmail) && (
          <View style={[s.infoBox, { flexDirection: "row", gap: 16 }]}>
            {cursus.organisateurs.length > 0 && (
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 7, color: GRAY, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Comité d&apos;organisation</Text>
                {cursus.organisateurs.map((o, i) => <Text key={i} style={{ fontSize: 8, color: BLACK, lineHeight: 1.5 }}>{o}</Text>)}
              </View>
            )}
            {cursus.secretaires.length > 0 && (
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 7, color: GRAY, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Secrétariat pédagogique</Text>
                {cursus.secretaires.map((o, i) => <Text key={i} style={{ fontSize: 8, color: BLACK, lineHeight: 1.5 }}>{o}</Text>)}
              </View>
            )}
            {(cursus.contactNom || cursus.contactEmail || cursus.contactTelephone) && (
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 7, color: GRAY, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Contact</Text>
                {cursus.contactNom && <Text style={{ fontSize: 8, color: BLACK, lineHeight: 1.5 }}>{cursus.contactNom}</Text>}
                {cursus.contactEmail && <Text style={{ fontSize: 8, color: BLACK, lineHeight: 1.5 }}>{cursus.contactEmail}</Text>}
                {cursus.contactTelephone && <Text style={{ fontSize: 8, color: BLACK, lineHeight: 1.5 }}>{cursus.contactTelephone}</Text>}
              </View>
            )}
          </View>
        )}

        {cursus.journees.map((j, i) => (
          <View key={i} wrap={false}>
            <Text style={s.journeeTitle}>Journée {i + 1} — {j.dateStr}</Text>
            <Text style={s.journeeMeta}>{j.heureDebut}–{j.heureFin} · {j.modalite} · {j.lieu}</Text>
            {j.slots.map((slot, k) => (
              <View key={k} style={s.row}>
                <Text style={s.heure}>{slot.heureDebut}–{slot.heureFin}</Text>
                <View style={s.contenu}>
                  <Text style={s.titre}>{slot.titre}</Text>
                  {slot.description ? <Text style={s.desc}>{slot.description}</Text> : <View style={{ height: 0 }} />}
                  {(slot.enVisio || slot.lieuNom || slot.salle) ? (
                    <Text style={s.desc}>
                      {slot.enVisio ? "Visioconférence" : [slot.lieuNom, slot.salle ? `salle ${slot.salle}` : null].filter(Boolean).join(" — ")}
                    </Text>
                  ) : <View style={{ height: 0 }} />}
                </View>
                <Text style={s.prof}>{slot.type === "pause" ? "" : (slot.enseignantNom ?? "À confirmer")}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={base.footer} fixed>
          <Text style={base.footerText}>
            {branding?.masquerMM ? (branding.orgNom ?? "") : (branding?.orgNom ?? company.raisonSociale)} — Programme {cursus.titre}
          </Text>
          <Text style={base.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
        </View>
        <PdfMMFootnote company={company} branding={branding} />
      </Page>
    </Document>
  );
}
