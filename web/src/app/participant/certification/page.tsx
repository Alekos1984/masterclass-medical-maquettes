import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import CertificationHub from "@/components/CertificationHub";

export const dynamic = "force-dynamic";

export default async function ParticipantCertificationPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px 60px" }}>
      <CertificationHub />
    </div>
  );
}
