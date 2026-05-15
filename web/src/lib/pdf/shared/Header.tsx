import React from "react";
import { View, Text } from "@react-pdf/renderer";
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

export function PdfHeader({
  company,
  docLabel,
}: {
  company: CompanyInfo;
  docLabel?: string;
}) {
  return (
    <View style={base.header}>
      <View style={base.headerLeft}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={base.logoMark}>
            <Text style={{ color: "white", fontSize: 13, fontFamily: "Helvetica-Bold" }}>M</Text>
          </View>
          <View>
            <Text style={base.logoText}>{company.raisonSociale}</Text>
            <Text style={base.logoSub}>Organisme de formation</Text>
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
