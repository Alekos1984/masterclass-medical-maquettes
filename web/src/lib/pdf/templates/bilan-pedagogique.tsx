import React from "react";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader } from "../shared/Header";
import { base, RED, GRAY, LIGHT_GRAY, OFF_WHITE, BLACK } from "../shared/styles";
import type { CompanyData, FormateurData, FormationData, SatisfactionData } from "../shared/types";

const s = StyleSheet.create({
  kpiGrid: { flexDirection: "row", gap: 10, marginBottom: 20 },
  kpiCard: {
    flex: 1,
    backgroundColor: OFF_WHITE,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  kpiValue: { fontSize: 28, fontFamily: "Helvetica-Bold", color: RED, lineHeight: 1 },
  kpiLabel: { fontSize: 7, color: GRAY, textAlign: "center", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.8 },
  barContainer: { marginBottom: 12 },
  barLabel: { fontSize: 9, color: BLACK, marginBottom: 4, flexDirection: "row", justifyContent: "space-between" },
  barTrack: { height: 8, backgroundColor: LIGHT_GRAY, borderRadius: 100, overflow: "hidden" },
  barFill: { height: 8, backgroundColor: RED, borderRadius: 100 },
  analysisBox: {
    borderLeftWidth: 3,
    borderLeftColor: RED,
    paddingLeft: 12,
    marginBottom: 12,
  },
  analysisTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: BLACK, marginBottom: 4 },
  analysisText: { fontSize: 9, color: BLACK, lineHeight: 1.65 },
  actionRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  actionBullet: {
    width: 20,
    height: 20,
    backgroundColor: "#fff0f2",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  actionBulletText: { fontSize: 8, color: RED, fontFamily: "Helvetica-Bold" },
});

interface Props {
  company: CompanyData;
  formateur: FormateurData;
  formation: FormationData;
  reponses: SatisfactionData[];
  texteAnalyse?: {
    synthese: string;
    pointsForts: string[];
    pointsAmelioration: string[];
    recommandations: string[];
  };
}

function avg(values: (number | null | undefined)[]): number {
  const valid = values.filter((v): v is number => v != null);
  if (valid.length === 0) return 0;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function BarItem({ label, value, total = 5 }: { label: string; value: number; total?: number }) {
  const pct = Math.round((value / total) * 100);
  return (
    <View style={s.barContainer}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
        <Text style={{ fontSize: 9, color: BLACK }}>{label}</Text>
        <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: RED }}>{value.toFixed(1)} / {total}</Text>
      </View>
      <View style={s.barTrack}>
        <View style={[s.barFill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export function BilanPedagogiquePdf({ company, formateur, formation, reponses, texteAnalyse }: Props) {
  const n = reponses.length;
  const moyContenu = avg(reponses.map((r) => r.noteContenu));
  const moyFormateur = avg(reponses.map((r) => r.noteFormateur));
  const moyOrganisation = avg(reponses.map((r) => r.noteOrganisation));
  const moySupport = avg(reponses.map((r) => r.noteSupport));
  const moyGlobal = avg(reponses.map((r) => r.noteGlobal));
  const tauxObjectifs = n > 0 ? (reponses.filter((r) => r.objectifsAtteints).length / n) * 100 : 0;
  const tauxRecommande = n > 0 ? (reponses.filter((r) => r.recommanderait).length / n) * 100 : 0;

  return (
    <Document title={`Bilan pédagogique — ${formation.titre}`} author={company.raisonSociale}>
      <Page size="A4" style={base.page}>
        <PdfHeader company={company} docLabel="BILAN PÉDAGOGIQUE" />

        <Text style={base.docTitle}>Bilan pédagogique post-formation</Text>
        <Text style={base.docSubtitle}>
          {formation.titre} — {formatDate(formation.date)} — {n} réponse{n > 1 ? "s" : ""}
        </Text>

        {/* KPI grid */}
        <View style={s.kpiGrid}>
          <View style={s.kpiCard}>
            <Text style={s.kpiValue}>{moyGlobal.toFixed(1)}</Text>
            <Text style={s.kpiLabel}>Note globale /5</Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiValue}>{n}</Text>
            <Text style={s.kpiLabel}>Répondants</Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiValue}>{Math.round(tauxObjectifs)}%</Text>
            <Text style={s.kpiLabel}>Objectifs atteints</Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiValue}>{Math.round(tauxRecommande)}%</Text>
            <Text style={s.kpiLabel}>Recommandation</Text>
          </View>
        </View>

        {/* Notes par critère */}
        <Text style={base.sectionTitle}>Résultats par critère</Text>
        <BarItem label="Contenu pédagogique" value={moyContenu} />
        <BarItem label="Qualité du formateur" value={moyFormateur} />
        <BarItem label="Organisation" value={moyOrganisation} />
        <BarItem label="Supports de cours" value={moySupport} />

        {/* Analyse LLM ou générique */}
        <Text style={base.sectionTitle}>Analyse qualitative</Text>

        {texteAnalyse ? (
          <>
            <View style={s.analysisBox}>
              <Text style={s.analysisTitle}>Synthèse générale</Text>
              <Text style={s.analysisText}>{texteAnalyse.synthese}</Text>
            </View>

            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: BLACK, marginBottom: 8, marginTop: 12 }}>
              Points forts identifiés
            </Text>
            {texteAnalyse.pointsForts.map((p, i) => (
              <View key={i} style={s.actionRow}>
                <View style={[s.actionBullet, { backgroundColor: "#f0fff4" }]}>
                  <Text style={[s.actionBulletText, { color: "#16a34a" }]}>✓</Text>
                </View>
                <Text style={{ fontSize: 9, color: BLACK, flex: 1, lineHeight: 1.5 }}>{p}</Text>
              </View>
            ))}

            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: BLACK, marginBottom: 8, marginTop: 12 }}>
              Axes d'amélioration
            </Text>
            {texteAnalyse.pointsAmelioration.map((p, i) => (
              <View key={i} style={s.actionRow}>
                <View style={s.actionBullet}>
                  <Text style={s.actionBulletText}>{i + 1}</Text>
                </View>
                <Text style={{ fontSize: 9, color: BLACK, flex: 1, lineHeight: 1.5 }}>{p}</Text>
              </View>
            ))}

            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: BLACK, marginBottom: 8, marginTop: 12 }}>
              Recommandations pour la prochaine session
            </Text>
            {texteAnalyse.recommandations.map((r, i) => (
              <View key={i} style={s.actionRow}>
                <View style={[s.actionBullet, { backgroundColor: "#eff6ff" }]}>
                  <Text style={[s.actionBulletText, { color: "#2563eb" }]}>{i + 1}</Text>
                </View>
                <Text style={{ fontSize: 9, color: BLACK, flex: 1, lineHeight: 1.5 }}>{r}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={{ fontSize: 9, color: GRAY, lineHeight: 1.65 }}>
            {n === 0
              ? "Aucun questionnaire de satisfaction n'a encore été complété pour cette formation."
              : `Sur ${n} participants ayant répondu, la note globale est de ${moyGlobal.toFixed(1)}/5. ` +
                `${Math.round(tauxObjectifs)}% estiment que les objectifs pédagogiques ont été atteints. ` +
                `${Math.round(tauxRecommande)}% recommanderaient cette formation à leurs confrères.`}
          </Text>
        )}

        {/* Commentaires texte libres */}
        {reponses.some((r) => r.pointsForts || r.pointsAmelioration || r.commentaireLibre) && (
          <>
            <Text style={base.sectionTitle}>Verbatims participants (extraits)</Text>
            {reponses
              .filter((r) => r.pointsForts || r.commentaireLibre)
              .slice(0, 5)
              .map((r, i) => (
                <View key={i} style={{ marginBottom: 8, borderLeftWidth: 2, borderLeftColor: LIGHT_GRAY, paddingLeft: 8 }}>
                  {r.pointsForts && (
                    <Text style={{ fontSize: 8, color: GRAY, fontFamily: "Helvetica-Oblique" }}>
                      « {r.pointsForts} »
                    </Text>
                  )}
                  {r.commentaireLibre && (
                    <Text style={{ fontSize: 8, color: GRAY, fontFamily: "Helvetica-Oblique", marginTop: 2 }}>
                      « {r.commentaireLibre} »
                    </Text>
                  )}
                </View>
              ))}
          </>
        )}

        {/* Contenu rédigé par le formateur */}
        {(formation.bilanResume || formation.bilanRecommandations || formation.bilanPointsForts) && (
          <>
            <Text style={base.sectionTitle}>Synthèse du formateur</Text>
            {formation.bilanResume && (
              <View style={s.analysisBox}>
                <Text style={s.analysisTitle}>Résumé</Text>
                <Text style={s.analysisText}>{formation.bilanResume}</Text>
              </View>
            )}
            {formation.bilanPointsForts && (
              <View style={s.analysisBox}>
                <Text style={s.analysisTitle}>Points forts</Text>
                <Text style={s.analysisText}>{formation.bilanPointsForts}</Text>
              </View>
            )}
            {formation.bilanRecommandations && (
              <View style={s.analysisBox}>
                <Text style={s.analysisTitle}>Recommandations</Text>
                <Text style={s.analysisText}>{formation.bilanRecommandations}</Text>
              </View>
            )}
          </>
        )}

        {/* Signature */}
        <Text style={base.sectionTitle}>Validation</Text>
        <View style={{ flexDirection: "row", gap: 20, marginTop: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>Le formateur</Text>
            <Text style={{ fontSize: 8, color: GRAY, marginBottom: 8 }}>{formateur.titre ? `${formateur.titre} ` : ""}{formateur.nom}</Text>
            <View style={{ borderWidth: 1, borderColor: LIGHT_GRAY, borderRadius: 6, height: 80, padding: 8, justifyContent: "flex-end", marginBottom: 6 }}>
              {formation.bilanSigne ? (
                formation.signatureFormateurBase64
                  ? <Image src={formation.signatureFormateurBase64} style={{ width: "100%", height: 50, objectFit: "contain" }} />
                  : <View style={{ flex: 1 }} />
              ) : (
                <Text style={{ fontSize: 8, color: GRAY }}>Signature à apposer</Text>
              )}
            </View>
            {formation.bilanSigne && (
              <>
                <Text style={{ fontSize: 10, fontFamily: "Times-BoldItalic", color: BLACK, marginTop: 4 }}>
                  {formation.formateurNomComplet ?? formateur.nom}
                </Text>
                <Text style={{ fontSize: 7, color: "#1565c0", marginTop: 2 }}>
                  Signé le {formation.bilanSigneAt ? (new Date(formation.bilanSigneAt).toLocaleDateString("fr-FR") + " à " + new Date(formation.bilanSigneAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })) : ""}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Certification numérique */}
        {formation.bilanSigne && formation.bilanSigneAt && (
          <View style={{ marginTop: 12, padding: 8, backgroundColor: "#f8f9ff", borderRadius: 4, borderWidth: 1, borderColor: "#dde3f5" }}>
            <Text style={{ fontSize: 7, color: "#1565c0", fontFamily: "Helvetica-Bold" }}>◆ Document certifié numériquement</Text>
            <Text style={{ fontSize: 7, color: GRAY, marginTop: 2 }}>
              Horodatage : {new Date(formation.bilanSigneAt).toLocaleString("fr-FR")} · Formation ID : {formation.id.slice(0, 12).toUpperCase()} · Ce document est un original numérique non modifiable.
            </Text>
          </View>
        )}

        <View style={base.footer} fixed>
          <Text style={base.footerText}>{company.raisonSociale} — Bilan pédagogique confidentiel</Text>
          <Text style={base.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
        </View>
      </Page>
    </Document>
  );
}
