import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

function checkPin(pin: unknown): boolean {
  const adminPin = process.env.ADMIN_PIN;
  if (!adminPin) return true; // PIN not configured — skip check
  return pin === adminPin;
}

// PATCH /api/admin/users/[id] — update role
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { role, pin } = body;

  if (!checkPin(pin)) {
    return NextResponse.json({ error: "Code PIN incorrect" }, { status: 401 });
  }

  if (!["PARTICIPANT", "FORMATEUR", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
  }

  const user = await prisma.user.update({ where: { id }, data: { role } });

  if (role === "FORMATEUR") {
    const existing = await prisma.formateurProfile.findUnique({ where: { userId: id } });
    if (!existing) await prisma.formateurProfile.create({ data: { userId: id } });
  }

  if (role === "PARTICIPANT") {
    const existing = await prisma.participantProfile.findUnique({ where: { userId: id } });
    if (!existing) await prisma.participantProfile.create({ data: { userId: id } });
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

  if (id === session.user.id) {
    return NextResponse.json(
      { error: "Impossible de supprimer votre propre compte" },
      { status: 400 }
    );
  }

  let pin: unknown;
  try {
    const body = await req.json();
    pin = body.pin;
  } catch { pin = undefined; }

  if (!checkPin(pin)) {
    return NextResponse.json({ error: "Code PIN incorrect" }, { status: 401 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ message: "Compte supprimé" });
}
