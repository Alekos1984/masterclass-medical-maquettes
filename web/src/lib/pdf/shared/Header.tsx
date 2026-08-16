import React from "react";
import { View, Text, Image } from "@react-pdf/renderer";
import { base, RED, GRAY } from "./styles";

interface CompanyInfo {
  raisonSociale: string;
  siret?: string | null;
  numeroDeclaration?: string | null;
  adresse?: string | null;
  codePostal?: string | null;
  ville?: string | null;
  email?: string | null;
}

/** Marque blanche : nom + logo de l'organisation qui délivre l'enseignement */
export type BrandingInfo = {
  orgNom?: string | null;
  orgLogoBase64?: string | null; // dataURI ou base64 brut
  masquerMM?: boolean; // supprime toute mention MM
};

function normalizeLogo(src: string): string {
  if (src.startsWith("data:")) return src;
  return `data:image/png;base64,${src}`;
}

export function PdfHeader({
  company,
  docLabel,
  branding,
}: {
  company: CompanyInfo;
  docLabel?: string;
  branding?: BrandingInfo;
}) {
  const marqueBlanche = branding?.orgNom || branding?.orgLogoBase64;
  return (
    <View style={base.header}>
      <View style={base.headerLeft}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {marqueBlanche && branding?.orgLogoBase64 ? (
            <Image src={normalizeLogo(branding.orgLogoBase64)} style={{ width: 36, height: 36, objectFit: "contain" }} />
          ) : (
            <View style={base.logoMark}>
              <Text style={{ color: "white", fontSize: 13, fontFamily: "Helvetica-Bold" }}>M</Text>
            </View>
          )}
          <View>
            <Text style={base.logoText}>{marqueBlanche ? (branding?.orgNom ?? company.raisonSociale) : company.raisonSociale}</Text>
            {!marqueBlanche && <Text style={base.logoSub}>Masterclass Médical</Text>}
          </View>
        </View>
      </View>
      <View style={base.headerRight}>
        <Text style={base.companyInfo}>
          {[company.adresse, `${company.codePostal ?? ""} ${company.ville ?? ""}`.trim()]
            .filter(Boolean)
            .join("\n")}
        </Text>
        {company.email && (
          <Text style={{ ...base.companyInfo, marginTop: 2 }}>{company.email}</Text>
        )}
        {company.siret && (
          <Text style={{ ...base.companyInfo, marginTop: 2 }}>SIRET {company.siret}</Text>
        )}
        {company.numeroDeclaration && (
          <View style={base.declarationBadge}>
            <Text>N° déclaration activité : {company.numeroDeclaration}</Text>
          </View>
        )}
        {docLabel && (
          <Text style={{ fontSize: 8, color: RED, marginTop: 6, fontFamily: "Helvetica-Bold" }}>
            {docLabel}
          </Text>
        )}
      </View>
    </View>
  );
}

/** Pied de page marque blanche : "Avec l'aide de MM" en tout petit à droite */
export function PdfMMFootnote({ company, branding }: { company: CompanyInfo; branding?: BrandingInfo }) {
  if (branding?.masquerMM) return null;
  // Sans branding org, on ne montre rien : le pied normal (docFooter) affiche déjà MM
  if (!branding?.orgNom && !branding?.orgLogoBase64) return null;
  return (
    <View style={{ position: "absolute", right: 32, bottom: 18, flexDirection: "row", alignItems: "center", gap: 4 }} fixed>
      <View>
        <Text style={{ fontSize: 5, color: GRAY, textAlign: "right" }}>Avec l&apos;aide de</Text>
        <Text style={{ fontSize: 7, color: GRAY, fontFamily: "Helvetica-Bold", textAlign: "right" }}>{company.raisonSociale}</Text>
      </View>
      <View style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: RED, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "white", fontSize: 8, fontFamily: "Helvetica-Bold" }}>M</Text>
      </View>
    </View>
  );
}
