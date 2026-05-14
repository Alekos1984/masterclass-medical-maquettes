import Link from "next/link";

export default function ParticipantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--off-white)", fontFamily: "var(--font-sans, 'DM Sans', sans-serif)" }}>
      <nav className="participant-nav">
        <Link href="/" className="participant-nav-logo">
          <div className="participant-nav-logo-mark">M</div>
          <span className="participant-nav-logo-name">Masterclass Médical</span>
        </Link>
        <div className="participant-nav-right">
          <Link href="/formations" className="participant-nav-link">Formations</Link>
          <Link href="/participant/dashboard" className="participant-nav-link">Mes inscriptions</Link>
          <Link href="/participant/profil" className="participant-nav-link">Mon profil</Link>
          <div className="participant-nav-avatar">DR</div>
        </div>
      </nav>
      {children}
    </div>
  );
}
