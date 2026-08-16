import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess, rematchIntervenants, peutGerer } from "@/lib/cursus";
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
  if (!peutGerer(role)) return NextResponse.json({ error: "Réservé au coordinateur ou à la secrétaire pédagogique" }, { status: 403 });

  const body = await req.json();
  // Accepte une invitation unique { email, nom, phone, fonction, sansInviter?, role? }
  // ou un import en masse { enseignants: [...], sansInviter?, role? }
  const rows: { email?: string; nom?: string; phone?: string; fonction?: string; prenom?: string }[] =
    Array.isArray(body.enseignants) ? body.enseignants : [body];
  const sansInviter: boolean = !!body.sansInviter;
  const roleDemande: string = body.role === "SECRETAIRE" ? "SECRETAIRE" : "ENSEIGNANT";
  // Seul le coordinateur peut nommer une secrétaire pédagogique (accès élargi)
  if (roleDemande === "SECRETAIRE" && role !== "COORDINATEUR") {
    return NextResponse.json({ error: "Seul le coordinateur peut ajouter une secrétaire pédagogique" }, { status: 403 });
  }
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

    // Nom complet : combine prénom + nom si les deux sont fournis
    const nomComplet = [row.prenom?.trim(), row.nom?.trim()].filter(Boolean).join(" ") || user?.name || null;

    // Statut : compte formateur existant → ACCEPTE ; sinon selon "sansInviter"
    const statut = user?.formateurProfile
      ? "ACCEPTE"
      : sansInviter ? "NON_INVITE" : "EN_ATTENTE";

    const enseignant = await prisma.cursusEnseignant.create({
      data: {
        cursusId: id,
        email: cleanEmail,
        nom: nomComplet,
        phone: row.phone?.trim() || null,
        fonction: row.fonction?.trim() || null,
        formateurId: user?.formateurProfile?.id ?? null,
        statut,
        role: roleDemande,
      },
    });
    invites++;

    // On n'envoie pas d'email si "sansInviter" ET pas de compte formateur existant
    if (statut !== "NON_INVITE") {
      const inviteUrl = user?.formateurProfile
        ? `${baseUrl}/formateur/coordination/${id}`
        : `${baseUrl}/cursus/invitation/${enseignant.inviteToken}`;

      sendEmail({
        to: [{ email: cleanEmail, name: enseignant.nom ?? undefined }],
        subject: roleDemande === "SECRETAIRE"
          ? `Vous êtes invité·e comme secrétaire pédagogique — ${cursus.titre}`
          : `Vous êtes invité·e à enseigner — ${cursus.titre}`,
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
  }

  // Auto-rattachement : les intervenants détectés (digitalisation) qui matchent
  // maintenant l'un des nouveaux enseignants sont affectés à leurs créneaux.
  let rattaches = 0;
  if (invites > 0) {
    try { ({ rattaches } = await rematchIntervenants(id)); } catch { /* non bloquant */ }
  }

  return NextResponse.json({ invites, doublons, erreurs, rattaches }, { status: 201 });
}
