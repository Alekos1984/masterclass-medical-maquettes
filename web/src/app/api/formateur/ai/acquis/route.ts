import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { titre, objectifs, description } = await req.json() as {
    titre: string;
    objectifs: string[];
    description: string;
  };

  const client = new Anthropic();
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,
    messages: [
      {
        role: "user",
        content: `Pour la formation médicale "${titre}", génère une liste de 5 à 8 acquis de formation (compétences que les participants auront acquis).
Description: ${description}
Objectifs: ${objectifs.join(", ")}
Réponds uniquement avec la liste des acquis, un par ligne, sans numérotation, format: "• [acquis]"`,
      },
    ],
  });

  const text = (message.content[0] as { type: string; text: string }).text;
  return NextResponse.json({ acquis: text });
}
