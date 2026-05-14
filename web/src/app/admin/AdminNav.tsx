"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/admin/utilisateurs", icon: "👥", label: "Utilisateurs" },
  { href: "/admin/demandes", icon: "🏨", label: "Demandes salles" },
  { href: "/admin/formations", icon: "🎓", label: "Formations" },
  { href: "/admin/formateurs", icon: "👨‍⚕️", label: "Formateurs" },
  { href: "/admin/paiements", icon: "💶", label: "Paiements" },
  { href: "/admin/remboursements", icon: "↩️", label: "Remboursements" },
  { href: "/admin/services", icon: "📋", label: "Services & devis" },
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
        <div className="admin-tag">
          <div className="admin-tag-dot" />
          <span className="admin-tag-text">Admin</span>
        </div>
      </div>
    </aside>
  );
}
