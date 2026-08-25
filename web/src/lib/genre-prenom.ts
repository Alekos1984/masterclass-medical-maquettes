// Détection simple et déterministe du genre probable d'un prénom français, pour
// adapter "cher/chère" dans les messages générés (proposition de créneau). Ni
// exhaustif ni infaillible : pour un prénom composé, étranger ou épicène absent de
// la liste, on renvoie null et l'appelant retombe sur une formulation neutre
// ("cher·ère") plutôt que de deviner au hasard.

function normaliser(s: string): string {
  return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function extrairePrenom(nomComplet: string): string {
  return nomComplet.trim().split(/\s+/)[0] ?? "";
}

const PRENOMS_FEMININS = new Set([
  "marie", "sophie", "isabelle", "catherine", "nathalie", "nicole", "monique", "françoise", "francoise",
  "sylvie", "christine", "brigitte", "martine", "jacqueline", "chantal", "anne", "anne-marie", "julie",
  "claire", "camille", "sarah", "sara", "laura", "laure", "emma", "léa", "lea", "chloé", "chloe", "manon",
  "lucie", "julia", "juliette", "clara", "louise", "alice", "sophia", "zoé", "zoe", "inès", "ines", "eva",
  "jeanne", "marguerite", "hélène", "helene", "béatrice", "beatrice", "véronique", "veronique", "corinne",
  "valérie", "valerie", "patricia", "sandrine", "stéphanie", "stephanie", "céline", "celine", "aurélie",
  "aurelie", "delphine", "virginie", "caroline", "élodie", "elodie", "laëtitia", "laetitia", "amandine",
  "pauline", "morgane", "mélanie", "melanie", "audrey", "élise", "elise", "charlotte", "victoire", "diane",
  "florence", "danielle", "michèle", "michele", "annie", "colette", "denise", "yvette",
  "simone", "odile", "geneviève", "genevieve", "andrée", "andree", "gisèle", "gisele", "renée", "renee",
  "pascale", "maryline", "marylène", "marylene", "myriam", "yasmine", "nadia", "samira", "fatima", "leila",
  "vanessa", "cindy", "jessica", "mélissa", "melissa", "sabrina", "karine", "carole", "cécile", "cecile",
  "agnès", "agnes", "christelle", "estelle", "gaëlle", "gaelle", "magali", "muriel", "noémie",
  "noemie", "olivia", "romane", "salomé", "salome", "tiphaine", "yolande", "hannah", "eugénie", "eugenie",
  "liliane", "solange", "suzanne", "thérèse", "therese", "madeleine", "berthe", "gabrielle", "adèle",
  "adele", "constance", "joséphine", "josephine", "margot", "mathilde", "océane", "oceane", "capucine",
]);

const PRENOMS_MASCULINS = new Set([
  "jean", "pierre", "michel", "alain", "philippe", "bernard", "gérard", "gerard", "jacques", "daniel",
  "andré", "andre", "christian", "patrick", "robert", "yves", "roger", "henri", "claude", "marcel",
  "louis", "paul", "gilles", "raymond", "georges", "françois", "francois", "guy", "jean-pierre",
  "jean-claude", "jean-marc", "jean-luc", "jean-paul", "marc", "denis", "didier", "hervé",
  "herve", "olivier", "pascal", "serge", "thierry", "vincent", "bruno", "eric", "éric", "frédéric",
  "frederic", "laurent", "nicolas", "sébastien", "sebastien", "stéphane", "stephane", "alexandre",
  "antoine", "arnaud", "benjamin", "cédric", "cedric", "christophe", "cyril", "damien", "david", "emmanuel",
  "fabien", "florent", "florian", "franck", "grégory", "gregory", "guillaume", "hugo", "jérôme", "jerome",
  "julien", "kevin", "ludovic", "mathieu", "matthieu", "maxime", "mickael", "mickaël", "nathan", "quentin",
  "raphaël", "raphael", "rémi", "remi", "romain", "samuel", "simon", "sylvain", "thomas", "valentin",
  "victor", "xavier", "yannick", "adrien", "alexis", "anthony", "aurélien", "aurelien",
  "baptiste", "clément", "clement", "corentin", "enzo", "ethan", "gabriel", "gaspard", "hugues", "jules",
  "lucas", "léo", "leo", "mathis", "maxence", "noah", "théo", "theo", "tristan", "gilbert", "jean-michel",
  "philippe-marie", "bertrand", "gérald", "gerald", "loïc", "loic", "yann", "erwan", "gwenaël",
  "gwenael", "malo", "ronan", "yohann",
]);

export function detecterGenre(prenom: string): "M" | "F" | null {
  const p = normaliser(prenom);
  if (PRENOMS_FEMININS.has(p)) return "F";
  if (PRENOMS_MASCULINS.has(p)) return "M";
  return null;
}
