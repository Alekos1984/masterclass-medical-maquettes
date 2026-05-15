"use client";

import { useState } from "react";

interface Settings {
  raisonSociale: string;
  siret: string | null;
  numeroDeclaration: string | null;
  adresse: string | null;
  codePostal: string | null;
  ville: string | null;
  phone: string | null;
  email: string | null;
  representantLegal: string | null;
  siteWeb: string | null;
}

export function SettingsClient({ initialSettings }: { initialSettings: Settings | null }) {
  const [form, setForm] = useState<Settings>({
    raisonSociale: initialSettings?.raisonSociale ?? "Masterclass Medical",
    siret: initialSettings?.siret ?? "",
    numeroDeclaration: initialSettings?.numeroDeclaration ?? "",
    adresse: initialSettings?.adresse ?? "",
    codePostal: initialSettings?.codePostal ?? "",
    ville: initialSettings?.ville ?? "",
    phone: initialSettings?.phone ?? "",
    email: initialSettings?.email ?? "",
    representantLegal: initialSettings?.representantLegal ?? "",
    siteWeb: initialSettings?.siteWeb ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (key: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 900 }}>

        {/* Bloc 1 : Identité */}
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <h2 className="stat-card-label" style={{ fontSize: 11, marginBottom: 16 }}>Identité de l&apos;organisme</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label className="form-label">Raison sociale *</label>
              <input className="form-input" value={form.raisonSociale} onChange={set("raisonSociale")} required />
            </div>
            <div>
              <label className="form-label">SIRET</label>
              <input className="form-input" value={form.siret ?? ""} onChange={set("siret")} placeholder="000 000 000 00000" />
            </div>
            <div>
              <label className="form-label">N° déclaration d&apos;activité</label>
              <input
                className="form-input"
                value={form.numeroDeclaration ?? ""}
                onChange={set("numeroDeclaration")}
                placeholder="11 75 XXXXXXXX"
              />
              <p style={{ fontSize: 11, color: "var(--gray)", marginTop: 4 }}>
                Préfecture de région — formation professionnelle
              </p>
            </div>
            <div>
              <label className="form-label">Représentant légal</label>
              <input className="form-input" value={form.representantLegal ?? ""} onChange={set("representantLegal")} />
            </div>
          </div>
        </div>

        {/* Bloc 2 : Coordonnées */}
        <div className="card">
          <h2 className="stat-card-label" style={{ fontSize: 11, marginBottom: 16 }}>Adresse</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="form-label">Adresse</label>
              <input className="form-input" value={form.adresse ?? ""} onChange={set("adresse")} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
              <div>
                <label className="form-label">Code postal</label>
                <input className="form-input" value={form.codePostal ?? ""} onChange={set("codePostal")} />
              </div>
              <div>
                <label className="form-label">Ville</label>
                <input className="form-input" value={form.ville ?? ""} onChange={set("ville")} />
              </div>
            </div>
          </div>
        </div>

        {/* Bloc 3 : Contact */}
        <div className="card">
          <h2 className="stat-card-label" style={{ fontSize: 11, marginBottom: 16 }}>Contact</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email ?? ""} onChange={set("email")} />
            </div>
            <div>
              <label className="form-label">Téléphone</label>
              <input className="form-input" value={form.phone ?? ""} onChange={set("phone")} />
            </div>
            <div>
              <label className="form-label">Site web</label>
              <input className="form-input" value={form.siteWeb ?? ""} onChange={set("siteWeb")} placeholder="https://..." />
            </div>
          </div>
        </div>

        {/* Preview PDFs */}
        <div className="card" style={{ gridColumn: "1 / -1", backgroundColor: "var(--off-white)" }}>
          <h2 className="stat-card-label" style={{ fontSize: 11, marginBottom: 12 }}>Aperçu — ces informations apparaîtront sur tous les documents PDF</h2>
          <div style={{ fontSize: 12, color: "var(--gray)", lineHeight: 1.8 }}>
            <strong style={{ color: "var(--black)" }}>{form.raisonSociale}</strong>
            {form.siret && <> — SIRET {form.siret}</>}
            {form.numeroDeclaration && <> — N° déclaration activité : {form.numeroDeclaration}</>}
            <br />
            {form.adresse && <>{form.adresse}, </>}{form.codePostal} {form.ville}
            {form.email && <> — {form.email}</>}
          </div>
        </div>

      </div>

      <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 12 }}>
        <button type="submit" className="btn btn-red" disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        {saved && <span style={{ fontSize: 13, color: "#16a34a" }}>✓ Paramètres enregistrés</span>}
      </div>
    </form>
  );
}
