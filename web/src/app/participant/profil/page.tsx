import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfilClient from "./ProfilClient";

export default async function ParticipantProfilPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  const profil = await prisma.participantProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      titre: true,
      specialite: true,
      phone: true,
      ville: true,
      rpps: true,
      adresse: true,
      codePostal: true,
    },
  });

  return (
    <ProfilClient
      profil={{
        name: user?.name ?? null,
        email: user?.email ?? null,
        titre: profil?.titre ?? null,
        specialite: profil?.specialite ?? null,
        phone: profil?.phone ?? null,
        ville: profil?.ville ?? null,
        rpps: profil?.rpps ?? null,
        adresse: profil?.adresse ?? null,
        codePostal: profil?.codePostal ?? null,
      }}
    />
  );
}
