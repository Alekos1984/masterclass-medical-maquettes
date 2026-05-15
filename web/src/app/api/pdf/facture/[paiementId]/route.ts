import { NextRequest } from "next/server";
import React from "react";
import { renderPdf, pdfResponse } from "@/lib/pdf/render";
import { getCompanySettings, mapParticipant } from "@/lib/pdf/db-helpers";
import { FacturePdf } from "@/lib/pdf/templates/facture";
import { prisma } from "@/lib/prisma";
import type { FormationData, ProgrammeItem } from "@/lib/pdf/shared/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ paiementId: string }> }
) {
  const { paiementId } = await params;

  const [company, paiement] = await Promise.all([
    getCompanySettings(),
    prisma.paiement.findUnique({
      where: { id: paiementId },
      include: {
        inscription: {
          include: {
            participant: { include: { user: true } },
            formation: { include: { formateur: { include: { user: true } } } },
          },
        },
      },
    }),
  ]);

  if (!paiement?.inscription) return new Response("Paiement introuvable", { status: 404 });

  const { inscription } = paiement;
  const f = inscription.formation;
  const formation: FormationData = {
    id: f.id,
    titre: f.titre,
    specialite: f.specialite,
    description: f.description,
    objectifs: (f.objectifs as unknown as string[]) ?? [],
    programme: (f.programme as unknown as ProgrammeItem[]) ?? [],
    date: f.date.toISOString(),
    heureDebut: f.heureDebut,
    heureFin: f.heureFin,
    dureeHeures: f.dureeHeures,
    lieuNom: f.lieuNom,
    lieuAdresse: f.lieuAdresse,
    lieuVille: f.lieuVille,
    lieuSalle: f.lieuSalle,
    placesTotal: f.placesTotal,
    placesRestantes: f.placesRestantes,
    prixHT: Number(f.prixHT),
    exonerationTVA: f.exonerationTVA,
    niveau: f.niveau,
  };

  const buffer = await renderPdf(
    React.createElement(FacturePdf, {
      company,
      formateur: {
        nom: f.formateur.user.name ?? "Formateur",
        titre: f.formateur.titre,
        specialite: f.formateur.specialite,
        rpps: f.formateur.rpps,
        email: f.formateur.user.email,
        phone: f.formateur.phone,
        siret: f.formateur.siret,
        raisonSociale: f.formateur.raisonSociale,
      },
      formation,
      participant: mapParticipant(inscription.participant),
      paiement: {
        id: paiement.id,
        numeroFacture: paiement.numeroFacture,
        montantHT: Number(paiement.montantHT),
        datePaiement: paiement.datePaiement?.toISOString() ?? null,
        type: paiement.type,
      },
    })
  );

  return pdfResponse(buffer, `facture-${paiement.numeroFacture ?? paiementId}.pdf`);
}
