import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess, peutGerer } from "@/lib/cursus";
import { sendEmail, emailCompteEtudiantCursus } from "@/lib/brevo";

// GET : liste des étudiants + assiduité par journée
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus || !role) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });

  const journeeIds = cursus.journees.map((j) => j.id);
  const inscriptions = await prisma.inscription.findMany({
    where: { formationId: { in: journeeIds }, statut: "CONFIRMEE" },
    include: {
      participant: { include: { user: { select: { name: true, email: true } } } },
      emargements: { select: { formationId: true, presentMatin: true, presentApresMidi: true } },
    },
  });

  const parEtudiant = new Map<string, {
    participantId: string; nom: string; email: string;
    presences: Record<string, { matin: boolean; apresMidi: boolean }>;
  }>();

  for (const insc of inscriptions) {
    const key = insc.participantId;
    if (!parEtudiant.has(key)) {
      parEtudiant.set(key, {
        participantId: key,
        nom: insc.participant.user?.name ?? "—",
        email: insc.participant.user?.email ?? "—",
        presences: {},
      });
    }
    const e = parEtudiant.get(key)!;
    for (const em of insc.emargements) {
      e.presences[em.formationId] = { matin: em.presentMatin, apresMidi: em.presentApresMidi };
    }
    if (!e.presences[insc.formationId]) {
      e.presences[insc.formationId] = { matin: false, apresMidi: false };
    }
  }

  return NextResponse.json({
    journees: cursus.journees.map((j) => ({ id: j.id, date: j.date.toISOString() })),
    etudiants: Array.from(parEtudiant.values()).sort((a, b) => a.nom.localeCompare(b.nom)),
  });
}

// POST : import de la liste des étudiants → comptes + inscriptions sur toutes les journées
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });
  if (!peutGerer(role)) return NextResponse.json({ error: "Réservé au coordinateur ou à la secrétaire pédagogique" }, { status: 403 });
  if (cursus.journees.length === 0) {
    return NextResponse.json({ error: "Créez d'abord au moins une journée d'enseignement" }, { status: 400 });
  }

  const { etudiants } = await req.json() as { etudiants: { email: string; nom?: string; prenom?: string }[] };
  if (!Array.isArray(etudiants) || etudiants.length === 0) {
    return NextResponse.json({ error: "Liste vide" }, { status: 400 });
  }
  if (etudiants.length > 500) {
    return NextResponse.json({ error: "Maximum 500 étudiants par import" }, { status: 400 });
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://masterclassmedicale.com";
  let crees = 0, existants = 0, inscrits = 0, erreurs = 0;

  for (const row of etudiants) {
    const email = (row.email ?? "").trim().toLowerCase();
    if (!email.includes("@")) { erreurs++; continue; }
    const nomComplet = [row.prenom?.trim(), row.nom?.trim()].filter(Boolean).join(" ") || email.split("@")[0];

    try {
      let user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, participantProfile: { select: { id: true } } },
      });

      let motDePasse: string | null = null;
      if (!user) {
        motDePasse = randomBytes(6).toString("base64url");
        const created = await prisma.user.create({
          data: {
            email,
            name: nomComplet,
            password: await bcrypt.hash(motDePasse, 12),
            role: "PARTICIPANT",
            participantProfile: { create: {} },
          },
          select: { id: true, name: true, participantProfile: { select: { id: true } } },
        });
        user = created;
        crees++;
      } else {
        existants++;
        if (!user.participantProfile) {
          const profil = await prisma.participantProfile.create({ data: { userId: user.id }, select: { id: true } });
          user = { ...user, participantProfile: profil };
        }
      }

      const participantId = user.participantProfile!.id;
      const result = await prisma.inscription.createMany({
        data: cursus.journees.map((j) => ({
          participantId,
          formationId: j.id,
          statut: "CONFIRMEE" as const,
          montantHT: 0,
          commission: 0,
          netFormateur: 0,
        })),
        skipDuplicates: true,
      });
      inscrits += result.count;

      if (motDePasse) {
        try {
          await sendEmail({
            to: [{ email, name: nomComplet }],
            subject: `Votre accès — ${cursus.titre}`,
            htmlContent: emailCompteEtudiantCursus({
              nom: nomComplet,
              cursusTitre: cursus.titre,
              email,
              motDePasse,
              loginUrl: `${baseUrl}/auth/login`,
            }),
          });
        } catch { /* compte créé quand même */ }
      }
    } catch {
      erreurs++;
    }
  }

  return NextResponse.json({ crees, existants, inscrits, erreurs });
}
