import { NextRequest } from "next/server";
import React from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderPdf, pdfResponse } from "@/lib/pdf/render";
import { getCompanySettings, getInscriptionData, mapParticipant } from "@/lib/pdf/db-helpers";
import { ConvocationPdf } from "@/lib/pdf/templates/convocation";
import type { FormationData, ProgrammeItem } from "@/lib/pdf/shared/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ inscriptionId: string }> }
) {
  const { inscriptionId } = await params;
  const session = await auth();

  // Si c'est un participant qui télécharge, enregistrer l'accusé de réception
  let accuse: { at: Date; name: string } | null = null;
  if (session?.user?.role === "PARTICIPANT") {
    const check = await prisma.inscription.findUnique({
      where: { id: inscriptionId },
      select: {
        convocationSignee: true,
        convocationAccuseAt: true,
        participant: { select: { userId: true } },
      },
    });
    if (!check || check.participant.userId !== session.user.id) {
      return new Response("Accès refusé", { status: 403 });
    }
    if (!check.convocationSignee) {
      return new Response("Convocation non disponible", { status: 403 });
    }
    const now = new Date();
    if (!check.convocationAccuseAt) {
      await prisma.inscription.update({
        where: { id: inscriptionId },
        data: { convocationAccuseAt: now },
      });
    }
    accuse = { at: check.convocationAccuseAt ?? now, name: session.user.name ?? "" };
  }

  const [company, inscription] = await Promise.all([
    getCompanySettings(),
    getInscriptionData(inscriptionId),
  ]);

  if (!inscription) return new Response("Inscription introuvable", { status: 404 });

  // Récupérer les champs de signature
  const inscriptionMeta = await prisma.inscription.findUnique({
    where: { id: inscriptionId },
    select: { convocationSigneeAt: true, convocationAccuseAt: true },
  });

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
    React.createElement(ConvocationPdf, {
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
      formateurSignedAt: inscriptionMeta?.convocationSigneeAt?.toISOString()
        ?? (inscription.convocationSignee ? "date non disponible" : null),
      accuseReception: accuse
        ? { at: accuse.at.toISOString(), participantName: accuse.name }
        : inscriptionMeta?.convocationAccuseAt
        ? { at: inscriptionMeta.convocationAccuseAt.toISOString(), participantName: inscription.participant.user.name ?? "" }
        : undefined,
    })
  );

  return pdfResponse(buffer, `convocation-${inscriptionId}.pdf`);
}
