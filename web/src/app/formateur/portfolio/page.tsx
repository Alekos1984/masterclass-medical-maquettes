import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PortfolioClient from "./PortfolioClient";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function FormateurPortfolioPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const profil = await prisma.formateurProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  });
  if (!profil) redirect("/formateur/dashboard");

  const formations = await prisma.formation.findMany({
    where: { formateurId: profil.id },
    include: {
      inscriptions: {
        where: { statut: { in: ["CONFIRMEE", "REMBOURSEE"] } },
      },
    },
    orderBy: { date: "desc" },
  });

  const totalParticipants = formations.reduce(
    (sum, f) => sum + f.inscriptions.length,
    0
  );

  const notesGiven = formations.flatMap((f) =>
    f.inscriptions
      .map((i) => i.noteSatisfaction)
      .filter((n): n is number => n !== null)
  );
  const noteMoyenne =
    notesGiven.length > 0
      ? (notesGiven.reduce((a, b) => a + b, 0) / notesGiven.length).toFixed(1)
      : null;

  const userName = profil.user.name ?? profil.user.email ?? "Formateur";
  const titre = profil.titre ? `${profil.titre} ` : "";
  const displayName = `${titre}${userName}`;
  const initials = getInitials(userName);
  const specialite = profil.specialite ?? "";
  const slug = profil.user.email?.split("@")[0]?.toLowerCase().replace(/\W+/g, "-") ?? "formateur";

  // Serialize formations for the client component
  const formationRows = formations.map((f) => ({
    id: f.id,
    titre: f.titre,
    date: f.date.toISOString(),
    lieuVille: f.lieuVille ?? null,
    lieuNom: f.lieuNom ?? null,
    statut: f.statut,
    placesTotal: f.placesTotal,
    participantsCount: f.inscriptions.length,
    noteMoyenne:
      f.inscriptions.filter((i) => i.noteSatisfaction !== null).length > 0
        ? (
            f.inscriptions
              .filter((i) => i.noteSatisfaction !== null)
              .reduce((s, i) => s + (i.noteSatisfaction ?? 0), 0) /
            f.inscriptions.filter((i) => i.noteSatisfaction !== null).length
          ).toFixed(1)
        : null,
    dureeHeures: f.dureeHeures,
    niveau: f.niveau,
    portfolioVisible: true, // default visible; would be a real field in production
  }));

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Portfolio pédagogique</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link
            href={`/formateurs/${profil.id}`}
            target="_blank"
            rel="noopener noreferrer"
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
              textDecoration: "none",
            }}
          >
            🌐 Voir la page publique
          </Link>
        </div>
      </div>

      <div className="content">
        {/* HERO */}
        <div
          style={{
            background: "linear-gradient(135deg,#080810,#1a0408)",
            borderRadius: 16,
            padding: "28px 32px",
            marginBottom: 24,
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 20,
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 200,
              height: 200,
              background:
                "radial-gradient(circle,rgba(200,16,46,0.15) 0%,transparent 65%)",
            }}
          />
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "white",
                letterSpacing: -0.5,
                marginBottom: 4,
              }}
            >
              Portfolio de{" "}
              <em
                style={{
                  fontFamily: "Georgia, serif",
                  fontWeight: 400,
                  color: "#ff8a96",
                }}
              >
                {displayName}
              </em>
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                marginBottom: 16,
              }}
            >
              {specialite && `${specialite} · `}
              {profil.ville ? `${profil.ville} · ` : ""}
              Formateur sur la plateforme
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              {[
                { val: String(formations.length), label: "Formations" },
                { val: String(totalParticipants), label: "Participants" },
                {
                  val: noteMoyenne ?? "—",
                  label: "Note moy.",
                },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: "white",
                      letterSpacing: -0.8,
                    }}
                  >
                    {s.val}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.35)",
                      marginTop: 2,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: "16px 18px",
              textAlign: "center",
              minWidth: 180,
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}
            >
              Page publique
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#ff8a96",
                fontFamily: "monospace",
                marginBottom: 10,
              }}
            >
              masterclassmedical.fr/formateurs/…
            </div>
            <Link
              href={`/formateurs/${profil.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "var(--red)",
                color: "white",
                border: "none",
                borderRadius: 7,
                padding: "7px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Voir ma page →
            </Link>
          </div>
        </div>

        {formations.length === 0 ? (
          <div
            style={{
              background: "white",
              border: "1.5px dashed #E0E0E0",
              borderRadius: 14,
              padding: "60px 40px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 14 }}>🎓</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
              Aucune formation pour l&apos;instant
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--gray)",
                maxWidth: 380,
                margin: "0 auto",
              }}
            >
              Vos formations apparaîtront ici une fois créées. Elles
              constitueront votre portfolio pédagogique public.
            </div>
          </div>
        ) : (
          <PortfolioClient formations={formationRows} initials={initials} />
        )}
      </div>
    </>
  );
}
