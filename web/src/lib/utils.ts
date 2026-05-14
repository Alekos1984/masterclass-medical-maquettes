import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrix(montantHT: number | string): string {
  const n = typeof montantHT === "string" ? parseFloat(montantHT) : montantHT;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(n);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function calcCommission(prixHT: number, taux = 0.2) {
  const commission = prixHT * taux;
  const netFormateur = prixHT - commission;
  return { commission, netFormateur };
}

export function estEligibleRemboursement(dateFormation: Date): boolean {
  const now = new Date();
  const diffMs = dateFormation.getTime() - now.getTime();
  const diffJours = diffMs / (1000 * 60 * 60 * 24);
  return diffJours >= 14;
}
