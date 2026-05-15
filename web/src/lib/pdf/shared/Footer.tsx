import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { base } from "./styles";

export function PdfFooter({
  company,
  pageNumber,
  totalPages,
}: {
  company: { raisonSociale: string; siret?: string | null; siteWeb?: string | null };
  pageNumber?: number;
  totalPages?: number;
}) {
  return (
    <View style={base.footer} fixed>
      <Text style={base.footerText}>
        {company.raisonSociale}
        {company.siret ? ` — SIRET ${company.siret}` : ""}
        {company.siteWeb ? ` — ${company.siteWeb}` : ""}
      </Text>
      {pageNumber !== undefined && totalPages !== undefined && (
        <Text style={base.footerText}>
          {pageNumber} / {totalPages}
        </Text>
      )}
      <Text
        style={base.footerText}
        render={({ pageNumber: p, totalPages: t }) => `${p} / ${t}`}
        fixed
      />
    </View>
  );
}
