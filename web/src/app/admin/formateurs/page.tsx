import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import FormateursClient from "./FormateursClient";

export default async function AdminFormateursPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const formateurs = await prisma.formateurProfile.findMany({
    include: { user: true, formations: true },
    orderBy: { createdAt: "desc" },
  });

  const data = formateurs.map((f) => ({
    id: f.id,
    nom: f.user.name ?? f.user.email ?? "—",
    email: f.user.email ?? "—",
    specialite: f.specialite ?? "—",
    formations: f.formations.length,
    statutAbonnement: f.statutAbonnement,
    inscription: f.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
  }));

  return <FormateursClient formateurs={data} />;
}
