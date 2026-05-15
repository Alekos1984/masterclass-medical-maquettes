import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { reformulerTexte } from "@/lib/ai/reformuler";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({}, { status: 401 });

  const { texte, type } = await req.json() as { texte: string; type: string };
  if (!texte) return NextResponse.json({ error: "Texte manquant" }, { status: 400 });

  const validTypes = ["description", "objectifs", "programme", "general"] as const;
  const safeType = validTypes.includes(type as typeof validTypes[number])
    ? (type as typeof validTypes[number])
    : "general";

  const reformule = await reformulerTexte(texte, safeType);
  return NextResponse.json({ texte: reformule });
}
