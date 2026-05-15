import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LiveFormationClient from "./LiveFormationClient";

export const dynamic = "force-dynamic";

export default async function LiveFormationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const profil = await prisma.formateurProfile.findUnique({ where: { userId: session.user.id } });
  if (!profil) redirect("/formateur/dashboard");

  const formation = await prisma.formation.findFirst({
    where: { id, formateurId: profil.id },
    include: {
      inscriptions: {
        include: {
          participant: { include: { user: { select: { name: true, email: true } } } },
          emargements: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!formation) notFound();

  const data = {
    id: formation.id,
    titre: formation.titre,
    specialite: formation.specialite,
    date: formation.date.toISOString(),
    heureDebut: formation.heureDebut,
    heureFin: formation.heureFin,
    dureeHeures: formation.dureeHeures,
    lieuNom: formation.lieuNom ?? null,
    lieuVille: formation.lieuVille ?? null,
    statut: formation.statut,
    placesTotal: formation.placesTotal,
    sessionStatus: formation.sessionStatus ?? null,
    sessionStartedAt: formation.sessionStartedAt?.toISOString() ?? null,
    sessionEndedAt: formation.sessionEndedAt?.toISOString() ?? null,
    sessionLog: (formation.sessionLog as { type: string; time: string }[] | null) ?? [],
    participants: formation.inscriptions.map((insc) => {
      const emg = insc.emargements[0] ?? null;
      return {
        id: insc.id,
        name: insc.participant.user.name ?? "Anonyme",
        email: insc.participant.user.email ?? "",
        specialite: insc.participant.specialite ?? null,
        statut: insc.statut,
        presentMatin: emg?.presentMatin ?? false,
        presentApresMidi: emg?.presentApresMidi ?? false,
        signatureMatin: emg?.signatureMatin?.toISOString() ?? null,
        signatureApresMidi: emg?.signatureApresMidi?.toISOString() ?? null,
        emargementToken: emg?.token ?? null,
      };
    }),
  };

  return <LiveFormationClient formation={data} />;
}
