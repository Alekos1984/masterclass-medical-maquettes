import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import FormationDetailClient from "./FormationDetailClient";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

function getInitials(name: string | null | undefined): string {
  if (!name) return "DR";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function FormationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const f = await prisma.formation.findUnique({
    where: { slug },
    include: {
      formateur: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!f || f.statut === "BROUILLON" || f.statut === "ANNULEE") notFound();

  // Check if current user is already registered for this formation
  let alreadyInscrit = false;
  const session = await auth();
  if (session?.user?.id && session.user.role === "PARTICIPANT") {
    const profil = await prisma.participantProfile.findUnique({ where: { userId: session.user.id } });
    if (profil) {
      const existing = await prisma.inscription.findUnique({
        where: { participantId_formationId: { participantId: profil.id, formationId: f.id } },
        select: { statut: true },
      });
      if (existing) alreadyInscrit = true;
    }
  }

  const formateurName =
    (f.formateur.titre ? `${f.formateur.titre} ` : "") +
    (f.formateur.user.name ?? f.formateur.user.email ?? "Dr. Expert");

  const formateurSpec =
    f.formateur.specialite ||
    "Spécialiste";

  const placesReserved = f.placesTotal - f.placesRestantes;

  const programme = (
    f.programme as unknown as {
      time?: string;
      heure?: string;
      title?: string;
      titre?: string;
      description?: string;
      type?: string;
    }[]
  ).map((slot) => ({
    time: slot.time ?? slot.heure ?? "",
    title: slot.title ?? slot.titre ?? "",
    description: slot.description,
    type: slot.type,
  }));

  const formation = {
    id: f.id,
    slug: f.slug,
    titre: f.titre,
    specialite: f.specialite,
    niveau: f.niveau,
    description: f.description || "",
    date: f.date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
    dateShort: f.date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
    heureDebut: f.heureDebut,
    heureFin: f.heureFin,
    dureeHeures: f.dureeHeures,
    placesTotal: f.placesTotal,
    placesRestantes: f.placesRestantes,
    placesReserved,
    prixHT: Number(f.prixHT),
    gratuite: f.gratuite,
    lieuVille: f.lieuVille ?? "",
    lieuNom: f.lieuNom ?? "",
    lieuSalle: f.lieuSalle ?? "",
    lieuAdresse: f.lieuAdresse ?? "",
    objectifs: (f.objectifs as unknown as string[]) || [],
    programme,
    formateurInitials: getInitials(f.formateur.user.name),
    formateurName,
    formateurSpec,
    formateurBio: f.formateur.bio ?? "",
    formateurExperience: f.formateur.experienceAns ?? 0,
    formateurPublications: f.formateur.publications ?? 0,
    formateurFormations: 0,
    linkedinUrl: f.formateur.linkedinUrl ?? "",
    researchgateUrl: f.formateur.researchgateUrl ?? "",
    pubmedUrl: f.formateur.pubmedUrl ?? "",
    publicCible: f.publicCible ?? "",
    restauration: f.restauration ?? "",
  };

  return <FormationDetailClient formation={formation} alreadyInscrit={alreadyInscrit} />;
}
