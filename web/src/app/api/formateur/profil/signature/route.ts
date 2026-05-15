import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { signatureBase64 } = await req.json() as { signatureBase64: string };
  await prisma.formateurProfile.update({
    where: { userId: session.user.id },
    data: { signatureBase64 },
  });
  return NextResponse.json({ ok: true });
}
