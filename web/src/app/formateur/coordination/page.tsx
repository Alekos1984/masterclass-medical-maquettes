"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CursusCoordonne = {
  id: string; titre: string; statut: string; annee: string | null; publique: boolean;
  nbJournees: number; nbEnseignants: number; enAttente: number; prochaineDate: string | null;
  nbAlertes: number; prochaineEcheanceNotation: { intitule: string; date: string } | null;
  nbEtudiants: number; capaciteMax: number | null; tauxRemplissage: number | null;
};
type CursusEnseigne = {
  id: string; titre: string; statut: string; annee: string | null;
  coordinateurNom: string; nbJournees: number; invitationEnAttente: boolean; inviteToken: string | null;
};

function statutPill(statut: string) {
  if (statut === "PUBLIE") return <span className="pill pill-green">Publié</span>;
  if (statut === "ARCHIVE") return <span className="pill pill-gray">Archivé</span>;
  return <span className="pill pill-orange">Brouillon</span>;
}

export default function CoordinationPage() {
  const [coordonnes, setCoordonnes] = useState<CursusCoordonne[]>([]);
  const [enseignes, setEnseignes] = useState<CursusEnseigne[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cursus")
      .then((r) => r.json())
      .then((d) => { setCoordonnes(d.coordonnes ?? []); setEnseignes(d.enseignes ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Coordination d&apos;enseignement</div>
        <div className="topbar-right">
          <Link
            href="/formateur/coordination/new"
            style={{ background: "#C8102E", color: "white", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}
          >
            + Nouveau DU / cursus
          </Link>
        </div>
      </div>
      <div className="content" style={{ maxWidth: 1100 }}>
        <div style={{ fontSize: 14, color: "#6A6A6A", marginBottom: 24, lineHeight: 1.6, maxWidth: 720 }}>
          Créez et pilotez un enseignement multi-journées (DU, DIU, séminaire annuel) : dates, créneaux,
          intervenants, supports, étudiants — toute la coordination au même endroit.
        </div>

        {loading && <div style={{ padding: 40, textAlign: "center", color: "#6A6A6A" }}>Chargement…</div>}

        {!loading && (
          <>
            {coordonnes.length > 1 && (
              <div style={{ display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
                <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 12, padding: "12px 18px", minWidth: 140 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: coordonnes.some((c) => c.nbAlertes > 0) ? "#C8102E" : "#0F0F0F" }}>
                    {coordonnes.reduce((s, c) => s + c.nbAlertes, 0)}
                  </div>
                  <div style={{ fontSize: 11, color: "#6A6A6A" }}>alertes au total</div>
                </div>
                <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 12, padding: "12px 18px", minWidth: 140 }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>
                    {coordonnes.filter((c) => c.prochaineEcheanceNotation).length}
                  </div>
                  <div style={{ fontSize: 11, color: "#6A6A6A" }}>échéance(s) de notation à venir</div>
                </div>
                <div style={{ background: "white", border: "1px solid #E0E0E0", borderRadius: 12, padding: "12px 18px", minWidth: 140 }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>
                    {coordonnes.reduce((s, c) => s + c.nbEtudiants, 0)}
                  </div>
                  <div style={{ fontSize: 11, color: "#6A6A6A" }}>étudiants inscrits (tous DU)</div>
                </div>
              </div>
            )}

            <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6A6A6A", marginBottom: 12 }}>
              Mes cursus coordonnés ({coordonnes.length})
            </div>
            {coordonnes.length === 0 && (
              <div style={{ background: "white", borderRadius: 16, border: "1px dashed #E0E0E0", padding: "36px 24px", textAlign: "center", marginBottom: 28 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🧑‍🏫</div>
                <div style={{ fontSize: 14, color: "#6A6A6A" }}>Aucun cursus pour l&apos;instant. Créez votre premier DU !</div>
              </div>
            )}
            {coordonnes.map((c) => (
              <Link key={c.id} href={`/formateur/coordination/${c.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ background: "white", borderRadius: 14, border: "1px solid #E0E0E0", padding: "18px 22px", marginBottom: 10, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", cursor: "pointer" }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0F0F0F" }}>{c.titre}{c.annee ? ` · ${c.annee}` : ""}</div>
                    <div style={{ fontSize: 12, color: "#6A6A6A", marginTop: 3 }}>
                      {c.nbJournees} journée{c.nbJournees > 1 ? "s" : ""} · {c.nbEnseignants} enseignant{c.nbEnseignants > 1 ? "s" : ""}
                      {c.prochaineDate && ` · prochaine : ${new Date(c.prochaineDate).toLocaleDateString("fr-FR")}`}
                      {c.tauxRemplissage !== null && ` · ${c.nbEtudiants}/${c.capaciteMax} étudiants (${c.tauxRemplissage}%)`}
                    </div>
                  </div>
                  {c.nbAlertes > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 700, background: "#ffebee", color: "#C8102E", padding: "4px 10px", borderRadius: 100 }}>
                      ⚠ {c.nbAlertes} alerte{c.nbAlertes > 1 ? "s" : ""}
                    </span>
                  )}
                  {c.prochaineEcheanceNotation && (
                    <span style={{ fontSize: 11, fontWeight: 700, background: "#f3e5f5", color: "#6a1b9a", padding: "4px 10px", borderRadius: 100 }}>
                      📝 {c.prochaineEcheanceNotation.intitule} · {new Date(c.prochaineEcheanceNotation.date).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                  {c.enAttente > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 700, background: "#fff3e0", color: "#e65100", padding: "4px 10px", borderRadius: 100 }}>
                      {c.enAttente} invitation{c.enAttente > 1 ? "s" : ""} en attente
                    </span>
                  )}
                  {c.publique && <span style={{ fontSize: 11, fontWeight: 600, background: "#e3f2fd", color: "#1565c0", padding: "4px 10px", borderRadius: 100 }}>Public</span>}
                  {statutPill(c.statut)}
                  <span style={{ color: "#C8102E", fontWeight: 700, fontSize: 13 }}>Gérer →</span>
                </div>
              </Link>
            ))}

            <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6A6A6A", margin: "28px 0 12px" }}>
              Mes enseignements ({enseignes.length})
            </div>
            {enseignes.length === 0 && (
              <div style={{ fontSize: 13, color: "#9A9A9A", marginBottom: 20 }}>
                Vous n&apos;êtes enseignant dans aucun cursus pour l&apos;instant.
              </div>
            )}
            {enseignes.map((c) => (
              <Link key={c.id} href={c.invitationEnAttente && c.inviteToken ? `/cursus/invitation/${c.inviteToken}` : `/formateur/coordination/${c.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ background: "white", borderRadius: 14, border: "1px solid #E0E0E0", padding: "18px 22px", marginBottom: 10, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", cursor: "pointer" }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0F0F0F" }}>{c.titre}{c.annee ? ` · ${c.annee}` : ""}</div>
                    <div style={{ fontSize: 12, color: "#6A6A6A", marginTop: 3 }}>
                      Coordonné par {c.coordinateurNom} · {c.nbJournees} journée{c.nbJournees > 1 ? "s" : ""}
                    </div>
                  </div>
                  {c.invitationEnAttente
                    ? <span style={{ fontSize: 11, fontWeight: 700, background: "#fff3e0", color: "#e65100", padding: "4px 10px", borderRadius: 100 }}>Invitation à accepter</span>
                    : statutPill(c.statut)}
                  <span style={{ color: "#C8102E", fontWeight: 700, fontSize: 13 }}>
                    {c.invitationEnAttente ? "Accepter →" : "Voir mes enseignements →"}
                  </span>
                </div>
              </Link>
            ))}
          </>
        )}
      </div>
    </>
  );
}
