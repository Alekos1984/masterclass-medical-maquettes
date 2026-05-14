import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UtilisateursClient from "./UtilisateursClient";

export default async function AdminUtilisateursPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      formateurProfile: { select: { id: true, specialite: true, formationsTotal: true } },
      participantProfile: { select: { id: true, specialite: true } },
    },
  });

  const serialized = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <>
      <div className="topbar">
        <span className="topbar-title">Utilisateurs</span>
        <div className="topbar-right">
          <span className="topbar-date">{users.length} compte{users.length !== 1 ? "s" : ""} au total</span>
        </div>
      </div>
      <div className="content">
        <UtilisateursClient users={serialized} currentUserId={session.user.id} />
      </div>
    </>
  );
}
