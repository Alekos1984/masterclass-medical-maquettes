import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Service IA non configuré" }, { status: 503 });
  }

  const { formationId, message, history } = await req.json() as {
    formationId: string;
    message: string;
    history: { role: "user" | "assistant"; content: string }[];
  };

  if (!message?.trim()) return NextResponse.json({ error: "Message vide" }, { status: 400 });

  // Load formation context
  const formation = await prisma.formation.findUnique({
    where: { id: formationId },
    select: { titre: true, description: true, objectifs: true, programme: true, specialite: true },
  });
  if (!formation) return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });

  const objectifsText = Array.isArray(formation.objectifs)
    ? (formation.objectifs as string[]).join("\n- ")
    : "";
  const programmeText = Array.isArray(formation.programme)
    ? (formation.programme as { titre?: string; description?: string }[])
        .map((p) => `• ${p.titre ?? ""} ${p.description ?? ""}`.trim())
        .join("\n")
    : "";

  const systemPrompt = `Tu es un assistant pédagogique médical pour la formation suivante :

TITRE : ${formation.titre}
SPÉCIALITÉ : ${formation.specialite}
DESCRIPTION : ${formation.description ?? ""}
OBJECTIFS :
- ${objectifsText}
PROGRAMME :
${programmeText}

RÈGLES STRICTES :
1. Réponds UNIQUEMENT aux questions en lien avec cette formation et cette spécialité médicale.
2. Si tu cites des études ou références scientifiques, mentionne systématiquement : "À vérifier sur PubMed/ClinicalKey" et n'invente JAMAIS de DOI, PMID ou auteurs.
3. Si tu n'es pas certain d'une information médicale, dis-le explicitement : "Cette information nécessite vérification auprès de sources officielles."
4. Pour toute question clinique sur un patient, rappelle que tu es un outil pédagogique et non un outil de décision clinique.
5. Réponds en français, de façon concise et structurée.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...history.slice(-6), // Keep last 6 exchanges for context
        { role: "user", content: message.trim() },
      ],
      max_tokens: 600,
      temperature: 0.3, // Low temperature for factual medical content
    });

    const reply = completion.choices[0]?.message?.content ?? "Désolé, je n'ai pas pu répondre.";
    return NextResponse.json({ reply });
  } catch (e) {
    console.error("OpenAI error:", e);
    return NextResponse.json({ error: "Erreur IA" }, { status: 500 });
  }
}
