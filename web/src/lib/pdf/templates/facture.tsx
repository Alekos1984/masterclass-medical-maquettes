import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader } from "../shared/Header";
import { base, RED, GRAY, LIGHT_GRAY, OFF_WHITE, BLACK } from "../shared/styles";
import type { CompanyData, FormateurData, FormationData, ParticipantData, PaiementData } from "../shared/types";

const s = StyleSheet.create({
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BLACK,
    borderRadius: 4,
    padding: 10,
    marginTop: 12,
  },
  tableHeaderText: { color: "white", fontSize: 8, fontFamily: "Helvetica-Bold" },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  col1: { flex: 3 },
  col2: { width: 60, textAlign: "right" },
  col3: { width: 70, textAlign: "right" },
  col4: { width: 70, textAlign: "right" },
  totalsBox: {
    marginTop: 12,
    alignItems: "flex-end",
  },
  totalRow: { flexDirection: "row", marginBottom: 4 },
  totalLabel: { width: 120, fontSize: 9, color: GRAY, textAlign: "right" },
  totalValue: { width: 80, fontSize: 9, color: BLACK, textAlign: "right" },
  totalRowBig: {
    flexDirection: "row",
    backgroundColor: BLACK,
    borderRadius: 4,
    padding: 10,
    marginTop: 8,
  },
  totalLabelBig: { flex: 1, fontSize: 11, color: "white", fontFamily: "Helvetica-Bold", textAlign: "right" },
  totalValueBig: { width: 80, fontSize: 11, color: "white", fontFamily: "Helvetica-Bold", textAlign: "right" },
  mentionBox: {
    backgroundColor: OFF_WHITE,
    borderRadius: 6,
    padding: 12,
    marginTop: 24,
  },
  mentionText: { fontSize: 8, color: GRAY, lineHeight: 1.6 },
  billTo: {
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
  },
});

