import { NextRequest } from "next/server";
import React from "react";
import { prisma } from "@/lib/prisma";
import { renderPdf, pdfResponse } from "@/lib/pdf/render";
import { getCompanySettings } from "@/lib/pdf/db-helpers";
import { CursusProgrammePdf } from "@/lib/pdf/templates/cursus-programme";
import { parseSlots, nomAvecCivilite } from "@/lib/cursus";

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

  const formateurIds = cursus.enseignants.map((e) => e.formateurId).filter((v): v is string => !!v);
  const titreByFormateurId = formateurIds.length
    ? new Map(
        (await prisma.formateurProfile.findMany({ where: { id: { in: formateurIds } }, select: { id: true, titre: true } }))
          .map((f) => [f.id, f.titre] as const)
      )
    : new Map<string, string | null>();
  const nomEnseignant = (e: { nom: string | null; email: string; formateurId: string | null }) =>
    nomAvecCivilite(e.nom ?? e.email, e.formateurId ? titreByFormateurId.get(e.formateurId) : null);

  const enseignantsById = new Map(cursus.enseignants.map((e) => [e.id, nomEnseignant(e)]));
  const coordinateurNom = nomAvecCivilite(cursus.coordinateur.user?.name ?? "—", cursus.coordinateur.titre);
  const organisateurs = [
    `${coordinateurNom} (coordinateur·rice)`,
    ...cursus.enseignants.filter((e) => e.estOrganisateur).map(nomEnseignant),
    ...(cursus.organisateursTexte ?? "").split("\n").map((l) => l.trim()).filter(Boolean),
  ];
  const secretaires = cursus.enseignants
    .filter((e) => e.role === "SECRETAIRE" && e.statut === "ACCEPTE")
    .map(nomEnseignant);
  const data = {
    titre: cursus.titre,
    annee: cursus.annee,
    specialite: cursus.specialite,
    description: cursus.description,
    coordinateurNom,
    organisateurs,
    secretaires,
    contactNom: cursus.contactNom,
    contactEmail: cursus.contactEmail,
    contactTelephone: cursus.contactTelephone,
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
        lieuNom: s.lieuNom, salle: s.salle, enVisio: s.enVisio,
      })),
    })),
  };

  const branding = { orgNom: cursus.orgNom, orgLogoBase64: cursus.orgLogoBase64, masquerMM: cursus.masquerMM };
  const buffer = await renderPdf(React.createElement(CursusProgrammePdf, { company, cursus: data, branding }));
  return pdfResponse(buffer, `programme-${cursus.slug}.pdf`);
}
