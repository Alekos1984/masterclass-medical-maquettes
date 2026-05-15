import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getFormateurId(userId: string) {
  const profil = await prisma.formateurProfile.findUnique({ where: { userId } });
  return profil?.id ?? null;
}

// DELETE — remove a publication
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ pubId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const formateurId = await getFormateurId(session.user.id);
  if (!formateurId) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const { pubId } = await params;

  const pub = await prisma.publication.findUnique({ where: { id: pubId } });
  if (!pub || pub.formateurId !== formateurId) {
    return NextResponse.json({ error: "Publication introuvable" }, { status: 404 });
  }

  await prisma.publication.delete({ where: { id: pubId } });

  // Update publications count
  const remaining = await prisma.publication.count({ where: { formateurId } });
  await prisma.formateurProfile.update({
    where: { id: formateurId },
    data: { publications: remaining },
  });

  return NextResponse.json({ ok: true });
}
