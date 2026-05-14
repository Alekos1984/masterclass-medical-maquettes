import Link from "next/link";

const demandes = [
  {
    id: "DR-2026-0041",
    formateur: "Dr. Dumont",
    ville: "Paris",
    hotel: "Hôtel Lutetia",
    salle: "Salle conférence",
    capacite: "10–25 pers.",
    slaWidth: "85%",
    slaColor: "#e65100",
    slaText: "20h ⚠",
    statut: "Contacté",
    pillClass: "pill-orange",
  },
  {
    id: "DR-2026-0042",
    formateur: "Dr. Bernard",
    ville: "Bordeaux",
    hotel: "Centre de Congrès",
    salle: "Grande salle",
    capacite: "25–50 pers.",
    slaWidth: "40%",
    slaColor: "#2e7d32",
    slaText: "48h",
    statut: "En attente",
    pillClass: "pill-gray",
  },
  {
    id: "DR-2026-0043",
    formateur: "Dr. Lefebvre",
    ville: "Lille",
    hotel: "Novotel",
    salle: "Salle modulable",
    capacite: "10–25 pers.",
    slaWidth: "20%",
    slaColor: "#2e7d32",
    slaText: "60h",
    statut: "En attente",
    pillClass: "pill-gray",
  },
  {
    id: "DR-2026-0044",
    formateur: "Dr. Chartier",
    ville: "Nantes",
    hotel: "Mercure",
    salle: "Salle de réunion",
    capacite: "Moins de 10",
    slaWidth: "10%",
    slaColor: "#2e7d32",
    slaText: "68h",
    statut: "En attente",
    pillClass: "pill-gray",
  },
];

export default function AdminDemandesPage() {
  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/admin/dashboard" className="topbar-back">← Dashboard</Link>
          <div className="topbar-sep"></div>
          <span className="topbar-title">Demandes de salle</span>
        </div>
      </div>

      <div className="content">
        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-val" style={{ color: "var(--red)" }}>4</div>
            <div className="stat-card-label">Demandes en attente</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val">1</div>
            <div className="stat-card-label">SLA critique ({"<"}24h)</div>
            <div className="stat-card-trend trend-warn">⚠ Action requise</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val">72h</div>
            <div className="stat-card-label">SLA garanti formateurs</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val">12</div>
            <div className="stat-card-label">Traitées ce mois</div>
            <div className="stat-card-trend trend-up">↑ +4 ce mois</div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Formateur · Lieu</th>
                <th>Capacité</th>
                <th>SLA restant</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div className="td-name" style={{ fontFamily: "monospace", fontSize: 11 }}>{d.id}</div>
                  </td>
                  <td>
                    <div className="td-name">{d.formateur} · {d.ville}</div>
                    <div className="td-sub">{d.hotel} · {d.salle}</div>
                  </td>
                  <td>{d.capacite}</td>
                  <td>
                    <div className="sla-bar">
                      <div className="sla-track">
                        <div className="sla-fill" style={{ width: d.slaWidth, background: d.slaColor }}></div>
                      </div>
                      <span className="sla-text" style={{ color: d.slaColor }}>{d.slaText}</span>
                    </div>
                  </td>
                  <td><span className={`pill ${d.pillClass}`}>{d.statut}</span></td>
                  <td>
                    <Link href={`/admin/demandes/${d.id}`} className="card-action">Traiter →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
