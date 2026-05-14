import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthRedirectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const role = session.user.role;

  if (role === "FORMATEUR") redirect("/formateur/dashboard");
  if (role === "ADMIN") redirect("/admin/dashboard");
  redirect("/participant/dashboard");
}
