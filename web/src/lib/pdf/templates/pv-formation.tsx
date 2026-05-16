import React from "react";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader } from "../shared/Header";
import { base, GRAY, LIGHT_GRAY, OFF_WHITE, BLACK } from "../shared/styles";
import type { CompanyData, FormateurData, FormationData, EmargementData } from "../shared/types";

const s = StyleSheet.create({
  articleTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: BLACK, marginTop: 16, marginBottom: 6 },
  articleText: { fontSize: 9, color: BLACK, lineHeight: 1.65 },
  participantRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
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
  obsBox: {
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    borderRadius: 6,
    padding: 12,
    height: 60,
    marginTop: 12,
  },
});

interface Props {
  company: CompanyData;
  formateur: FormateurData;
  formation: FormationData;
  emargements: EmargementData[];
  participantSignatureBase64?: string | null;
  participantNomComplet?: string | null;
  pvParticipantSignedAt?: string | null;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatSignatureDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR") + " à " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function PvFormationPdf({ company, formateur, formation, emargements, participantSignatureBase64, participantNomComplet, pvParticipantSignedAt }: Props) {
  const presents = emargements.filter((e) => e.presentMatin || e.presentApresMidi);
  const refNum = `PV-${formation.id.slice(0, 8).toUpperCase()}`;

