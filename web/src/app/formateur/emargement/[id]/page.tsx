import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EmargementClient from "./EmargementClient";

export const dynamic = "force-dynamic";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#2e7d32,#66bb6a)",
  "linear-gradient(135deg,#1565c0,#42a5f5)",
  "linear-gradient(135deg,#6a1b9a,#ab47bc)",
  "linear-gradient(135deg,#e65100,#ff9800)",
  "linear-gradient(135deg,#c62828,#ef5350)",
  "linear-gradient(135deg,#00695c,#26a69a)",
  "linear-gradient(135deg,#4527a0,#7e57c2)",
  "linear-gradient(135deg,#ad1457,#f06292)",
];

export default async function FormateurEmargementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const profil = await prisma.formateurProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profil) redirect("/formateur/dashboard");

  const formation = await prisma.formation.findUnique({
    where: { id },
    include: {
      inscriptions: {
        where: { statut: { in: ["CONFIRMEE"] } },
        include: {
          participant: {
            include: { user: true },
          },
          emargements: {
            where: { formationId: id },
          },
        },
      },
    },
  });

  if (!formation || formation.formateurId !== profil.id) {
    notFound();
  }

  const totalInscrits = formation.inscriptions.length;

  type ParticipantRow = {
    inscriptionId: string;
    name: string;
    initials: string;
    specialite: string | null;
    ville: string | null;
    bg: string;
    presentMatin: boolean;
    presentApresMidi: boolean;
    signatureMatinTime: string | null;
    signatureApresMidiTime: string | null;
    isManualCorrection: boolean;
    emargementId: string | null;
    emargementToken: string | null;
    pvSigned: boolean;
  };

  const participants: ParticipantRow[] = formation.inscriptions.map(
    (insc, idx) => {
      const user = insc.participant.user;
      const name = user.name ?? user.email ?? "—";
      const emargement = insc.emargements[0] ?? null;

      function fmtTime(d: Date | null): string | null {
        if (!d) return null;
        return `${d.getHours().toString().padStart(2, "0")}h${d
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;
      }

      return {
        inscriptionId: insc.id,
        name,
        initials: getInitials(name),
        specialite: insc.participant.specialite ?? null,
        ville: insc.participant.ville ?? null,
        bg: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length],
        presentMatin: emargement?.presentMatin ?? false,
        presentApresMidi: emargement?.presentApresMidi ?? false,
        signatureMatinTime: emargement ? fmtTime(emargement.signatureMatin) : null,
        signatureApresMidiTime: emargement
          ? fmtTime(emargement.signatureApresMidi)
          : null,
        isManualCorrection: !!emargement?.correctionPresence,
        emargementId: emargement?.id ?? null,
        emargementToken: emargement?.token ?? null,
        pvSigned: !!emargement?.pvParticipantSignedAt,
      };
    }
  );

  const formationDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(formation.date);

  const lieuDisplay = [formation.lieuNom, formation.lieuSalle]
    .filter(Boolean)
    .join(", ");

  if (participants.length === 0) {
    return (
      <>
        <div className="topbar">
          <div className="topbar-title">
            Émargement · {formationDate}
          </div>
        </div>
        <div className="content">
          <div
            style={{
              background: "white",
              border: "1.5px dashed #E0E0E0",
              borderRadius: 14,
              padding: "60px 40px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 14 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
              Aucun participant inscrit
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--gray)",
                maxWidth: 380,
                margin: "0 auto",
              }}
            >
              Les participants confirmés à cette formation apparaîtront ici le
              jour de la session.
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <EmargementClient
      formationId={id}
      formationTitre={formation.titre}
      formationDate={formationDate}
      lieuDisplay={lieuDisplay}
      heureDebut={formation.heureDebut}
      heureFin={formation.heureFin}
      placesTotal={totalInscrits}
      participants={participants}
    />
  );
}
