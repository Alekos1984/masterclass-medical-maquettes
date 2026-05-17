"use client";
import { useState } from "react";

export default function SignerConventionButton({ inscriptionId, onSigned }: { inscriptionId: string; onSigned?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSign() {
    if (!confirm("En cliquant sur OK vous signez numériquement la convention de formation. Cette action est définitive.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/participant/inscriptions/${inscriptionId}/signer-convention`, { method: "POST" });
      if (res.ok) { setDone(true); onSigned?.(); window.location.reload(); }
      else {
        let msg = await res.text();
        try { const j = JSON.parse(msg); msg = j.error ?? msg; } catch { /* raw text */ }
        alert("Erreur : " + msg);
      }
    } finally { setLoading(false); }
  }

  if (done) return <span style={{ fontSize: 11, color: "#2e7d32", fontWeight: 700 }}>✓ Convention signée</span>;

  return (
    <button
      onClick={handleSign}
      disabled={loading}
      style={{ background: "#C8102E", color: "white", border: "none", borderRadius: 7, padding: "5px 14px", fontSize: 12, fontWeight: 700, cursor: loading ? "wait" : "pointer", fontFamily: "inherit" }}
    >
      {loading ? "Signature…" : "✍️ Signer la convention"}
    </button>
  );
}
