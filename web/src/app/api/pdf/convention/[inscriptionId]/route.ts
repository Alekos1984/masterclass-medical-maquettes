import { NextRequest } from "next/server";
import React from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderPdf, pdfResponse } from "@/lib/pdf/render";
import { getCompanySettings, getInscriptionData, mapParticipant } from "@/lib/pdf/db-helpers";
import { ConventionPdf } from "@/lib/pdf/templates/convention";
import { lockPdf } from "@/lib/pdf/encrypt";
import type { FormationData, ProgrammeItem } from "@/lib/pdf/shared/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ inscriptionId: string }> }
) {
  const { inscriptionId } = await params;

  const session = await auth();
  if (!session?.user?.id) return new Response("Non authentifié", { status: 401 });

  // Participants : disponible uniquement si le formateur a signé et inscription confirmée
  if (session.user.role === "PARTICIPANT") {
    const check = await prisma.inscription.findUnique({
      where: { id: inscriptionId },
      select: { statut: true, conventionSignee: true, participant: { select: { userId: true } } },
    });
    if (!check || check.participant.userId !== session.user.id) {
      return new Response("Accès refusé", { status: 403 });
    }
    if (!check.conventionSignee || check.statut !== "CONFIRMEE") {
      return new Response("Convention non disponible — en attente de signature du formateur", { status: 403 });
    }
  }

  const [company, inscription] = await Promise.all([
    getCompanySettings(),
    prisma.inscription.findUnique({
      where: { id: inscriptionId },
      include: {
        formation: { include: { formateur: { include: { user: true } } } },
        participant: { include: { user: true } },
      },
    }),
  ]);

  if (!inscription) return new Response("Inscription introuvable", { status: 404 });

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

  let buffer = await renderPdf(
    React.createElement(ConventionPdf, {
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
      inscription: {
        id: inscription.id,
        montantHT: Number(inscription.montantHT),
        createdAt: inscription.createdAt.toISOString(),
        statut: inscription.statut,
      },
      signatures: {
        formateurSignedAt: inscription.conventionSigneeAt?.toISOString()
          ?? (inscription.conventionSignee ? "date non disponible" : null),
        participantSignedAt: inscription.conventionParticipantSigneeAt?.toISOString() ?? null,
        seal: inscription.conventionSeal ?? null,
      },
    })
  );

  const bothSigned = !!(inscription.conventionSignee && inscription.conventionParticipantSigneeAt);
  if (bothSigned) buffer = await lockPdf(buffer);

  return pdfResponse(buffer, `convention-${inscriptionId}.pdf`);
}
