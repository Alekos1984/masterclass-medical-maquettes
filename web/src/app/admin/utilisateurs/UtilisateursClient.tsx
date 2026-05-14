"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: "PARTICIPANT" | "FORMATEUR" | "ADMIN";
  createdAt: string;
  formateurProfile: { id: string; specialite: string | null; formationsTotal: number } | null;
  participantProfile: { id: string; specialite: string | null } | null;
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  FORMATEUR: "Formateur",
  PARTICIPANT: "Participant",
};

const ROLE_PILL: Record<string, string> = {
  ADMIN: "pill pill-red",
  FORMATEUR: "pill pill-blue",
  PARTICIPANT: "pill pill-green",
};

function initials(name: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UtilisateursClient({
  users: initial,
  currentUserId,
}: {
  users: User[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initial);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ADMIN" | "FORMATEUR" | "PARTICIPANT">("ALL");
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || u.role === filter;
    return matchSearch && matchFilter;
  });

  async function changeRole(userId: string, newRole: string) {
    if (!confirm(`Changer le rôle vers "${ROLE_LABELS[newRole]}" ?`)) return;
    setLoading(userId + "_role");
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setLoading(null);
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as User["role"] } : u))
      );
    } else {
      alert("Erreur lors du changement de rôle");
    }
  }

  async function deleteUser(userId: string, name: string | null) {
    if (!confirm(`Supprimer définitivement le compte de "${name ?? userId}" ? Cette action est irréversible.`))
      return;
    setLoading(userId + "_del");
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    setLoading(null);
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } else {
      const data = await res.json();
      alert(data.error ?? "Erreur lors de la suppression");
    }
  }

  const counts = {
    ALL: users.length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
    FORMATEUR: users.filter((u) => u.role === "FORMATEUR").length,
    PARTICIPANT: users.filter((u) => u.role === "PARTICIPANT").length,
  };

  return (
    <>
      {/* Stats */}
      <div className="metrics-grid metrics-grid-4" style={{ marginBottom: 20 }}>
        {(["ALL", "ADMIN", "FORMATEUR", "PARTICIPANT"] as const).map((r) => (
          <div
            key={r}
            className="metric-card"
            style={{ cursor: "pointer", border: filter === r ? "2px solid var(--red)" : undefined }}
            onClick={() => setFilter(r)}
          >
            <div className="metric-label">{r === "ALL" ? "Total" : ROLE_LABELS[r]}</div>
            <div className="metric-val">{counts[r]}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Rechercher par nom ou email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="auth-input"
          style={{ maxWidth: 400 }}
        />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--gray)" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
            <div style={{ fontWeight: 700 }}>Aucun utilisateur trouvé</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Profil</th>
                <th>Inscrit le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: "linear-gradient(135deg, var(--red), #ff6b7a)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0,
                        }}
                      >
                        {initials(u.name)}
                      </div>
                      <div>
                        <div className="td-name">{u.name ?? "—"}</div>
                        {u.id === currentUserId && (
                          <div style={{ fontSize: 10, color: "var(--red)", fontWeight: 700 }}>Vous</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--gray)" }}>{u.email}</td>
                  <td>
                    <span className={ROLE_PILL[u.role]}>{ROLE_LABELS[u.role]}</span>
                  </td>
                  <td style={{ fontSize: 11, color: "var(--gray)" }}>
                    {u.role === "FORMATEUR" && u.formateurProfile
                      ? `${u.formateurProfile.specialite ?? "—"} · ${u.formateurProfile.formationsTotal} formation(s)`
                      : u.role === "PARTICIPANT" && u.participantProfile
                      ? u.participantProfile.specialite ?? "—"
                      : "—"}
                  </td>
                  <td style={{ fontSize: 11, color: "var(--gray)" }}>
                    {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {/* Role change */}
                      {u.role !== "FORMATEUR" && (
                        <button
                          className="btn-sm btn-ghost-sm"
                          disabled={loading === u.id + "_role"}
                          onClick={() => changeRole(u.id, "FORMATEUR")}
                        >
                          → Formateur
                        </button>
                      )}
                      {u.role !== "PARTICIPANT" && (
                        <button
                          className="btn-sm btn-ghost-sm"
                          disabled={loading === u.id + "_role"}
                          onClick={() => changeRole(u.id, "PARTICIPANT")}
                        >
                          → Participant
                        </button>
                      )}
                      {u.role !== "ADMIN" && (
                        <button
                          className="btn-sm btn-ghost-sm"
                          disabled={loading === u.id + "_role"}
                          onClick={() => changeRole(u.id, "ADMIN")}
                        >
                          → Admin
                        </button>
                      )}
                      {/* Delete */}
                      {u.id !== currentUserId && (
                        <button
                          className="btn-sm"
                          style={{ background: "#ffebee", color: "#c62828" }}
                          disabled={loading === u.id + "_del"}
                          onClick={() => deleteUser(u.id, u.name)}
                        >
                          {loading === u.id + "_del" ? "…" : "Supprimer"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
