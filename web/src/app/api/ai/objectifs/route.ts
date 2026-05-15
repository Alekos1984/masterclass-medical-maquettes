import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { restructurerObjectifs } from "@/lib/ai/objectifs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({}, { status: 401 });

  const { objectifsRaw, titre } = await req.json() as { objectifsRaw: string; titre: string };
  if (!objectifsRaw || !titre) return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });

  const objectifs = await restructurerObjectifs(objectifsRaw, titre);
  return NextResponse.json({ objectifs });
}
