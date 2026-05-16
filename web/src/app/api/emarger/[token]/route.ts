import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function loadEmargement(token: string) {
  return prisma.emargement.findUnique({
    where: { token },
    include: {
      inscription: {
        include: {
          participant: { include: { user: { select: { name: true, email: true } } } },
        },
      },
      formation: {
        include: {
          formateur: { include: { user: { select: { name: true } } } },
        },
      },
    },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const emg = await loadEmargement(token);

  if (!emg) return NextResponse.json({ error: "Lien invalide" }, { status: 404 });
  if (new Date() > emg.tokenExpire) return NextResponse.json({ error: "Lien expiré" }, { status: 410 });

  const f = emg.formation;
  const lieu = f.lieuNom
    ? `${f.lieuVille ?? ""} · ${f.lieuNom}`
    : f.lieuVille ?? "Lieu à confirmer";

  return NextResponse.json({
    emargementId: emg.id,
    alreadySigned: emg.presentMatin || emg.presentApresMidi,
    signedAt: emg.signatureMatin?.toISOString() ?? emg.signatureApresMidi?.toISOString() ?? null,
    participant: {
      nom: emg.inscription.participant.user.name ?? "Participant",
      email: emg.inscription.participant.user.email,
    },
    formation: {
      titre: f.titre,
      date: f.date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
      heureDebut: f.heureDebut,
      heureFin: f.heureFin,
      lieu,
      formateurNom: f.formateur.user.name ?? "Formateur",
    },
  });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const emg = await prisma.emargement.findUnique({ where: { token } });

  if (!emg) return NextResponse.json({ error: "Lien invalide" }, { status: 404 });
  if (new Date() > emg.tokenExpire) return NextResponse.json({ error: "Lien expiré" }, { status: 410 });
  if (emg.presentMatin || emg.presentApresMidi) {
    return NextResponse.json({ error: "Déjà émargé" }, { status: 409 });
  }

  const now = new Date();
  const isMatin = now.getHours() < 13;

  await prisma.emargement.update({
    where: { id: emg.id },
    data: {
      presentMatin: isMatin ? true : emg.presentMatin,
      presentApresMidi: !isMatin ? true : emg.presentApresMidi,
      signatureMatin: isMatin ? now : emg.signatureMatin,
      signatureApresMidi: !isMatin ? now : emg.signatureApresMidi,
    },
  });

  return NextResponse.json({ ok: true, signedAt: now.toISOString() });
}
