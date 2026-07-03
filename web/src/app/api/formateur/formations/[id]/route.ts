import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PUBLISHABLE = ["BROUILLON", "EN_ATTENTE_SALLE", "SALLE_CONFIRMEE"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { statut } = body;

  // Verify ownership
  const profil = await prisma.formateurProfile.findUnique({ where: { userId: session.user.id } });
  if (!profil) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const formation = await prisma.formation.findUnique({ where: { id }, select: { formateurId: true, statut: true } });
  if (!formation || formation.formateurId !== profil.id) {
    return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });
  }

  // Collect content fields if present
  const contentFields: Record<string, unknown> = {};
  if (body.description !== undefined) contentFields.description = body.description;
  if (body.objectifs !== undefined) contentFields.objectifs = body.objectifs;
  if (body.programme !== undefined) contentFields.programme = body.programme;
  if (body.titre !== undefined) contentFields.titre = body.titre;
  if (body.heureDebut !== undefined) contentFields.heureDebut = body.heureDebut;
  if (body.heureFin !== undefined) contentFields.heureFin = body.heureFin;
  if (body.placesTotal !== undefined) contentFields.placesTotal = body.placesTotal;
  if (body.prixHT !== undefined) contentFields.prixHT = body.prixHT;
  if (body.gratuite !== undefined) contentFields.gratuite = Boolean(body.gratuite);
  if (body.publicCible !== undefined) contentFields.publicCible = body.publicCible;
  if (body.restauration !== undefined) contentFields.restauration = body.restauration;
  if (body.formatFormation !== undefined) contentFields.formatFormation = body.formatFormation;
  if (body.minParticipants !== undefined) contentFields.minParticipants = body.minParticipants !== null ? Number(body.minParticipants) : null;
  if (body.equipements !== undefined) contentFields.equipements = body.equipements;
  if (body.niveau !== undefined) contentFields.niveau = body.niveau;
  if (body.titre !== undefined) contentFields.titre = body.titre;
  if (body.specialite !== undefined) contentFields.specialite = body.specialite;
  if (body.dureeHeures !== undefined) contentFields.dureeHeures = Number(body.dureeHeures);
  if (body.date !== undefined) contentFields.date = new Date(body.date as string);
  if (body.heureDebut !== undefined) contentFields.heureDebut = body.heureDebut;
  if (body.heureFin !== undefined) contentFields.heureFin = body.heureFin;
  if (body.placesTotal !== undefined) contentFields.placesTotal = Number(body.placesTotal);
  if (body.certifBlocCode !== undefined) contentFields.certifBlocCode = body.certifBlocCode || null;
  if (body.certifActionTitre !== undefined) contentFields.certifActionTitre = body.certifActionTitre || null;

  if (statut) {
    if (statut === "PUBLIEE" && !PUBLISHABLE.includes(formation.statut)) {
      return NextResponse.json({ error: "Statut actuel ne permet pas la publication" }, { status: 400 });
    }
    if (statut === "ANNULEE" && formation.statut === "ANNULEE") {
      return NextResponse.json({ error: "Formation déjà annulée" }, { status: 400 });
    }

    const updated = await prisma.formation.update({
      where: { id },
      data: { statut },
      select: { id: true, statut: true },
    });

    return NextResponse.json(updated);
  } else if (Object.keys(contentFields).length > 0) {
    const updated = await prisma.formation.update({
      where: { id },
      data: contentFields,
      select: { id: true },
    });

    const salleRelated = ["lieuVille", "equipements", "restauration", "minParticipants", "formatFormation", "placesTotal"];
    if (salleRelated.some((k) => k in contentFields)) {
      const f = await prisma.formation.findUnique({
        where: { id },
        select: {
          lieuVille: true,
          equipements: true,
          restauration: true,
          minParticipants: true,
          formatFormation: true,
          placesTotal: true,
        },
      });
      if (f) {
        const equip = (f.equipements as string[] | null) ?? [];
        const notes = [
          f.lieuVille ? `Ville souhaitée : ${f.lieuVille}` : null,
          equip.length ? `Équipements : ${equip.join(", ")}` : null,
          f.restauration ? `Restauration : ${f.restauration}` : "Pas de restauration",
          f.minParticipants ? `Minimum participants : ${f.minParticipants}` : null,
          f.placesTotal ? `Maximum participants : ${f.placesTotal}` : null,
          f.formatFormation ? `Format : ${f.formatFormation}` : null,
        ]
          .filter(Boolean)
          .join("\n");

        await prisma.demandeSalle.upsert({
          where: { formationId: id },
          update: { notes },
          create: { formationId: id, statut: "EN_ATTENTE", notes },
        });
      }
    }

    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Aucun champ à mettre à jour" }, { status: 400 });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const profil = await prisma.formateurProfile.findUnique({ where: { userId: session.user.id } });
  if (!profil) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const formation = await prisma.formation.findUnique({
    where: { id },
    select: { formateurId: true, statut: true, _count: { select: { inscriptions: { where: { statut: "CONFIRMEE" } } } } },
  });
  if (!formation || formation.formateurId !== profil.id)
    return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });

  if (formation._count.inscriptions > 0 && formation.statut !== "ANNULEE")
    return NextResponse.json({ error: "Impossible de supprimer : des participants sont confirmés. Annulez d'abord la formation." }, { status: 409 });

  await prisma.$transaction([
    prisma.emargement.deleteMany({ where: { formationId: id } }),
    prisma.satisfactionReponse.deleteMany({ where: { formationId: id } }),
    prisma.question.deleteMany({ where: { formationId: id } }),
    prisma.ressource.deleteMany({ where: { formationId: id } }),
    prisma.inscription.deleteMany({ where: { formationId: id } }),
    prisma.demandeSalle.deleteMany({ where: { formationId: id } }),
    prisma.formation.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
