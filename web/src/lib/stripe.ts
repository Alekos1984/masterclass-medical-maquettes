import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
});

export const COMMISSION_RATE = 0.2; // 20% plateforme
export const FRAIS_GESTION_SALLE_RATE = 0.1; // 10% sur devis salle
export const ABONNEMENT_MENSUEL_HT = 2000; // 20€ en centimes
export const FORMATIONS_GRATUITES = 3; // nombre de formations sans abonnement
