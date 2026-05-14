import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CatalogueClient from "./CatalogueClient";

export default async function CataloguePage() {
  const formations = await prisma.formation.findMany({
    where: { statut: "PUBLIEE" },
    include: { formateur: { include: { user: true } } },
    orderBy: { date: "asc" },
  });

  const data = formations.map((f) => ({
    id: f.id,
    slug: f.slug,
    titre: f.titre,
    specialite: f.specialite,
    niveau: f.niveau,
    date: f.date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
    lieuVille: f.lieuVille ?? null,
    lieuNom: f.lieuNom ?? null,
    placesTotal: f.placesTotal,
    placesRestantes: f.placesRestantes,
    prixHT: Number(f.prixHT),
    formateurNom: f.formateur.user.name ?? f.formateur.user.email ?? "—",
    formateurSpec: f.formateur.specialite ?? null,
  }));

  if (data.length === 0) {
    return (
      <>
        {/* NAV */}
        <nav className="public-nav" style={{ position: "sticky", top: 0, zIndex: 100 }}>
          <Link href="/" className="public-nav-logo">
            <div className="public-nav-logo-mark">M</div>
            <span className="public-nav-logo-name">Masterclass Médical</span>
          </Link>
          <div className="public-nav-links">
            <Link href="/formations" className="public-nav-link" style={{ color: "white" }}>Formations</Link>
            <Link href="/#comment" className="public-nav-link">Comment ça marche</Link>
            <Link href="/auth/inscription/formateur" className="public-nav-link">Devenir formateur</Link>
          </div>
          <Link href="/auth/inscription/formateur" className="public-nav-cta">Organiser une formation</Link>
        </nav>

        {/* HERO */}
        <div style={{
          background: "linear-gradient(135deg, #080810 0%, #1a0408 50%, #0a1018 100%)",
          padding: "56px 40px 48px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "linear-gradient(rgba(200,16,46,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(200,16,46,0.05) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }} />
          <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 2, textAlign: "center" }}>
            <h1 style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)", fontWeight: 800, color: "white", lineHeight: 1.1, letterSpacing: -1, marginBottom: 8 }}>
              Catalogue des{" "}
              <span style={{ fontFamily: "var(--font-serif, 'Instrument Serif', serif)", fontStyle: "italic", fontWeight: 400, color: "#ff8a96" }}>
                masterclasses
              </span>
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>
              Des formations médicales premium organisées par des experts, partout en France.
            </p>
          </div>
        </div>

        {/* EMPTY STATE */}
        <div style={{ textAlign: "center", padding: "80px 40px", color: "var(--gray)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 8 }}>Aucune formation disponible pour l&apos;instant</div>
          <p>Les formations seront affichées ici dès qu&apos;elles seront publiées.</p>
          <Link href="/auth/inscription/formateur" className="btn-primary" style={{ marginTop: 24, display: "inline-block" }}>
            Organiser une formation →
          </Link>
        </div>

        {/* FOOTER */}
        <footer style={{ background: "#0F0F0F", padding: "24px 40px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: "#C8102E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white" }}>M</div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>Masterclass Médical</span>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <Link href="/auth/inscription/formateur" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Devenir formateur</Link>
              <a href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>CGU</a>
              <a href="mailto:contact@masterclassmedical.fr" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Contact</a>
            </div>
          </div>
        </footer>
      </>
    );
  }

  return <CatalogueClient formations={data} />;
}
