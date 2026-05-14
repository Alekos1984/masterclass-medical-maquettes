import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    database_url_set: !!process.env.DATABASE_URL,
    auth_secret_set: !!process.env.AUTH_SECRET,
  };

  try {
    const userCount = await prisma.user.count();
    const formateurCount = await prisma.formateurProfile.count();
    const participantCount = await prisma.participantProfile.count();

    checks.db_connected = true;
    checks.tables_exist = true;
    checks.users = userCount;
    checks.formateurs = formateurCount;
    checks.participants = participantCount;
    checks.status = "ok";
  } catch (error) {
    checks.db_connected = false;
    checks.tables_exist = false;
    checks.error = error instanceof Error ? error.message : String(error);
    checks.status = "error";

    return NextResponse.json(checks, { status: 500 });
  }

  return NextResponse.json(checks);
}
