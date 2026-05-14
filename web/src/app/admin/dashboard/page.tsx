export default function AdminDashboardPage() {
  return (
    <>
      <div className="topbar">
        <span className="topbar-title">Dashboard Administration</span>
        <div className="topbar-right">
          <span className="topbar-date">Dimanche 26 avril 2026</span>
          <div className="topbar-notif">
            🔔
            <div className="notif-dot"></div>
          </div>
        </div>
      </div>

      <div className="content">
        {/* METRICS */}
        <div className="metrics-grid metrics-grid-5">
          <div className="metric-card">
            <div className="metric-label">Formations actives</div>
            <div className="metric-val">23</div>
            <div className="metric-sub">8 publiées · 15 en cours</div>
            <div className="metric-trend trend-up">↑ +3 ce mois</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Formateurs</div>
            <div className="metric-val">41</div>
            <div className="metric-sub">34 actifs · 7 inactifs</div>
            <div className="metric-trend trend-up">↑ +5 ce mois</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Inscriptions</div>
            <div className="metric-val">312</div>
            <div className="metric-sub">Total toutes formations</div>
            <div className="metric-trend trend-up">↑ +47 ce mois</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Revenus plateforme</div>
            <div className="metric-val" style={{ fontSize: 18 }}>18 640 €</div>
            <div className="metric-sub">Commissions + frais gestion</div>
            <div className="metric-trend trend-up">↑ +2 340 € ce mois</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Devis en attente</div>
            <div className="metric-val" style={{ color: "var(--red)" }}>4</div>
            <div className="metric-sub">SLA : 72h ouvrées</div>
            <div className="metric-trend trend-warn">⚠ 1 expire demain</div>
          </div>
        </div>

        {/* DEMANDES SALLES + ACTIVITÉ */}
        <div className="three-col">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Demandes de salle à traiter</span>
              <a href="/admin/demandes" className="card-action">Voir tout →</a>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Formateur · Lieu</th>
                  <th>Capacité</th>
                  <th>SLA restant</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="td-name">Dr. Dumont · Paris</div>
                    <div className="td-sub">Hôtel Lutetia · Salle conférence</div>
                  </td>
                  <td>10–25 pers.</td>
                  <td>
                    <div className="sla-bar">
                      <div className="sla-track">
                        <div className="sla-fill" style={{ width: "85%", background: "#e65100" }}></div>
                      </div>
                      <span className="sla-text" style={{ color: "#e65100" }}>20h ⚠</span>
                    </div>
                  </td>
                  <td><span className="pill pill-orange">Contacté</span></td>
                  <td><a href="/admin/demandes/DR-2026-0041" className="card-action">Traiter →</a></td>
                </tr>
                <tr>
                  <td>
                    <div className="td-name">Dr. Bernard · Bordeaux</div>
                    <div className="td-sub">Centre de Congrès · Grande salle</div>
                  </td>
                  <td>25–50 pers.</td>
                  <td>
                    <div className="sla-bar">
                      <div className="sla-track">
                        <div className="sla-fill" style={{ width: "40%", background: "#2e7d32" }}></div>
                      </div>
                      <span className="sla-text" style={{ color: "#2e7d32" }}>48h</span>
                    </div>
                  </td>
                  <td><span className="pill pill-gray">En attente</span></td>
                  <td><a href="/admin/demandes/DR-2026-0042" className="card-action">Traiter →</a></td>
                </tr>
                <tr>
                  <td>
                    <div className="td-name">Dr. Lefebvre · Lille</div>
                    <div className="td-sub">Novotel · Salle modulable</div>
                  </td>
                  <td>10–25 pers.</td>
                  <td>
                    <div className="sla-bar">
                      <div className="sla-track">
                        <div className="sla-fill" style={{ width: "20%", background: "#2e7d32" }}></div>
                      </div>
                      <span className="sla-text" style={{ color: "#2e7d32" }}>60h</span>
                    </div>
                  </td>
                  <td><span className="pill pill-gray">En attente</span></td>
                  <td><a href="/admin/demandes/DR-2026-0043" className="card-action">Traiter →</a></td>
                </tr>
                <tr>
                  <td>
                    <div className="td-name">Dr. Chartier · Nantes</div>
                    <div className="td-sub">Mercure · Salle de réunion</div>
                  </td>
                  <td>Moins de 10</td>
                  <td>
                    <div className="sla-bar">
                      <div className="sla-track">
                        <div className="sla-fill" style={{ width: "10%", background: "#2e7d32" }}></div>
                      </div>
                      <span className="sla-text" style={{ color: "#2e7d32" }}>68h</span>
                    </div>
                  </td>
                  <td><span className="pill pill-gray">En attente</span></td>
                  <td><a href="/admin/demandes/DR-2026-0044" className="card-action">Traiter →</a></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="card-header">
                <span className="card-title">Activité récente</span>
                <a className="card-action">Tout voir</a>
              </div>
              <div className="notif-item">
                <div className="notif-icon ni-green">💳</div>
                <div>
                  <div className="notif-text">Paiement confirmé — <strong>Dr. Dumont · Lyon</strong> — 1 440 € HT</div>
                  <div className="notif-time">Il y a 1h</div>
                </div>
                <div className="notif-new"></div>
              </div>
              <div className="notif-item">
                <div className="notif-icon ni-blue">👨‍⚕️</div>
                <div>
                  <div className="notif-text">Nouveau formateur — <strong>Dr. Anne Chartier</strong> · Marseille</div>
                  <div className="notif-time">Il y a 3h</div>
                </div>
                <div className="notif-new"></div>
              </div>
              <div className="notif-item">
                <div className="notif-icon ni-red">↩️</div>
                <div>
                  <div className="notif-text">Remboursement demandé — <strong>Dr. Martin</strong> · Toulouse</div>
                  <div className="notif-time">Il y a 5h</div>
                </div>
                <div className="notif-new"></div>
              </div>
              <div className="notif-item">
                <div className="notif-icon ni-orange">🏨</div>
                <div>
                  <div className="notif-text">Nouvelle demande salle — <strong>Dr. Chartier</strong> · Nantes</div>
                  <div className="notif-time">Hier 17h32</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">Revenus mensuels (HT)</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--gray)", marginBottom: 6 }}>Commissions + frais gestion</div>
              <div className="rev-bars">
                <div className="rev-bar-wrap"><div className="rev-bar" style={{ height: "30%" }}></div><div className="rev-bar-label">Nov</div></div>
                <div className="rev-bar-wrap"><div className="rev-bar" style={{ height: "45%" }}></div><div className="rev-bar-label">Déc</div></div>
                <div className="rev-bar-wrap"><div className="rev-bar" style={{ height: "35%" }}></div><div className="rev-bar-label">Jan</div></div>
                <div className="rev-bar-wrap"><div className="rev-bar" style={{ height: "60%" }}></div><div className="rev-bar-label">Fév</div></div>
                <div className="rev-bar-wrap"><div className="rev-bar" style={{ height: "50%" }}></div><div className="rev-bar-label">Mar</div></div>
                <div className="rev-bar-wrap"><div className="rev-bar" style={{ height: "75%" }}></div><div className="rev-bar-label">Avr</div></div>
                <div className="rev-bar-wrap">
                  <div className="rev-bar" style={{ height: "100%", opacity: 1 }}></div>
                  <div className="rev-bar-label" style={{ fontWeight: 700, color: "var(--black)" }}>Mai</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FORMATIONS + FORMATEURS */}
        <div className="two-col">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Formations récentes</span>
              <a href="/admin/formations" className="card-action">Voir tout →</a>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Formation</th>
                  <th>Inscrits</th>
                  <th>Revenus comm.</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="td-name">Cardiologie inter. — Lyon</div>
                    <div className="td-sub">15 nov. 2026 · Dr. Dumont</div>
                  </td>
                  <td>12 / 15</td>
                  <td>1 080 € HT</td>
                  <td><span className="pill pill-green">Publiée</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="td-name">Échocardiographie — Paris</div>
                    <div className="td-sub">3 déc. 2026 · Dr. Bernard</div>
                  </td>
                  <td>6 / 15</td>
                  <td>384 € HT</td>
                  <td><span className="pill pill-orange">Devis reçu</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="td-name">Rythmologie — Marseille</div>
                    <div className="td-sub">8 fév. 2027 · Dr. Chartier</div>
                  </td>
                  <td>3 / 15</td>
                  <td>234 € HT</td>
                  <td><span className="pill pill-blue">Validée</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="td-name">Stenting — Toulouse</div>
                    <div className="td-sub">Juin 2026 · Dr. Dumont</div>
                  </td>
                  <td>14 / 15</td>
                  <td>3 360 € HT</td>
                  <td><span className="pill pill-gray">Archivée</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Formateurs actifs</span>
              <a href="/admin/formateurs" className="card-action">Voir tout →</a>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Formateur</th>
                  <th>Formations</th>
                  <th>Abonnement</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="td-name">Dr. P. Dumont</div>
                    <div className="td-sub">Cardiologue · Lyon</div>
                  </td>
                  <td>4</td>
                  <td><span className="pill pill-green">Actif</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="td-name">Dr. S. Bernard</div>
                    <div className="td-sub">Cardiologue · Paris</div>
                  </td>
                  <td>2</td>
                  <td><span className="pill pill-green">Actif</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="td-name">Dr. M. Lefebvre</div>
                    <div className="td-sub">Cardiologue · Lille</div>
                  </td>
                  <td>3</td>
                  <td><span className="pill pill-orange">Impayé</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="td-name">Dr. A. Chartier</div>
                    <div className="td-sub">Rythmologue · Marseille</div>
                  </td>
                  <td>1</td>
                  <td><span className="pill pill-blue">1ère formation</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="td-name">Dr. T. Moreau</div>
                    <div className="td-sub">Neurologue · Bordeaux</div>
                  </td>
                  <td>2</td>
                  <td><span className="pill pill-green">Actif</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
