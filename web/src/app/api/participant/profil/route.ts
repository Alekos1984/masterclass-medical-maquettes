import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json() as {
    name?: string;
    titre?: string;
    specialite?: string;
    phone?: string;
    ville?: string;
    rpps?: string;
    adresse?: string;
    codePostal?: string;
  };

  // Update User.name if provided
  if (body.name !== undefined) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: body.name },
    });
  }

  // Upsert ParticipantProfile (create if it doesn't exist yet)
  await prisma.participantProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      titre: body.titre,
      specialite: body.specialite,
      phone: body.phone,
      ville: body.ville,
      rpps: body.rpps,
      adresse: body.adresse,
      codePostal: body.codePostal,
    },
    update: {
      titre: body.titre,
      specialite: body.specialite,
      phone: body.phone,
      ville: body.ville,
      rpps: body.rpps,
      adresse: body.adresse,
      codePostal: body.codePostal,
    },
  });

  return NextResponse.json({ ok: true });
}
