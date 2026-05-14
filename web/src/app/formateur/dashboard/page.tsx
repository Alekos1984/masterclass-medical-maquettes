"use client";

import Link from "next/link";

const formations = [
  {
    color: "#C8102E",
    title: "Cardiologie interventionnelle — Lyon",
    meta: "15 nov. 2026 · Marriott Lyon",
    gauge: 80,
    status: "Publiée",
    statusClass: "pill-green",
    inscrits: "12 / 15 inscrits",
  },
  {
    color: "#e65100",
    title: "Échocardiographie — Paris",
    meta: "12 jan. 2027 · Hôtel Lutetia",
    gauge: 20,
    status: "Devis reçu",
    statusClass: "pill-orange",
    inscrits: "3 / 15 inscrits",
  },
  {
    color: "#9e9e9e",
    title: "Insuffisance cardiaque — Bordeaux",
    meta: "Mars 2027 · À confirmer",
    gauge: null,
    status: "Brouillon",
    statusClass: "pill-gray",
    inscrits: "—",
  },
  {
    color: "#1565c0",
    title: "Stenting coronarien — Toulouse",
    meta: "Juin 2026 · Novotel Toulouse",
    gauge: null,
    status: "Terminée",
    statusClass: "pill-blue",
    inscrits: "14 / 15",
  },
];

const notifications = [
  {
    iconBg: "#fff3e0",
    icon: "💰",
    textStr: "Devis reçu pour Paris · Hôtel Lutetia — 1 400 € HT",
    time: "Il y a 2 heures",
    isNew: true,
  },
  {
    iconBg: "#e8f5e9",
    icon: "👤",
    textStr: "Nouvelle inscription — Dr. Sophie Bernard · Lyon",
    time: "Il y a 4 heures",
    isNew: true,
  },
  {
    iconBg: "#e3f2fd",
    icon: "📅",
    textStr: "Rappel — Formation Lyon dans 20 jours. Kit formateur envoyé J-7.",
    time: "Hier",
    isNew: false,
  },
];

const priorityActions = [
  {
    iconBg: "#fff0f2",
    icon: "💰",
    title: "Valider le devis — Paris · Hôtel Lutetia",
    sub: "1 400 € HT + 140 € frais gestion · Expire dans 5 jours",
  },
  {
    iconBg: "#fff3e0",
    icon: "✍️",
    title: "Préparer l'émargement — Lyon · 15 nov.",
    sub: "12 participants confirmés · Formation dans 20 jours",
  },
  {
    iconBg: "#e3f2fd",
    icon: "📋",
    title: "Compléter le brouillon — Bordeaux",
    sub: "Étape 3/6 · Contenu pédagogique manquant",
  },
];

const statsData = [
  { label: "Taux de remplissage moyen", value: "78%", pct: 78 },
  { label: "Satisfaction moyenne", value: "4.9 / 5", pct: 98 },
  { label: "Taux de présence", value: "93%", pct: 93 },
  { label: "Taux de recommandation", value: "96%", pct: 96 },
];

