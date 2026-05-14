import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, nom, prenom, role, specialite, rpps, titre, phone } = body;

    if (!email || !password || !nom || !prenom || !role) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userRole = role === "FORMATEUR" ? "FORMATEUR" : "PARTICIPANT";

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${prenom} ${nom}`,
        role: userRole,
      },
    });

    if (userRole === "FORMATEUR") {
      await prisma.formateurProfile.create({
        data: {
          userId: user.id,
          titre: titre ?? null,
          specialite: specialite ?? null,
          rpps: rpps ?? null,
          phone: phone ?? null,
        },
      });
    } else {
      await prisma.participantProfile.create({
        data: {
          userId: user.id,
          titre: titre ?? null,
          specialite: specialite ?? null,
          rpps: rpps ?? null,
          phone: phone ?? null,
        },
      });
    }

    return NextResponse.json(
      { message: "Compte créé avec succès", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json(
      { error: "Erreur serveur, veuillez réessayer" },
      { status: 500 }
    );
  }
}
