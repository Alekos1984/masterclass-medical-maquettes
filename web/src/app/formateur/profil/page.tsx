import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfilClient from "./ProfilClient";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function FormateurProfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const profil = await prisma.formateurProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      publicationsList: { orderBy: [{ annee: "desc" }, { createdAt: "desc" }] },
    },
  });
  if (!profil) redirect("/formateur/dashboard");

  const user = profil.user;
  const displayName = user.name ?? user.email ?? "Formateur";
  const initials = getInitials(displayName);

  // Parse name parts for first/last name fields
  const nameParts = (user.name ?? "").trim().split(/\s+/);
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : nameParts[0] ?? "";
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

  const profileData = {
    titre: profil.titre ?? "",
    firstName,
    lastName,
    email: user.email ?? "",
    phone: profil.phone ?? "",
    specialite: profil.specialite ?? "",
    adresse: profil.adresse ?? "",
    ville: profil.ville ?? "",
    codePostal: profil.codePostal ?? "",
    bio: profil.bio ?? "",
    experienceAns: profil.experienceAns ?? 0,
    publications: profil.publications ?? 0,
    linkedinUrl: profil.linkedinUrl ?? "",
    researchgateUrl: profil.researchgateUrl ?? "",
    pubmedUrl: profil.pubmedUrl ?? "",
    siret: profil.siret ?? "",
    raisonSociale: profil.raisonSociale ?? "",
    iban: profil.iban ?? "",
    bic: profil.bic ?? "",
    statutAbonnement: profil.statutAbonnement,
    rpps: profil.rpps ?? "",
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Mon profil</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--gray)" }}>
            Profil public :
          </span>
          <a
            href={`/formateurs/${profil.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              color: "var(--red)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Voir mon profil public →
          </a>
        </div>
      </div>

      <div className="content" style={{ paddingBottom: 80 }}>
        {/* PROFILE HEADER */}
        <div
          style={{
            background: "white",
            border: "1px solid #E0E0E0",
            borderRadius: 16,
            padding: 24,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg,var(--red),#ff6b7a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 700,
                color: "white",
              }}
            >
              {initials}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "var(--red)",
                border: "2px solid white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              ✏️
            </div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 3 }}>
              {profil.titre ? `${profil.titre} ` : ""}
              {displayName}
            </div>
            <div
              style={{ fontSize: 14, color: "var(--gray)", marginBottom: 8 }}
            >
              {profil.specialite ?? "Spécialité non renseignée"}
              {profil.ville ? ` · ${profil.ville}` : ""}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span className="pill pill-green">✓ Profil vérifié</span>
              {profil.publications && profil.publications > 0 ? (
                <span style={{ fontSize: 11, color: "var(--gray)" }}>
                  {profil.publications} publication
                  {profil.publications > 1 ? "s" : ""}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <ProfilClient
          profileData={profileData}
          savedPublications={profil.publicationsList.map((p) => ({
            id: p.id,
            pmid: p.pmid ?? null,
            titre: p.titre,
            auteurs: p.auteurs,
            revue: p.revue ?? null,
            annee: p.annee ?? null,
            doi: p.doi ?? null,
            url: p.url ?? null,
          }))}
        />
      </div>
    </>
  );
}
