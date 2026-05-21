import { getOpenAI } from "./openai";

export type ProgrammeSlot = {
  heureDebut: string;
  heureFin: string;
  titre: string;
  description: string;
  type: "cours" | "atelier" | "cas_clinique" | "pause" | "evaluation" | "autre";
};

function calculerHeureFin(heureDebut: string, dureeHeures: number): string {
  const [heuresStr, minutesStr] = heureDebut.split(":");
  const totalMinutes = parseInt(heuresStr ?? "8", 10) * 60 + parseInt(minutesStr ?? "0", 10) + Math.round(dureeHeures * 60);
  const heureFin = Math.floor(totalMinutes / 60) % 24;
  const minutesFin = totalMinutes % 60;
  return `${String(heureFin).padStart(2, "0")}:${String(minutesFin).padStart(2, "0")}`;
}

export async function genererProgramme(
  titre: string,
  description: string,
  dureeHeures: number,
  heureDebut: string,
  objectifs: string[],
  specialite?: string
): Promise<ProgrammeSlot[]> {
  const openai = getOpenAI();
  const heureFin = calculerHeureFin(heureDebut, dureeHeures);

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Tu es un expert en ingénierie pédagogique médicale et en organisation de formations DPC/Qualiopi.
Tu génères un programme de formation COMPLET et DÉTAILLÉ avec un déroulé horaire précis.

RÈGLES STRICTES :
- Durée totale : exactement ${dureeHeures}h, de ${heureDebut} jusqu'à ${heureFin}
- Chaque créneau a : heureDebut (format "HH:MM"), heureFin (format "HH:MM"), titre court, description (1-2 phrases), type
- Types possibles : "cours" | "atelier" | "cas_clinique" | "pause" | "evaluation" | "autre"
- Intègre impérativement des pauses : pause café (15-20 min) le matin, déjeuner (60-90 min) si > 5h, pause café (15 min) l'après-midi si > 6h
- Le contenu doit RÉELLEMENT RÉPONDRE aux objectifs pédagogiques listés
- La progression doit être logique : du général au particulier, de la théorie à la pratique
- Pour une formation médicale, préfère : exposé théorique → cas cliniques → mise en pratique → synthèse/évaluation
- Les créneaux doivent se chaîner sans chevauchement (heureFin[i] == heureDebut[i+1])
Retourne UNIQUEMENT un JSON : { "programme": [{ "heureDebut": "HH:MM", "heureFin": "HH:MM", "titre": "...", "description": "...", "type": "..." }, ...] }`,
      },
      {
        role: "user",
        content: `Formation : "${titre}"${specialite ? ` — ${specialite}` : ""}
Durée : ${dureeHeures}h (début : ${heureDebut}, fin : ${heureFin})
Description : ${description || "Non fournie"}
Objectifs pédagogiques :
${objectifs.length > 0 ? objectifs.map((o, i) => `${i + 1}. ${o}`).join("\n") : "Non spécifiés"}

Génère un programme COMPLET séquencé, cohérent avec les objectifs et la durée.`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as { programme?: ProgrammeSlot[] };
  return parsed.programme ?? [];
}
