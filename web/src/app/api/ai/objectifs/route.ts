import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { restructurerObjectifs } from "@/lib/ai/objectifs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({}, { status: 401 });

  const body = await req.json() as { objectifsRaw?: string; titre: string; specialite?: string };
  const { titre, specialite } = body;
  const objectifsRaw = body.objectifsRaw ?? "";

  if (!titre) return NextResponse.json({ error: "Titre manquant" }, { status: 400 });

  const objectifs = await restructurerObjectifs(objectifsRaw, titre, specialite);
  return NextResponse.json({ objectifs });
}
