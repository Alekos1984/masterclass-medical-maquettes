import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({}, { status: 403 });

  const settings = await prisma.companySettings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json(settings ?? { id: "singleton", raisonSociale: "Masterclass Medical" });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({}, { status: 403 });

  const body = await req.json() as Record<string, string>;
  const {
    raisonSociale,
    siret,
    numeroDeclaration,
    adresse,
    codePostal,
    ville,
    phone,
    email,
    representantLegal,
    siteWeb,
  } = body;

  const settings = await prisma.companySettings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      raisonSociale: raisonSociale || "Masterclass Medical",
      siret,
      numeroDeclaration,
      adresse,
      codePostal,
      ville,
      phone,
      email,
      representantLegal,
      siteWeb,
    },
    update: {
      raisonSociale,
      siret,
      numeroDeclaration,
      adresse,
      codePostal,
      ville,
      phone,
      email,
      representantLegal,
      siteWeb,
    },
  });

  return NextResponse.json(settings);
}
