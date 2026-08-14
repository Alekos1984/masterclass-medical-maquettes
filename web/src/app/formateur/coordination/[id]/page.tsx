import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import CoordinationClient from "./CoordinationClient";

export const dynamic = "force-dynamic";

export default async function CoordinationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  return <CoordinationClient cursusId={id} />;
}
