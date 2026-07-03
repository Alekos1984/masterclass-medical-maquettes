import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import CertificationHub from "@/components/CertificationHub";

export const dynamic = "force-dynamic";

export default async function FormateurCertificationPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Certification périodique</div>
      </div>
      <div className="content" style={{ maxWidth: 1100 }}>
        <CertificationHub />
      </div>
    </>
  );
}
