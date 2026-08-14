import { prisma } from "@/lib/prisma";

export type CursusSlot = {
  slotId: string;
  heureDebut: string;
  heureFin: string;
  titre: string;
  description: string;
  type: string;
  enseignantId: string | null; // CursusEnseignant.id
};

export type CursusRole = "COORDINATEUR" | "ENSEIGNANT" | null;

/**
 * Résout le rôle d'un utilisateur sur un cursus.
 * COORDINATEUR = créateur ou co-coordinateur accepté ; ENSEIGNANT = membre de l'équipe.
 */
export async function getCursusAccess(cursusId: string, userId: string) {
  const cursus = await prisma.cursus.findUnique({
    where: { id: cursusId },
    include: {
      coordinateur: { include: { user: { select: { name: true, email: true } } } },
      enseignants: { orderBy: { createdAt: "asc" } },
      journees: { orderBy: { date: "asc" } },
    },
  });
  if (!cursus) return { cursus: null, role: null as CursusRole, enseignant: null };

  const [profile, user] = await Promise.all([
    prisma.formateurProfile.findUnique({ where: { userId }, select: { id: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { email: true } }),
  ]);

  const enseignant =
    cursus.enseignants.find(
      (e) => (profile && e.formateurId === profile.id) || (user?.email && e.email === user.email)
    ) ?? null;

  let role: CursusRole = null;
  if (profile && cursus.coordinateurId === profile.id) role = "COORDINATEUR";
  else if (enseignant?.coCoordinateur && enseignant.statut === "ACCEPTE") role = "COORDINATEUR";
  else if (enseignant) role = "ENSEIGNANT";

  return { cursus, role, enseignant, profile };
}

export function parseSlots(programme: unknown): CursusSlot[] {
  if (!Array.isArray(programme)) return [];
  return (programme as Record<string, string | null>[]).map((s, i) => ({
    slotId: (s.slotId as string) ?? `slot-${i}`,
    heureDebut: (s.heureDebut as string) ?? "",
    heureFin: (s.heureFin as string) ?? "",
    titre: (s.titre as string) ?? "",
    description: (s.description as string) ?? "",
    type: (s.type as string) ?? "cours",
    enseignantId: (s.enseignantId as string) ?? null,
  }));
}

export function cursusSlugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function uniqueCursusSlug(base: string): Promise<string> {
  let slug = base || "cursus";
  let n = 0;
  while (await prisma.cursus.findUnique({ where: { slug } })) {
    n++;
    slug = `${base}-${n}`;
  }
  return slug;
}

/** Alertes de coordination : créneaux vides, supports manquants, conflits, invitations en attente. */
export async function computeAlertes(cursusId: string) {
  const cursus = await prisma.cursus.findUnique({
    where: { id: cursusId },
    include: { enseignants: true, journees: { orderBy: { date: "asc" } } },
  });
  if (!cursus) return null;

  const ressources = await prisma.ressource.findMany({
    where: { formationId: { in: cursus.journees.map((j) => j.id) }, slotId: { not: null } },
    select: { formationId: true, slotId: true },
  });
  const supportsParSlot = new Set(ressources.map((r) => `${r.formationId}:${r.slotId}`));

  const creneauxSansEnseignant: { journeeId: string; date: Date; slot: CursusSlot }[] = [];
  const supportsManquants: { journeeId: string; date: Date; slot: CursusSlot }[] = [];
  const affectations: { enseignantId: string; date: string; debut: string; fin: string; titre: string }[] = [];

  for (const j of cursus.journees) {
    for (const slot of parseSlots(j.programme)) {
      if (slot.type === "pause") continue;
      if (!slot.enseignantId) {
        creneauxSansEnseignant.push({ journeeId: j.id, date: j.date, slot });
      } else {
        affectations.push({
          enseignantId: slot.enseignantId,
          date: j.date.toISOString().slice(0, 10),
          debut: slot.heureDebut,
          fin: slot.heureFin,
          titre: slot.titre,
        });
        if (!supportsParSlot.has(`${j.id}:${slot.slotId}`)) {
          supportsManquants.push({ journeeId: j.id, date: j.date, slot });
        }
      }
    }
  }

  // Conflits : même enseignant, même date, créneaux qui se chevauchent
  const conflits: { enseignantId: string; date: string; titres: string[] }[] = [];
  for (let i = 0; i < affectations.length; i++) {
    for (let k = i + 1; k < affectations.length; k++) {
      const a = affectations[i], b = affectations[k];
      if (a.enseignantId !== b.enseignantId || a.date !== b.date) continue;
      if (a.debut < b.fin && b.debut < a.fin) {
        conflits.push({ enseignantId: a.enseignantId, date: a.date, titres: [a.titre, b.titre] });
      }
    }
  }

  return {
    creneauxSansEnseignant,
    supportsManquants,
    conflits,
    invitationsEnAttente: cursus.enseignants.filter((e) => e.statut === "EN_ATTENTE"),
  };
}
