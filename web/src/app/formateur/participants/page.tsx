import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function conventionPillClass(signed: boolean): string {
  return signed ? "pill-green" : "pill-orange";
}

function paiementPillClass(statut: string): string {
  switch (statut) {
    case "CONFIRMEE":
      return "pill-green";
    case "EN_ATTENTE_PAIEMENT":
      return "pill-orange";
    default:
      return "pill-gray";
  }
}

function paiementLabel(statut: string, montant: number): string {
  switch (statut) {
    case "CONFIRMEE":
      return `Payé · ${montant.toLocaleString("fr-FR")} €`;
    case "EN_ATTENTE_PAIEMENT":
      return "En attente";
    case "ANNULEE":
      return "Annulée";
    case "REMBOURSEE":
      return "Remboursée";
    default:
      return statut;
  }
}

export default async function FormateurParticipantsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const profil = await prisma.formateurProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profil) redirect("/formateur/dashboard");

  const inscriptions = await prisma.inscription.findMany({
    where: {
      formation: { formateurId: profil.id },
    },
    include: {
      participant: {
        include: { user: true },
      },
      formation: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Compute stats
  const total = inscriptions.length;
  const enCours = inscriptions.filter(
    (i) =>
      i.statut === "CONFIRMEE" &&
      i.formation.date >= new Date()
  ).length;
  const conventionsEnAttente = inscriptions.filter(
    (i) => i.statut === "CONFIRMEE" && !i.conventionSignee
  ).length;
  const attestationsEnvoyees = inscriptions.filter(
    (i) => i.attestationUrl
  ).length;

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Mes participants</div>
        <button
          style={{
            background: "white",
            border: "1.5px solid #E0E0E0",
            borderRadius: 8,
            padding: "7px 14px",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--gray)",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          📥 Exporter CSV
        </button>
      </div>

      <div className="content">
        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            { val: String(total), label: "Total participants", color: undefined },
            { val: String(enCours), label: "Formation en cours", color: undefined },
            {
              val: String(attestationsEnvoyees),
              label: "Attestations envoyées",
              color: "#2e7d32",
            },
            {
              val: String(conventionsEnAttente),
              label: "Conventions en attente",
              color: conventionsEnAttente > 0 ? "var(--red)" : undefined,
            },
          ].map((s, i) => (
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
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: -0.5,
                  color: s.color || "var(--black)",
                }}
              >
                {s.val}
              </div>
              <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 3 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* TABLE OR EMPTY STATE */}
        {inscriptions.length === 0 ? (
          <div
            style={{
              background: "white",
              border: "1.5px dashed #E0E0E0",
              borderRadius: 14,
              padding: "60px 40px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 14 }}>👥</div>
            <div
              style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}
            >
              Aucun participant pour l&apos;instant
            </div>
            <div style={{ fontSize: 13, color: "var(--gray)", maxWidth: 380, margin: "0 auto" }}>
              Les participants inscrits à vos formations apparaîtront ici.
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "white",
              border: "1px solid #E0E0E0",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <table>
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Formation</th>
                  <th>Inscription</th>
                  <th>Paiement</th>
                  <th>Convention</th>
                  <th>Attestation</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {inscriptions.map((insc) => {
                  const user = insc.participant.user;
                  const name = user.name ?? user.email ?? "—";
                  const initials = getInitials(name);
                  const montant = Number(insc.montantHT);
                  const attestLabel = insc.attestationUrl
                    ? "Envoyée"
                    : "À venir";
                  const attestClass = insc.attestationUrl
                    ? "pill-green"
                    : "pill-orange";

                  return (
                    <tr key={insc.id}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
                              fontWeight: 700,
                              color: "white",
                              flexShrink: 0,
                              background:
                                "linear-gradient(135deg,#1565c0,#42a5f5)",
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>
                              {name}
                            </div>
                            {insc.participant.specialite && (
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "var(--gray)",
                                  marginTop: 1,
                                }}
                              >
                                {insc.participant.specialite}
                                {insc.participant.ville
                                  ? ` · ${insc.participant.ville}`
                                  : ""}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 12 }}>
                          {insc.formation.titre}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--gray)" }}>
                          {formatDate(insc.formation.date)}
                        </div>
                      </td>
                      <td style={{ fontSize: 13 }}>
                        {formatDate(insc.createdAt)}
                      </td>
                      <td>
                        <span
                          className={`pill ${paiementPillClass(insc.statut)}`}
                        >
                          {paiementLabel(insc.statut, montant)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`pill ${conventionPillClass(insc.conventionSignee)}`}
                        >
                          {insc.conventionSignee ? "Signée" : "En attente"}
                        </span>
                      </td>
                      <td>
                        <span className={`pill ${attestClass}`}>
                          {attestLabel}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button
                            style={{
                              border: "1px solid #E0E0E0",
                              background: "white",
                              borderRadius: 6,
                              padding: "4px 9px",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                              color: "var(--gray)",
                              fontFamily: "inherit",
                            }}
                          >
                            Email
                          </button>
                          {!insc.conventionSignee && (
                            <button
                              style={{
                                border: "1px solid #E0E0E0",
                                background: "white",
                                borderRadius: 6,
                                padding: "4px 9px",
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: "pointer",
                                color: "var(--gray)",
                                fontFamily: "inherit",
                              }}
                            >
                              Relancer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
