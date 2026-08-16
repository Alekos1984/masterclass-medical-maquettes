"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Invitation = {
  email: string; nom: string | null; statut: string; role: string;
  cursusTitre: string; annee: string | null; coordinateurNom: string; nbJournees: number;
};

export default function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    fetch(`/api/cursus/invitation/${token}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) setError(d.error ?? "Invitation introuvable");
        else setInvitation(d);
      })
      .catch(() => setError("Erreur réseau"));
  }, [token]);

  const accepter = useCallback(async () => {
    setAccepting(true);
    setError("");
    try {
      const res = await fetch(`/api/cursus/invitation/${token}`, { method: "POST" });
      const d = await res.json();
      if (res.status === 401) {
        // Pas connecté → login avec retour ici
        router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/cursus/invitation/${token}`)}`);
        return;
      }
      if (res.status === 403) {
        // Pas de compte → inscription. Un compte "formateur" est utilisé même pour la secrétaire
        // pédagogique : c'est ce qui donne accès aux pages /formateur/coordination/*, la secrétaire
        // n'aura simplement aucune formation personnelle à gérer.
        router.push(`/auth/register?role=formateur&callbackUrl=${encodeURIComponent(`/cursus/invitation/${token}`)}`);
        return;
      }
      if (!res.ok) { setError(d.error ?? "Erreur"); return; }
      router.push(`/formateur/coordination/${d.cursusId}`);
    } catch {
      setError("Erreur réseau");
    } finally {
      setAccepting(false);
    }
  }, [token, router]);

  return (
    <div style={{ minHeight: "100vh", background: "#F9F7F4", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-sans, 'DM Sans', sans-serif)", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 20, border: "1px solid #E0E0E0", padding: "44px 40px", maxWidth: 520, width: "100%", textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#C8102E", color: "white", fontSize: 22, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>M</div>
        {error && !invitation && (
          <>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0F0F0F", marginBottom: 8 }}>Invitation introuvable</div>
            <div style={{ fontSize: 13, color: "#6A6A6A", marginBottom: 20 }}>{error}</div>
            <Link href="/" style={{ color: "#C8102E", fontWeight: 700, fontSize: 13 }}>← Retour à l&apos;accueil</Link>
          </>
        )}
        {invitation && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C8102E", marginBottom: 8 }}>
              {invitation.role === "SECRETAIRE" ? "Invitation secrétaire pédagogique" : "Invitation enseignant·e"}
            </div>
            <div style={{ fontSize: 21, fontWeight: 800, color: "#0F0F0F", marginBottom: 8, lineHeight: 1.3 }}>
              {invitation.cursusTitre}{invitation.annee ? ` · ${invitation.annee}` : ""}
            </div>
            <div style={{ fontSize: 14, color: "#6A6A6A", lineHeight: 1.6, marginBottom: 22 }}>
              {invitation.role === "SECRETAIRE" ? (
                <><strong>{invitation.coordinateurNom}</strong> vous invite comme secrétaire pédagogique
                ({invitation.nbJournees} journée{invitation.nbJournees > 1 ? "s" : ""} d&apos;enseignement).
                Vous pourrez gérer les créneaux, l&apos;équipe enseignante, les étudiants et les émargements — sans accès aux notes.</>
              ) : (
                <><strong>{invitation.coordinateurNom}</strong> vous invite à rejoindre l&apos;équipe pédagogique
                ({invitation.nbJournees} journée{invitation.nbJournees > 1 ? "s" : ""} d&apos;enseignement).
                Vous pourrez consulter vos créneaux, charger vos supports, échanger vos cours et communiquer avec les autres intervenants.</>
              )}
            </div>
            {invitation.statut === "ACCEPTE" ? (
              <div style={{ fontSize: 14, color: "#2e7d32", fontWeight: 700 }}>✓ Invitation déjà acceptée — connectez-vous pour accéder au cursus.</div>
            ) : (
              <button
                onClick={accepter}
                disabled={accepting}
                style={{ background: accepting ? "#999" : "#C8102E", color: "white", border: "none", borderRadius: 100, padding: "14px 36px", fontSize: 15, fontWeight: 800, cursor: accepting ? "not-allowed" : "pointer", fontFamily: "inherit" }}
              >
                {accepting ? "Un instant…" : "Accepter l'invitation →"}
              </button>
            )}
            {error && <div style={{ fontSize: 13, color: "#c62828", marginTop: 14 }}>{error}</div>}
            <div style={{ fontSize: 12, color: "#9A9A9A", marginTop: 18, lineHeight: 1.5 }}>
              Invitation adressée à {invitation.email}.<br/>
              Pas encore de compte ? Il sera créé à cette étape (gratuit).
            </div>
          </>
        )}
        {!invitation && !error && <div style={{ color: "#6A6A6A", fontSize: 14 }}>Chargement…</div>}
      </div>
    </div>
  );
}
