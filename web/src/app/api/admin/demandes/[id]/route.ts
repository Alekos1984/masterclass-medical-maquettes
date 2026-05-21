import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json() as {
    statut?: string;
    hotelNom?: string;
    hotelEmail?: string;
    hotelPhone?: string;
    notes?: string;
    devisHT?: number | null;
    fraisGestion?: number | null;
  };

  const totalHT =
    body.devisHT != null && body.fraisGestion != null
      ? body.devisHT + body.fraisGestion
      : body.devisHT != null
      ? body.devisHT * 1.1
      : undefined;

  const demande = await prisma.demandeSalle.update({
    where: { id },
    data: {
      ...(body.statut && { statut: body.statut as never }),
      ...(body.hotelNom !== undefined && { hotelNom: body.hotelNom }),
      ...(body.hotelEmail !== undefined && { hotelEmail: body.hotelEmail }),
      ...(body.hotelPhone !== undefined && { hotelPhone: body.hotelPhone }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.devisHT !== undefined && { devisHT: body.devisHT }),
      ...(body.fraisGestion !== undefined && { fraisGestion: body.fraisGestion }),
      ...(totalHT !== undefined && { totalHT }),
      ...(body.statut === "DEVIS_RECU" && { dateDevis: new Date() }),
      ...(body.statut === "CONTACT_HOTEL" && { dateContact: new Date() }),
    },
  });

  return NextResponse.json({ ok: true, statut: demande.statut });
}
