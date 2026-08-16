import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess, parseSlots, matchEnseignantByName, peutGerer } from "@/lib/cursus";
import { genererJournees, digitaliserProgramme } from "@/lib/ai/journees";
import { extractText } from "@/lib/extract-text";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });
  if (!peutGerer(role)) return NextResponse.json({ error: "Réservé au coordinateur ou à la secrétaire pédagogique" }, { status: 403 });

  const { consigne, fichierNom, fichierBase64 } = await req.json() as {
    consigne?: string; fichierNom?: string; fichierBase64?: string;
  };
  if (!consigne?.trim() && !fichierBase64) {
    return NextResponse.json({ error: "Décrivez le calendrier souhaité ou chargez un fichier" }, { status: 400 });
  }

  const datesExistantes = cursus.journees.map((j) => j.date.toISOString().slice(0, 10));

  try {
    // ── Mode digitalisation : un fichier programme est fourni ──
    if (fichierBase64 && fichierNom) {
      if (fichierBase64.length * 0.75 > MAX_FILE_BYTES) {
        return NextResponse.json({ error: "Fichier trop volumineux (max 10 Mo)" }, { status: 413 });
      }
      let texte: string;
      try {
        texte = await extractText(fichierNom, Buffer.from(fichierBase64, "base64"));
      } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 422 });
      }

      const propositions = await digitaliserProgramme(texte, consigne?.trim() ?? "", {
        cursusTitre: cursus.titre,
        annee: cursus.annee,
        journeesExistantes: cursus.journees.map((j, i) => ({
          index: i + 1,
          date: j.date.toISOString().slice(0, 10),
          heureDebut: j.heureDebut,
          heureFin: j.heureFin,
          nbSlots: parseSlots(j.programme).length,
        })),
        enseignants: cursus.enseignants.map((e) => e.nom ?? e.email),
        datesExistantes,
      });

      let reconnus = 0, inconnus = 0;
      const journees = propositions.map((p) => {
        const cible = p.journeeExistante ? cursus.journees[p.journeeExistante - 1] : null;
        return {
          journeeId: cible?.id ?? null,
          date: cible ? cible.date.toISOString().slice(0, 10) : p.date,
          heureDebut: cible?.heureDebut ?? p.heureDebut,
          heureFin: cible?.heureFin ?? p.heureFin,
          modaliteSession: cible?.modaliteSession ?? "PRESENTIEL",
          commentaire: p.commentaire,
          slots: p.slots.map((s) => {
            const enseignantId = s.intervenant && s.type !== "pause"
              ? matchEnseignantByName(s.intervenant, cursus.enseignants)
              : null;
            if (s.intervenant && s.type !== "pause") {
              if (enseignantId) reconnus++; else inconnus++;
            }
            return {
              heureDebut: s.heureDebut,
              heureFin: s.heureFin,
              titre: s.titre,
              type: s.type,
              enseignantId,
              description: "",
              intervenantRaw: s.intervenant && !enseignantId ? s.intervenant : null,
              intervenant: s.intervenant, // pour l'affichage dans la liste de propositions (côté client)
            };
          }),
        };
      }).filter((j) => j.date);

      return NextResponse.json({ journees, mode: "digitalisation", intervenants: { reconnus, inconnus } });
    }

    // ── Mode génération de dates par consigne (existant) ──
    const journees = await genererJournees(consigne!.trim().slice(0, 2000), {
      cursusTitre: cursus.titre,
      datesExistantes,
    });

    // Info non bloquante : dates qui tombent le même jour qu'un AUTRE cursus du coordinateur
    if (journees.length > 0) {
      const dates = journees.map((j) => new Date(j.date + "T00:00:00Z"));
      const min = new Date(Math.min(...dates.map((d) => d.getTime())));
      const max = new Date(Math.max(...dates.map((d) => d.getTime())) + 24 * 3600 * 1000);
      const autres = await prisma.formation.findMany({
        where: {
          cursusId: { not: id },
          cursus: { coordinateurId: cursus.coordinateurId },
          date: { gte: min, lte: max },
        },
        select: { date: true, cursus: { select: { titre: true } } },
      });
      const parDate = new Map<string, string[]>();
      for (const f of autres) {
        const k = f.date.toISOString().slice(0, 10);
        (parDate.get(k) ?? parDate.set(k, []).get(k)!).push(f.cursus?.titre ?? "autre cursus");
      }
      for (const j of journees as (typeof journees[number] & { chevauchement?: string })[]) {
        const c = parDate.get(j.date);
        if (c?.length) j.chevauchement = c.join(", ");
      }
    }

    return NextResponse.json({ journees, mode: "generation" });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la génération. Réessayez." }, { status: 502 });
  }
}
