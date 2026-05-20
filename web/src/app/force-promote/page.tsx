"use client";

import { useState } from "react";

export default function ForcePromotePage() {
  const [email, setEmail] = useState("alexis.bourla+formateur@gmail.com");
  const [secret, setSecret] = useState("");
  const [result, setResult] = useState<{ ok?: boolean; message?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/admin/force-promote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, secret }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", fontFamily: "system-ui" }}>
      <div style={{ background: "white", borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 420, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🔑</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Promouvoir en Admin</h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 5 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", border: "1.5px solid #ddd", borderRadius: 8, padding: "10px 12px", fontSize: 13, boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 5 }}>ADMIN_SETUP_SECRET (variable Scalingo)</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              required
              style={{ width: "100%", border: "1.5px solid #ddd", borderRadius: 8, padding: "10px 12px", fontSize: 13, boxSizing: "border-box" }}
            />
          </div>

          {result && (
            <div style={{
              padding: "12px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: result.ok ? "#e8f5e9" : "#ffebee",
              color: result.ok ? "#2e7d32" : "#c62828",
            }}>
              {result.message ?? result.error}
            </div>
          )}

          {result?.ok && (
            <div style={{ fontSize: 12, color: "#666", background: "#fff8e1", padding: "10px 12px", borderRadius: 8 }}>
              ✅ Maintenant : <strong>déconnecte-toi et reconnecte-toi</strong> pour que le token JWT soit mis à jour avec le rôle ADMIN.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ background: "#C8102E", color: "white", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            {loading ? "En cours…" : "Promouvoir en administrateur"}
          </button>
        </form>
      </div>
    </div>
  );
}
