import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCursusAccess, parseSlots, peutGerer } from "@/lib/cursus";
import { renderPdf } from "@/lib/pdf/render";
import { getCompanySettings } from "@/lib/pdf/db-helpers";
import { CursusProgrammePdf } from "@/lib/pdf/templates/cursus-programme";
import { NotationPdf } from "@/lib/pdf/templates/notation";
import { createZip, type ZipEntry } from "@/lib/create-zip";

function slugifyFile(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "document";
}

function csvEscape(v: string): string {
  return /[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

// GET : archive ZIP complète du DU (programme + étudiants/assiduité + notes clôturées)
// pour l'archivage administratif annuel ou un audit qualité (Qualiopi).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { cursus, role } = await getCursusAccess(id, session.user.id);
  if (!cursus) return NextResponse.json({ error: "Cursus introuvable" }, { status: 404 });
  if (!peutGerer(role)) return NextResponse.json({ error: "Réservé au coordinateur ou à la secrétaire pédagogique" }, { status: 403 });

  const company = await getCompanySettings();
  const branding = { orgNom: cursus.orgNom, orgLogoBase64: cursus.orgLogoBase64, masquerMM: cursus.masquerMM };
  const entries: ZipEntry[] = [];

  // 1. Programme
  const enseignantsById = new Map(cursus.enseignants.map((e) => [e.id, e.nom ?? e.email]));
  const organisateurs = [
    ...cursus.enseignants.filter((e) => e.estOrganisateur).map((e) => e.nom ?? e.email),
    ...(cursus.organisateursTexte ?? "").split("\n").map((l) => l.trim()).filter(Boolean),
  ];
  const secretaires = cursus.enseignants.filter((e) => e.role === "SECRETAIRE" && e.statut === "ACCEPTE").map((e) => e.nom ?? e.email);
  const programmeBuffer = await renderPdf(
    React.createElement(CursusProgrammePdf, {
      company,
      branding,
      cursus: {
        titre: cursus.titre, annee: cursus.annee, specialite: cursus.specialite, description: cursus.description,
        coordinateurNom: cursus.coordinateur.user?.name ?? "—",
        organisateurs, secretaires,
        contactNom: cursus.contactNom, contactEmail: cursus.contactEmail, contactTelephone: cursus.contactTelephone,
        journees: cursus.journees.map((j) => ({
          dateStr: j.date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
          heureDebut: j.heureDebut, heureFin: j.heureFin,
          modalite: j.modaliteSession === "VIRTUEL" ? "Visioconférence" : j.modaliteSession === "MIXTE" ? "Mixte (présentiel + visio)" : "Présentiel",
          lieu: j.modaliteSession === "VIRTUEL" ? "En ligne" : [j.lieuNom, j.lieuVille].filter(Boolean).join(", ") || "À confirmer",
          slots: parseSlots(j.programme).map((s) => ({
            heureDebut: s.heureDebut, heureFin: s.heureFin, titre: s.titre, description: s.description, type: s.type,
            enseignantNom: s.enseignantId ? enseignantsById.get(s.enseignantId) ?? null : null,
          })),
        })),
      },
    })
  );
  entries.push({ path: "programme.pdf", content: programmeBuffer });

  // 2. Étudiants + assiduité (CSV)
  const journeeIds = cursus.journees.map((j) => j.id);
  const inscriptions = await prisma.inscription.findMany({
    where: { formationId: { in: journeeIds }, statut: "CONFIRMEE" },
    include: {
      participant: { include: { user: { select: { name: true, email: true } } } },
      emargements: { select: { formationId: true, presentMatin: true, presentApresMidi: true } },
    },
  });
  const parEtudiant = new Map<string, { nom: string; email: string; presences: Record<string, { matin: boolean; apresMidi: boolean }> }>();
  for (const insc of inscriptions) {
    if (!parEtudiant.has(insc.participantId)) {
      parEtudiant.set(insc.participantId, {
        nom: insc.participant.user?.name ?? "—",
        email: insc.participant.user?.email ?? "—",
        presences: {},
      });
    }
    const e = parEtudiant.get(insc.participantId)!;
    for (const em of insc.emargements) e.presences[em.formationId] = { matin: em.presentMatin, apresMidi: em.presentApresMidi };
  }
  const header = ["Nom", "Email", ...cursus.journees.map((j) => `${j.date.toLocaleDateString("fr-FR")} matin;${j.date.toLocaleDateString("fr-FR")} après-midi`)].join(";");
  const rows = Array.from(parEtudiant.values()).map((e) => [
    csvEscape(e.nom), csvEscape(e.email),
    ...cursus.journees.map((j) => {
      const p = e.presences[j.id];
      return `${p?.matin ? "Présent" : "Absent"};${p?.apresMidi ? "Présent" : "Absent"}`;
    }),
  ].join(";"));
  entries.push({ path: "etudiants-assiduite.csv", content: "﻿" + [header, ...rows].join("\n") });

  // 3. Notes clôturées
  const modules = await prisma.cursusValidationModule.findMany({ where: { cursusId: id, cloture: true }, include: { notes: true } });
  for (const mod of modules) {
    const notesById = new Map(mod.notes.map((n) => [n.participantId, n]));
    const buffer = await renderPdf(
      React.createElement(NotationPdf, {
        company,
        branding,
        data: {
          cursusTitre: cursus.titre, cursusAnnee: cursus.annee,
          moduleIntitule: mod.intitule, moduleType: mod.type,
          dateEpreuve: mod.dateEpreuve?.toISOString() ?? null,
          noteMax: mod.noteMax, seuilValidation: mod.seuilValidation,
          coordinateurNom: cursus.coordinateur.user?.name ?? "—",
          clotureAt: (mod.clotureAt ?? new Date()).toISOString(),
          lignes: Array.from(parEtudiant.entries()).map(([participantId, e]) => ({
            nom: e.nom, email: e.email,
            note: notesById.get(participantId)?.note ?? null,
            commentaire: notesById.get(participantId)?.commentaire ?? "",
          })),
        },
      })
    );
    entries.push({ path: `notes/${slugifyFile(mod.intitule)}.pdf`, content: buffer });
  }

  // 4. Résumé
  const resume = [
    `Dossier d'archivage — ${cursus.titre}${cursus.annee ? ` (${cursus.annee})` : ""}`,
    `Exporté le ${new Date().toLocaleString("fr-FR")}`,
    ``,
    `Journées : ${cursus.journees.length}`,
    `Étudiants inscrits : ${parEtudiant.size}`,
    `Modules de validation clôturés : ${modules.length}`,
    `Enseignants : ${cursus.enseignants.filter((e) => e.role !== "SECRETAIRE").length}`,
    ``,
    `Contenu de l'archive :`,
    `- programme.pdf : programme complet de l'enseignement`,
    `- etudiants-assiduite.csv : liste des étudiants et relevé de présence par journée`,
    `- notes/*.pdf : feuilles de notation clôturées (une par modalité de validation)`,
  ].join("\n");
  entries.push({ path: "README.txt", content: resume });

  const zipBuffer = await createZip(entries);
  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="dossier-${cursus.slug}.zip"`,
    },
  });
}
