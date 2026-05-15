import { NextRequest } from "next/server";
import React from "react";
import { renderPdf, pdfResponse } from "@/lib/pdf/render";
import { getCompanySettings, getInscriptionData, mapParticipant } from "@/lib/pdf/db-helpers";
import { AttestationPdf } from "@/lib/pdf/templates/attestation";
import type { FormationData, ProgrammeItem } from "@/lib/pdf/shared/types";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ inscriptionId: string }> }
) {
  const { inscriptionId } = await params;

  const [company, inscription] = await Promise.all([
    getCompanySettings(),
    getInscriptionData(inscriptionId),
  ]);

  if (!inscription) return new Response("Inscription introuvable", { status: 404 });
  if (inscription.statut !== "CONFIRMEE")
    return new Response("Inscription non confirmée", { status: 400 });

  // Coherence check: participant must have signed emargement
  const emargement = await prisma.emargement.findUnique({
    where: { formationId_inscriptionId: { formationId: inscription.formation.id, inscriptionId: inscription.id } },
  });
  if (!emargement || (!emargement.presentMatin && !emargement.presentApresMidi)) {
    return new Response("Attestation non disponible : le participant n'a pas émargé.", { status: 403 });
  }

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
    React.createElement(AttestationPdf, {
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
    })
  );

  return pdfResponse(buffer, `attestation-${inscriptionId}.pdf`);
}
