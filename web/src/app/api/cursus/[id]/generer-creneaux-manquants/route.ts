import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess, peutGerer, parseSlots, type CursusSlot } from "@/lib/cursus";

const GAP_MIN_MINUTES = 15; // en dessous, on ne matérialise pas de créneau (bruit)

function heureToMin(h: string): number {
  const [hh, mm] = h.split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return 0;
  return hh * 60 + mm;
}

function minToHeure(m: number): string {
  const hh = Math.floor(m / 60).toString().padStart(2, "0");
  const mm = (m % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

// POST : repère les plages non couvertes par un créneau dans chaque journée existante
// (entre l'heure de début/fin de la journée et les créneaux déjà posés) et y insère des
// créneaux "à définir" — sans titre ni enseignant, à compléter ensuite manuellement.
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

  let crees = 0;
  let minutesAjoutees = 0;

  for (const journee of cursus.journees) {
    const slots = parseSlots(journee.programme).sort((a, b) => heureToMin(a.heureDebut) - heureToMin(b.heureDebut));
    const dayStart = heureToMin(journee.heureDebut);
    const dayEnd = heureToMin(journee.heureFin);
    if (dayEnd <= dayStart) continue;

    const nouveaux: CursusSlot[] = [];
    let cursor = dayStart;
    let idx = 0;
    for (const s of slots) {
      const sStart = heureToMin(s.heureDebut);
      const sEnd = heureToMin(s.heureFin);
      if (sStart - cursor >= GAP_MIN_MINUTES) {
        nouveaux.push({
          slotId: `slot-gen-${Date.now()}-${idx++}`,
          heureDebut: minToHeure(cursor), heureFin: minToHeure(sStart),
          titre: "", description: "", type: "cours", enseignantId: null,
        });
      }
      cursor = Math.max(cursor, sEnd);
    }
    if (dayEnd - cursor >= GAP_MIN_MINUTES) {
      nouveaux.push({
        slotId: `slot-gen-${Date.now()}-${idx++}`,
        heureDebut: minToHeure(cursor), heureFin: minToHeure(dayEnd),
        titre: "", description: "", type: "cours", enseignantId: null,
      });
    }

    if (nouveaux.length === 0) continue;

    const fusion = [...slots, ...nouveaux].sort((a, b) => heureToMin(a.heureDebut) - heureToMin(b.heureDebut));
    await prisma.formation.update({ where: { id: journee.id }, data: { programme: fusion } });
    crees += nouveaux.length;
    minutesAjoutees += nouveaux.reduce((sum, s) => sum + (heureToMin(s.heureFin) - heureToMin(s.heureDebut)), 0);
  }

  return NextResponse.json({ ok: true, crees, minutesAjoutees });
}
