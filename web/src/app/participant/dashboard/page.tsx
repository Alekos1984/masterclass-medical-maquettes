import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatutInscription } from "@/generated/prisma/enums";
import PayerButton from "./PayerButton";
import SignerConventionButton from "./SignerConventionButton";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function formatDateLong(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function daysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function statutPillClass(statut: string): { label: string; className: string } {
  switch (statut) {
    case StatutInscription.CONFIRMEE:
      return { label: "Confirmée", className: "pill-green" };
    case StatutInscription.EN_ATTENTE_PAIEMENT:
      return { label: "En attente de paiement", className: "pill-orange" };
    case StatutInscription.ANNULEE:
      return { label: "Annulée", className: "pill-gray" };
    case StatutInscription.REMBOURSEE:
      return { label: "Remboursée", className: "pill-gray" };
    default:
      return { label: statut, className: "pill-gray" };
  }
}

export default async function ParticipantDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const profil = await prisma.participantProfile.findUnique({
    where: { userId: session.user.id },
  });

  const inscriptions = profil
    ? await prisma.inscription.findMany({
        where: { participantId: profil.id },
        include: {
          formation: true,
          paiement: { select: { id: true } },
          satisfaction: { select: { id: true } },
          emargements: { select: { id: true, token: true, presentMatin: true, presentApresMidi: true, pvParticipantSignedAt: true } },
        },
        orderBy: { formation: { date: "asc" } },
      })
    : [];

  const now = new Date();

  const inscriptionsAVenir = inscriptions.filter(
    (i) =>
      i.formation.date >= now &&
      i.statut !== StatutInscription.ANNULEE &&
      i.statut !== StatutInscription.REMBOURSEE
  );
  const inscriptionsPassees = inscriptions.filter(
    (i) =>
      i.formation.date < now &&
      i.statut !== StatutInscription.ANNULEE &&
      i.statut !== StatutInscription.REMBOURSEE
  );

  const attestationsCount = inscriptionsPassees.filter((i) => i.attestationUrl).length;
  const notesGiven = inscriptionsPassees.filter((i) => i.noteSatisfaction !== null);
  const noteMoyenne =
    notesGiven.length > 0
      ? (notesGiven.reduce((sum, i) => sum + (i.noteSatisfaction ?? 0), 0) / notesGiven.length).toFixed(1)
      : null;

  const prochaineFormation = inscriptionsAVenir[0];
  const userName = session.user.name ?? "Participant";
  const initials = getInitials(userName);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px 60px" }}>

      {/* WELCOME */}
      <div style={{
        background: "linear-gradient(135deg,#080810,#0c1828)", borderRadius: 16,
        padding: "28px 32px", marginBottom: 24, display: "flex",
        alignItems: "center", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40, width: 200, height: 200,
          background: "radial-gradient(circle,rgba(21,101,192,0.2) 0%,transparent 65%)",
        }} />
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "white", letterSpacing: -0.3, marginBottom: 4 }}>
            Bonjour, {userName} 👋
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
            {prochaineFormation
              ? (() => {
                  const days = daysUntil(prochaineFormation.formation.date);
                  if (days === 0) return "Votre formation a lieu aujourd'hui !";
                  if (days === 1) return "Votre formation a lieu demain.";
                  return `Vous avez une formation dans ${days} jours. Pensez à vérifier vos documents.`;
                })()
              : inscriptionsPassees.length > 0
              ? "Retrouvez l'historique de vos formations ci-dessous."
              : "Découvrez nos formations disponibles et inscrivez-vous."}
          </div>
          {prochaineFormation && (
            <div style={{
              background: "rgba(21,101,192,0.2)", border: "1px solid rgba(21,101,192,0.4)",
              color: "#90caf9", padding: "4px 12px", borderRadius: 100, fontSize: 11,
              fontWeight: 700, marginTop: 10, display: "inline-block",
            }}>
              📅 Prochaine formation : {formatDateLong(prochaineFormation.formation.date)}
              {prochaineFormation.formation.lieuVille ? ` · ${prochaineFormation.formation.lieuVille}` : ""}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 20, position: "relative", zIndex: 1 }}>
          {[
            { val: String(inscriptions.filter(i => i.statut !== StatutInscription.ANNULEE && i.statut !== StatutInscription.REMBOURSEE).length), label: "Formations suivies" },
            { val: String(attestationsCount), label: "Attestations" },
            { val: noteMoyenne ?? "—", label: "Note moy. donnée" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 20px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "white", letterSpacing: -0.5 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        <div>

          {/* MES INSCRIPTIONS */}
          <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 14, padding: "20px 22px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Mes inscriptions</span>
              <Link href="/formations" style={{ fontSize: 12, fontWeight: 600, color: "var(--red)", textDecoration: "none" }}>
                Trouver une formation →
              </Link>
            </div>

            {/* À VENIR */}
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--red)", marginBottom: 8 }}>
              À venir ({inscriptionsAVenir.length})
            </div>

            {inscriptionsAVenir.length === 0 ? (
              <div style={{ border: "1.5px dashed #E0E0E0", borderRadius: 12, padding: "24px 20px", textAlign: "center", color: "#6A6A6A", marginBottom: 16 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📅</div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Aucune formation à venir</div>
                <div style={{ fontSize: 12, marginBottom: 12 }}>Découvrez notre catalogue et inscrivez-vous à une formation.</div>
                <Link href="/formations" style={{ fontSize: 12, fontWeight: 600, color: "var(--red)", textDecoration: "none" }}>
                  Voir les formations disponibles →
                </Link>
              </div>
            ) : (
              inscriptionsAVenir.map((insc) => {
                const f = insc.formation;
                const days = daysUntil(f.date);
                const { label: statutLabel, className: statutClass } = statutPillClass(insc.statut);
                return (
                  <div key={insc.id} style={{ border: "1.5px solid #E0E0E0", borderRadius: 12, overflow: "hidden", marginBottom: 10 }}>
                    <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <div style={{ width: 4, borderRadius: 100, flexShrink: 0, alignSelf: "stretch", minHeight: 50, background: "var(--red)" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                              <span className={`pill ${statutClass}`}>{statutLabel}</span>
                              {days >= 0 && (
                                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--red)", background: "#fff5f6", border: "1px solid #ffc5cc", padding: "3px 10px", borderRadius: 100 }}>
                                  ⏰ {days === 0 ? "Aujourd'hui !" : days === 1 ? "Demain" : `Dans ${days} jours`}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: -0.2 }}>
                              {f.titre}
                            </div>
                          </div>
                          <div style={{ fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
                            {f.gratuite || Number(insc.montantHT) === 0 ? (
                              <span style={{ color: "#2e7d32" }}>Gratuit</span>
                            ) : (
                              <>{Number(insc.montantHT).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €{" "}
                              <span style={{ fontSize: 11, fontWeight: 400, color: "var(--gray)" }}>HT</span></>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, marginBottom: 8 }}>
                          <span style={{ fontSize: 12, color: "var(--gray)", display: "flex", alignItems: "center", gap: 4 }}>
                            📅 {formatDateLong(f.date)} · {f.heureDebut}–{f.heureFin}
                          </span>
                          {f.lieuVille && (
                            <span style={{ fontSize: 12, color: "var(--gray)", display: "flex", alignItems: "center", gap: 4 }}>
                              📍 {f.lieuVille}{f.lieuNom ? ` · ${f.lieuNom}` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {(f.sessionStatus === "EN_COURS" || f.sessionStatus === "EN_PAUSE") && (() => {
                      const emg = insc.emargements[0];
                      const alreadyEmarked = emg && (emg.presentMatin || emg.presentApresMidi);
                      if (alreadyEmarked) {
                        return (
                          <div style={{ padding: "10px 16px", background: "#2e7d32", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
                              ✅ Émargement enregistré
                            </span>
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>Votre présence est confirmée</span>
                          </div>
                        );
                      }
                      return (
                        <div style={{ padding: "10px 16px", background: "#C8102E", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
                            🔴 Session démarrée{f.sessionStatus === "EN_PAUSE" ? " (pause)" : ""}
                          </span>
                          {emg?.token ? (
                            <a
                              href={`/emarger/${emg.token}`}
                              style={{ background: "white", color: "#C8102E", border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 800, textDecoration: "none", whiteSpace: "nowrap" as const }}
                            >
                              ✍️ Émarger maintenant
                            </a>
                          ) : (
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>Lien d&apos;émargement en cours d&apos;envoi…</span>
                          )}
                        </div>
                      );
                    })()}
                    <div style={{ padding: "8px 16px", background: "var(--off-white)", borderTop: "1px solid #EBEBEB", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
                      {insc.conventionSignee && (insc as { conventionParticipantSigneeAt?: Date | null }).conventionParticipantSigneeAt && <span style={{ fontSize: 11, color: "#2e7d32" }}>✓ Convention co-signée</span>}
                      {insc.conventionSignee && !(insc as { conventionParticipantSigneeAt?: Date | null }).conventionParticipantSigneeAt && insc.statut === StatutInscription.CONFIRMEE && <span style={{ fontSize: 11, color: "#f57f17" }}>Convention en attente de votre signature</span>}
                      {!insc.conventionSignee && insc.statut === StatutInscription.CONFIRMEE && <span style={{ fontSize: 11, color: "var(--gray)" }}>Convention en attente du formateur</span>}
                      <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                        {insc.statut === StatutInscription.EN_ATTENTE_PAIEMENT && (
                          f.gratuite || Number(insc.montantHT) === 0
                            ? <PayerButton inscriptionId={insc.id} label="Confirmer mon inscription" />
                            : <PayerButton inscriptionId={insc.id} />
                        )}
                        {/* Bouton signer convention côté participant */}
                        {insc.statut === StatutInscription.CONFIRMEE && insc.conventionSignee && !(insc as { conventionParticipantSigneeAt?: Date | null }).conventionParticipantSigneeAt && (
                          <SignerConventionButton inscriptionId={insc.id} />
                        )}
                        {/* Convocation — dispo après envoi par le formateur */}
                        {insc.convocationSignee ? (
                          <a href={`/api/pdf/convocation/${insc.id}`} target="_blank" rel="noopener noreferrer" style={{ border: "1.5px solid #E0E0E0", background: "white", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", color: "var(--black)" }}>
                            📬 Convocation PDF
                          </a>
                        ) : (
                          <span title="En attente d'envoi par le formateur" style={{ border: "1.5px solid #E0E0E0", background: "#f5f5f5", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "not-allowed", color: "#bbb", userSelect: "none" }}>
                            📬 Convocation PDF
                          </span>
                        )}
                        {/* Convention — dispo seulement si signée par le formateur */}
                        {insc.conventionSignee && insc.statut === StatutInscription.CONFIRMEE ? (
                          <a href={`/api/pdf/convention/${insc.id}`} target="_blank" rel="noopener noreferrer" style={{ border: "1.5px solid #E0E0E0", background: "white", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", color: "var(--black)" }}>
                            📄 Convention PDF
                          </a>
                        ) : (
                          <span title={insc.statut !== StatutInscription.CONFIRMEE ? "Disponible après confirmation de votre inscription" : "En attente de signature par le formateur"} style={{ border: "1.5px solid #E0E0E0", background: "#f5f5f5", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "not-allowed", color: "#bbb", userSelect: "none" }}>
                            📄 Convention PDF
                          </span>
                        )}
                        {/* Facture */}
                        {insc.paiement?.id ? (
                          <a href={`/api/pdf/facture/${insc.paiement.id}`} target="_blank" rel="noopener noreferrer" style={{ border: "1.5px solid #E0E0E0", background: "white", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", color: "var(--black)" }}>
                            🧾 Facture PDF
                          </a>
                        ) : (
                          <span title="Disponible après paiement" style={{ border: "1.5px solid #E0E0E0", background: "#f5f5f5", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "not-allowed", color: "#bbb", userSelect: "none" }}>
                            🧾 Facture PDF
                          </span>
                        )}
                        <Link href={`/formations/${f.slug}`} style={{ border: "1.5px solid #E0E0E0", background: "white", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", color: "var(--black)" }}>
                          Voir la formation
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* PASSÉES */}
            <div style={{ height: 16 }} />
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--gray)", marginBottom: 8 }}>
              Passées ({inscriptionsPassees.length})
            </div>

            {inscriptionsPassees.length === 0 ? (
              <div style={{ padding: "20px 0", textAlign: "center", color: "#6A6A6A", fontSize: 13 }}>
                Aucune formation passée.
              </div>
            ) : (
              inscriptionsPassees.map((insc, i) => {
                const f = insc.formation;
                return (
                  <div key={insc.id} style={{ border: "1.5px solid #E0E0E0", borderRadius: 12, overflow: "hidden", marginBottom: i < inscriptionsPassees.length - 1 ? 10 : 0, opacity: 0.85 }}>
                    <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <div style={{ width: 4, borderRadius: 100, flexShrink: 0, alignSelf: "stretch", minHeight: 50, background: "#1565c0" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                              <span className="pill pill-blue">Terminée</span>
                              {insc.attestationUrl && (
                                <span style={{ fontSize: 11, color: "var(--gray)" }}>Attestation disponible</span>
                              )}
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 800 }}>{f.titre}</div>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: f.gratuite || Number(insc.montantHT) === 0 ? "#2e7d32" : "var(--gray)" }}>
                            {f.gratuite || Number(insc.montantHT) === 0 ? "Gratuit" : `${Number(insc.montantHT).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} € HT`}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
                          <span style={{ fontSize: 12, color: "var(--gray)" }}>📅 {formatDate(f.date)}</span>
                          {f.lieuVille && (
                            <span style={{ fontSize: 12, color: "var(--gray)" }}>📍 {f.lieuVille}</span>
                          )}
                          {insc.noteSatisfaction && (
                            <span style={{ fontSize: 12, color: "#ffc107", fontWeight: 600 }}>
                              ⭐ Votre note : {insc.noteSatisfaction}/5
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: "8px 16px", background: "var(--off-white)", borderTop: "1px solid #EBEBEB", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
                      {insc.conventionSignee && <span style={{ fontSize: 11, color: "#2e7d32" }}>✓ Convention signée</span>}
                      {f.sessionStatus === "TERMINEE" && !insc.satisfaction && insc.emargements.some((e) => e.presentMatin || e.presentApresMidi) && (
                        <Link
                          href={`/participant/satisfaction/${insc.id}`}
                          style={{ fontSize: 11, fontWeight: 700, color: "#C8102E", background: "#fff5f6", border: "1px solid #ffc5cc", padding: "4px 10px", borderRadius: 100, textDecoration: "none" }}
                        >
                          ⭐ Remplir le questionnaire de satisfaction
                        </Link>
                      )}
                      <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                        {/* Convention PDF */}
                        {insc.conventionSignee && insc.statut === StatutInscription.CONFIRMEE ? (
                          <a href={`/api/pdf/convention/${insc.id}`} target="_blank" rel="noopener noreferrer" style={{ border: "1.5px solid #E0E0E0", background: "white", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", color: "var(--black)" }}>
                            📄 Convention PDF
                          </a>
                        ) : (
                          <span title="Non disponible" style={{ border: "1.5px solid #E0E0E0", background: "#f5f5f5", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "not-allowed", color: "#bbb", userSelect: "none" }}>
                            📄 Convention PDF
                          </span>
                        )}
                        {/* Attestation PDF */}
                        {insc.statut === "CONFIRMEE" ? (
                          <a href={`/api/pdf/attestation/${insc.id}`} target="_blank" rel="noopener noreferrer" style={{ border: "1.5px solid #E0E0E0", background: "white", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", color: "var(--black)" }}>
                            🎓 Attestation PDF
                          </a>
                        ) : (
                          <span title="Non disponible" style={{ border: "1.5px solid #E0E0E0", background: "#f5f5f5", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "not-allowed", color: "#bbb", userSelect: "none" }}>
                            🎓 Attestation PDF
                          </span>
                        )}
                        {/* PV de formation */}
                        {f.pvSigne ? (() => {
                          const myEmg = insc.emargements.find((e) => e.presentMatin || e.presentApresMidi);
                          if (!myEmg) return null;
                          const pvParticipantSigne = !!myEmg.pvParticipantSignedAt;
                          return pvParticipantSigne ? (
                            <a href={`/api/pdf/pv-formation/${f.id}/participant/${myEmg.id}`} target="_blank" rel="noopener noreferrer" style={{ border: "1.5px solid #c8e6c9", background: "#e8f5e9", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", color: "#2e7d32" }}>
                              📄 PV co-signé
                            </a>
                          ) : (
                            <Link href={`/participant/pv/${myEmg.id}`} style={{ border: "1.5px solid #ffc5cc", background: "#fff5f6", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", color: "#C8102E" }}>
                              ✍️ Signer le PV
                            </Link>
                          );
                        })() : (
                          <span title="En attente de signature par le formateur" style={{ border: "1.5px solid #E0E0E0", background: "#f5f5f5", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "not-allowed", color: "#bbb", userSelect: "none" }}>
                            📄 PV de formation
                          </span>
                        )}
                        {/* Bilan pédagogique */}
                        {f.bilanSigne ? (
                          <a href={`/api/pdf/bilan/${f.id}`} target="_blank" rel="noopener noreferrer" style={{ border: "1.5px solid #E0E0E0", background: "white", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", color: "var(--black)" }}>
                            📊 Bilan pédagogique
                          </a>
                        ) : (
                          <span title="En attente de publication par le formateur" style={{ border: "1.5px solid #E0E0E0", background: "#f5f5f5", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "not-allowed", color: "#bbb", userSelect: "none" }}>
                            📊 Bilan pédagogique
                          </span>
                        )}
                        {/* Facture */}
                        {insc.paiement?.id ? (
                          <a href={`/api/pdf/facture/${insc.paiement.id}`} target="_blank" rel="noopener noreferrer" style={{ border: "1.5px solid #E0E0E0", background: "white", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", color: "var(--black)" }}>
                            🧾 Facture PDF
                          </a>
                        ) : (
                          <span title="Aucun paiement enregistré" style={{ border: "1.5px solid #E0E0E0", background: "#f5f5f5", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "not-allowed", color: "#bbb", userSelect: "none" }}>
                            🧾 Facture PDF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* AIDE */}
          <div style={{ background: "#fff5f6", border: "1.5px solid #ffc5cc", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Besoin d&apos;aide ?</div>
            <div style={{ fontSize: 12, color: "var(--gray)", marginBottom: 10, lineHeight: 1.5 }}>
              Pour toute question sur votre inscription, annulation ou vos documents.
            </div>
            <a href="mailto:contact@masterclassmedicale.com" style={{ fontSize: 12, fontWeight: 600, color: "var(--red)", textDecoration: "none" }}>
              ✉️ Contacter le support →
            </a>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div>
          {/* PROFIL */}
          <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 14, padding: "20px 22px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Mon profil</div>
            <div style={{ background: "var(--off-white)", borderRadius: 12, padding: "14px 16px", marginBottom: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#1565c0,#42a5f5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "white", flexShrink: 0 }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{userName}</div>
                  {profil?.specialite && (
                    <div style={{ fontSize: 12, color: "var(--gray)" }}>{profil.specialite}</div>
                  )}
                </div>
              </div>
              {profil ? (
                [
                  { key: "Email", val: session.user.email ?? "—" },
                  profil.specialite ? { key: "Spécialité", val: profil.specialite } : null,
                  profil.rpps ? { key: "RPPS", val: profil.rpps } : null,
                  profil.ville ? { key: "Ville", val: profil.ville } : null,
                ]
                  .filter(Boolean)
                  .map((r, i, arr) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: i < arr.length - 1 ? "1px solid #E0E0E0" : "none" }}>
                      <span style={{ color: "var(--gray)" }}>{r!.key}</span>
                      <span style={{ fontWeight: 600 }}>{r!.val}</span>
                    </div>
                  ))
              ) : (
                <div style={{ fontSize: 12, color: "var(--gray)", marginBottom: 8 }}>
                  Profil non complété
                </div>
              )}
              <Link href="/participant/profil" style={{
                width: "100%", background: "white", border: "1.5px solid #E0E0E0", borderRadius: 8,
                padding: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                marginTop: 10, display: "block", textAlign: "center", textDecoration: "none", color: "var(--black)",
              }}>
                ✏️ Modifier mon profil
              </Link>
            </div>
          </div>

          {/* SUGGESTIONS */}
          <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Découvrir des formations</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--gray)", marginBottom: 12, lineHeight: 1.5 }}>
              Parcourez notre catalogue de masterclasses médicales pour développer vos compétences.
            </div>
            <Link href="/formations" style={{
              width: "100%", background: "var(--red)", border: "1.5px solid var(--red)", borderRadius: 8,
              padding: 9, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              display: "block", textAlign: "center", textDecoration: "none", color: "white",
            }}>
              🔍 Voir le catalogue →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
