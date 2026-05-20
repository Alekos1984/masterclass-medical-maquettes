import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const profil = await prisma.formateurProfile.findUnique({ where: { userId: session.user.id } });
  if (!profil) return NextResponse.json({ demandes: [] });

  const demandes = await prisma.demandeSalle.findMany({
    where: { formation: { formateurId: profil.id } },
    include: { formation: { select: { titre: true, date: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    demandes: demandes.map((d) => ({
      id: d.id,
      statut: d.statut,
      hotelNom: d.hotelNom,
      notes: d.notes,
      devisHT: d.devisHT ? Number(d.devisHT) : null,
      dateDevis: d.dateDevis?.toISOString() ?? null,
      createdAt: d.createdAt.toISOString(),
      formation: { titre: d.formation.titre, date: d.formation.date.toISOString() },
    })),
  });
}