  return (
    <Document title={`PV de formation — ${formation.titre}`} author={company.raisonSociale}>
      <Page size="A4" style={base.page}>
        <PdfHeader company={company} docLabel="PROCÈS-VERBAL DE FORMATION" />

        <Text style={base.docTitle}>Procès-verbal de fin de formation</Text>
        <Text style={base.docSubtitle}>Réf. {refNum} — {formatDate(new Date().toISOString())}</Text>

        {/* Article 1 */}
        <Text style={s.articleTitle}>1. Identification de la formation</Text>
        <View style={base.infoRow}><Text style={base.infoLabel}>Intitulé</Text><Text style={base.infoValue}>{formation.titre}</Text></View>
        <View style={base.infoRow}><Text style={base.infoLabel}>Date</Text><Text style={base.infoValue}>{formatDate(formation.date)} — {formation.heureDebut} à {formation.heureFin}</Text></View>
        <View style={base.infoRow}><Text style={base.infoLabel}>Durée</Text><Text style={base.infoValue}>{formation.dureeHeures}h</Text></View>
        <View style={base.infoRow}><Text style={base.infoLabel}>Lieu</Text><Text style={base.infoValue}>{formation.lieuNom ?? "À confirmer"}{formation.lieuVille ? `, ${formation.lieuVille}` : ""}</Text></View>
        <View style={base.infoRow}><Text style={base.infoLabel}>Organisme</Text><Text style={base.infoValue}>{company.raisonSociale}{company.siret ? ` — SIRET ${company.siret}` : ""}</Text></View>
        <View style={base.infoRow}><Text style={base.infoLabel}>Formateur</Text><Text style={base.infoValue}>{formateur.titre ? `${formateur.titre} ` : ""}{formateur.nom}{formateur.specialite ? `, ${formateur.specialite}` : ""}</Text></View>

        {/* Article 2 */}
        <Text style={s.articleTitle}>2. Participants présents ({presents.length} / {emargements.length})</Text>
        <View style={{ backgroundColor: OFF_WHITE, borderRadius: 4, overflow: "hidden" }}>
          <View style={[s.participantRow, { backgroundColor: BLACK }]}>
            <Text style={[base.infoLabel, { color: "white", fontSize: 8, fontFamily: "Helvetica-Bold" }]}>Nom</Text>
            <Text style={[base.infoValue, { color: "white", fontSize: 8, fontFamily: "Helvetica-Bold" }]}>Spécialité</Text>
            <Text style={{ width: 60, color: "white", fontSize: 8, fontFamily: "Helvetica-Bold" }}>Présence</Text>
          </View>
          {emargements.map((e, i) => (
            <View key={i} style={[s.participantRow, i % 2 === 1 ? {} : { backgroundColor: "white" }]}>
              <Text style={[base.infoLabel, { fontSize: 9 }]}>
                {e.participant.titre ? `${e.participant.titre} ` : ""}{e.participant.nom}
              </Text>
              <Text style={[base.infoValue, { fontSize: 9 }]}>{e.participant.specialite ?? "—"}</Text>
              <Text style={{ width: 60, fontSize: 9 }}>
                {e.presentMatin && e.presentApresMidi ? "Journée" : e.presentMatin ? "Matin" : e.presentApresMidi ? "A-midi" : "Absent"}
              </Text>
            </View>
          ))}
        </View>

        {/* Article 3 */}
        <Text style={s.articleTitle}>3. Déroulement et objectifs</Text>
        <Text style={s.articleText}>
          La formation s'est déroulée conformément au programme prévu.
          Les objectifs pédagogiques suivants ont été abordés :
        </Text>
        {formation.objectifs.map((obj, i) => (
          <View key={i} style={{ flexDirection: "row", marginTop: 4, gap: 8 }}>
            <Text style={{ fontSize: 9, color: GRAY }}>•</Text>
            <Text style={{ fontSize: 9, color: BLACK, flex: 1 }}>{obj}</Text>
          </View>
        ))}

        {/* Article 4 */}
        <Text style={s.articleTitle}>4. Évaluation des acquis</Text>
        <Text style={s.articleText}>
          Une évaluation des acquis a été réalisée en cours et en fin de formation (quiz, mises en situation cliniques, échanges interactifs).
          Les participants ont eu l'opportunité d'exprimer leur niveau de satisfaction via un questionnaire anonyme.
        </Text>

        {/* Article 5 - Observations */}
        <Text style={s.articleTitle}>5. Observations</Text>
        <View style={s.obsBox}>
          <Text style={{ fontSize: 8, color: LIGHT_GRAY }}>Observations du formateur...</Text>
        </View>

        {/* Signatures */}
        <View style={s.signatureGrid}>
          <View style={s.signatureBlock}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>Le formateur</Text>
            <Text style={{ fontSize: 8, color: GRAY, marginBottom: 8 }}>{formateur.titre ? `${formateur.titre} ` : ""}{formateur.nom}</Text>
            <View style={s.signatureBox}>
              {formation.pvSigne ? (
                formation.signatureFormateurBase64
                  ? <Image src={formation.signatureFormateurBase64} style={{ width: "100%", height: 50, objectFit: "contain" }} />
                  : <View style={{ flex: 1 }} />
              ) : (
                <Text style={{ fontSize: 8, color: GRAY }}>Signature à apposer</Text>
              )}
            </View>
            {formation.pvSigne && (
              <>
                <Text style={{ fontSize: 10, fontFamily: "Times-BoldItalic", color: BLACK, marginTop: 4 }}>
                  {formation.formateurNomComplet ?? formateur.nom}
                </Text>
                <Text style={{ fontSize: 7, color: "#1565c0", marginTop: 2 }}>
                  Signé le {formatSignatureDate(formation.pvSigneAt)}
                </Text>
              </>
            )}
          </View>
          <View style={s.signatureBlock}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>Signature du participant</Text>
            <Text style={{ fontSize: 8, color: GRAY, marginBottom: 8 }}>
              {participantNomComplet ?? "Nom et prénom : ________________________"}
            </Text>
            <View style={s.signatureBox}>
              {pvParticipantSignedAt ? (
                participantSignatureBase64
                  ? <Image src={participantSignatureBase64} style={{ width: "100%", height: 50, objectFit: "contain" }} />
                  : <View style={{ flex: 1 }} />
              ) : (
                <Text style={{ fontSize: 8, color: GRAY }}>Signature à apposer</Text>
              )}
            </View>
            {pvParticipantSignedAt && (
              <>
                <Text style={{ fontSize: 10, fontFamily: "Times-BoldItalic", color: BLACK, marginTop: 4 }}>
                  {participantNomComplet ?? ""}
                </Text>
                <Text style={{ fontSize: 7, color: "#1565c0", marginTop: 2 }}>
                  Signé le {formatSignatureDate(pvParticipantSignedAt)}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Certification numérique */}
        {formation.pvSigne && formation.pvSigneAt && (
          <View style={{ marginTop: 12, padding: 8, backgroundColor: "#f8f9ff", borderRadius: 4, borderWidth: 1, borderColor: "#dde3f5" }}>
            <Text style={{ fontSize: 7, color: "#1565c0", fontFamily: "Helvetica-Bold" }}>
              ◆ Document certifié numériquement
            </Text>
            <Text style={{ fontSize: 7, color: GRAY, marginTop: 2 }}>
              Horodatage : {new Date(formation.pvSigneAt).toLocaleString("fr-FR")} · Formation ID : {formation.id.slice(0, 12).toUpperCase()} · Ce document est un original numérique non modifiable.
            </Text>
          </View>
        )}

        <View style={base.footer} fixed>
          <Text style={base.footerText}>{refNum} — {company.raisonSociale}</Text>
          <Text style={base.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
        </View>
      </Page>
    </Document>
  );
}
