import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailPVPretPourSignature } from "@/lib/brevo";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const profil = await prisma.formateurProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profil) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const formation = await prisma.formation.findUnique({
    where: { id },
    select: { formateurId: true, titre: true, date: true, pvSigne: true },
  });
  if (!formation || formation.formateurId !== profil.id) {
    return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });
  }

  const body = await req.json() as {
    docs: Array<"pv" | "bilan" | "certificat" | "emargement"> | "all";
    pvContent?: { objectifsAtteints: string; observations: string; acquis: string };
    bilanContent?: { resume: string; recommandations: string; pointsForts: string };
  };
  const { docs, pvContent, bilanContent } = body;

  const list = docs === "all" ? ["pv", "bilan", "certificat"] : docs;
  const now = new Date();
  const data: Record<string, unknown> = {};
  if (list.includes("pv")) {
    data.pvSigne = true;
    data.pvSigneAt = now;
    if (pvContent) data.pvContent = pvContent;
  }
  if (list.includes("bilan")) {
    data.bilanSigne = true;
    data.bilanSigneAt = now;
    if (bilanContent) data.bilanContent = bilanContent;
  }
  if (list.includes("certificat")) { data.certificatSigne = true; data.certificatSigneAt = now; }
  if (list.includes("emargement")) { data.emargementSigne = true; data.emargementSigneAt = now; }

  const updated = await prisma.formation.update({
    where: { id },
    data,
    select: {
      pvSigne: true,
      pvSigneAt: true,
      bilanSigne: true,
      bilanSigneAt: true,
      certificatSigne: true,
      certificatSigneAt: true,
      emargementSigne: true,
      emargementSigneAt: true,
    },
  });

  // If PV just signed, notify participants to co-sign
  if (list.includes("pv") && !formation.pvSigne) {
    const baseUrl = process.env.NEXTAUTH_URL ?? "https://masterclassmedical.fr";
    const dateFormatted = formation.date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

    const emargements = await prisma.emargement.findMany({
      where: { formationId: id, OR: [{ presentMatin: true }, { presentApresMidi: true }] },
      include: { inscription: { include: { participant: { include: { user: { select: { name: true, email: true } } } } } } },
    });

    for (const emg of emargements) {
      const participantEmail = emg.inscription.participant.user.email;
      const participantNom = emg.inscription.participant.user.name ?? "Participant";
      if (!participantEmail) continue;
      sendEmail({
        to: [{ email: participantEmail, name: participantNom }],
        subject: `PV de formation disponible — ${formation.titre}`,
        htmlContent: emailPVPretPourSignature({
          participantNom,
          formationTitre: formation.titre,
          formationDate: dateFormatted,
          pvUrl: `${baseUrl}/participant/pv/${emg.id}`,
        }),
      }).catch(() => {});
    }
  }

  return NextResponse.json({
    ...updated,
    pvSigneAt: updated.pvSigneAt?.toISOString() ?? null,
    bilanSigneAt: updated.bilanSigneAt?.toISOString() ?? null,
    certificatSigneAt: updated.certificatSigneAt?.toISOString() ?? null,
    emargementSigneAt: updated.emargementSigneAt?.toISOString() ?? null,
  });
}
