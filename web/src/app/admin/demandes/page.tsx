import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

const STATUT_LABELS: Record<string, { label: string; pillClass: string }> = {
  EN_ATTENTE:          { label: "En attente",          pillClass: "pill-gray" },
  CONTACT_HOTEL:       { label: "Hôtel contacté",      pillClass: "pill-orange" },
  DEVIS_RECU:          { label: "Devis reçu",           pillClass: "pill-blue" },
  VALIDE:              { label: "Validé",               pillClass: "pill-green" },
  TRANSMIS_FORMATEUR:  { label: "Transmis formateur",  pillClass: "pill-green" },
  PAYE:                { label: "Payé",                 pillClass: "pill-green" },
};

export default async function AdminDemandesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/auth/login");

  const demandes = await prisma.demandeSalle.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      formation: {
        select: {
          titre: true,
          lieuVille: true,
          lieuNom: true,
          placesTotal: true,
          formateur: { select: { user: { select: { name: true } } } },
        },
      },
    },
  });

  const enAttente = demandes.filter((d) => d.statut === "EN_ATTENTE").length;
  const contacte  = demandes.filter((d) => d.statut === "CONTACT_HOTEL").length;

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/admin/dashboard" className="topbar-back">← Dashboard</Link>
          <div className="topbar-sep" />
          <span className="topbar-title">Demandes de salle</span>
        </div>
        <div className="topbar-right">
          <span className="topbar-date">{demandes.length} demande{demandes.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="content">
        {/* STATS */}
        <div className="metrics-grid metrics-grid-4" style={{ marginBottom: 20 }}>
          <div className="metric-card">
            <div className="metric-label">Total</div>
            <div className="metric-val">{demandes.length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">En attente</div>
            <div className="metric-val" style={{ color: enAttente > 0 ? "var(--red)" : undefined }}>{enAttente}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Hôtel contacté</div>
            <div className="metric-val">{contacte}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Validées / Payées</div>
            <div className="metric-val">
              {demandes.filter((d) => d.statut === "VALIDE" || d.statut === "TRANSMIS_FORMATEUR" || d.statut === "PAYE").length}
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {demandes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--gray)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🏨</div>
              <div style={{ fontWeight: 700 }}>Aucune demande de salle pour l&apos;instant</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Les demandes apparaîtront ici dès qu&apos;un formateur créera une formation.</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Formation</th>
                  <th>Formateur · Ville</th>
                  <th>Capacité</th>
                  <th>Hôtel</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {demandes.map((d) => {
                  const statut = STATUT_LABELS[d.statut] ?? { label: d.statut, pillClass: "pill-gray" };
                  const capacite = d.formation.placesTotal
                    ? `${d.formation.placesTotal} places`
                    : "—";
                  return (
                    <tr key={d.id}>
                      <td><div className="td-name">{d.formation.titre}</div></td>
                      <td>
                        <div className="td-name">{d.formation.formateur.user.name ?? "—"}</div>
                        <div className="td-sub">{d.formation.lieuVille ?? "—"}</div>
                      </td>
                      <td style={{ fontSize: 12 }}>{capacite}</td>
                      <td style={{ fontSize: 12, color: "var(--gray)" }}>
                        {d.hotelNom ?? <span style={{ fontStyle: "italic" }}>Non renseigné</span>}
                      </td>
                      <td><span className={`pill ${statut.pillClass}`}>{statut.label}</span></td>
                      <td style={{ fontSize: 11, color: "var(--gray)" }}>
                        {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td>
                        <Link href={`/admin/demandes/${d.id}`} className="card-action">Traiter →</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
