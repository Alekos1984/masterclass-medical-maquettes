import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess } from "@/lib/cursus";
import { sendEmail, emailNouveauMessageCursus } from "@/lib/brevo";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus || !role) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });

  const { texte } = await req.json();
  if (!texte?.trim()) return NextResponse.json({ error: "Message vide" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  const message = await prisma.cursusMessage.create({
    data: {
      cursusId: id,
      auteurEmail: user?.email ?? "—",
      auteurNom: user?.name ?? "—",
      texte: texte.trim().slice(0, 4000),
    },
  });

  // Notifier les autres membres (enseignants acceptés + coordinateur)
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://masterclassmedicale.com";
  const destinataires = new Map<string, string>();
  for (const e of cursus.enseignants) {
    if (e.statut === "ACCEPTE" && e.email !== user?.email) destinataires.set(e.email, e.nom ?? "");
  }
  const coordEmail = cursus.coordinateur.user?.email;
  if (coordEmail && coordEmail !== user?.email) {
    destinataires.set(coordEmail, cursus.coordinateur.user?.name ?? "");
  }

  const extrait = texte.trim().slice(0, 180) + (texte.trim().length > 180 ? "…" : "");
  for (const [email, nom] of destinataires) {
    sendEmail({
      to: [{ email, name: nom || undefined }],
      subject: `💬 ${user?.name ?? "Un membre"} — ${cursus.titre}`,
      htmlContent: emailNouveauMessageCursus({
        nom: nom || "cher·e collègue",
        cursusTitre: cursus.titre,
        auteurNom: user?.name ?? "Un membre de l'équipe",
        extrait,
        url: `${baseUrl}/formateur/coordination/${id}`,
      }),
    }).catch(() => {});
  }

  return NextResponse.json(message, { status: 201 });
}
