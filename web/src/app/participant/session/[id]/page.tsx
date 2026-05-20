import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SessionClient from "./SessionClient";

export const dynamic = "force-dynamic";

export default async function ParticipantSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const profil = await prisma.participantProfile.findUnique({ where: { userId: session.user.id } });
  if (!profil) redirect("/participant/dashboard");

  const inscription = await prisma.inscription.findFirst({
    where: { formationId: id, participantId: profil.id, statut: "CONFIRMEE" },
    include: {
      formation: {
        select: {
          id: true, titre: true, specialite: true, heureDebut: true, heureFin: true,
          sessionStatus: true, sessionCurrentPage: true, sessionSlidesBase64: true,
          modaliteSession: true, description: true, objectifs: true, programme: true,
          ressources: { select: { id: true, nom: true, url: true, taille: true }, orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  if (!inscription) notFound();

  const f = inscription.formation;
  if (f.sessionStatus !== "EN_COURS" && f.sessionStatus !== "EN_PAUSE") {
    redirect("/participant/dashboard");
  }

  const emargement = await prisma.emargement.findFirst({
    where: { formationId: f.id, inscriptionId: inscription.id },
    select: { token: true, presentMatin: true, presentApresMidi: true },
  });

  const emargementToken = emargement && !emargement.presentMatin && !emargement.presentApresMidi
    ? emargement.token
    : undefined;

  return (
    <SessionClient
      formationId={f.id}
      titre={f.titre}
      specialite={f.specialite}
      heureDebut={f.heureDebut}
      heureFin={f.heureFin}
      modaliteSession={f.modaliteSession ?? "PRESENTIEL"}
      hasSlides={!!f.sessionSlidesBase64}
      initialPage={f.sessionCurrentPage ?? 1}
      ressources={f.ressources}
      description={f.description ?? ""}
      emargementToken={emargementToken}
    />
  );
}
