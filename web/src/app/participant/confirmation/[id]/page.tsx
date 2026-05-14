import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ConfirmationClient from "./ConfirmationClient";

function formatDateLong(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function annulationDeadline(formationDate: Date): string {
  const d = new Date(formationDate);
  d.setDate(d.getDate() - 14);
  return formatDateShort(d);
}

export default async function ParticipantConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const inscription = await prisma.inscription.findUnique({
    where: { id },
    include: {
      formation: {
        include: {
          formateur: {
            include: { user: true },
          },
        },
      },
      participant: {
        include: { user: true },
      },
      paiement: true,
    },
  });

  if (!inscription) notFound();

  // Ensure this inscription belongs to the logged-in user
  if (inscription.participant.userId !== session.user.id) {
    redirect("/participant/dashboard");
  }

  const formation = inscription.formation;
  const formateur = formation.formateur;
  const formateurName = formateur.user.name ?? formateur.user.email ?? "Formateur";
  const formateurTitre = formateur.titre ? `${formateur.titre} ` : "";
  const formateurDisplay = `${formateurTitre}${formateurName}`;
  const formateurSpec = formateur.specialite ?? "";

  const montantHT = Number(inscription.montantHT);
  const dateFormation = formation.date;
  const participantEmail = inscription.participant.user.email ?? "";

  const confirmationData = {
    inscriptionId: inscription.id,
    formationTitre: formation.titre,
    formationDateLong: formatDateLong(dateFormation),
    formationDateShort: formatDateShort(dateFormation),
    heureDebut: formation.heureDebut,
    heureFin: formation.heureFin,
    dureeHeures: formation.dureeHeures,
    lieuNom: formation.lieuNom ?? null,
    lieuAdresse: formation.lieuAdresse ?? null,
    lieuVille: formation.lieuVille ?? null,
    lieuSalle: formation.lieuSalle ?? null,
    lieuFeatures: (formation.lieuFeatures as string[] | null) ?? [],
    formateurDisplay,
    formateurSpec,
    montantHT,
    conventionSignee: inscription.conventionSignee,
    attestationUrl: inscription.attestationUrl ?? null,
    factureUrl: inscription.paiement?.factureUrl ?? null,
    numeroFacture: inscription.paiement?.numeroFacture ?? null,
    participantEmail,
    annulationDate: annulationDeadline(dateFormation),
    placesRestantes: formation.placesRestantes,
  };

  return <ConfirmationClient data={confirmationData} />;
}
