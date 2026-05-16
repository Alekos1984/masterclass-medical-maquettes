"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ParticipantLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  const initials = getInitials(session?.user?.name);

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
          <div className="participant-nav-avatar">{initials}</div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              background: "none", border: "1px solid #E0E0E0", borderRadius: 7,
              padding: "6px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer",
              color: "#6A6A6A", fontFamily: "inherit", transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C8102E"; e.currentTarget.style.color = "#C8102E"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E0E0E0"; e.currentTarget.style.color = "#6A6A6A"; }}
          >
            🚪 Déconnexion
          </button>
        </div>
      </nav>
      {children}
    </div>
  );
}
