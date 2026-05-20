import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EmargerClient from "./EmargerClient";

export const dynamic = "force-dynamic";

export default async function EmargerPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const emg = await prisma.emargement.findUnique({
    where: { token },
    include: {
      inscription: {
        include: {
          participant: { include: { user: { select: { name: true, email: true } } } },
        },
      },
      formation: {
        include: {
          formateur: { include: { user: { select: { name: true } } } },
        },
      },
    },
  });

  if (!emg) notFound();

  const f = emg.formation;
  const lieu = f.lieuNom
    ? `${f.lieuVille ?? ""} · ${f.lieuNom}`
    : f.lieuVille ?? "Lieu à confirmer";

  return (
    <EmargerClient
      data={{
        emargementId: emg.id,
        token,
        formationId: f.id,
        alreadySigned: emg.presentMatin || emg.presentApresMidi,
        signedAt: emg.signatureMatin?.toISOString() ?? emg.signatureApresMidi?.toISOString() ?? null,
        participant: {
          nom: emg.inscription.participant.user.name ?? "Participant",
          email: emg.inscription.participant.user.email,
        },
        formation: {
          titre: f.titre,
          date: f.date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
          heureDebut: f.heureDebut,
          heureFin: f.heureFin,
          lieu,
          formateurNom: f.formateur.user.name ?? "Formateur",
        },
      }}
    />
  );
}
