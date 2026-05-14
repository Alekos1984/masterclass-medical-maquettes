import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

// PATCH /api/admin/users/[id] — update role
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;
  const { role } = await req.json();

  if (!["PARTICIPANT", "FORMATEUR", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
  });

  // Create profile if switching to FORMATEUR and none exists
  if (role === "FORMATEUR") {
    const existing = await prisma.formateurProfile.findUnique({ where: { userId: id } });
    if (!existing) {
      await prisma.formateurProfile.create({ data: { userId: id } });
    }
  }

  // Create profile if switching to PARTICIPANT and none exists
  if (role === "PARTICIPANT") {
    const existing = await prisma.participantProfile.findUnique({ where: { userId: id } });
    if (!existing) {
      await prisma.participantProfile.create({ data: { userId: id } });
    }
  }

  return NextResponse.json({ message: "Rôle mis à jour", user });
}

// DELETE /api/admin/users/[id] — delete user
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;

  // Prevent deleting yourself
  if (id === session.user.id) {
    return NextResponse.json(
      { error: "Impossible de supprimer votre propre compte" },
      { status: 400 }
    );
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ message: "Compte supprimé" });
}
