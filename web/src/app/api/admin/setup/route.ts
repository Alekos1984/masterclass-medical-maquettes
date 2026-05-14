import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Only works if no admin exists yet
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Un administrateur existe déjà. Endpoint désactivé." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, password, nom, prenom, secret } = body;

    // Require a setup secret to prevent unauthorized admin creation
    const setupSecret = process.env.ADMIN_SETUP_SECRET;
    if (!setupSecret || secret !== setupSecret) {
      return NextResponse.json(
        { error: "Secret invalide." },
        { status: 401 }
      );
    }

    if (!email || !password || !nom || !prenom) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants (email, password, nom, prenom)" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${prenom} ${nom}`,
        role: "ADMIN",
      },
    });

    return NextResponse.json(
      { message: "Administrateur créé avec succès.", userId: admin.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[admin/setup]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
