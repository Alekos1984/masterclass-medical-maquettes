import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess, peutGerer, parseSlots, type CursusSlot } from "@/lib/cursus";
import { sommeDureeSlots } from "@/lib/duree-creneaux";

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

// POST : repère les plages non couvertes par un créneau dans les journées existantes
// (entre le début/fin de journée et les créneaux déjà posés) et y insère des créneaux
// "à définir" — sans titre ni enseignant, à compléter ensuite manuellement.
// S'ARRÊTE dès que le volume horaire manquant (attendu - réel) est comblé : on ne remplit
// pas toutes les plages libres de toutes les journées, seulement de quoi couvrir le manque.
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

  if (!cursus.volumeHoraireAttendu) {
    return NextResponse.json({ error: "Renseignez d'abord le volume horaire attendu dans les paramètres du DU." }, { status: 400 });
  }

  const volumeActuelMin = cursus.journees.reduce((sum, j) => sum + sommeDureeSlots(parseSlots(j.programme)), 0);
  const volumeAttenduMin = Math.round(cursus.volumeHoraireAttendu * 60);
  let restant = Math.max(0, volumeAttenduMin - volumeActuelMin);

  let crees = 0;
  let minutesAjoutees = 0;

  for (const journee of cursus.journees) {
    if (restant < GAP_MIN_MINUTES) break;

    const slots = parseSlots(journee.programme).sort((a, b) => heureToMin(a.heureDebut) - heureToMin(b.heureDebut));
    const dayStart = heureToMin(journee.heureDebut);
    const dayEnd = heureToMin(journee.heureFin);
    if (dayEnd <= dayStart) continue;

    // 1. Repère toutes les plages libres de la journée, sans encore les créer.
    const gaps: { start: number; end: number }[] = [];
    let cursor = dayStart;
    for (const s of slots) {
      const sStart = heureToMin(s.heureDebut);
      const sEnd = heureToMin(s.heureFin);
      if (sStart - cursor >= GAP_MIN_MINUTES) gaps.push({ start: cursor, end: sStart });
      cursor = Math.max(cursor, sEnd);
    }
    if (dayEnd - cursor >= GAP_MIN_MINUTES) gaps.push({ start: cursor, end: dayEnd });
    if (gaps.length === 0) continue;

    // 2. N'utilise ces plages que jusqu'à combler le manque — quitte à ne remplir
    // qu'une partie de la dernière plage utilisée.
    const nouveaux: CursusSlot[] = [];
    let idx = 0;
    for (const gap of gaps) {
      if (restant < GAP_MIN_MINUTES) break;
      const dispo = gap.end - gap.start;
      const utilise = Math.min(dispo, restant);
      if (utilise < GAP_MIN_MINUTES) break;
      nouveaux.push({
        slotId: `slot-gen-${Date.now()}-${idx++}`,
        heureDebut: minToHeure(gap.start), heureFin: minToHeure(gap.start + utilise),
        titre: "", description: "", type: "cours", enseignantId: null,
      });
      restant -= utilise;
      minutesAjoutees += utilise;
    }
    if (nouveaux.length === 0) continue;

    const fusion = [...slots, ...nouveaux].sort((a, b) => heureToMin(a.heureDebut) - heureToMin(b.heureDebut));
    await prisma.formation.update({ where: { id: journee.id }, data: { programme: fusion } });
    crees += nouveaux.length;
  }

  return NextResponse.json({ ok: true, crees, minutesAjoutees });
}