interface Props {
  company: CompanyData;
  formateur: FormateurData;
  formation: FormationData;
  participant: ParticipantData;
  paiement: PaiementData;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export function FacturePdf({ company, formateur, formation, participant, paiement }: Props) {
  const tva = formation.exonerationTVA ? 0 : paiement.montantHT * 0.2;
  const ttc = paiement.montantHT + tva;
  const numFacture = paiement.numeroFacture ?? `FACT-${paiement.id.slice(0, 8).toUpperCase()}`;

  return (
    <Document title={`Facture ${numFacture}`} author={company.raisonSociale}>
      <Page size="A4" style={base.page}>
        <PdfHeader company={company} docLabel="FACTURE" />

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 24 }}>
          <View>
            <Text style={base.docTitle}>Facture</Text>
            <Text style={[base.docSubtitle, { marginBottom: 0 }]}>N° {numFacture}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <View style={{ backgroundColor: OFF_WHITE, borderRadius: 6, padding: 12, alignItems: "flex-end" }}>
              <Text style={{ fontSize: 8, color: GRAY }}>Date d'émission</Text>
              <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: BLACK, marginTop: 2 }}>
                {paiement.datePaiement ? formatDate(paiement.datePaiement) : formatDate(new Date().toISOString())}
              </Text>
              <Text style={{ fontSize: 8, color: GRAY, marginTop: 8 }}>Statut</Text>
              <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: "#16a34a", marginTop: 2 }}>PAYÉE</Text>
            </View>
          </View>
        </View>

        {/* Émetteur + Destinataire */}
        <View style={{ flexDirection: "row", gap: 16, marginBottom: 24 }}>
          <View style={{ flex: 1 }}>
            <Text style={base.sectionTitle}>Émetteur</Text>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: BLACK }}>{company.raisonSociale}</Text>
            {company.adresse && <Text style={{ fontSize: 9, color: GRAY, lineHeight: 1.5 }}>{company.adresse}</Text>}
            {(company.codePostal || company.ville) && (
              <Text style={{ fontSize: 9, color: GRAY }}>{company.codePostal} {company.ville}</Text>
            )}
            {company.siret && <Text style={{ fontSize: 9, color: GRAY, marginTop: 4 }}>SIRET {company.siret}</Text>}
            {company.numeroDeclaration && (
              <Text style={{ fontSize: 9, color: GRAY }}>N° déclaration activité : {company.numeroDeclaration}</Text>
            )}
            {company.email && <Text style={{ fontSize: 9, color: GRAY }}>{company.email}</Text>}
          </View>
          <View style={[s.billTo, { flex: 1 }]}>
            <Text style={base.sectionTitle}>Facturé à</Text>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: BLACK }}>
              {participant.titre ? `${participant.titre} ` : ""}{participant.nom}
            </Text>
            {participant.specialite && <Text style={{ fontSize: 9, color: GRAY }}>{participant.specialite}</Text>}
            {participant.rpps && <Text style={{ fontSize: 9, color: GRAY }}>RPPS {participant.rpps}</Text>}
            <Text style={{ fontSize: 9, color: GRAY, marginTop: 4 }}>{participant.email}</Text>
            {participant.adresse && <Text style={{ fontSize: 9, color: GRAY, marginTop: 4 }}>{participant.adresse}</Text>}
            {(participant.codePostal || participant.ville) && (
              <Text style={{ fontSize: 9, color: GRAY }}>{participant.codePostal} {participant.ville}</Text>
            )}
          </View>
        </View>

        {/* Table */}
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, s.col1]}>Description</Text>
          <Text style={[s.tableHeaderText, s.col2]}>Qté</Text>
          <Text style={[s.tableHeaderText, s.col3]}>Prix unit. HT</Text>
          <Text style={[s.tableHeaderText, s.col4]}>Montant HT</Text>
        </View>
        <View style={s.tableRow}>
          <View style={s.col1}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: BLACK }}>{formation.titre}</Text>
            <Text style={{ fontSize: 8, color: GRAY, marginTop: 2 }}>
              Formation professionnelle continue — {formatDate(formation.date)}
              {"\n"}{formation.dureeHeures}h — {formation.lieuVille ?? "En ligne"}
            </Text>
          </View>
          <Text style={[{ fontSize: 9, color: BLACK }, s.col2]}>1</Text>
          <Text style={[{ fontSize: 9, color: BLACK }, s.col3]}>{paiement.montantHT.toFixed(2)} €</Text>
          <Text style={[{ fontSize: 9, color: BLACK }, s.col4]}>{paiement.montantHT.toFixed(2)} €</Text>
        </View>

        {/* Totals */}
        <View style={s.totalsBox}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Sous-total HT</Text>
            <Text style={s.totalValue}>{paiement.montantHT.toFixed(2)} €</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>
              {formation.exonerationTVA ? "TVA (exonérée)" : "TVA 20%"}
            </Text>
            <Text style={s.totalValue}>{tva.toFixed(2)} €</Text>
          </View>
          <View style={s.totalRowBig}>
            <Text style={s.totalLabelBig}>TOTAL TTC</Text>
            <Text style={s.totalValueBig}>{ttc.toFixed(2)} €</Text>
          </View>
        </View>

        {/* Legal mentions */}
        <View style={s.mentionBox}>
          <Text style={s.mentionText}>
            {formation.exonerationTVA
              ? "TVA non applicable — exonération en application de l'article 261-4-4° du Code Général des Impôts."
              : ""}
            {"\n"}Paiement reçu par carte bancaire via Stripe. Aucun escompte pour paiement anticipé.
            {"\n"}{company.raisonSociale} — {company.siret ? `SIRET ${company.siret}` : ""}{company.numeroDeclaration ? ` — N° déclaration activité ${company.numeroDeclaration}` : ""}
          </Text>
        </View>

        <View style={base.footer} fixed>
          <Text style={base.footerText}>Facture {numFacture} — {company.raisonSociale}</Text>
          <Text style={base.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
        </View>
      </Page>
    </Document>
  );
}
