import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOpenAI } from "@/lib/ai/openai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { titre, objectifs, description } = await req.json() as {
    titre: string;
    objectifs: string[];
    description: string;
  };

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content: "Tu es un expert en ingénierie pédagogique pour la formation médicale continue. Tu génères des acquis de formation clairs et opérationnels.",
      },
      {
        role: "user",
        content: `Pour la formation médicale "${titre}", génère une liste de 5 à 8 acquis de formation (compétences concrètes acquises par les participants à l'issue de la formation).
Description : ${description || "Non renseignée"}
Objectifs : ${objectifs.length ? objectifs.join(", ") : "Non renseignés"}
Réponds uniquement avec la liste, un acquis par ligne, format : "• [acquis]"`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content ?? "";
  return NextResponse.json({ acquis: text });
}
