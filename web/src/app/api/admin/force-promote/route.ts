import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { secret, email } = await req.json() as { secret: string; email: string };

  const setupSecret = process.env.ADMIN_SETUP_SECRET;
  if (!setupSecret || secret !== setupSecret) {
    return NextResponse.json({ error: "Secret invalide." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });

  await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
  return NextResponse.json({ ok: true, message: `${email} est maintenant ADMIN.` });
}
