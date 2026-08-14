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

  const { email, nom } = await req.json();
  const cleanEmail = (email ?? "").trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) return NextResponse.json({ error: "Email invalide" }, { status: 400 });

  const existing = await prisma.cursusEnseignant.findUnique({
    where: { cursusId_email: { cursusId: id, email: cleanEmail } },
  });
  if (existing) return NextResponse.json({ error: "Cet enseignant est déjà dans l'équipe" }, { status: 409 });

  // Rattacher directement si un compte formateur existe déjà
  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
    select: { name: true, formateurProfile: { select: { id: true } } },
  });

  const enseignant = await prisma.cursusEnseignant.create({
    data: {
      cursusId: id,
      email: cleanEmail,
      nom: nom?.trim() || user?.name || null,
      formateurId: user?.formateurProfile?.id ?? null,
      statut: user?.formateurProfile ? "ACCEPTE" : "EN_ATTENTE",
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://masterclassmedicale.com";
  const inviteUrl = user?.formateurProfile
    ? `${baseUrl}/formateur/coordination/${id}`
    : `${baseUrl}/cursus/invitation/${enseignant.inviteToken}`;

  try {
    await sendEmail({
      to: [{ email: cleanEmail, name: enseignant.nom ?? undefined }],
      subject: `Vous êtes invité·e à enseigner — ${cursus.titre}`,
      htmlContent: emailInvitationEnseignant({
        nom: enseignant.nom ?? "cher·e collègue",
        cursusTitre: cursus.titre,
        coordinateurNom: cursus.coordinateur.user?.name ?? "Le coordinateur",
        inviteUrl,
        dejaInscrit: !!user?.formateurProfile,
      }),
    });
  } catch {
    // L'invitation reste valable même si l'email échoue (relance possible)
  }

  return NextResponse.json({ id: enseignant.id, statut: enseignant.statut }, { status: 201 });
}
