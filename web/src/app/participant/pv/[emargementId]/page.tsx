import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PVSignClient from "./PVSignClient";

export const dynamic = "force-dynamic";

export default async function ParticipantPVPage({
  params,
}: {
  params: Promise<{ emargementId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const { emargementId } = await params;

  const profil = await prisma.participantProfile.findUnique({ where: { userId: session.user.id } });
  if (!profil) redirect("/participant/dashboard");

  const emargement = await prisma.emargement.findUnique({
    where: { id: emargementId },
    include: {
      inscription: { select: { participantId: true } },
      formation: {
        include: {
          formateur: { include: { user: { select: { name: true } } } },
        },
      },
    },
  });

  if (!emargement) notFound();
  if (emargement.inscription.participantId !== profil.id) notFound();

  const f = emargement.formation;

  return (
    <PVSignClient
      data={{
        emargementId,
        alreadySigned: !!emargement.pvParticipantSignedAt,
        signedAt: emargement.pvParticipantSignedAt?.toISOString() ?? null,
        pvFormateurSigne: f.pvSigne,
        participant: {
          nom: session.user.name ?? "Participant",
          email: session.user.email ?? "",
        },
        formation: {
          id: f.id,
          titre: f.titre,
          date: f.date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
          formateurNom: f.formateur.user.name ?? "Formateur",
        },
      }}
    />
  );
}
