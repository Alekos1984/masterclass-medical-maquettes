import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatutFormation, StatutInscription } from "@/generated/prisma/enums";

function statutLabel(statut: string): { label: string; className: string } {
  switch (statut) {
    case StatutFormation.PUBLIEE:
      return { label: "Publiée", className: "pill-green" };
    case StatutFormation.COMPLETE:
      return { label: "Complète", className: "pill-blue" };
    case StatutFormation.ANNULEE:
      return { label: "Annulée", className: "pill-gray" };
    case StatutFormation.BROUILLON:
      return { label: "Brouillon", className: "pill-gray" };
    case "EN_ATTENTE_SALLE":
      return { label: "En attente salle", className: "pill-orange" };
    case "SALLE_CONFIRMEE":
      return { label: "Salle confirmée", className: "pill-orange" };
    default:
      return { label: statut, className: "pill-gray" };
  }
}

function colorBarForStatut(statut: string): string {
  switch (statut) {
    case StatutFormation.PUBLIEE:
      return "#C8102E";
    case StatutFormation.COMPLETE:
      return "#1565c0";
    case StatutFormation.BROUILLON:
      return "#9e9e9e";
    case StatutFormation.ANNULEE:
      return "#9e9e9e";
    case "EN_ATTENTE_SALLE":
    case "SALLE_CONFIRMEE":
      return "#e65100";
    default:
      return "#9e9e9e";
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export default async function DashboardFormateur() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const profil = await prisma.formateurProfile.findUnique({
    where: { userId: session.user.id },
  });

  const formateurId = profil?.id ?? "";

  const [formationsCount, inscriptionsCount, revenusAgg, formations] = await Promise.all([
    prisma.formation.count({ where: { formateurId } }),
    prisma.inscription.count({
      where: { formation: { formateurId } },
    }),
    formateurId
      ? prisma.inscription.aggregate({
          where: {
            formation: { formateurId },
            statut: StatutInscription.CONFIRMEE,
          },
          _sum: { netFormateur: true },
        })
      : Promise.resolve({ _sum: { netFormateur: null } }),
    prisma.formation.findMany({
      where: { formateurId },
      orderBy: { date: "desc" },
      take: 5,
      include: {
        _count: { select: { inscriptions: true } },
      },
    }),
  ]);

  const revenus = revenusAgg._sum.netFormateur
    ? Number(revenusAgg._sum.netFormateur)
    : 0;

  const revenusFormatted = revenus.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }) + " €";

  const userName = session.user.name ?? "Formateur";

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="topbar-title">Dashboard</div>
        <div className="topbar-right">
          <div className="topbar-notif">
            🔔
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">
        {/* WELCOME BANNER */}
        <div className="welcome-banner">
          <div>
            <div className="welcome-title">Bonjour, {userName} 👋</div>
            <div className="welcome-sub">
              {formationsCount === 0
                ? "Créez votre première formation pour démarrer."
                : `Vous avez ${formationsCount} formation${formationsCount > 1 ? "s" : ""} et ${inscriptionsCount} participant${inscriptionsCount > 1 ? "s" : ""} au total.`}
            </div>
            {!profil && (
              <div className="welcome-pill">⚠️ Complétez votre profil pour activer toutes les fonctionnalités</div>
            )}
          </div>
          <Link
            href="/formateur/formations/new"
            className="btn-new"
            style={{ flexShrink: 0, position: "relative", zIndex: 1 }}
          >
            + Nouvelle formation
          </Link>
        </div>

        {/* METRICS */}
        <div className="metrics-grid metrics-grid-4">
          <div className="metric-card">
            <div className="metric-label">Formations</div>
            <div className="metric-val">{formationsCount}</div>
            <div className="metric-sub">Total créées</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Participants total</div>
            <div className="metric-val">{inscriptionsCount}</div>
            <div className="metric-sub">Toutes formations</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Revenus HT</div>
            <div className="metric-val" style={{ fontSize: 20 }}>
              {revenusFormatted}
            </div>
            <div className="metric-sub">Inscriptions confirmées (80%)</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Abonnement</div>
            <div className="metric-val" style={{ fontSize: 16 }}>
              {profil?.statutAbonnement === "ACTIF" ? "Actif" : profil ? "Inactif" : "—"}
            </div>
            <div className="metric-sub">
              {profil
                ? `${profil.formationsTotal} formation${profil.formationsTotal !== 1 ? "s" : ""} créée${profil.formationsTotal !== 1 ? "s" : ""}`
                : "Profil incomplet"}
            </div>
          </div>
        </div>

        {/* FORMATIONS + RIGHT COL */}
        <div className="three-col">
          {/* Formations list */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Mes formations récentes</span>
              <Link href="/formateur/formations" className="card-action">
                Voir tout →
              </Link>
            </div>
            {formations.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--gray)" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🎓</div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Aucune formation pour l&apos;instant</div>
                <Link href="/formateur/formations/new" className="btn-new">Créer ma première formation</Link>
              </div>
            ) : (
              formations.map((f, i) => {
                const { label, className } = statutLabel(f.statut);
                const color = colorBarForStatut(f.statut);
                const inscrits = f._count.inscriptions;
                const gaugePct = f.placesTotal > 0 ? Math.round((inscrits / f.placesTotal) * 100) : null;
                return (
                  <div
                    key={f.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 0",
                      borderBottom: i < formations.length - 1 ? "1px solid #EBEBEB" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 4,
                        height: 44,
                        borderRadius: 100,
                        background: color,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          marginBottom: 3,
                        }}
                      >
                        {f.titre}
                      </div>
                      <div style={{ fontSize: 11, color: "#6A6A6A" }}>
                        {formatDate(f.date)}{f.lieuVille ? ` · ${f.lieuVille}` : ""}
                      </div>
                      {gaugePct !== null && (
                        <div style={{ marginTop: 4 }}>
                          <div
                            style={{
                              background: "#EBEBEB",
                              borderRadius: 100,
                              height: 3,
                              overflow: "hidden",
                              width: 80,
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                borderRadius: 100,
                                background: "#C8102E",
                                width: `${gaugePct}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span
                        className={`pill ${className}`}
                        style={{ display: "inline-block", marginBottom: 4 }}
                      >
                        {label}
                      </span>
                      <div style={{ fontSize: 11, color: "#6A6A6A" }}>
                        {inscrits} / {f.placesTotal} inscrits
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right column: abonnement */}
          <div>
            <div
              style={{
                background: "linear-gradient(135deg, #0F0F0F, #1a0408)",
                borderRadius: 14,
                padding: "18px 20px",
                color: "white",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 6,
                }}
              >
                Abonnement
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 2 }}>
                {profil?.statutAbonnement === "ACTIF" ? "Formateur Actif" : "Formateur"}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>
                {profil?.statutAbonnement === "ACTIF" ? "20 € HT / mois" : "3 formations gratuites"}
              </div>
              {profil?.abonnementFin && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
                  Prochain prélèvement :{" "}
                  <strong style={{ color: "white" }}>
                    {formatDate(profil.abonnementFin)}
                  </strong>
                </div>
              )}
              <Link
                href="/formateur/profil"
                style={{
                  background: "#C8102E",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  width: "100%",
                  fontFamily: "inherit",
                  display: "block",
                  textAlign: "center",
                  textDecoration: "none",
                }}
              >
                Gérer l&apos;abonnement
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
