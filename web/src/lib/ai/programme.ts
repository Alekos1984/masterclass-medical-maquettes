import { getOpenAI } from "./openai";
import type { ProgrammeItem } from "../pdf/shared/types";

/**
 * Calculate the end time by adding dureeHeures to heureDebut.
 * Example: calculerHeureFin("08:30", 7) => "15:30"
 */
function calculerHeureFin(heureDebut: string, dureeHeures: number): string {
  const [heuresStr, minutesStr] = heureDebut.split(":");
  const totalMinutes = parseInt(heuresStr ?? "8", 10) * 60 + parseInt(minutesStr ?? "0", 10) + Math.round(dureeHeures * 60);
  const heureFin = Math.floor(totalMinutes / 60) % 24;
  const minutesFin = totalMinutes % 60;
  return `${String(heureFin).padStart(2, "0")}:${String(minutesFin).padStart(2, "0")}`;
}

/**
 * Generate a detailed timetable from a short description.
 */
export async function genererProgramme(
  titre: string,
  description: string,
  dureeHeures: number,
  heureDebut: string,
  objectifs: string[],
  specialite?: string
): Promise<ProgrammeItem[]> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Tu es un expert en ingénierie pédagogique médicale et en organisation de formations DPC/Qualiopi.
Tu génères un programme de formation COMPLET et DÉTAILLÉ avec un déroulé horaire minute par minute.

RÈGLES STRICTES :
- Durée totale : exactement ${dureeHeures}h, de ${heureDebut} jusqu'à l'heure de fin calculée
- Chaque créneau a : time (format "HH:MM–HH:MM"), titre court, description (1-2 phrases utiles), type
- Types : "cours" | "atelier" | "cas_clinique" | "pause" | "evaluation" | "autre"
- Intègre impérativement des pauses : pause café (15-20 min) le matin, déjeuner (60-90 min) si > 5h, pause café (15 min) l'après-midi si > 6h
- Le contenu doit RÉELLEMENT RÉPONDRE aux objectifs pédagogiques listés
- La progression doit être logique : du général au particulier, de la théorie à la pratique
- Pour une formation médicale, préfère : exposé théorique → cas cliniques → mise en pratique → synthèse/évaluation
- Chaque objectif pédagogique doit correspondre à au moins un créneau
- Le titre du programme doit être accrocheur et médical
Retourne UNIQUEMENT un JSON : { "programme": [{ "time": "HH:MM–HH:MM", "titre": "...", "description": "...", "type": "..." }, ...] }`,
      },
      {
        role: "user",
        content: `Formation : "${titre}"${specialite ? ` — ${specialite}` : ""}
Durée : ${dureeHeures}h (début : ${heureDebut}, fin calculée : ${calculerHeureFin(heureDebut, dureeHeures)})
Description : ${description || "Non fournie"}
Objectifs pédagogiques :
${objectifs.length > 0 ? objectifs.map((o, i) => `${i + 1}. ${o}`).join("\n") : "Non spécifiés"}

Génère un programme COMPLET séquencé heure par heure, cohérent avec les objectifs et la durée.`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as { programme?: ProgrammeItem[] };
  return parsed.programme ?? [];
}
