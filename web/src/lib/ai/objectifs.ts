import { getOpenAI } from "./openai";

/**
 * Restructure raw pedagogical objectives into SMART Qualiopi-compliant format.
 * Input: free text from the formateur
 * Output: array of 3-6 SMART objectives
 */
export async function restructurerObjectifs(objectifsRaw: string, titre: string, specialite?: string, description?: string): Promise<string[]> {
  const openai = getOpenAI();

  const hasRaw = objectifsRaw.trim().length > 0;
  const systemContent = `Tu es un expert en ingénierie pédagogique pour la formation médicale continue (FMC) et Qualiopi.
${hasRaw ? "Tu reformules des objectifs pédagogiques existants" : "Tu génères des objectifs pédagogiques"} en objectifs SMART (Spécifiques, Mesurables, Atteignables, Réalistes, Temporellement définis).
Chaque objectif doit :
- Commencer par un verbe d'action à l'infinitif (Identifier, Décrire, Appliquer, Analyser, Mettre en œuvre...)
- Être mesurable et évaluable
- Être réaliste pour une formation d'une journée max
- Respecter le format Qualiopi
Retourne un JSON : { "objectifs": ["...", "...", "..."] } — entre 3 et 6 objectifs.`;

  const descriptionSuffix = description && description.trim() ? `\n\nDescription de la formation :\n${description}` : "";

  const userContent = hasRaw
    ? `Formation : "${titre}"${specialite ? ` — ${specialite}` : ""}\n\nObjectifs actuels :\n${objectifsRaw}${descriptionSuffix}`
    : `Formation : "${titre}"${specialite ? ` — spécialité : ${specialite}` : ""}\n\nGénère 4 à 5 objectifs pédagogiques SMART adaptés à cette formation médicale.${descriptionSuffix}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemContent },
      { role: "user", content: userContent },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as { objectifs?: string[] };
  return parsed.objectifs ?? [];
}
