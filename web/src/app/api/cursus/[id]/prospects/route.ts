import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess, inscrireEtudiantCursus, peutGerer } from "@/lib/cursus";

type ProspectInput = { email: string; nom?: string; prenom?: string; phone?: string; fonction?: string };

// POST : ajouter des étudiants à la liste d'attente (en masse ou un par un)
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

  const { prospects } = await req.json() as { prospects: ProspectInput[] };
  if (!Array.isArray(prospects) || prospects.length === 0) {
    return NextResponse.json({ error: "Liste vide" }, { status: 400 });
  }
  if (prospects.length > 500) {
    return NextResponse.json({ error: "Maximum 500 lignes par import" }, { status: 400 });
  }

  let ajoutes = 0, doublons = 0, erreurs = 0;
  for (const p of prospects) {
    const email = (p.email ?? "").trim().toLowerCase();
    if (!email.includes("@")) { erreurs++; continue; }
    try {
      await prisma.cursusProspect.create({
        data: {
          cursusId: id,
          email,
          nom: p.nom?.trim() || null,
          prenom: p.prenom?.trim() || null,
          phone: p.phone?.trim() || null,
          fonction: p.fonction?.trim() || null,
        },
      });
      ajoutes++;
    } catch {
      doublons++; // contrainte unique (cursusId, email)
    }
  }

  return NextResponse.json({ ajoutes, doublons, erreurs }, { status: 201 });
}

// GET : liste d'attente complète
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus || !peutGerer(role)) return NextResponse.json({ error: "Réservé au coordinateur ou à la secrétaire pédagogique" }, { status: 403 });

  const prospects = await prisma.cursusProspect.findMany({
    where: { cursusId: id },
    orderBy: [{ statut: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ prospects });
}

// PATCH : accepter / refuser / remettre en attente (en masse)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });
  if (!peutGerer(role)) return NextResponse.json({ error: "Réservé au coordinateur ou à la secrétaire pédagogique" }, { status: 403 });

  const { ids, action } = await req.json() as { ids: string[]; action: "ACCEPTER" | "REFUSER" | "ATTENTE" };
  if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: "Aucune sélection" }, { status: 400 });

  const prospects = await prisma.cursusProspect.findMany({ where: { id: { in: ids }, cursusId: id } });

  if (action === "ACCEPTER") {
    if (cursus.journees.length === 0) {
      return NextResponse.json({ error: "Créez d'abord au moins une journée d'enseignement" }, { status: 400 });
    }
    let acceptes = 0, comptesCrees = 0, erreurs = 0;
    for (const p of prospects) {
      const r = await inscrireEtudiantCursus(
        { id: cursus.id, titre: cursus.titre, journees: cursus.journees },
        { email: p.email, nom: p.nom, prenom: p.prenom }
      );
      if (r.ok) {
        await prisma.cursusProspect.update({ where: { id: p.id }, data: { statut: "ACCEPTE" } });
        acceptes++;
        if (r.cree) comptesCrees++;
      } else {
        erreurs++;
      }
    }
    return NextResponse.json({ acceptes, comptesCrees, erreurs });
  }

  await prisma.cursusProspect.updateMany({
    where: { id: { in: ids }, cursusId: id },
    data: { statut: action === "REFUSER" ? "REFUSE" : "ATTENTE" },
  });
  return NextResponse.json({ ok: true });
}

// DELETE : retirer des lignes de la liste d'attente
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus || !peutGerer(role)) return NextResponse.json({ error: "Réservé au coordinateur ou à la secrétaire pédagogique" }, { status: 403 });

  const { ids } = await req.json() as { ids: string[] };
  await prisma.cursusProspect.deleteMany({ where: { id: { in: ids }, cursusId: id } });
  return NextResponse.json({ ok: true });
}
