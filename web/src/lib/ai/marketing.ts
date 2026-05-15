import { getOpenAI } from "./openai";

interface MarketingContent {
  headline: string;        // Titre accrocheur pour l'affiche (max 8 mots)
  accroche: string;        // Sous-titre descriptif (max 30 mots)
  linkedin: string;        // Post LinkedIn complet (280-400 mots)
  bullet1: string;         // 3 arguments clés pour l'affiche
  bullet2: string;
  bullet3: string;
}

/**
 * Generate marketing copy for the affiche A4 and LinkedIn post.
 */
export async function genererMarketing(
  titre: string,
  specialite: string,
  description: string,
  objectifs: string[],
  formateurNom: string,
  date: string,
  ville: string | null | undefined,
  prixHT: number
): Promise<MarketingContent> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Tu es un expert en marketing pour la formation médicale continue.
Tu rédiges des textes percutants pour des professionnels de santé (médecins, chirurgiens, spécialistes).
Ton style : direct, professionnel, valorisant l'expertise et le ROI clinique.
Retourne un JSON avec les champs : headline, accroche, linkedin, bullet1, bullet2, bullet3.`,
      },
      {
        role: "user",
        content: `Formation : "${titre}"
Spécialité : ${specialite}
Formateur : ${formateurNom}
Date : ${date}
Lieu : ${ville ?? "En ligne"}
Prix : ${prixHT}€ HT
Description : ${description}
Objectifs : ${objectifs.join(" / ")}

Génère le contenu marketing (affiche + LinkedIn).`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  return JSON.parse(content) as MarketingContent;
}
