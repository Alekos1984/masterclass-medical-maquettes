"use client";

import { useState } from "react";

export default function PayerButton({ inscriptionId }: { inscriptionId: string }) {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    try {
      const res = await fetch(`/api/checkout/${inscriptionId}`, { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      style={{
        background: "#C8102E", color: "white", border: "none", borderRadius: 7,
        padding: "5px 14px", fontSize: 12, fontWeight: 700, cursor: loading ? "wait" : "pointer",
        fontFamily: "inherit", opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? "Redirection…" : "💳 Payer maintenant"}
    </button>
  );
}
