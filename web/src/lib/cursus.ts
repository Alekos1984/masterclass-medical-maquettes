import { prisma } from "@/lib/prisma";

export type CursusSlot = {
  slotId: string;
  heureDebut: string;
  heureFin: string;
  titre: string;
  description: string;
  type: string;
  enseignantId: string | null; // CursusEnseignant.id
  intervenantRaw?: string | null; // nom brut détecté (digitalisation), en attente de rattachement à un enseignant
};

export type CursusRole = "COORDINATEUR" | "SECRETAIRE" | "ENSEIGNANT" | null;

/** La secrétaire pédagogique a les mêmes droits opérationnels que le coordinateur
 * (créneaux, équipe, étudiants) mais pas l'accès aux notes ni aux réglages du cursus. */
export function peutGerer(role: CursusRole): boolean {
  return role === "COORDINATEUR" || role === "SECRETAIRE";
}

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
  else if (enseignant?.role === "SECRETAIRE" && enseignant.statut === "ACCEPTE") role = "SECRETAIRE";
  else if (enseignant) role = "ENSEIGNANT";

  return { cursus, role, enseignant, profile };
}

export function parseSlots(programme: unknown): CursusSlot[] {
  if (!Array.isArray(programme)) return [];
  return (programme as Record<string, string | null>[]).map((s, i) => {
    const rawDescription = (s.description as string) ?? "";
    // Rétrocompat : anciens créneaux qui stockaient l'intervenant dans la description
    let intervenantRaw: string | null = (s.intervenantRaw as string) ?? null;
    let description = rawDescription;
    if (!intervenantRaw) {
      const m = rawDescription.match(/Intervenant\s*\(année précédente\)\s*:\s*(.+)$/i);
      if (m) {
        intervenantRaw = m[1].trim();
        description = rawDescription.replace(m[0], "").trim();
      }
    }
    return {
      slotId: (s.slotId as string) ?? `slot-${i}`,
      heureDebut: (s.heureDebut as string) ?? "",
      heureFin: (s.heureFin as string) ?? "",
      titre: (s.titre as string) ?? "",
      description,
      type: (s.type as string) ?? "cours",
      enseignantId: (s.enseignantId as string) ?? null,
      intervenantRaw,
    };
  });
}

// ─── Rattachement d'un nom d'intervenant à un enseignant de l'équipe ──────────
// Matching tolérant : insensible aux accents, aux titres (Dr/Pr/Mme…), utilise
// aussi le préfixe email en fallback.

function normaliserNom(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\b(dr|pr|docteur|professeur|mme|mlle|mr|ms|monsieur|madame)\b\.?/g, " ")
    .replace(/[^a-z]+/g, " ")
    .trim();
}

export function matchEnseignantByName(
  intervenant: string,
  enseignants: { id: string; nom: string | null; email: string }[]
): string | null {
  const tokens = normaliserNom(intervenant).split(" ").filter((t) => t.length > 2);
  if (tokens.length === 0) return null;

  let best: { id: string; score: number } | null = null;
  for (const e of enseignants) {
    const cible = new Set(
      [...normaliserNom(e.nom ?? "").split(" "), ...normaliserNom(e.email.split("@")[0]).split(" ")]
        .filter((t) => t.length > 2)
    );
    const score = tokens.filter((t) => cible.has(t)).length;
    if (score > 0 && (!best || score > best.score)) best = { id: e.id, score };
  }
  return best?.id ?? null;
}

/** Parcourt tous les créneaux du cursus et rattache ceux dont l'intervenantRaw matche un enseignant actuel. */
export async function rematchIntervenants(cursusId: string): Promise<{ rattaches: number }> {
  const cursus = await prisma.cursus.findUnique({
    where: { id: cursusId },
    include: { enseignants: true, journees: true },
  });
  if (!cursus) return { rattaches: 0 };

  let rattaches = 0;
  for (const j of cursus.journees) {
    const slots = parseSlots(j.programme);
    let dirty = false;
    const newSlots = slots.map((s) => {
      if (s.enseignantId || !s.intervenantRaw || s.type === "pause") return s;
      const matchId = matchEnseignantByName(s.intervenantRaw, cursus.enseignants);
      if (matchId) {
        dirty = true;
        rattaches++;
        return { ...s, enseignantId: matchId, intervenantRaw: null };
      }
      return s;
    });
    if (dirty) {
      await prisma.formation.update({
        where: { id: j.id },
        data: { programme: newSlots as unknown as object[] },
      });
    }
  }
  return { rattaches };
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
  const intervenantsNonRattaches: { journeeId: string; date: Date; slot: CursusSlot }[] = [];
  const affectations: { enseignantId: string; date: string; debut: string; fin: string; titre: string }[] = [];

  for (const j of cursus.journees) {
    for (const slot of parseSlots(j.programme)) {
      if (slot.type === "pause") continue;
      if (!slot.enseignantId) {
        creneauxSansEnseignant.push({ journeeId: j.id, date: j.date, slot });
        if (slot.intervenantRaw) intervenantsNonRattaches.push({ journeeId: j.id, date: j.date, slot });
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
    intervenantsNonRattaches,
    conflits,
    invitationsEnAttente: cursus.enseignants.filter((e) => e.statut === "EN_ATTENTE"),
  };
}

// ─── Inscription d'un étudiant à toutes les journées d'un cursus ──────────────

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { sendEmail, emailCompteEtudiantCursus } from "@/lib/brevo";

export async function inscrireEtudiantCursus(
  cursus: { id: string; titre: string; journees: { id: string }[] },
  etudiant: { email: string; nom?: string | null; prenom?: string | null }
): Promise<{ ok: boolean; cree: boolean; inscrits: number }> {
  const email = (etudiant.email ?? "").trim().toLowerCase();
  if (!email.includes("@")) return { ok: false, cree: false, inscrits: 0 };
  const nomComplet = [etudiant.prenom?.trim(), etudiant.nom?.trim()].filter(Boolean).join(" ") || email.split("@")[0];

  let user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, participantProfile: { select: { id: true } } },
  });

  let motDePasse: string | null = null;
  if (!user) {
    motDePasse = randomBytes(6).toString("base64url");
    user = await prisma.user.create({
      data: {
        email,
        name: nomComplet,
        password: await bcrypt.hash(motDePasse, 12),
        role: "PARTICIPANT",
        participantProfile: { create: {} },
      },
      select: { id: true, participantProfile: { select: { id: true } } },
    });
  } else if (!user.participantProfile) {
    const profil = await prisma.participantProfile.create({ data: { userId: user.id }, select: { id: true } });
    user = { ...user, participantProfile: profil };
  }

  const result = await prisma.inscription.createMany({
    data: cursus.journees.map((j) => ({
      participantId: user!.participantProfile!.id,
      formationId: j.id,
      statut: "CONFIRMEE" as const,
      montantHT: 0,
      commission: 0,
      netFormateur: 0,
    })),
    skipDuplicates: true,
  });

  if (motDePasse) {
    const baseUrl = process.env.NEXTAUTH_URL ?? "https://masterclassmedicale.com";
    sendEmail({
      to: [{ email, name: nomComplet }],
      subject: `Votre accès — ${cursus.titre}`,
      htmlContent: emailCompteEtudiantCursus({
        nom: nomComplet,
        cursusTitre: cursus.titre,
        email,
        motDePasse,
        loginUrl: `${baseUrl}/auth/login`,
      }),
    }).catch(() => {});
  }

  return { ok: true, cree: !!motDePasse, inscrits: result.count };
}
