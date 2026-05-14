"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const navItems = [
  { href: "/formateur/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/formateur/formations", icon: "🎓", label: "Mes formations" },
  { href: "/formateur/participants", icon: "👥", label: "Participants" },
  { href: "/formateur/paiements", icon: "💶", label: "Paiements" },
  { href: "/formateur/portfolio", icon: "🏆", label: "Portfolio" },
  { href: "/formateur/profil", icon: "⚙️", label: "Profil" },
];

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function FormateurLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name ?? "Formateur";
  const initials = getInitials(session?.user?.name);

  return (
    <div className="dashboard-root">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div className="sidebar-logo-mark">M</div>
            <div>
              <div className="sidebar-logo-name">Masterclass</div>
              <div className="sidebar-logo-sub">Espace formateur</div>
            </div>
          </Link>
        </div>
        <nav className="sidebar-nav">
          <span className="nav-section-label">Navigation</span>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${pathname.startsWith(item.href) ? " active" : ""}`}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-label">{item.label}</span>
            </Link>
          ))}
          <span className="nav-section-label">Autres</span>
          <Link href="/formations" className="nav-item">
            <span className="nav-item-icon">🔍</span>
            <span className="nav-item-label">Catalogue</span>
          </Link>
          <Link href="/" className="nav-item">
            <span className="nav-item-icon">🏠</span>
            <span className="nav-item-label">Accueil</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div>
              <div className="sidebar-user-name">{userName}</div>
              <div className="sidebar-user-role">Formateur</div>
            </div>
          </div>
        </div>
      </aside>
      <div className="main">{children}</div>
    </div>
  );
}
