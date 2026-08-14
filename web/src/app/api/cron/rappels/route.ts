import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseSlots } from "@/lib/cursus";
import { generateIcs, icsToBase64 } from "@/lib/ics";
import { sendEmail, emailRappelEnseignement } from "@/lib/brevo";

export const dynamic = "force-dynamic";

const FENETRES: { type: string; joursMin: number; joursMax: number; label: string }[] = [
  { type: "J15", joursMin: 14, joursMax: 15, label: "dans 15 jours" },
  { type: "J7", joursMin: 6, joursMax: 7, label: "dans 7 jours" },
  { type: "H48", joursMin: 1, joursMax: 2, label: "dans 48 heures" },
  { type: "MATIN", joursMin: 0, joursMax: 0, label: "aujourd'hui" },
];

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const now = new Date();
  const debutJour = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const horizon = new Date(debutJour.getTime() + 16 * 24 * 3600 * 1000);

  const journees = await prisma.formation.findMany({
    where: { cursusId: { not: null }, date: { gte: debutJour, lte: horizon }, statut: { not: "ANNULEE" } },
    include: { cursus: { include: { enseignants: true } } },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://masterclassmedicale.com";
  let envoyes = 0;

  for (const j of journees) {
    if (!j.cursus) continue;
    const joursAvant = Math.floor((j.date.getTime() - debutJour.getTime()) / (24 * 3600 * 1000));
    const fenetre = FENETRES.find((f) => joursAvant >= f.joursMin && joursAvant <= f.joursMax);
    if (!fenetre) continue;

    const slots = parseSlots(j.programme);
    const enseignantsAffectes = new Map<string, typeof slots>();
    for (const s of slots) {
      if (!s.enseignantId || s.type === "pause") continue;
      if (!enseignantsAffectes.has(s.enseignantId)) enseignantsAffectes.set(s.enseignantId, []);
      enseignantsAffectes.get(s.enseignantId)!.push(s);
    }

    const dateStr = j.date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const lieu = j.modaliteSession === "VIRTUEL"
      ? (j.visioUrl ? `Visioconférence — ${j.visioUrl}` : "Visioconférence")
      : [j.lieuNom, j.lieuVille].filter(Boolean).join(", ") || "Lieu à confirmer";

    for (const [enseignantId, mesSlots] of enseignantsAffectes) {
      const enseignant = j.cursus.enseignants.find((e) => e.id === enseignantId);
      if (!enseignant) continue;

      // Idempotence : un seul envoi par (journée, email, type)
      const deja = await prisma.cursusRappel.findUnique({
        where: { formationId_email_type: { formationId: j.id, email: enseignant.email, type: fenetre.type } },
      });
      if (deja) continue;

      const premierDebut = mesSlots.map((s) => s.heureDebut).sort()[0] || j.heureDebut;
      const dernierFin = mesSlots.map((s) => s.heureFin).sort().reverse()[0] || j.heureFin;
      const creneauxHtml = mesSlots
        .map((s) => `🕐 <strong>${s.heureDebut}–${s.heureFin}</strong> · ${s.titre}`)
        .join("<br/>");

      const ics = generateIcs({
        uid: `${j.id}-${enseignant.id}`,
        titre: `${j.cursus.titre} — vos enseignements`,
        description: mesSlots.map((s) => `${s.heureDebut}-${s.heureFin} ${s.titre}`).join(" | "),
        lieu,
        dateISO: j.date.toISOString(),
        heureDebut: premierDebut,
        heureFin: dernierFin,
        url: `${baseUrl}/formateur/coordination/${j.cursus.id}`,
      });

      try {
        await sendEmail({
          to: [{ email: enseignant.email, name: enseignant.nom ?? undefined }],
          subject: `⏰ Rappel : vous enseignez ${fenetre.label} — ${j.cursus.titre}`,
          htmlContent: emailRappelEnseignement({
            nom: enseignant.nom ?? "cher·e collègue",
            cursusTitre: j.cursus.titre,
            delaiLabel: fenetre.label,
            dateStr,
            creneaux: creneauxHtml,
            lieu,
          }),
          attachment: [{ name: "enseignement.ics", content: icsToBase64(ics) }],
        });
        await prisma.cursusRappel.create({
          data: { formationId: j.id, email: enseignant.email, type: fenetre.type },
        });
        envoyes++;
      } catch { /* réessaiera au prochain passage */ }
    }
  }

  return NextResponse.json({ envoyes, journeesExaminees: journees.length });
}
