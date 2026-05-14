"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, secret }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } else {
      setError(data.error ?? "Erreur inconnue");
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", fontFamily: "var(--font-sans)",
    }}>
      <div className="card" style={{ width: "100%", maxWidth: 420, padding: "40px 36px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--red), #ff6b7a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, margin: "0 auto 16px",
          }}>🔑</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Accès administrateur</h1>
          <p style={{ fontSize: 13, color: "var(--gray)" }}>
            Promouvez votre compte en administrateur. Cette page se désactive dès qu'un admin existe.
          </p>
        </div>

        {success ? (
          <div style={{
            background: "#e8f5e9", color: "#2e7d32", borderRadius: 10,
            padding: "16px 20px", textAlign: "center", fontWeight: 600,
          }}>
            Compte promu administrateur. Redirection vers la connexion…
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>
                Email du compte à promouvoir
              </label>
              <input
                type="email"
                className="auth-input"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>
                Secret de configuration
              </label>
              <input
                type="password"
                className="auth-input"
                placeholder="ADMIN_SETUP_SECRET"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                required
                style={{ width: "100%" }}
              />
            </div>

            {error && (
              <div style={{
                background: "#ffebee", color: "#c62828", borderRadius: 8,
                padding: "10px 14px", fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: 4 }}
            >
              {loading ? "En cours…" : "Promouvoir en administrateur"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
