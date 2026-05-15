import { getOpenAI } from "./openai";

export async function reformulerTexte(texte: string, type: "description" | "objectifs" | "programme" | "general"): Promise<string> {
  const openai = getOpenAI();

  const systemPrompts: Record<string, string> = {
    description: `Tu es un expert en marketing de formation médicale continue. Reformule la description fournie pour la rendre plus claire, professionnelle et attractive pour des médecins. Conserve les informations essentielles, améliore la structure et le style. Retourne un JSON : { "texte": "..." }`,
    objectifs: `Tu es un expert en ingénierie pédagogique Qualiopi. Reformule les objectifs pédagogiques fournis en objectifs SMART commençant par un verbe d'action à l'infinitif. Retourne un JSON : { "texte": "..." } — un objectif par ligne.`,
    programme: `Tu es un expert en organisation de formations médicales. Reformule le programme fourni pour améliorer la clarté et la cohérence pédagogique. Conserve le format "HH:MM–HH:MM | Titre | Description | Type". Retourne un JSON : { "texte": "..." }`,
    general: `Tu es un expert en communication professionnelle médicale. Reformule le texte fourni pour le rendre plus clair et professionnel. Retourne un JSON : { "texte": "..." }`,
  };

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompts[type] ?? systemPrompts.general },
      { role: "user", content: texte },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as { texte?: string };
  return parsed.texte ?? texte;
}
