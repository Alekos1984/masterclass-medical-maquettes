import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess, cursusSlugify } from "@/lib/cursus";

async function uniqueFormationSlug(base: string): Promise<string> {
  let slug = base || "journee";
  let n = 0;
  while (await prisma.formation.findUnique({ where: { slug } })) {
    n++;
    slug = `${base}-${n}`;
  }
  return slug;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });
  if (role !== "COORDINATEUR") return NextResponse.json({ error: "Réservé au coordinateur" }, { status: 403 });

  const { date, heureDebut, heureFin, modaliteSession, visioUrl, lieuNom, lieuAdresse, lieuVille, titre, slots } = await req.json();
  if (!date) return NextResponse.json({ error: "Date obligatoire" }, { status: 400 });

  const programme = Array.isArray(slots)
    ? (slots as { heureDebut?: string; heureFin?: string; titre?: string; type?: string; description?: string; enseignantId?: string | null }[]).map((s, i) => ({
        slotId: `slot-${Date.now()}-${i}`,
        heureDebut: s.heureDebut ?? "",
        heureFin: s.heureFin ?? "",
        titre: s.titre ?? "",
        description: s.description ?? "",
        type: s.type ?? "cours",
        enseignantId: s.enseignantId ?? null,
      }))
    : [];

  const numero = cursus.journees.length + 1;
  const jTitre = titre?.trim() || `${cursus.titre} — Journée ${numero}`;
  const slug = await uniqueFormationSlug(cursusSlugify(`${cursus.slug}-j${numero}-${date}`));

  const debut = heureDebut || "09:00";
  const fin = heureFin || "17:00";
  const dureeHeures = Math.max(1, Math.round(
    (parseInt(fin.split(":")[0]) * 60 + parseInt(fin.split(":")[1] ?? "0") -
     parseInt(debut.split(":")[0]) * 60 - parseInt(debut.split(":")[1] ?? "0")) / 60
  ));

  const journee = await prisma.formation.create({
    data: {
      slug,
      formateurId: cursus.coordinateurId,
      cursusId: id,
      titre: jTitre,
      specialite: cursus.specialite,
      niveau: "tous",
      description: cursus.description,
      objectifs: [],
      programme,
      date: new Date(date),
      heureDebut: debut,
      heureFin: fin,
      dureeHeures,
      placesTotal: 200,
      placesRestantes: 200,
      lieuNom: (modaliteSession === "VIRTUEL" ? null : (lieuNom ?? cursus.lieuNom)) || null,
      lieuAdresse: (modaliteSession === "VIRTUEL" ? null : (lieuAdresse ?? cursus.lieuAdresse)) || null,
      lieuVille: (modaliteSession === "VIRTUEL" ? null : (lieuVille ?? cursus.lieuVille)) || null,
      prixHT: 0,
      gratuite: true,
      exonerationTVA: true,
      statut: cursus.statut === "PUBLIE" ? "PUBLIEE" : "BROUILLON",
      modaliteSession: modaliteSession ?? "PRESENTIEL",
      visioUrl: visioUrl || null,
      certifBlocCode: cursus.certifBlocCode,
      certifActionTitre: cursus.certifBlocCode ? (cursus.certifActionTitre ?? cursus.titre) : null,
    },
    select: { id: true },
  });

  // Inscrire automatiquement les étudiants déjà présents sur les autres journées
  const existants = await prisma.inscription.findMany({
    where: { formationId: { in: cursus.journees.map((j) => j.id) }, statut: "CONFIRMEE" },
    select: { participantId: true },
    distinct: ["participantId"],
  });
  if (existants.length > 0) {
    await prisma.inscription.createMany({
      data: existants.map((e) => ({
        participantId: e.participantId,
        formationId: journee.id,
        statut: "CONFIRMEE" as const,
        montantHT: 0,
        commission: 0,
        netFormateur: 0,
      })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json({ id: journee.id }, { status: 201 });
}