export default function DashboardFormateur() {
  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="topbar-title">Dashboard</div>
        <div className="topbar-right">
          <div className="topbar-notif">
            🔔
            <div className="notif-dot" />
          </div>
          <Link href="/formateur/formations/new" className="btn-new">
            + Nouvelle formation
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">
        {/* WELCOME BANNER */}
        <div className="welcome-banner">
          <div>
            <div className="welcome-title">Bonjour, Dr. Dumont 👋</div>
            <div className="welcome-sub">
              Vous avez 1 devis en attente de validation et 2 nouvelles inscriptions.
            </div>
            <div className="welcome-pill">⚡ Formation active · Lyon · 15 nov. 2026</div>
          </div>
          <Link
            href="/formateur/formations/new"
            className="btn-new"
            style={{ flexShrink: 0, position: "relative", zIndex: 1 }}
          >
            + Nouvelle formation
          </Link>
        </div>

        {/* METRICS */}
        <div className="metrics-grid metrics-grid-4">
          <div className="metric-card">
            <div className="metric-label">Formations</div>
            <div className="metric-val">3</div>
            <div className="metric-sub">2 publiées · 1 en cours</div>
            <div className="metric-trend trend-up">↑ +1 ce mois</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Participants total</div>
            <div className="metric-val">34</div>
            <div className="metric-sub">Toutes formations</div>
            <div className="metric-trend trend-up">↑ +7 ce mois</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Revenus HT</div>
            <div className="metric-val" style={{ fontSize: 20 }}>
              6 480 €
            </div>
            <div className="metric-sub">Après commission (20%)</div>
            <div className="metric-trend trend-up">↑ +1 440 € ce mois</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Note moyenne</div>
            <div className="metric-val">4.9</div>
            <div className="metric-sub">Sur 28 évaluations</div>
            <div className="metric-trend trend-neutral">⭐ Excellent</div>
          </div>
        </div>

        {/* FORMATIONS + NOTIFS */}
        <div className="three-col">
          {/* Formations list */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Mes formations</span>
              <Link href="/formateur/formations" className="card-action">
                Voir tout →
              </Link>
            </div>
            {formations.map((f, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 0",
                  borderBottom: i < formations.length - 1 ? "1px solid #EBEBEB" : "none",
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 44,
                    borderRadius: 100,
                    background: f.color,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginBottom: 3,
                    }}
                  >
                    {f.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#6A6A6A" }}>{f.meta}</div>
                  {f.gauge !== null && (
                    <div style={{ marginTop: 4 }}>
                      <div
                        style={{
                          background: "#EBEBEB",
                          borderRadius: 100,
                          height: 3,
                          overflow: "hidden",
                          width: 80,
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            borderRadius: 100,
                            background: "#C8102E",
                            width: `${f.gauge}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span
                    className={`pill ${f.statusClass}`}
                    style={{ display: "inline-block", marginBottom: 4 }}
                  >
                    {f.status}
                  </span>
                  <div style={{ fontSize: 11, color: "#6A6A6A" }}>{f.inscrits}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right column: notifications + abonnement */}
          <div>
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="card-header">
                <span className="card-title">Notifications</span>
                <a href="#" className="card-action">
                  Tout lire
                </a>
              </div>
              {notifications.map((n, i) => (
                <div className="notif-item" key={i}>
                  <div className="notif-icon" style={{ background: n.iconBg }}>
                    {n.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="notif-text">{n.textStr}</div>
                    <div className="notif-time">{n.time}</div>
                  </div>
                  {n.isNew && <div className="notif-new" />}
                </div>
              ))}
            </div>

            {/* Abonnement card */}
            <div
              style={{
                background: "linear-gradient(135deg, #0F0F0F, #1a0408)",
                borderRadius: 14,
                padding: "18px 20px",
                color: "white",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 6,
                }}
              >
                Abonnement
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 2 }}>
                Formateur Actif
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>
                20 € HT / mois
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
                Prochain prélèvement :{" "}
                <strong style={{ color: "white" }}>1er déc. 2026</strong>
              </div>
              <button
                style={{
                  background: "#C8102E",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  width: "100%",
                  fontFamily: "inherit",
                }}
              >
                Gérer l&apos;abonnement
              </button>
            </div>
          </div>
        </div>

        {/* ACTIONS + STATS */}
        <div className="two-col">
          {/* Actions prioritaires */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 12 }}>
              <span className="card-title">Actions prioritaires</span>
            </div>
            {priorityActions.map((a, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "10px 14px",
                  border: "1.5px solid #E0E0E0",
                  borderRadius: 10,
                  marginBottom: i < priorityActions.length - 1 ? 8 : 0,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: a.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {a.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 1 }}>{a.sub}</div>
                </div>
                <span style={{ color: "#6A6A6A", fontSize: 16 }}>→</span>
              </div>
            ))}
          </div>

          {/* Statistiques */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Statistiques</span>
              <a href="#" className="card-action">
                Détails →
              </a>
            </div>
            {statsData.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: i < statsData.length - 1 ? "1px solid #EBEBEB" : "none",
                }}
              >
                <span style={{ fontSize: 12, color: "#6A6A6A" }}>{s.label}</span>
                <div
                  style={{
                    flex: 1,
                    margin: "0 12px",
                    background: "#EBEBEB",
                    borderRadius: 100,
                    height: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 100,
                      background: "#C8102E",
                      width: `${s.pct}%`,
                    }}
                  />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
