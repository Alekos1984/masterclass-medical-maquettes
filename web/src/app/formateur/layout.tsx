"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/formateur/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/formateur/formations", icon: "🎓", label: "Mes formations" },
  { href: "/formateur/participants", icon: "👥", label: "Participants" },
  { href: "/formateur/paiements", icon: "💶", label: "Paiements" },
  { href: "/formateur/portfolio", icon: "🏆", label: "Portfolio" },
  { href: "/formateur/profil", icon: "⚙️", label: "Profil" },
];

export default function FormateurLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
            <div className="sidebar-avatar">DR</div>
            <div>
              <div className="sidebar-user-name">Dr. Formateur</div>
              <div className="sidebar-user-role">Formateur</div>
            </div>
          </div>
        </div>
      </aside>
      <div className="main">{children}</div>
    </div>
  );
}
