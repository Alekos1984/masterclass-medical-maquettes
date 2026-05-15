import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const {
    titre, firstName, lastName, phone, specialite, adresse, ville, codePostal,
    bio, experienceAns, linkedinUrl, researchgateUrl, pubmedUrl,
    siret, raisonSociale, iban, bic, rpps,
  } = body;

  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { name: fullName || undefined },
      }),
      prisma.formateurProfile.update({
        where: { userId: session.user.id },
        data: {
          titre: titre || null,
          phone: phone || null,
          specialite: specialite || null,
          adresse: adresse || null,
          ville: ville || null,
          codePostal: codePostal || null,
          bio: bio || null,
          experienceAns: experienceAns !== undefined && experienceAns !== "" ? Number(experienceAns) : null,
          linkedinUrl: linkedinUrl || null,
          researchgateUrl: researchgateUrl || null,
          pubmedUrl: pubmedUrl || null,
          siret: siret || null,
          raisonSociale: raisonSociale || null,
          iban: iban || null,
          bic: bic || null,
          rpps: rpps || null,
        },
      }),
    ]);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // Unique constraint on RPPS
    if (msg.includes("rpps") && msg.includes("Unique")) {
      return NextResponse.json({ error: "Ce numéro RPPS est déjà utilisé par un autre compte." }, { status: 409 });
    }
    console.error("[PATCH /api/formateur/profil]", msg);
    return NextResponse.json({ error: "Erreur lors de la sauvegarde : " + msg }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
