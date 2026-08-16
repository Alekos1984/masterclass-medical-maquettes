import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatutInscription } from "@/generated/prisma/enums";
import { parseSlots } from "@/lib/cursus";
import FormationsClient from "./FormationsClient";

export default async function FormateurFormationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const profil = await prisma.formateurProfile.findUnique({
    where: { userId: session.user.id },
  });

  const formateurId = profil?.id ?? "";

  const [formations, inscriptionsCount, revenusAgg, monEmail] = await Promise.all([
    formateurId
      ? prisma.formation.findMany({
          // On exclut les journées de cursus (DU) — les cours d'un DU sont listés
          // à part sous forme de créneaux, pas de journées entières.
          where: { formateurId, cursusId: null },
          orderBy: { date: "desc" },
          include: {
            _count: { select: { inscriptions: true } },
          },
        })
      : Promise.resolve([]),
    formateurId
      ? prisma.inscription.count({ where: { formation: { formateurId } } })
      : Promise.resolve(0),
    formateurId
      ? prisma.inscription.aggregate({
          where: {
            formation: { formateurId },
            statut: StatutInscription.CONFIRMEE,
          },
          _sum: { netFormateur: true },
        })
      : Promise.resolve({ _sum: { netFormateur: null } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true } }),
  ]);

  // Mes cours dans un DU : tous les créneaux (dans des journées de cursus) où
  // je suis affecté comme enseignant, futurs et récents.
  const monEnseignantIds = formateurId
    ? await prisma.cursusEnseignant.findMany({
        where: { OR: [{ formateurId }, { email: monEmail?.email ?? "__none__" }] },
        select: { id: true },
      })
    : [];
  const idsEnseignant = new Set(monEnseignantIds.map((e) => e.id));

  const journeesCursus = formateurId
    ? await prisma.formation.findMany({
        where: {
          cursusId: { not: null },
          OR: [
            { formateurId }, // coordinateur du cursus (créateur des journées)
            { cursus: { enseignants: { some: { id: { in: [...idsEnseignant] } } } } },
          ],
        },
        select: {
          id: true, titre: true, date: true, heureDebut: true, heureFin: true,
          programme: true, statut: true, lieuNom: true, lieuVille: true,
          cursus: { select: { id: true, titre: true, coordinateurId: true, annee: true } },
        },
        orderBy: { date: "asc" },
      })
    : [];

  const coursDU: {
    formationId: string; slotId: string; date: string; heureDebut: string; heureFin: string;
    titre: string; cursusId: string; cursusTitre: string; cursusAnnee: string | null; role: "COORDINATEUR" | "ENSEIGNANT" | "APERCU";
    lieu: string | null; type: string;
  }[] = [];
  for (const j of journeesCursus) {
    if (!j.cursus) continue;
    const suisCoord = j.cursus.coordinateurId === formateurId;
    for (const slot of parseSlots(j.programme)) {
      if (slot.type === "pause" || !slot.titre) continue;
      const suisAffecte = slot.enseignantId && idsEnseignant.has(slot.enseignantId);
      if (!suisAffecte && !suisCoord) continue;
      // Le coordinateur voit aussi les cours des autres enseignants (aperçu de la vue enseignant),
      // marqués comme tels via le champ role — utile en mode brouillon pour vérifier le rendu.
      coursDU.push({
        formationId: j.id, slotId: slot.slotId,
        date: j.date.toISOString(), heureDebut: slot.heureDebut, heureFin: slot.heureFin,
        titre: slot.titre, cursusId: j.cursus.id, cursusTitre: j.cursus.titre,
        cursusAnnee: j.cursus.annee,
        role: suisAffecte ? (suisCoord ? "COORDINATEUR" : "ENSEIGNANT") : "APERCU",
        lieu: [j.lieuNom, j.lieuVille].filter(Boolean).join(", ") || null,
        type: slot.type,
      });
    }
  }

  // Cursus dont l'utilisateur est coordinateur : une carte "coordination" par cursus,
  // même s'il n'a aucun créneau affecté à son propre nom.
  const cursusCoordinesRaw = formateurId
    ? await prisma.cursus.findMany({
        where: { coordinateurId: formateurId },
        select: {
          id: true, titre: true, annee: true, statut: true,
          journees: { select: { date: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const now = new Date();
  const cursusCoordonnes = cursusCoordinesRaw.map((c) => ({
    id: c.id,
    titre: c.titre,
    annee: c.annee,
    statut: c.statut,
    nbJournees: c.journees.length,
    prochaineDate: c.journees
      .filter((j) => j.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0]?.date.toISOString() ?? null,
  }));

  const revenus = revenusAgg._sum.netFormateur ? Number(revenusAgg._sum.netFormateur) : 0;

  const formationsData = formations.map((f) => ({
    id: f.id,
    titre: f.titre,
    statut: f.statut,
    date: f.date.toISOString(),
    lieuVille: f.lieuVille ?? null,
    prixHT: Number(f.prixHT).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €",
    placesTotal: f.placesTotal,
    placesRestantes: f.placesRestantes,
    inscriptionsCount: f._count.inscriptions,
    dureeHeures: f.dureeHeures,
  }));

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="topbar-title">Mes formations</div>
        <div className="topbar-right">
          <Link href="/formateur/formations/new" className="btn-new">
            + Nouvelle formation
          </Link>
        </div>
      </div>

      <div className="content">
        <FormationsClient
          formations={formationsData}
          coursDU={coursDU}
          cursusCoordonnes={cursusCoordonnes}
          stats={{ total: formations.length, inscriptionsTotal: inscriptionsCount, revenus }}
        />
      </div>
    </>
  );
}
