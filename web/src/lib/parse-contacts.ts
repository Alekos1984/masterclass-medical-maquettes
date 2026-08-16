// Parseur intelligent de contacts (règles, sans LLM) — partagé serveur/client.
// Détecte par ligne : email, téléphone, civilités (Dr, Pr, Mme…), initiales
// (S., M.V., J-M.), NOM en majuscules, Prénom capitalisé (Marie-Claire…),
// le reste = fonction/note. Enrichit depuis l'email quand un champ manque.

export type ParsedContact = { email: string; nom: string; prenom: string; phone: string; fonction: string };

const TITLES = new Set([
  "dr", "dr.", "pr", "pr.", "prof", "prof.",
  "docteur", "docteure", "professeur", "professeure",
  "mme", "mlle", "monsieur", "madame", "mademoiselle",
  "mr", "mr.", "ms", "ms.",
]);

function isTitle(w: string) { return TITLES.has(w.toLowerCase()); }
function isInitial(w: string) {
  if (w.length > 6 || !w.includes(".")) return false;
  return /^(?:[A-ZÀ-Ý][.\-]?)+$/.test(w);
}
function isAllUpper(w: string) {
  if (isInitial(w) || w.length < 2) return false;
  return w === w.toUpperCase() && /[A-ZÀ-Ý]/.test(w);
}
function isCapitalized(w: string) {
  if (isInitial(w) || isTitle(w)) return false;
  return /^[A-ZÀ-Ý][a-zà-ÿ']*(?:-[A-ZÀ-Ý][a-zà-ÿ']*)*$/.test(w);
}
function capitalizeName(s: string): string {
  return s.toLowerCase().replace(/(^|-)([a-zà-ÿ])/g, (_, sep, c: string) => sep + c.toUpperCase());
}
function namesFromEmail(email: string): { prenom: string; nom: string } {
  const local = email.split("@")[0];
  const parts = local.split(/[._]+/).filter((p) => p.length > 1);
  if (parts.length === 0) return { prenom: "", nom: "" };
  if (parts.length === 1) return { prenom: capitalizeName(parts[0]), nom: "" };
  return {
    prenom: capitalizeName(parts[0]),
    nom: parts.slice(1).map((p) => p.toUpperCase()).join(" "),
  };
}

export function parseContacts(text: string): ParsedContact[] {
  const results: ParsedContact[] = [];
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    const emailMatch = line.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/);
    if (!emailMatch) continue;
    const email = emailMatch[0].toLowerCase();

    let rest = line.replace(emailMatch[0], " ");
    const phoneMatch = rest.match(/(?:\+\d{1,3}[\s.-]?)?(?:\(?0\)?[\s.-]?)?[1-9](?:[\s.-]?\d{2}){4}/);
    const phone = phoneMatch ? phoneMatch[0].replace(/[\s.-]+/g, " ").trim() : "";
    if (phoneMatch) rest = rest.replace(phoneMatch[0], " ");

    const tokens = rest
      .split(/[;,\t|]/)
      .flatMap((t) => t.split(/\s+/))
      .map((t) => t.trim().replace(/[,;]$/, ""))
      .filter((t) => t && t !== "-" && t !== "&");

    let nom = "";
    let prenom = "";
    const titles: string[] = [];
    const fonctionParts: string[] = [];

    for (const tok of tokens) {
      if (isTitle(tok)) { titles.push(tok); continue; }
      if (isInitial(tok)) continue;
      if (isAllUpper(tok)) {
        if (!nom) nom = tok; else fonctionParts.push(tok);
        continue;
      }
      if (isCapitalized(tok)) {
        if (!prenom) prenom = tok;
        else if (!nom) nom = tok.toUpperCase();
        else fonctionParts.push(tok);
        continue;
      }
      if (tok.toLowerCase() !== "x") fonctionParts.push(tok);
    }

    if (!prenom || !nom) {
      const fromEmail = namesFromEmail(email);
      if (!prenom && fromEmail.prenom) prenom = fromEmail.prenom;
      if (!nom && fromEmail.nom) nom = fromEmail.nom;
    }

    const fonction = [...titles, ...fonctionParts].join(" ").replace(/\s+/g, " ").trim();
    results.push({ email, nom, prenom, phone, fonction });
  }
  const seen = new Set<string>();
  return results.filter((r) => (seen.has(r.email) ? false : (seen.add(r.email), true)));
}
