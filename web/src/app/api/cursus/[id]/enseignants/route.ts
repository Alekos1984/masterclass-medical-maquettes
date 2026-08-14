import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess } from "@/lib/cursus";
import { sendEmail, emailInvitationEnseignant } from "@/lib/brevo";

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

  const body = await req.json();
  // Accepte une invitation unique { email, nom, phone, fonction }
  // ou un import en masse { enseignants: [{ email, nom, phone, fonction }] }
  const rows: { email?: string; nom?: string; phone?: string; fonction?: string }[] =
    Array.isArray(body.enseignants) ? body.enseignants : [body];
  if (rows.length === 0) return NextResponse.json({ error: "Liste vide" }, { status: 400 });
  if (rows.length > 200) return NextResponse.json({ error: "Maximum 200 enseignants par import" }, { status: 400 });

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://masterclassmedicale.com";
  let invites = 0, doublons = 0, erreurs = 0;

  for (const row of rows) {
    const cleanEmail = (row.email ?? "").trim().toLowerCase();
    if (!cleanEmail.includes("@")) { erreurs++; continue; }

    const existing = await prisma.cursusEnseignant.findUnique({
      where: { cursusId_email: { cursusId: id, email: cleanEmail } },
    });
    if (existing) { doublons++; continue; }

    // Rattacher directement si un compte formateur existe déjà
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { name: true, formateurProfile: { select: { id: true } } },
    });

    const enseignant = await prisma.cursusEnseignant.create({
      data: {
        cursusId: id,
        email: cleanEmail,
        nom: row.nom?.trim() || user?.name || null,
        phone: row.phone?.trim() || null,
        fonction: row.fonction?.trim() || null,
        formateurId: user?.formateurProfile?.id ?? null,
        statut: user?.formateurProfile ? "ACCEPTE" : "EN_ATTENTE",
      },
    });
    invites++;

    const inviteUrl = user?.formateurProfile
      ? `${baseUrl}/formateur/coordination/${id}`
      : `${baseUrl}/cursus/invitation/${enseignant.inviteToken}`;

    sendEmail({
      to: [{ email: cleanEmail, name: enseignant.nom ?? undefined }],
      subject: `Vous êtes invité·e à enseigner — ${cursus.titre}`,
      htmlContent: emailInvitationEnseignant({
        nom: enseignant.nom ?? "cher·e collègue",
        cursusTitre: cursus.titre,
        coordinateurNom: cursus.coordinateur.user?.name ?? "Le coordinateur",
        inviteUrl,
        dejaInscrit: !!user?.formateurProfile,
      }),
    }).catch(() => {
      // L'invitation reste valable même si l'email échoue (relance possible)
    });
  }

  return NextResponse.json({ invites, doublons, erreurs }, { status: 201 });
}
