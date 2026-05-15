import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function parseDuree(duree: string): number {
  const match = duree.match(/^(\d+)/);
  return match ? parseInt(match[1]) : 7;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 0;
  while (await prisma.formation.findUnique({ where: { slug } })) {
    n++;
    slug = `${base}-${n}`;
  }
  return slug;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const profil = await prisma.formateurProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profil) {
    return NextResponse.json({ error: "Profil formateur introuvable" }, { status: 404 });
  }

  const body = await req.json();
  const {
    titre,
    thematique,
    format,
    duree,
    dateDebut,
    dateFin,
    maxPart,
    minPart,
    ville,
    checkedEquip,
    restauration,
    checkedResto,
    objectives,
    description,
    prixType,
    prix,
    niveau = "intermediaire",
    publicCible,
  } = body;

  if (!titre || !dateDebut) {
    return NextResponse.json({ error: "Titre et date de début obligatoires" }, { status: 400 });
  }

  const dureeHeures = parseDuree(duree ?? "7h");
  const slug = await uniqueSlug(slugify(titre));
  const prixHT = prixType === "gratuit" ? 0 : parseFloat(prix ?? "0") || 0;

  const formation = await prisma.formation.create({
    data: {
      slug,
      formateurId: profil.id,
      titre,
      specialite: thematique ?? "",
      niveau: niveau as string,
      description: description ?? "",
      objectifs: objectives ? objectives.split("\n").filter(Boolean) : [],
      programme: [],
      date: new Date(dateDebut),
      heureDebut: "09:00",
      heureFin: dureeHeures >= 7 ? "17:00" : `${9 + dureeHeures}:00`,
      dureeHeures,
      placesTotal: maxPart ?? 15,
      placesRestantes: maxPart ?? 15,
      lieuVille: ville ?? null,
      prixHT,
      gratuite: prixType === "gratuit",
      exonerationTVA: true,
      statut: "BROUILLON",
      formatFormation: format ?? null,
      minParticipants: minPart ? Number(minPart) : 8,
      equipements: checkedEquip ?? [],
      restauration: restauration && checkedResto?.length ? (checkedResto as string[]).join(" + ") : null,
      publicCible: publicCible ?? null,
    },
  });

  // Create the DemandeSalle linked to this formation
  await prisma.demandeSalle.create({
    data: {
      formationId: formation.id,
      statut: "EN_ATTENTE",
      notes: [
        ville ? `Ville souhaitée : ${ville}` : null,
        checkedEquip?.length ? `Équipements : ${checkedEquip.join(", ")}` : null,
        restauration ? `Restauration : ${(checkedResto ?? []).join(", ")}` : "Pas de restauration",
        minPart ? `Minimum participants : ${minPart}` : null,
        format ? `Format : ${format}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    },
  });

  return NextResponse.json({ formationId: formation.id, slug }, { status: 201 });
}
