import { getOpenAI } from "./openai";
import type { SatisfactionData } from "../pdf/shared/types";

interface BilanAnalyse {
  synthese: string;
  pointsForts: string[];
  pointsAmelioration: string[];
  recommandations: string[];
}

/**
 * Generate a J+3 pedagogical report from satisfaction responses.
 */
export async function genererBilan(
  titre: string,
  objectifs: string[],
  reponses: SatisfactionData[]
): Promise<BilanAnalyse> {
  const openai = getOpenAI();

  if (reponses.length === 0) {
    return {
      synthese: "Aucun questionnaire de satisfaction n'a été complété pour cette session.",
      pointsForts: [],
      pointsAmelioration: [],
      recommandations: ["Encourager les participants à remplir le questionnaire de satisfaction lors de la prochaine session."],
    };
  }

  function avg(vals: (number | null | undefined)[]) {
    const v = vals.filter((x): x is number => x != null);
    return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : "N/A";
  }

  const stats = {
    n: reponses.length,
    moyContenu: avg(reponses.map((r) => r.noteContenu)),
    moyFormateur: avg(reponses.map((r) => r.noteFormateur)),
    moyOrganisation: avg(reponses.map((r) => r.noteOrganisation)),
    moySupport: avg(reponses.map((r) => r.noteSupport)),
    moyGlobal: avg(reponses.map((r) => r.noteGlobal)),
    tauxObjectifs: Math.round((reponses.filter((r) => r.objectifsAtteints).length / reponses.length) * 100),
    tauxRecommande: Math.round((reponses.filter((r) => r.recommanderait).length / reponses.length) * 100),
    verbatimsForts: reponses.map((r) => r.pointsForts).filter(Boolean).slice(0, 10),
    verbatimsAmelio: reponses.map((r) => r.pointsAmelioration).filter(Boolean).slice(0, 10),
    verbatimsLibres: reponses.map((r) => r.commentaireLibre).filter(Boolean).slice(0, 5),
  };

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Tu es un expert en évaluation pédagogique pour la formation médicale.
Tu analyses les résultats d'une formation et rédiges un bilan pédagogique J+3 professionnel.
Ton analyse est factuelle, constructive et orientée amélioration continue.
Retourne un JSON : { "synthese": "...", "pointsForts": ["...", ...], "pointsAmelioration": ["...", ...], "recommandations": ["...", ...] }
Chaque liste doit contenir 3 à 5 éléments concrets et actionnables.`,
      },
      {
        role: "user",
        content: `Formation : "${titre}"
Objectifs pédagogiques : ${objectifs.join(" / ")}

Statistiques (${stats.n} répondants) :
- Note globale : ${stats.moyGlobal}/5
- Contenu : ${stats.moyContenu}/5
- Formateur : ${stats.moyFormateur}/5
- Organisation : ${stats.moyOrganisation}/5
- Supports : ${stats.moySupport}/5
- Objectifs atteints : ${stats.tauxObjectifs}%
- Recommanderait : ${stats.tauxRecommande}%

Points forts exprimés : ${stats.verbatimsForts.join(" | ")}
Axes d'amélioration suggérés : ${stats.verbatimsAmelio.join(" | ")}
Commentaires libres : ${stats.verbatimsLibres.join(" | ")}

Rédige le bilan pédagogique J+3.`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  return JSON.parse(content) as BilanAnalyse;
}
