import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Search PubMed via NCBI E-utilities (free, no API key needed)
async function searchPubMed(query: string, maxResults = 5): Promise<string> {
  try {
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json&sort=relevance`;
    const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(8000) });
    const searchData = await searchRes.json() as { esearchresult: { idlist: string[] } };
    const ids = searchData.esearchresult?.idlist ?? [];
    if (ids.length === 0) return "Aucun résultat PubMed pour cette requête.";

    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`;
    const summaryRes = await fetch(summaryUrl, { signal: AbortSignal.timeout(8000) });
    const summaryData = await summaryRes.json() as {
      result: Record<string, {
        uid: string;
        title: string;
        authors: { name: string }[];
        source: string;
        pubdate: string;
        elocationid: string;
      }>;
    };

    const articles = ids.map((id) => {
      const a = summaryData.result[id];
      if (!a) return null;
      const authors = a.authors?.slice(0, 3).map((x) => x.name).join(", ") ?? "—";
      const more = (a.authors?.length ?? 0) > 3 ? " et al." : "";
      return `PMID ${a.uid} — ${a.title}\n  ${authors}${more} · ${a.source} · ${a.pubdate}\n  https://pubmed.ncbi.nlm.nih.gov/${a.uid}/`;
    }).filter(Boolean);

    return articles.join("\n\n");
  } catch {
    return "Impossible d'accéder à PubMed pour le moment.";
  }
}

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

  const formation = await prisma.formation.findUnique({
    where: { id: formationId },
    select: { titre: true, description: true, objectifs: true, programme: true, specialite: true },
  });
  if (!formation) return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });

  const objectifsText = Array.isArray(formation.objectifs)
    ? (formation.objectifs as string[]).join("\n- ")
    : "";

  const systemPrompt = `Tu es un assistant pédagogique médical pour la formation "${formation.titre}" (${formation.specialite}).

Contexte du cours :
${formation.description ?? ""}

Objectifs : ${objectifsText}

RÈGLES :
1. Réponds en lien avec cette formation et la spécialité ${formation.specialite}.
2. Pour les références bibliographiques, utilise TOUJOURS l'outil search_pubmed — ne cite jamais une étude de mémoire.
3. Les résultats PubMed que tu reçois sont réels et vérifiés : tu peux les présenter avec leur PMID et lien.
4. Si tu n'es pas certain d'une information clinique, dis-le explicitement.
5. Tu n'es pas un outil de décision clinique.
6. Réponds en français, de façon concise.`;

  const tools: OpenAI.Chat.ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "search_pubmed",
        description: "Recherche des articles scientifiques sur PubMed (base de données médicale officielle NIH). Utilise cet outil pour toute question sur des études, publications ou références médicales.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Requête de recherche en anglais (meilleurs résultats). Ex: 'rTMS depression treatment 2023'",
            },
          },
          required: ["query"],
        },
      },
    },
  ];

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history.slice(-6).map((m) => ({ role: m.role, content: m.content } as OpenAI.Chat.ChatCompletionMessageParam)),
    { role: "user", content: message.trim() },
  ];

  try {
    // First call — may trigger tool use
    const first = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools,
      tool_choice: "auto",
      max_tokens: 800,
      temperature: 0.2,
    });

    const firstMsg = first.choices[0]?.message;
    if (!firstMsg) return NextResponse.json({ reply: "Pas de réponse." });

    // If the model wants to call PubMed
    if (firstMsg.tool_calls?.length) {
      const toolCall = firstMsg.tool_calls[0];
      if (toolCall.type !== "function") return NextResponse.json({ reply: "Erreur interne." });
      const args = JSON.parse(toolCall.function.arguments) as { query: string };
      const pubmedResults = await searchPubMed(args.query);

      // Second call with PubMed results injected
      const second = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          ...messages,
          firstMsg,
          {
            role: "tool",
            tool_call_id: toolCall.id,
            content: pubmedResults,
          },
        ],
        max_tokens: 800,
        temperature: 0.2,
      });

      const reply = second.choices[0]?.message?.content ?? "Pas de réponse.";
      return NextResponse.json({ reply, pubmedUsed: true });
    }

    return NextResponse.json({ reply: firstMsg.content ?? "Pas de réponse." });
  } catch (e) {
    console.error("OpenAI error:", e);
    if (e instanceof OpenAI.APIError) {
      const msg =
        e.status === 401 ? "Clé API OpenAI invalide ou expirée" :
        e.status === 403 ? "Accès refusé — vérifiez les permissions de votre clé OpenAI" :
        e.status === 429 ? "Quota OpenAI dépassé — réessayez dans quelques instants" :
        e.status === 503 ? "Service OpenAI temporairement indisponible" :
        `Erreur OpenAI (${e.status}) : ${e.message}`;
      return NextResponse.json({ error: msg }, { status: 500 });
    }
    return NextResponse.json({ error: `Erreur inattendue : ${e instanceof Error ? e.message : String(e)}` }, { status: 500 });
  }
}
