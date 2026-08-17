// Calendrier des vacances scolaires françaises (zones A, B, C) — dates codées en dur
// et vérifiées auprès de plusieurs sources concordantes (calendrier officiel du
// ministère de l'Éducation nationale ; arrêtés du 22/10/2025 pour 2026-2027 et du
// 23/07/2026 pour 2027-2028). On ne fait PAS confiance à la mémoire d'un LLM pour ces
// dates — même défaut que pour le jour de semaine, mais pour les vacances scolaires.
//
// ⚠️ À mettre à jour chaque année : le ministère publie généralement le calendrier de
// l'année suivante entre juillet et octobre. Sans donnée pour une période donnée,
// `estEnVacances` renvoie false (on ne bloque jamais une date faute de donnée).

export type ZoneScolaire = "A" | "B" | "C";

type Periode = { debut: string; fin: string }; // YYYY-MM-DD, inclusif

// Toussaint et Noël sont communes aux 3 zones.
const PERIODES_COMMUNES: Periode[] = [
  { debut: "2026-10-17", fin: "2026-11-02" }, // Toussaint 2026
  { debut: "2026-12-19", fin: "2027-01-04" }, // Noël 2026-2027
  { debut: "2027-10-23", fin: "2027-11-08" }, // Toussaint 2027
  { debut: "2027-12-18", fin: "2028-01-03" }, // Noël 2027-2028
];

// Hiver et printemps sont décalés par zone (l'ordre de départ tourne chaque année).
const PERIODES_PAR_ZONE: Record<ZoneScolaire, Periode[]> = {
  A: [
    { debut: "2027-02-13", fin: "2027-03-01" }, // Hiver 2027
    { debut: "2027-04-10", fin: "2027-04-26" }, // Printemps 2027
    { debut: "2028-02-19", fin: "2028-03-06" }, // Hiver 2028
    { debut: "2028-04-22", fin: "2028-05-09" }, // Printemps 2028
  ],
  B: [
    { debut: "2027-02-20", fin: "2027-03-08" },
    { debut: "2027-04-17", fin: "2027-05-03" },
    { debut: "2028-02-05", fin: "2028-02-21" },
    { debut: "2028-04-08", fin: "2028-04-24" },
  ],
  C: [
    { debut: "2027-02-06", fin: "2027-02-22" },
    { debut: "2027-04-03", fin: "2027-04-19" },
    { debut: "2028-02-12", fin: "2028-02-28" },
    { debut: "2028-04-15", fin: "2028-05-02" },
  ],
};

export function estEnVacances(dateStr: string, zone: ZoneScolaire): boolean {
  return [...PERIODES_COMMUNES, ...PERIODES_PAR_ZONE[zone]].some((p) => dateStr >= p.debut && dateStr <= p.fin);
}

/** Détecte une zone académique à partir d'un texte libre (mention explicite "zone X", région ou ville). */
export function detecterZoneScolaire(texte: string): ZoneScolaire | null {
  const t = texte.toLowerCase();
  const explicite = t.match(/zone\s*([abc])\b/);
  if (explicite) return explicite[1].toUpperCase() as ZoneScolaire;

  const villesParZone: [ZoneScolaire, string[]][] = [
    ["C", ["paris", "région parisienne", "region parisienne", "ile-de-france", "île-de-france", "idf", "créteil", "creteil", "versailles"]],
    ["A", ["lyon", "grenoble", "bordeaux", "dijon", "besançon", "besancon", "clermont-ferrand", "limoges", "poitiers"]],
    ["B", ["lille", "nantes", "marseille", "aix-marseille", "nice", "strasbourg", "rennes", "reims", "amiens", "caen", "normandie", "orléans", "orleans", "tours", "nancy", "metz"]],
  ];
  for (const [zone, villes] of villesParZone) {
    if (villes.some((v) => t.includes(v))) return zone;
  }
  return null;
}
