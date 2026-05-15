import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader } from "../shared/Header";
import { base, RED, GRAY, LIGHT_GRAY, OFF_WHITE, BLACK } from "../shared/styles";
import type { CompanyData, FormationData } from "../shared/types";

const s = StyleSheet.create({
  question: { marginBottom: 16 },
  questionText: { fontSize: 10, fontFamily: "Helvetica-Bold", color: BLACK, marginBottom: 8 },
  scaleRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  scaleItem: { alignItems: "center", gap: 4 },
  scaleBox: {
    width: 32,
    height: 32,
    borderWidth: 1.5,
    borderColor: LIGHT_GRAY,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  scaleLabel: { fontSize: 7, color: GRAY },
  yesNoRow: { flexDirection: "row", gap: 16 },
  yesNoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    borderRadius: 6,
    padding: "8 16",
  },
  checkbox: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderColor: LIGHT_GRAY,
    borderRadius: 3,
  },
  textAreaBox: {
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    borderRadius: 6,
    height: 60,
    padding: 8,
    marginTop: 4,
  },
  divider: { height: 1, backgroundColor: LIGHT_GRAY, marginVertical: 12 },
  sectionBadge: {
    backgroundColor: OFF_WHITE,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionBadgeText: { fontSize: 9, fontFamily: "Helvetica-Bold", color: BLACK },
  anonymLabel: {
    backgroundColor: "#fff0f2",
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 12,
    fontSize: 8,
    color: RED,
    fontFamily: "Helvetica-Bold",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
});

interface Props {
  company: CompanyData;
  formation: FormationData;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function StarScale({ label }: { label: string }) {
  return (
    <View style={s.question}>
      <Text style={s.questionText}>{label}</Text>
      <View style={s.scaleRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <View key={n} style={s.scaleItem}>
            <View style={s.scaleBox}>
              <Text style={{ fontSize: 9, color: GRAY }}>{n}</Text>
            </View>
            <Text style={s.scaleLabel}>{n === 1 ? "Insuffisant" : n === 5 ? "Excellent" : ""}</Text>
          </View>
        ))}
        <Text style={{ fontSize: 8, color: GRAY, marginLeft: 8 }}>
          1 = Insuffisant · 5 = Excellent
        </Text>
      </View>
    </View>
  );
}

function YesNo({ label }: { label: string }) {
  return (
    <View style={s.question}>
      <Text style={s.questionText}>{label}</Text>
      <View style={s.yesNoRow}>
        <View style={s.yesNoBox}><View style={s.checkbox} /><Text style={{ fontSize: 9, color: BLACK }}>Oui</Text></View>
        <View style={s.yesNoBox}><View style={s.checkbox} /><Text style={{ fontSize: 9, color: BLACK }}>Non</Text></View>
        <View style={s.yesNoBox}><View style={s.checkbox} /><Text style={{ fontSize: 9, color: BLACK }}>Partiellement</Text></View>
      </View>
    </View>
  );
}

function TextArea({ label }: { label: string }) {
  return (
    <View style={s.question}>
      <Text style={s.questionText}>{label}</Text>
      <View style={s.textAreaBox} />
    </View>
  );
}

export function QuestionnairePdf({ company, formation }: Props) {
  return (
    <Document title={`Questionnaire satisfaction — ${formation.titre}`} author={company.raisonSociale}>
      <Page size="A4" style={base.page}>
        <PdfHeader company={company} docLabel="QUESTIONNAIRE DE SATISFACTION" />

        <Text style={base.docTitle}>Questionnaire de satisfaction</Text>
        <Text style={base.docSubtitle}>{formation.titre} — {formatDate(formation.date)}</Text>

        <Text style={s.anonymLabel}>Questionnaire anonyme</Text>

        {/* Section 1 */}
        <View style={s.sectionBadge}>
          <Text style={s.sectionBadgeText}>1. Contenu pédagogique</Text>
        </View>

        <StarScale label="La qualité globale du contenu de la formation" />
        <StarScale label="La pertinence des thèmes abordés par rapport à votre pratique" />
        <StarScale label="La clarté des objectifs pédagogiques" />
        <YesNo label="Les objectifs pédagogiques ont-ils été atteints ?" />

        <View style={s.divider} />

        {/* Section 2 */}
        <View style={s.sectionBadge}>
          <Text style={s.sectionBadgeText}>2. Qualité du formateur</Text>
        </View>

        <StarScale label="Les compétences et l'expertise du formateur" />
        <StarScale label="La pédagogie et la clarté des explications" />
        <StarScale label="La disponibilité du formateur pour répondre aux questions" />

        <View style={s.divider} />

        {/* Section 3 */}
        <View style={s.sectionBadge}>
          <Text style={s.sectionBadgeText}>3. Organisation</Text>
        </View>

        <StarScale label="L'organisation générale de la journée (horaires, pauses...)" />
        <StarScale label="La qualité du lieu et des équipements" />
        <StarScale label="Les supports de cours et documentations remis" />

        <View style={s.divider} />

        {/* Section 4 */}
        <View style={s.sectionBadge}>
          <Text style={s.sectionBadgeText}>4. Note globale et recommandation</Text>
        </View>

        <StarScale label="Votre satisfaction globale pour cette formation" />
        <YesNo label="Recommanderiez-vous cette formation à vos confrères ?" />

        <View style={s.divider} />

        {/* Open questions */}
        <View style={s.sectionBadge}>
          <Text style={s.sectionBadgeText}>5. Commentaires libres</Text>
        </View>

        <TextArea label="Points forts de la formation (ce qui vous a le plus apporté)" />
        <TextArea label="Points à améliorer (suggestions concrètes)" />
        <TextArea label="Commentaires libres / autres remarques" />

        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 8, color: GRAY }}>
            Merci pour votre participation. Ce questionnaire est strictement anonyme et confidentiel.
            Vos réponses nous permettent d'améliorer continuellement la qualité de nos formations.
          </Text>
        </View>

        <View style={base.footer} fixed>
          <Text style={base.footerText}>{company.raisonSociale} — Questionnaire de satisfaction (anonyme)</Text>
          <Text style={base.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
        </View>
      </Page>
    </Document>
  );
}
