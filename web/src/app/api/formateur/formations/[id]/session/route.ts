import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Action = "start" | "pause" | "resume" | "stop" | "reopen";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json()) as { action?: Action };
  const action = body.action;

  if (!action || !["start", "pause", "resume", "stop", "reopen"].includes(action)) {
    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  }

  // Verify ownership
  const profil = await prisma.formateurProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profil) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const formation = await prisma.formation.findUnique({
    where: { id },
    select: {
      formateurId: true,
      sessionStatus: true,
      sessionStartedAt: true,
      sessionEndedAt: true,
    },
  });
  if (!formation || formation.formateurId !== profil.id) {
    return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });
  }

  const current = formation.sessionStatus ?? "IDLE";
  const now = new Date();

  const data: {
    sessionStatus?: string;
    sessionStartedAt?: Date | null;
    sessionEndedAt?: Date | null;
  } = {};

  switch (action) {
    case "start":
      data.sessionStatus = "EN_COURS";
      if (!formation.sessionStartedAt) data.sessionStartedAt = now;
      data.sessionEndedAt = null;
      break;
    case "pause":
      if (current !== "EN_COURS") {
        return NextResponse.json({ error: "Transition invalide" }, { status: 400 });
      }
      data.sessionStatus = "EN_PAUSE";
      break;
    case "resume":
      if (current !== "EN_PAUSE") {
        return NextResponse.json({ error: "Transition invalide" }, { status: 400 });
      }
      data.sessionStatus = "EN_COURS";
      break;
    case "stop":
      if (current !== "EN_COURS" && current !== "EN_PAUSE") {
        return NextResponse.json({ error: "Transition invalide" }, { status: 400 });
      }
      data.sessionStatus = "TERMINEE";
      data.sessionEndedAt = now;
      break;
    case "reopen":
      if (current !== "TERMINEE") {
        return NextResponse.json({ error: "Transition invalide" }, { status: 400 });
      }
      data.sessionStatus = "EN_PAUSE";
      data.sessionEndedAt = null;
      break;
  }

  const updated = await prisma.formation.update({
    where: { id },
    data,
    select: {
      sessionStatus: true,
      sessionStartedAt: true,
      sessionEndedAt: true,
    },
  });

  return NextResponse.json({
    sessionStatus: updated.sessionStatus,
    sessionStartedAt: updated.sessionStartedAt?.toISOString() ?? null,
    sessionEndedAt: updated.sessionEndedAt?.toISOString() ?? null,
  });
}
