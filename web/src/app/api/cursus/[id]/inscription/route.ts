import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST : inscription d'un participant à un cursus PAYANT
// → crée les inscriptions sur toutes les journées (montant sur la première),
//   puis renvoie l'ID de la première inscription pour le checkout Stripe existant.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Connectez-vous d'abord" }, { status: 401 });

  const { id } = await params;
  const cursus = await prisma.cursus.findUnique({
    where: { id },
    include: { journees: { orderBy: { date: "asc" }, select: { id: true } } },
  });
  if (!cursus || cursus.statut !== "PUBLIE") return NextResponse.json({ error: "Cursus indisponible" }, { status: 404 });
  if (cursus.inscriptionMode !== "PAYANT") {
    return NextResponse.json({ error: "Les inscriptions à ce cursus sont gérées par l'université." }, { status: 400 });
  }
  if (cursus.journees.length === 0) return NextResponse.json({ error: "Aucune journée programmée" }, { status: 400 });

  const participant = await prisma.participantProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!participant) return NextResponse.json({ error: "Un compte participant est requis" }, { status: 403 });

  const deja = await prisma.inscription.findFirst({
    where: { participantId: participant.id, formationId: { in: cursus.journees.map((j) => j.id) } },
    select: { id: true },
  });
  if (deja) return NextResponse.json({ error: "Vous êtes déjà inscrit·e à ce cursus" }, { status: 409 });

  const prix = Number(cursus.prixHT ?? 0);
  const inscriptions = await prisma.$transaction(
    cursus.journees.map((j, i) =>
      prisma.inscription.create({
        data: {
          participantId: participant.id,
          formationId: j.id,
          statut: prix > 0 ? "EN_ATTENTE_PAIEMENT" : "CONFIRMEE",
          montantHT: i === 0 ? prix : 0,
          commission: i === 0 ? Math.round(prix * 0.2 * 100) / 100 : 0,
          netFormateur: i === 0 ? Math.round(prix * 0.8 * 100) / 100 : 0,
        },
        select: { id: true },
      })
    )
  );

  return NextResponse.json({ inscriptionId: inscriptions[0].id, gratuit: prix === 0 }, { status: 201 });
}
