import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader } from "../shared/Header";
import { base, GRAY, LIGHT_GRAY, OFF_WHITE, BLACK, RED } from "../shared/styles";
import type { CompanyData, FormateurData, FormationData, ParticipantData, InscriptionData } from "../shared/types";

const s = StyleSheet.create({
  partiesGrid: { flexDirection: "row", gap: 12, marginBottom: 12 },
  partieCard: { flex: 1, borderWidth: 1, borderColor: LIGHT_GRAY, borderRadius: 6, padding: 12 },
  partieCardTitle: { fontSize: 8, color: RED, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  articleTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: BLACK, marginTop: 16, marginBottom: 6 },
  articleText: { fontSize: 9, color: BLACK, lineHeight: 1.65 },
  signatureGrid: { flexDirection: "row", gap: 20, marginTop: 32 },
  signatureBlock: { flex: 1 },
  signatureBoxBig: {
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    borderRadius: 6,
    padding: 12,
    height: 72,
    justifyContent: "flex-end",
    marginBottom: 6,
  },
  refBox: {
    backgroundColor: OFF_WHITE,
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  refLabel: { fontSize: 8, color: GRAY },
  refValue: { fontSize: 8, color: BLACK, fontFamily: "Helvetica-Bold" },
});

interface SignatureState {
  formateurSignedAt?: string | null;
  participantSignedAt?: string | null;
  seal?: string | null;
}

interface Props {
  company: CompanyData;
  formateur: FormateurData;
  formation: FormationData;
  participant: ParticipantData;
  inscription: InscriptionData;
  signatures?: SignatureState;
}

function safeDateTime(d: string): string {
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return d;
  return parsed.toLocaleString("fr-FR");
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function ConventionPdf({ company, formateur, formation, participant, inscription, signatures }: Props) {
  const refNum = `CONV-${inscription.id.slice(0, 8).toUpperCase()}`;
  const bothSigned = !!(signatures?.formateurSignedAt && signatures?.participantSignedAt);
  const formateurSigned = !!signatures?.formateurSignedAt;
  const participantSigned = !!signatures?.participantSignedAt;
  const isGratuite = inscription.montantHT === 0;

  return (
    <Document title={`Convention — ${formation.titre}`} author={company.raisonSociale}>
      <Page size="A4" style={base.page}>
        <PdfHeader company={company} docLabel="CONVENTION DE FORMATION PROFESSIONNELLE" />

        <Text style={base.docTitle}>Convention individuelle de formation</Text>
        <Text style={base.docSubtitle}>
          Établie conformément à la loi n° 2018-771 du 5 septembre 2018 pour la liberté de choisir son avenir professionnel
        </Text>

        {/* Référence */}
        <View style={s.refBox}>
          <Text style={s.refLabel}>Référence convention</Text>
          <Text style={s.refValue}>{refNum}</Text>
          <Text style={s.refLabel}>Date d'émission</Text>
          <Text style={s.refValue}>{formatDate(new Date().toISOString())}</Text>
        </View>

        {/* Parties */}
        <Text style={base.sectionTitle}>Entre les parties</Text>
        <View style={s.partiesGrid}>
          <View style={s.partieCard}>
            <Text style={s.partieCardTitle}>Le formateur</Text>
            <View style={base.infoRow}>
              <Text style={base.infoLabel}>Nom</Text>
              <Text style={base.infoValue}>{formateur.titre ? `${formateur.titre} ` : ""}{formateur.nom}</Text>
            </View>
            {formateur.specialite ? (
              <View style={base.infoRow}>
                <Text style={base.infoLabel}>Specialite</Text>
                <Text style={base.infoValue}>{formateur.specialite}</Text>
              </View>
            ) : <View style={{ height: 0 }} />}
            {formateur.rpps ? (
              <View style={base.infoRow}>
                <Text style={base.infoLabel}>N° RPPS</Text>
                <Text style={base.infoValue}>{formateur.rpps}</Text>
              </View>
            ) : <View style={{ height: 0 }} />}
            {formateur.raisonSociale ? (
              <View style={base.infoRow}>
                <Text style={base.infoLabel}>Raison sociale</Text>
                <Text style={base.infoValue}>{formateur.raisonSociale}</Text>
              </View>
            ) : <View style={{ height: 0 }} />}
            {formateur.email ? (
              <View style={base.infoRow}>
                <Text style={base.infoLabel}>Email</Text>
                <Text style={base.infoValue}>{formateur.email}</Text>
              </View>
            ) : <View style={{ height: 0 }} />}
          </View>
          <View style={s.partieCard}>
            <Text style={s.partieCardTitle}>Le stagiaire</Text>
            <View style={base.infoRow}>
              <Text style={base.infoLabel}>Nom</Text>
              <Text style={base.infoValue}>{participant.titre ? `${participant.titre} ` : ""}{participant.nom}</Text>
            </View>
            {participant.specialite ? (
              <View style={base.infoRow}>
                <Text style={base.infoLabel}>Specialite</Text>
                <Text style={base.infoValue}>{participant.specialite}</Text>
              </View>
            ) : <View style={{ height: 0 }} />}
            {participant.rpps ? (
              <View style={base.infoRow}>
                <Text style={base.infoLabel}>N° RPPS</Text>
                <Text style={base.infoValue}>{participant.rpps}</Text>
              </View>
            ) : <View style={{ height: 0 }} />}
            <View style={base.infoRow}>
              <Text style={base.infoLabel}>Email</Text>
              <Text style={base.infoValue}>{participant.email}</Text>
            </View>
            {participant.adresse ? (
              <View style={base.infoRow}>
                <Text style={base.infoLabel}>Adresse</Text>
                <Text style={base.infoValue}>{participant.adresse}, {participant.codePostal} {participant.ville}</Text>
              </View>
            ) : <View style={{ height: 0 }} />}
          </View>
        </View>

        {/* Articles */}
        <Text style={s.articleTitle}>Article 1 — Objet</Text>
        <Text style={s.articleText}>
          La présente convention a pour objet la participation de {participant.nom} a la formation intitulee «{" "}
          {formation.titre} », dispensee par {formateur.titre ? `${formateur.titre} ` : ""}{formateur.nom}{formateur.specialite ? `, ${formateur.specialite}` : ""}.
        </Text>

        <Text style={s.articleTitle}>Article 2 — Nature et duree de la formation</Text>
        <View style={base.infoRow}>
          <Text style={base.infoLabel}>Intitule</Text>
          <Text style={base.infoValue}>{formation.titre}</Text>
        </View>
        <View style={base.infoRow}>
          <Text style={base.infoLabel}>Date</Text>
          <Text style={base.infoValue}>{formatDate(formation.date)} — {formation.heureDebut} a {formation.heureFin}</Text>
        </View>
        <View style={base.infoRow}>
          <Text style={base.infoLabel}>Duree</Text>
          <Text style={base.infoValue}>{formation.dureeHeures} heure(s)</Text>
        </View>
        <View style={base.infoRow}>
          <Text style={base.infoLabel}>Lieu</Text>
          <Text style={base.infoValue}>{formation.lieuNom ? `${formation.lieuNom}, ${formation.lieuVille ?? ""}` : "A confirmer"}</Text>
        </View>

        <Text style={s.articleTitle}>Article 3 — Programme et objectifs</Text>
        <Text style={s.articleText}>
          Les objectifs pedagogiques et le programme figure en annexe.{"\n"}Objectifs : {formation.objectifs.join(" ; ")}.
        </Text>

        <Text style={s.articleTitle}>Article 4 — Prix et modalites de reglement</Text>
        {isGratuite ? (
          <View>
            <View style={base.infoRow}>
              <Text style={base.infoLabel}>Tarif</Text>
              <Text style={[base.infoValue, { color: "#2e7d32", fontFamily: "Helvetica-Bold" }]}>FORMATION GRATUITE</Text>
            </View>
            <Text style={[s.articleText, { marginTop: 6 }]}>
              Cette formation est organisee a titre gratuit. Aucun reglement n'est requis.
            </Text>
          </View>
        ) : (
          <View>
            <View style={base.infoRow}>
              <Text style={base.infoLabel}>Montant HT</Text>
              <Text style={base.infoValue}>{inscription.montantHT.toFixed(2)} EUR</Text>
            </View>
            <View style={base.infoRow}>
              <Text style={base.infoLabel}>TVA</Text>
              <Text style={base.infoValue}>{formation.exonerationTVA ? "Exoneree — Art. 261-4-4° CGI" : "20%"}</Text>
            </View>
            <Text style={[s.articleText, { marginTop: 6 }]}>
              Le reglement est effectue en ligne par carte bancaire via la plateforme securisee Stripe.
            </Text>
          </View>
        )}

        <Text style={s.articleTitle}>Article 5 — Conditions d'annulation</Text>
        <Text style={s.articleText}>
          Toute annulation effectuee plus de 14 jours avant la date de la formation donne droit a un remboursement integral.
          En deca de ce delai, aucun remboursement ne sera effectue sauf cas de force majeure ou annulation par l'organisateur.
        </Text>

        <Text style={s.articleTitle}>Article 6 — Litiges</Text>
        <Text style={s.articleText}>
          En cas de litige, les parties s'engagent a rechercher une solution amiable avant tout recours juridictionnel.
        </Text>

        {/* Signatures */}
        <View style={s.signatureGrid}>
          <View style={s.signatureBlock}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>Le formateur</Text>
            <Text style={{ fontSize: 8, color: GRAY, marginBottom: 6 }}>
              {formateur.titre ? `${formateur.titre} ` : ""}{formateur.nom}
            </Text>
            {formateurSigned ? (
              <View style={{ borderWidth: 1, borderColor: "#2e7d32", borderRadius: 6, padding: 10, marginBottom: 6, backgroundColor: "#f0fdf4" }}>
                <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#2e7d32" }}>Signe numeriquement</Text>
                <Text style={{ fontSize: 7, color: GRAY, marginTop: 3 }}>
                  {safeDateTime(signatures!.formateurSignedAt!)}
                </Text>
              </View>
            ) : (
              <View style={s.signatureBoxBig}>
                <Text style={{ fontSize: 8, color: LIGHT_GRAY }}>En attente de signature</Text>
              </View>
            )}
          </View>
          <View style={s.signatureBlock}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>Le stagiaire</Text>
            <Text style={{ fontSize: 8, color: GRAY, marginBottom: 6 }}>
              {participant.nom} — Lu et approuve
            </Text>
            {participantSigned ? (
              <View style={{ borderWidth: 1, borderColor: "#2e7d32", borderRadius: 6, padding: 10, marginBottom: 6, backgroundColor: "#f0fdf4" }}>
                <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#2e7d32" }}>Signe numeriquement</Text>
                <Text style={{ fontSize: 7, color: GRAY, marginTop: 3 }}>
                  {safeDateTime(signatures!.participantSignedAt!)}
                </Text>
              </View>
            ) : (
              <View style={s.signatureBoxBig}>
                <Text style={{ fontSize: 8, color: LIGHT_GRAY }}>En attente de signature</Text>
              </View>
            )}
          </View>
        </View>

        {/* Sceau d'intégrité — visible uniquement si les deux ont signé */}
        {bothSigned && signatures?.seal ? (
          <View style={{ marginTop: 12, padding: 8, backgroundColor: "#f8f9ff", borderRadius: 4, borderWidth: 1, borderColor: "#dde3f5" }}>
            <Text style={{ fontSize: 7, color: "#1565c0", fontFamily: "Helvetica-Bold" }}>
              DOCUMENT CERTIFIE NUMERIQUEMENT — Integrite garantie HMAC-SHA-256
            </Text>
            <Text style={{ fontSize: 6, color: GRAY, marginTop: 3 }}>
              Formateur signe le : {new Date(signatures.formateurSignedAt!).toLocaleString("fr-FR")}
            </Text>
            <Text style={{ fontSize: 6, color: GRAY, marginTop: 2 }}>
              Stagiaire signe le : {new Date(signatures.participantSignedAt!).toLocaleString("fr-FR")}
            </Text>
            <Text style={{ fontSize: 6, color: "#444", marginTop: 2 }}>
              Sceau : {signatures.seal}
            </Text>
            <Text style={{ fontSize: 6, color: GRAY, marginTop: 2, fontFamily: "Helvetica-Oblique" }}>
              Ce sceau cryptographique est lie au contenu du document. Toute modification invalide ce sceau.
            </Text>
          </View>
        ) : <View style={{ height: 0 }} />}

        <View style={base.footer} fixed>
          <Text style={base.footerText}>{refNum} — {company.raisonSociale}</Text>
          <Text style={base.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
        </View>
      </Page>
    </Document>
  );
}
