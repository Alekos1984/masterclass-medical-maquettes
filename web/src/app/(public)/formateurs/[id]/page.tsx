import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import FormateurPublicClient from "./FormateurPublicClient";

export const dynamic = "force-dynamic";

export default async function FormateurPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const profil = await prisma.formateurProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      formations: {
        where: { statut: "PUBLIEE" },
        orderBy: { date: "asc" },
        select: {
          id: true, slug: true, titre: true, specialite: true, niveau: true,
          date: true, heureDebut: true, heureFin: true, dureeHeures: true,
          lieuVille: true, lieuNom: true, placesTotal: true, placesRestantes: true,
          prixHT: true, gratuite: true,
        },
      },
    },
  });

  if (!profil || !profil.portfolioPublic) notFound();

  const nom = (profil.titre ? `${profil.titre} ` : "") + (profil.user.name ?? profil.user.email ?? "Dr. Expert");

  const data = {
    id: profil.id,
    nom,
    specialite: profil.specialite ?? "",
    ville: profil.ville ?? "",
    bio: profil.bio ?? "",
    experienceAns: profil.experienceAns ?? 0,
    publications: profil.publications ?? 0,
    linkedinUrl: profil.linkedinUrl ?? "",
    researchgateUrl: profil.researchgateUrl ?? "",
    pubmedUrl: profil.pubmedUrl ?? "",
    formations: profil.formations.map((f) => ({
      id: f.id,
      slug: f.slug,
      titre: f.titre,
      specialite: f.specialite,
      niveau: f.niveau,
      date: f.date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
      heureDebut: f.heureDebut,
      heureFin: f.heureFin,
      dureeHeures: f.dureeHeures,
      lieuVille: f.lieuVille ?? "",
      lieuNom: f.lieuNom ?? "",
      placesTotal: f.placesTotal,
      placesRestantes: f.placesRestantes,
      prixHT: Number(f.prixHT),
      gratuite: f.gratuite,
    })),
  };

  return <FormateurPublicClient profil={data} />;
}
