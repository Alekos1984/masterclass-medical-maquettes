import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatutInscription } from "@/generated/prisma/enums";
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

  const [formations, inscriptionsCount, revenusAgg] = await Promise.all([
    formateurId
      ? prisma.formation.findMany({
          where: { formateurId },
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
  ]);

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
          stats={{ total: formations.length, inscriptionsTotal: inscriptionsCount, revenus }}
        />
      </div>
    </>
  );
}
