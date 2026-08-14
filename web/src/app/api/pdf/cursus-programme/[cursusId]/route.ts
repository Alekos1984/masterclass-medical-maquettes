import { NextRequest } from "next/server";
import React from "react";
import { prisma } from "@/lib/prisma";
import { renderPdf, pdfResponse } from "@/lib/pdf/render";
import { getCompanySettings } from "@/lib/pdf/db-helpers";
import { CursusProgrammePdf } from "@/lib/pdf/templates/cursus-programme";
import { parseSlots } from "@/lib/cursus";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cursusId: string }> }
) {
  const { cursusId } = await params;
  const [company, cursus] = await Promise.all([
    getCompanySettings(),
    prisma.cursus.findUnique({
      where: { id: cursusId },
      include: {
        coordinateur: { include: { user: { select: { name: true } } } },
        enseignants: true,
        journees: { orderBy: { date: "asc" } },
      },
    }),
  ]);
  if (!cursus) return new Response("Cursus introuvable", { status: 404 });

  const enseignantsById = new Map(cursus.enseignants.map((e) => [e.id, e.nom ?? e.email]));
  const data = {
    titre: cursus.titre,
    annee: cursus.annee,
    specialite: cursus.specialite,
    description: cursus.description,
    coordinateurNom: cursus.coordinateur.user?.name ?? "—",
    journees: cursus.journees.map((j) => ({
      dateStr: j.date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      heureDebut: j.heureDebut,
      heureFin: j.heureFin,
      modalite: j.modaliteSession === "VIRTUEL" ? "Visioconférence" : j.modaliteSession === "MIXTE" ? "Mixte (présentiel + visio)" : "Présentiel",
      lieu: j.modaliteSession === "VIRTUEL" ? "En ligne" : [j.lieuNom, j.lieuVille].filter(Boolean).join(", ") || "À confirmer",
      slots: parseSlots(j.programme).map((s) => ({
        heureDebut: s.heureDebut,
        heureFin: s.heureFin,
        titre: s.titre,
        description: s.description,
        type: s.type,
        enseignantNom: s.enseignantId ? enseignantsById.get(s.enseignantId) ?? null : null,
      })),
    })),
  };

  const buffer = await renderPdf(React.createElement(CursusProgrammePdf, { company, cursus: data }));
  return pdfResponse(buffer, `programme-${cursus.slug}.pdf`);
}
