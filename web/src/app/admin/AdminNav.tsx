"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/admin/utilisateurs", icon: "👥", label: "Utilisateurs" },
  { href: "/admin/demandes", icon: "🏨", label: "Demandes salles" },
  { href: "/admin/formations", icon: "🎓", label: "Formations" },
  { href: "/admin/formateurs", icon: "👨‍⚕️", label: "Formateurs" },
  { href: "/admin/paiements", icon: "💶", label: "Paiements" },
  { href: "/admin/remboursements", icon: "↩️", label: "Remboursements" },
  { href: "/admin/services", icon: "📋", label: "Services & devis" },
  { href: "/admin/settings", icon: "⚙️", label: "Paramètres organisme" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div className="sidebar-logo-mark">M</div>
          <div>
            <div className="sidebar-logo-name">Masterclass</div>
            <div className="sidebar-logo-sub">Back-office admin</div>
          </div>
        </Link>
      </div>
      <nav className="sidebar-nav">
        <span className="nav-section-label">Administration</span>
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
      </nav>
      <div className="sidebar-footer">
        <div className="admin-tag" style={{ marginBottom: 10 }}>
          <div className="admin-tag-dot" />
          <span className="admin-tag-text">Admin</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          style={{
            width: "100%", background: "rgba(255,255,255,0.06)", border: "none",
            borderRadius: 7, padding: "8px 12px", color: "rgba(255,255,255,0.5)",
            fontSize: 12, fontWeight: 500, cursor: "pointer", textAlign: "left",
            fontFamily: "inherit", transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
        >
          🚪 Se déconnecter
        </button>
      </div>
    </aside>
  );
}
