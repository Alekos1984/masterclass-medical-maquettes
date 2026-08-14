import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess, parseSlots, cursusSlugify, uniqueCursusSlug } from "@/lib/cursus";

// POST : dupliquer le cursus pour l'année suivante (dates +364 jours, même structure)
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });
  if (role !== "COORDINATEUR") return NextResponse.json({ error: "Réservé au coordinateur" }, { status: 403 });

  const anneeSuivante = cursus.annee?.match(/^(\d{4})-(\d{4})$/)
    ? `${parseInt(cursus.annee.slice(0, 4)) + 1}-${parseInt(cursus.annee.slice(5, 9)) + 1}`
    : null;

  const slug = await uniqueCursusSlug(cursusSlugify(`${cursus.titre}-${anneeSuivante ?? "copie"}`));
  const nouveau = await prisma.cursus.create({
    data: {
      slug,
      titre: cursus.titre,
      description: cursus.description,
      specialite: cursus.specialite,
      annee: anneeSuivante,
      publique: false,
      statut: "BROUILLON",
      inscriptionMode: cursus.inscriptionMode,
      prixHT: cursus.prixHT,
      lieuNom: cursus.lieuNom,
      lieuAdresse: cursus.lieuAdresse,
      lieuVille: cursus.lieuVille,
      certifBlocCode: cursus.certifBlocCode,
      certifActionTitre: cursus.certifActionTitre,
      coordinateurId: cursus.coordinateurId,
    },
    select: { id: true },
  });

  // Recopier l'équipe (statuts conservés, nouveaux tokens)
  const mapping = new Map<string, string>();
  for (const e of cursus.enseignants) {
    const copie = await prisma.cursusEnseignant.create({
      data: {
        cursusId: nouveau.id,
        email: e.email,
        nom: e.nom,
        formateurId: e.formateurId,
        statut: e.statut,
        coCoordinateur: e.coCoordinateur,
      },
      select: { id: true },
    });
    mapping.set(e.id, copie.id);
  }

  // Recopier les journées (+364 jours = même jour de semaine l'année suivante)
  for (const [idx, j] of cursus.journees.entries()) {
    const newDate = new Date(j.date.getTime() + 364 * 24 * 3600 * 1000);
    const jSlug = cursusSlugify(`${slug}-j${idx + 1}-${Date.now().toString(36)}${idx}`);
    await prisma.formation.create({
      data: {
        slug: jSlug,
        formateurId: cursus.coordinateurId,
        cursusId: nouveau.id,
        titre: j.titre,
        specialite: j.specialite,
        niveau: j.niveau,
        description: j.description,
        objectifs: j.objectifs ?? [],
        programme: parseSlots(j.programme).map((s, i) => ({
          ...s,
          slotId: `slot-${Date.now()}-${idx}-${i}`,
          enseignantId: s.enseignantId ? mapping.get(s.enseignantId) ?? null : null,
        })),
        date: newDate,
        heureDebut: j.heureDebut,
        heureFin: j.heureFin,
        dureeHeures: j.dureeHeures,
        placesTotal: j.placesTotal,
        placesRestantes: j.placesTotal,
        lieuNom: j.lieuNom, lieuAdresse: j.lieuAdresse, lieuVille: j.lieuVille,
        prixHT: 0,
        gratuite: true,
        exonerationTVA: true,
        statut: "BROUILLON",
        modaliteSession: j.modaliteSession,
        visioUrl: j.visioUrl,
        certifBlocCode: cursus.certifBlocCode,
        certifActionTitre: cursus.certifBlocCode ? (cursus.certifActionTitre ?? cursus.titre) : null,
      },
    });
  }

  return NextResponse.json({ id: nouveau.id }, { status: 201 });
}
