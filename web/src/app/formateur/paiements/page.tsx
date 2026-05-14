import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PaiementsClient from "./PaiementsClient";

function formatDateShort(date: Date | null): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function FormateurPaiementsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const profil = await prisma.formateurProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profil) redirect("/formateur/dashboard");

  // Fetch all paiements linked to this formateur's formations or salle requests
  const paiements = await prisma.paiement.findMany({
    where: {
      OR: [
        {
          inscription: {
            formation: { formateurId: profil.id },
          },
        },
        {
          demandeSalle: {
            formation: { formateurId: profil.id },
          },
        },
        {
          formation: { formateurId: profil.id },
        },
      ],
    },
    include: {
      inscription: {
        include: { formation: true },
      },
      demandeSalle: {
        include: { formation: true },
      },
      formation: true,
    },
    orderBy: { createdAt: "desc" },
  });

  type PaiementRow = {
    id: string;
    type: string;
    statut: string;
    montantHT: number;
    numeroFacture: string | null;
    factureUrl: string | null;
    datePaiement: string | null;
    formationTitre: string | null;
    formationDate: string | null;
  };

  function toRow(p: (typeof paiements)[0]): PaiementRow {
    const formation =
      p.inscription?.formation ?? p.demandeSalle?.formation ?? p.formation;
    return {
      id: p.id,
      type: p.type,
      statut: p.statut,
      montantHT: Number(p.montantHT),
      numeroFacture: p.numeroFacture,
      factureUrl: p.factureUrl,
      datePaiement: formatDateShort(p.datePaiement),
      formationTitre: formation?.titre ?? null,
      formationDate: formation ? formatDateShort(formation.date) : null,
    };
  }

  const revenus = paiements.filter((p) => p.type === "INSCRIPTION").map(toRow);
  const sallePaiements = paiements.filter((p) => p.type === "FRAIS_SALLE").map(toRow);
  const abonnementPaiements = paiements.filter((p) => p.type === "ABONNEMENT").map(toRow);
  const allFactures = paiements.filter((p) => p.factureUrl || p.numeroFacture).map(toRow);

  // Compute totals for banner
  const totalRevenusBruts = revenus.reduce((s, r) => s + r.montantHT, 0);
  const totalSalle = sallePaiements.reduce((s, r) => s + r.montantHT, 0);
  const totalAbonnement = abonnementPaiements.reduce((s, r) => s + r.montantHT, 0);

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Paiements & facturation</div>
        <button
          style={{
            background: "white",
            border: "1.5px solid #E0E0E0",
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 700,
            color: "var(--gray)",
            cursor: "pointer",
            fontFamily: "inherit",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          📥 Exporter relevé PDF
        </button>
      </div>

      <div className="content">
        {/* METRICS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 14,
            marginBottom: 24,
          }}
        >
          {[
            {
              label: "Revenus formations (HT)",
              val:
                totalRevenusBruts > 0
                  ? `${totalRevenusBruts.toLocaleString("fr-FR")} €`
                  : "—",
              sub: "Total inscriptions",
            },
            {
              label: "Frais de salle payés",
              val:
                totalSalle > 0
                  ? `${totalSalle.toLocaleString("fr-FR")} €`
                  : "—",
              sub: "Toutes formations",
            },
            {
              label: "Abonnement",
              val:
                totalAbonnement > 0
                  ? `${totalAbonnement.toLocaleString("fr-FR")} €`
                  : "—",
              sub:
                profil.statutAbonnement === "ACTIF" ? "Actif" : profil.statutAbonnement,
            },
          ].map((m, i) => (
            <div
              key={i}
              style={{
                background: "white",
                border: "1px solid #E0E0E0",
                borderRadius: 12,
                padding: "16px 18px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--gray)",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginBottom: 8,
                }}
              >
                {m.label}
              </div>
              <div
                style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}
              >
                {m.val}
              </div>
              <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 4 }}>
                {m.sub}
              </div>
            </div>
          ))}
        </div>

        <PaiementsClient
          revenus={revenus}
          sallePaiements={sallePaiements}
          abonnementPaiements={abonnementPaiements}
          factures={allFactures}
          abonnement={{ statut: profil.statutAbonnement }}
        />
      </div>
    </>
  );
}
