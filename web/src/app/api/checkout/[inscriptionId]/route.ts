import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ inscriptionId: string }> }
) {
  const { inscriptionId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const inscription = await prisma.inscription.findUnique({
    where: { id: inscriptionId },
    include: {
      formation: { select: { titre: true, slug: true, gratuite: true } },
      participant: { select: { userId: true, stripeCustomerId: true, user: { select: { email: true, name: true } } } },
    },
  });

  if (!inscription || inscription.participant.userId !== session.user.id) {
    return NextResponse.json({ error: "Inscription introuvable" }, { status: 404 });
  }

  if (inscription.statut === "CONFIRMEE") {
    return NextResponse.json({ error: "Déjà payée" }, { status: 409 });
  }

  // Formation gratuite → confirmer directement
  if (inscription.formation.gratuite || Number(inscription.montantHT) === 0) {
    await prisma.inscription.update({
      where: { id: inscriptionId },
      data: { statut: "CONFIRMEE" },
    });
    return NextResponse.json({ url: `/participant/dashboard` });
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const montantCentimes = Math.round(Number(inscription.montantHT) * 100);

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: montantCentimes,
          product_data: {
            name: inscription.formation.titre,
            description: "Formation médicale – Masterclass Médical",
          },
        },
        quantity: 1,
      },
    ],
    customer_email: inscription.participant.user.email ?? undefined,
    metadata: {
      inscriptionId,
      userId: session.user.id,
    },
    success_url: `${baseUrl}/participant/dashboard?paiement=ok`,
    cancel_url: `${baseUrl}/formations/${inscription.formation.slug}`,
  });

  // Stocker le session ID Stripe
  await prisma.inscription.update({
    where: { id: inscriptionId },
    data: { stripeSessionId: checkoutSession.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
