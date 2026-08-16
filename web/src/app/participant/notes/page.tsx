import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ParticipantNotesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const profil = await prisma.participantProfile.findUnique({ where: { userId: session.user.id } });

  const notes = profil
    ? await prisma.cursusNote.findMany({
        where: { participantId: profil.id, module: { cloture: true } },
        include: { module: { include: { cursus: { select: { titre: true, annee: true } } } } },
        orderBy: { module: { clotureAt: "desc" } },
      })
    : [];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 40px 60px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Mes résultats</h1>
      <p style={{ fontSize: 13, color: "#6A6A6A", marginBottom: 24 }}>
        Notes et résultats des modalités de validation clôturées par le coordinateur.
      </p>

      {notes.length === 0 ? (
        <div style={{ background: "#F7F7F8", borderRadius: 12, padding: 28, textAlign: "center", color: "#8A8A8A", fontSize: 13 }}>
          Aucun résultat disponible pour le moment.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notes.map((n) => {
            const valide = n.module.seuilValidation != null && n.note != null ? n.note >= n.module.seuilValidation : null;
            return (
              <div key={n.id} style={{ border: "1px solid #E5E5E7", borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#8A8A8A", marginBottom: 2 }}>
                    {n.module.cursus.titre}{n.module.cursus.annee ? ` (${n.module.cursus.annee})` : ""}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{n.module.intitule}</div>
                  {n.commentaire && <div style={{ fontSize: 12, color: "#6A6A6A", marginTop: 4 }}>{n.commentaire}</div>}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>
                    {n.note != null ? `${n.note}/${n.module.noteMax}` : "—"}
                  </div>
                  {valide !== null && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: valide ? "#2E7D32" : "#C8102E" }}>
                      {valide ? "Validé" : "Non validé"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
