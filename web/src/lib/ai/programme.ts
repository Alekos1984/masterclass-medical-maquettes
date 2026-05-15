import { getOpenAI } from "./openai";
import type { ProgrammeItem } from "../pdf/shared/types";

/**
 * Generate a detailed timetable from a short description.
 */
export async function genererProgramme(
  titre: string,
  description: string,
  dureeHeures: number,
  heureDebut: string,
  objectifs: string[]
): Promise<ProgrammeItem[]> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Tu es un expert en ingénierie pédagogique médicale.
Tu génères un programme de formation détaillé avec un déroulé horaire précis.
Chaque item doit avoir : heure (format "HH:MM"), titre, description (1-2 phrases), type.
Types possibles : "cours" | "atelier" | "pause" | "evaluation" | "autre"
Inclus des pauses (café, déjeuner) aux moments appropriés.
Commence à l'heure indiquée, termine selon la durée.
Retourne un JSON : { "programme": [{heure, titre, description, type}, ...] }`,
      },
      {
        role: "user",
        content: `Formation : "${titre}"
Durée : ${dureeHeures}h (début : ${heureDebut})
Description : ${description}
Objectifs : ${objectifs.join(" / ")}

Génère un programme détaillé heure par heure.`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as { programme?: ProgrammeItem[] };
  return parsed.programme ?? [];
}
