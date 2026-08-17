// Calcul du volume horaire des créneaux (hors pauses) — utilisé côté client (onglet
// Journées & créneaux) et côté serveur (PDF programme). Pas de dépendance Prisma ici
// exprès, pour rester importable depuis un composant client.

export function dureeMinutes(heureDebut: string, heureFin: string): number {
  const [h1, m1] = heureDebut.split(":").map(Number);
  const [h2, m2] = heureFin.split(":").map(Number);
  if ([h1, m1, h2, m2].some((n) => Number.isNaN(n))) return 0;
  const minutes = h2 * 60 + m2 - (h1 * 60 + m1);
  return minutes > 0 ? minutes : 0;
}

/** Somme la durée des créneaux en minutes, en excluant les pauses (café, déjeuner…). */
export function sommeDureeSlots(slots: { heureDebut: string; heureFin: string; type: string }[]): number {
  return slots.filter((s) => s.type !== "pause").reduce((total, s) => total + dureeMinutes(s.heureDebut, s.heureFin), 0);
}

export function formatDureeHeures(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m.toString().padStart(2, "0")}`;
}
