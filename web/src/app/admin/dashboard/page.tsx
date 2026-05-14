import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const [
    formationsCount,
    formateursCount,
    participantsCount,
    inscriptionsCount,
    demandesEnAttente,
  ] = await Promise.all([
    prisma.formation.count(),
    prisma.formateurProfile.count(),
    prisma.participantProfile.count(),
    prisma.inscription.count({ where: { statut: "CONFIRMEE" } }),
    prisma.demandeSalle.count({ where: { statut: "EN_ATTENTE" } }),
  ]);

  const formations = await prisma.formation.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { formateur: { include: { user: true } } },
  });

  const formateurs = await prisma.formateurProfile.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true, formations: true },
  });

  const statutLabels: Record<string, { label: string; pillClass: string }> = {
    BROUILLON: { label: "Brouillon", pillClass: "pill-gray" },
    EN_ATTENTE_SALLE: { label: "En attente salle", pillClass: "pill-orange" },
    SALLE_CONFIRMEE: { label: "Salle confirmée", pillClass: "pill-blue" },
    PUBLIEE: { label: "Publiée", pillClass: "pill-green" },
    COMPLETE: { label: "Complète", pillClass: "pill-blue" },
    ANNULEE: { label: "Annulée", pillClass: "pill-red" },
  };

  return (
    <>
      <div className="topbar">
        <span className="topbar-title">Dashboard Administration</span>
        <div className="topbar-right">
          <div className="topbar-notif">🔔</div>
        </div>
      </div>

      <div className="content">
        {/* METRICS */}
        <div className="metrics-grid metrics-grid-5">
          <div className="metric-card">
            <div className="metric-label">Formations</div>
            <div className="metric-val">{formationsCount}</div>
            <div className="metric-sub">Total créées</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Formateurs</div>
            <div className="metric-val">{formateursCount}</div>
            <div className="metric-sub">Profils inscrits</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Participants</div>
            <div className="metric-val">{participantsCount}</div>
            <div className="metric-sub">Profils inscrits</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Inscriptions confirmées</div>
            <div className="metric-val">{inscriptionsCount}</div>
            <div className="metric-sub">Total confirmées</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Demandes salles en attente</div>
            <div className="metric-val" style={{ color: demandesEnAttente > 0 ? "var(--red)" : undefined }}>
              {demandesEnAttente}
            </div>
            <div className="metric-sub">À traiter</div>
          </div>
        </div>

        {/* FORMATIONS + FORMATEURS */}
        <div className="two-col">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Formations récentes</span>
              <Link href="/admin/formations" className="card-action">Voir tout →</Link>
            </div>
            {formations.length === 0 ? (
              <div style={{ padding: "32px 0", textAlign: "center", color: "var(--gray)", fontSize: 14 }}>
                Aucune formation créée pour l&apos;instant.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Formation</th>
                    <th>Formateur</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {formations.map((f) => {
                    const statut = statutLabels[f.statut] ?? { label: f.statut, pillClass: "pill-gray" };
                    const formateurName = f.formateur.user.name ?? f.formateur.user.email;
                    return (
                      <tr key={f.id}>
                        <td>
                          <div className="td-name">{f.titre}</div>
                          <div className="td-sub">{f.lieuVille ?? "Lieu non défini"}</div>
                        </td>
                        <td>
                          <div className="td-name">{formateurName}</div>
                        </td>
                        <td><span className={`pill ${statut.pillClass}`}>{statut.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Formateurs récents</span>
              <Link href="/admin/formateurs" className="card-action">Voir tout →</Link>
            </div>
            {formateurs.length === 0 ? (
              <div style={{ padding: "32px 0", textAlign: "center", color: "var(--gray)", fontSize: 14 }}>
                Aucun formateur inscrit pour l&apos;instant.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Formateur</th>
                    <th>Formations</th>
                    <th>Abonnement</th>
                  </tr>
                </thead>
                <tbody>
                  {formateurs.map((f) => {
                    const abonnementPill =
                      f.statutAbonnement === "ACTIF"
                        ? { label: "Actif", cls: "pill-green" }
                        : f.statutAbonnement === "SUSPENDU"
                        ? { label: "Impayé", cls: "pill-red" }
                        : f.statutAbonnement === "RESILIE"
                        ? { label: "Résilié", cls: "pill-gray" }
                        : { label: "Inactif", cls: "pill-gray" };
                    return (
                      <tr key={f.id}>
                        <td>
                          <div className="td-name">{f.user.name ?? f.user.email}</div>
                          <div className="td-sub">{f.specialite ?? "—"} · {f.ville ?? "—"}</div>
                        </td>
                        <td>{f.formations.length}</td>
                        <td><span className={`pill ${abonnementPill.cls}`}>{abonnementPill.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
