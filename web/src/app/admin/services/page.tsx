import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminServicesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/auth/login");

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/admin/dashboard" className="topbar-back">← Dashboard</Link>
          <div className="topbar-sep" />
          <span className="topbar-title">Services complémentaires sur devis</span>
        </div>
      </div>

      <div className="content">
        <div className="info-banner">
          ℹ️ Services facturables sur devis aux formateurs : traduction de documents, design personnalisé,
          captation vidéo, services de restauration premium, mise en page avancée du programme.
        </div>

        <div className="card" style={{ textAlign: "center", padding: "48px 20px", color: "var(--gray)" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Aucun service demandé pour l&apos;instant</div>
          <div style={{ fontSize: 13 }}>
            Les demandes de services complémentaires (devis, captation, traduction…) apparaîtront ici
            une fois que la fonctionnalité sera activée pour les formateurs.
          </div>
        </div>
      </div>
    </>
  );
}
