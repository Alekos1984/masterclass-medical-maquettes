import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "var(--font-sans, 'DM Sans', sans-serif)", color: "#0F0F0F" }}>
      {/* Header */}
      <header style={{
        background: "#0F0F0F", padding: "0 40px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#C8102E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "white" }}>M</div>
          <span style={{ fontSize: "1rem", fontWeight: 800, color: "white" }}>Masterclass Médical</span>
        </Link>
        <Link href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
          ← Retour à l&apos;accueil
        </Link>
      </header>

      {/* Content */}
      <main style={{
        maxWidth: 820, margin: "0 auto", padding: "56px 40px 80px",
        fontSize: 15, lineHeight: 1.75, color: "#222",
      }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ background: "#060606", padding: "32px 40px", textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
        <div style={{ marginBottom: 14, display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/legal/mentions-legales" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Mentions légales</Link>
          <Link href="/legal/cgu-formateur" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>CGU Formateurs</Link>
          <Link href="/legal/cgu-participant" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>CGU Participants</Link>
          <Link href="/legal/confidentialite" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Confidentialité</Link>
        </div>
        <div>© 2026 Masterclass Médical — Tous droits réservés</div>
      </footer>
    </div>
  );
}
