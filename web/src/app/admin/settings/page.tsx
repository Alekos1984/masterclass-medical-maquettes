import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./SettingsClient";
import Link from "next/link";

export default async function SettingsPage() {
  const settings = await prisma.companySettings.findUnique({ where: { id: "singleton" } });

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/admin/dashboard" className="topbar-back">← Dashboard</Link>
          <div className="topbar-sep"></div>
          <span className="topbar-title">Paramètres organisme</span>
        </div>
      </div>
      <div className="content">
        <SettingsClient initialSettings={settings} />
      </div>
    </>
  );
}
