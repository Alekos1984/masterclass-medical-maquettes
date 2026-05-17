import { createHmac } from "node:crypto";

export function computeDocSeal(
  formationId: string,
  doc: "pv" | "bilan" | "certificat" | "emargement",
  signedAt: string
): string {
  const secret = process.env.NEXTAUTH_SECRET ?? "fallback-dev-secret";
  return createHmac("sha256", secret)
    .update(`${formationId}:${doc}:${signedAt}`)
    .digest("hex");
}

export function computeInscriptionSeal(
  inscriptionId: string,
  doc: "convention" | "convocation",
  formateurSignedAt: string,
  participantSignedAt?: string
): string {
  const secret = process.env.NEXTAUTH_SECRET ?? "fallback-dev-secret";
  const payload = `${inscriptionId}:${doc}:${formateurSignedAt}:${participantSignedAt ?? ""}`;
  return createHmac("sha256", secret).update(payload).digest("hex");
}
