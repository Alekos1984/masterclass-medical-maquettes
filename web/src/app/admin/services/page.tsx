import Link from "next/link";

const services = [
  {
    formateur: "Dr. Pierre Dumont",
    service: "Captation vidéo journée",
    serviceDetail: "Caméra + montage + livraison",
    formation: "Cardiologie inter. — Lyon",
    montant: "890 €",
    date: "20 oct. 2026",
    statut: "Devis envoyé",
    pillClass: "pill-orange",
    canSend: false,
    faded: false,
  },
  {
    formateur: "Dr. Sophie Bernard",
    service: "Design affiche sur-mesure",
    serviceDetail: "Charte graphique personnalisée",
    formation: "Échocardiographie — Paris",
    montant: "350 €",
    date: "25 oct. 2026",
    statut: "En attente",
    pillClass: "pill-orange",
    canSend: true,
    faded: false,
  },
  {
    formateur: "Dr. Marc Lefebvre",
    service: "Traduction anglais → français",
    serviceDetail: "Programme + slides · 45 pages",
    formation: "Insuffisance cardiaque — Bordeaux",
    montant: "480 €",
    date: "2 nov. 2026",
    statut: "En attente",
    pillClass: "pill-orange",
    canSend: true,
    faded: false,
  },
  {
    formateur: "Dr. Anne Chartier",
    service: "Photographe professionnel",
    serviceDetail: undefined,
    formation: "Urgences cardio. — Lyon",
    montant: "290 €",
    date: "5 oct. 2026",
    statut: "Facturé",
    pillClass: "pill-green",
    canSend: false,
    faded: true,
  },
];

export default function AdminServicesPage() {
  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/admin/dashboard" className="topbar-back">← Dashboard</Link>
          <div className="topbar-sep"></div>
          <span className="topbar-title">Services complémentaires sur devis</span>
        </div>
      </div>

      <div className="content">
        {/* INFO BANNER */}
        <div className="info-banner">
          ℹ️ Services facturables sur devis aux formateurs : traduction de documents, design personnalisé,
          captation vidéo, services de restauration premium, mise en page avancée du programme.
        </div>

        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-val">3</div>
            <div className="stat-card-label">Devis en cours</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val">12</div>
            <div className="stat-card-label">Traités ce mois</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val" style={{ fontSize: 18 }}>4 200 €</div>
            <div className="stat-card-label">CA services HT</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-val">7</div>
            <div className="stat-card-label">Services catalogue</div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Formateur</th>
                <th>Service demandé</th>
                <th>Formation liée</th>
                <th>Montant HT</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.formateur + s.service} style={{ opacity: s.faded ? 0.6 : 1 }}>
                  <td><div className="td-name">{s.formateur}</div></td>
                  <td>
                    <div className="td-name">{s.service}</div>
                    {s.serviceDetail && <div className="td-sub">{s.serviceDetail}</div>}
                  </td>
                  <td>{s.formation}</td>
                  <td style={{ fontWeight: 700 }}>{s.montant}</td>
                  <td>{s.date}</td>
                  <td><span className={`pill ${s.pillClass}`}>{s.statut}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 5 }}>
                      {s.canSend && (
                        <button className="btn btn-red" style={{ fontSize: 11 }}>Envoyer devis</button>
                      )}
                      <button className="btn btn-ghost">Voir</button>
                    </div>
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
