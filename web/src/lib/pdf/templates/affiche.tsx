import React from "react";
import {
  Document, Page, View, Text, Image, Svg, Defs, LinearGradient, Stop, Rect,
} from "@react-pdf/renderer";
import type { CompanyData, FormateurData, FormationData } from "../shared/types";

const WHITE = "#FFFFFF";
const BLACK = "#0F0F0F";
const GRAY  = "#6A6A6A";

const COLORS: Record<string, { main: string; dark: string }> = {
  red:    { main: "#C8102E", dark: "#8b0000" },
  blue:   { main: "#1565c0", dark: "#0d3a7a" },
  green:  { main: "#2e7d32", dark: "#1b4f1e" },
  yellow: { main: "#f57f17", dark: "#bf5000" },
  purple: { main: "#6a1b9a", dark: "#3f0066" },
};

function initials(name: string) {
  return name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}
function truncate(s: string, max: number) {
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
}

interface Props {
  company:         CompanyData;
  formateur:       FormateurData;
  formation:       FormationData;
  registrationUrl: string;
  imageBase64?:    string | null;
  infoPratiques?:  string | null;
  couleur?:        string | null;
  qrCodeDataUrl?:  string | null;
}

export function AffichePdf({
  company, formateur, formation, registrationUrl,
  imageBase64, infoPratiques, couleur, qrCodeDataUrl,
}: Props) {
  const col  = COLORS[couleur ?? "red"] ?? COLORS.red;
  const prog = (formation.programme ?? []).slice(0, 7);
  const desc = truncate(formation.description ?? "", 320);
  const bio  = (formateur as FormateurData & { bio?: string }).bio
    ? truncate((formateur as FormateurData & { bio?: string }).bio!, 200)
    : null;
  const infos     = infoPratiques ?? null;
  const prixNum   = Number(formation.prixHT);
  const objectifs = (formation.objectifs ?? []).slice(0, 4);

  return (
    <Document title={`Affiche — ${formation.titre}`} author={company.raisonSociale}>
      <Page size="A4" style={{ fontFamily: "Helvetica", fontSize: 9, color: BLACK, backgroundColor: WHITE, flexDirection: "column" }}>

        {/* ── HERO ────────────────────────────────────────────── */}
        <View style={{ height: 168, width: "100%", overflow: "hidden", position: "relative" }}>
          {imageBase64 ? (
            <View style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 168 }}>
              <Image
                src={imageBase64}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 168 }}
              />
              <View style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 168, backgroundColor: "#000000", opacity: 0.5 }} />
            </View>
          ) : (
            <Svg width="595" height="168" style={{ position: "absolute", top: 0, left: 0 }}>
              <Defs>
                <LinearGradient id="hgrad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor={col.dark} stopOpacity="1" />
                  <Stop offset="100%" stopColor={col.main} stopOpacity="1" />
                </LinearGradient>
              </Defs>
              <Rect width="595" height="168" fill="url(#hgrad)" />
            </Svg>
          )}
          <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, paddingBottom: 18, paddingLeft: 28, paddingRight: 28 }}>
            <Text style={{ fontSize: 7, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6, fontFamily: "Helvetica-Bold" }}>
              {formation.specialite ?? ""}
            </Text>
            <Text style={{ fontSize: 24, fontFamily: "Helvetica-Bold", color: WHITE, lineHeight: 1.1 }}>
              {truncate(formation.titre, 80)}
            </Text>
          </View>
        </View>

        {/* ── INFO GRID ─────────────────────────────────────── */}
        <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E0E0E0", borderTopWidth: 1, borderTopColor: "#E0E0E0", height: 56 }}>
          {[
            {
              label: "Date",
              val: new Date(formation.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" }),
              sub: String(new Date(formation.date).getFullYear()),
              color: col.main,
            },
            {
              label: "Horaires",
              val: formation.heureDebut,
              sub: `fin ${formation.heureFin} (${formation.dureeHeures}h)`,
              color: BLACK,
            },
            {
              label: "Lieu",
              val: truncate(formation.lieuNom ?? formation.lieuVille ?? "A definir", 22),
              sub: formation.lieuNom ? (formation.lieuVille ?? "") : "",
              color: "#1565c0",
            },
            {
              label: "Places",
              val: String(formation.placesRestantes),
              sub: `sur ${formation.placesTotal}`,
              color: "#2e7d32",
            },
          ].map((item, i, arr) => (
            <View key={i} style={{
              flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 8,
              borderRightWidth: i < arr.length - 1 ? 1 : 0, borderRightColor: "#E0E0E0",
            }}>
              <View style={{ width: 12, height: 3, backgroundColor: item.color, borderRadius: 2, marginBottom: 5 }} />
              <Text style={{ fontSize: 7, color: GRAY, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3, fontFamily: "Helvetica-Bold" }}>
                {item.label}
              </Text>
              <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: BLACK }}>{item.val}</Text>
              {item.sub ? (
                <Text style={{ fontSize: 8, color: GRAY, marginTop: 1 }}>{item.sub}</Text>
              ) : (
                <View style={{ height: 0 }} />
              )}
            </View>
          ))}
        </View>

        {/* ── FORMATEUR ─────────────────────────────────────── */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 28, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#E0E0E0", backgroundColor: "#FAFAFA" }}>
          <View style={{ width: 38, height: 38, borderRadius: 100, backgroundColor: col.main, alignItems: "center", justifyContent: "center", marginRight: 14, flexShrink: 0 }}>
            <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold", color: WHITE }}>{initials(formateur.nom)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 7, color: GRAY, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Intervenant</Text>
            <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: BLACK }}>
              {formateur.titre ? `${formateur.titre} ` : ""}{formateur.nom}{formateur.specialite ? ` — ${formateur.specialite}` : ""}
            </Text>
            {bio ? (
              <Text style={{ fontSize: 8, color: GRAY, marginTop: 2, lineHeight: 1.4 }}>{bio}</Text>
            ) : (
              <View style={{ height: 0 }} />
            )}
          </View>
          {formateur.rpps ? (
            <Text style={{ fontSize: 7, color: GRAY }}>RPPS {formateur.rpps}</Text>
          ) : (
            <View style={{ height: 0 }} />
          )}
        </View>

        {/* ── CONTENT (flex: 1 fills remaining page) ────────── */}
        <View style={{ flex: 1, flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E0E0E0" }}>

          {/* LEFT — Programme */}
          <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: "#EBEBEB", paddingHorizontal: 20, paddingVertical: 12 }}>
            <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: GRAY, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>
              Programme
            </Text>
            {prog.length > 0 ? (
              <View>
                {prog.map((slot, i) => (
                  <View key={i} style={{ flexDirection: "row", marginBottom: 6, paddingBottom: 6, borderBottomWidth: i < prog.length - 1 ? 1 : 0, borderBottomColor: "#F0F0F0" }}>
                    <Text style={{ fontSize: 8, color: col.main, fontFamily: "Helvetica-Bold", width: 36, flexShrink: 0 }}>{slot.heure ?? ""}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: BLACK }}>{truncate(slot.titre ?? "", 60)}</Text>
                      {slot.description ? (
                        <Text style={{ fontSize: 7, color: GRAY, marginTop: 1, lineHeight: 1.4 }}>{truncate(slot.description, 80)}</Text>
                      ) : (
                        <View style={{ height: 0 }} />
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ fontSize: 8, color: GRAY }}>Programme en cours de finalisation.</Text>
            )}
          </View>

          {/* RIGHT — Description + objectifs + infos pratiques */}
          <View style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 12 }}>
            <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: GRAY, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>
              A propos
            </Text>
            <Text style={{ fontSize: 8, color: BLACK, lineHeight: 1.6, marginBottom: 8 }}>
              {desc}
            </Text>
            {objectifs.length > 0 ? (
              <View>
                <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: GRAY, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>
                  Objectifs
                </Text>
                {objectifs.map((obj, i) => (
                  <View key={i} style={{ flexDirection: "row", marginBottom: 3 }}>
                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: col.main, marginTop: 3, marginRight: 5, flexShrink: 0 }} />
                    <Text style={{ fontSize: 7.5, color: BLACK, flex: 1, lineHeight: 1.5 }}>{truncate(obj, 90)}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ height: 0 }} />
            )}
            {infos ? (
              <View style={{ marginTop: 8, backgroundColor: "#F5F5F5", borderRadius: 4, padding: 8 }}>
                <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: GRAY, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
                  Infos pratiques
                </Text>
                <Text style={{ fontSize: 7.5, color: BLACK, lineHeight: 1.5 }}>{infos}</Text>
              </View>
            ) : (
              <View style={{ height: 0 }} />
            )}
          </View>
        </View>

        {/* ── PRICE + QR ────────────────────────────────────── */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 28, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#E0E0E0" }}>
          <View style={{ backgroundColor: col.main, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, alignItems: "center", minWidth: 100, marginRight: 16 }}>
            <Text style={{ fontSize: 20, fontFamily: "Helvetica-Bold", color: WHITE }}>
              {prixNum === 0 ? "Gratuit" : `${prixNum.toFixed(0)} EUR`}
            </Text>
            {prixNum > 0 ? (
              <Text style={{ fontSize: 7, color: "rgba(255,255,255,0.75)", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.8 }}>HT par participant</Text>
            ) : (
              <View style={{ height: 0 }} />
            )}
            {formation.exonerationTVA ? (
              <Text style={{ fontSize: 6.5, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>TVA exoneree</Text>
            ) : (
              <View style={{ height: 0 }} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: BLACK, marginBottom: 3 }}>Inscription en ligne</Text>
            <Text style={{ fontSize: 7.5, color: GRAY, marginBottom: 3 }}>{registrationUrl}</Text>
            <Text style={{ fontSize: 7, color: GRAY }}>Paiement securise · Places limitees · Attestation remise sous 24h</Text>
          </View>
          {qrCodeDataUrl ? (
            <View style={{ alignItems: "center", marginLeft: 16 }}>
              <Image src={qrCodeDataUrl} style={{ width: 68, height: 68 }} />
              <Text style={{ fontSize: 6.5, color: GRAY, marginTop: 3, textAlign: "center" }}>Scanner pour s'inscrire</Text>
            </View>
          ) : (
            <View style={{ width: 68, height: 68, borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 4, alignItems: "center", justifyContent: "center", marginLeft: 16 }}>
              <Text style={{ fontSize: 7, color: GRAY, textAlign: "center" }}>QR Code</Text>
            </View>
          )}
        </View>

        {/* ── FOOTER ────────────────────────────────────────── */}
        <View style={{ backgroundColor: BLACK, paddingHorizontal: 28, paddingVertical: 7, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 7.5, color: "rgba(255,255,255,0.6)" }}>{company.raisonSociale}</Text>
          <Text style={{ fontSize: 7, color: "rgba(255,255,255,0.35)" }}>
            {company.numeroDeclaration ? `N decl. : ${company.numeroDeclaration}` : ""}
            {company.siteWeb ? `  ·  ${company.siteWeb}` : ""}
          </Text>
        </View>

      </Page>
    </Document>
  );
}
