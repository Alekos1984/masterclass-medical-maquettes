"use client";

import { useRef, useState } from "react";
import Link from "next/link";

interface PVData {
  emargementId: string;
  alreadySigned: boolean;
  signedAt: string | null;
  pvFormateurSigne: boolean;
  participant: { nom: string; email: string };
  formation: {
    id: string;
    titre: string;
    date: string;
    formateurNom: string;
  };
}

export default function PVSignClient({ data }: { data: PVData }) {
  const [signed, setSigned] = useState(data.alreadySigned);
  const [signedAt, setSignedAt] = useState(data.signedAt);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    lastPos.current = getPos(e);
    canvasRef.current?.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || !lastPos.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#0F0F0F";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
    lastPos.current = pos;
  }

  function onPointerUp() {
    drawing.current = false;
    lastPos.current = null;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  }

  function getSigBase64(): string | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasDrawing = Array.from(imageData.data).some((v, i) => i % 4 !== 3 && v < 250);
    if (!hasDrawing) return null;
    return canvas.toDataURL("image/png");
  }

  async function doSign() {
    const signatureBase64 = getSigBase64();
    if (!signatureBase64) {
      setError("Veuillez dessiner votre signature avant de valider.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/participant/pv-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emargementId: data.emargementId, signatureBase64 }),
      });
      const json = await res.json() as { error?: string; pvParticipantSignedAt?: string };
      if (!res.ok) {
        setError(json.error ?? "Erreur lors de la signature.");
        return;
      }
      setSigned(true);
      setSignedAt(json.pvParticipantSignedAt ?? new Date().toISOString());
    } catch {
      setError("Erreur réseau, veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  const signedDateStr = signedAt
    ? new Date(signedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px 60px" }}>

      <div style={{ marginBottom: 24 }}>
        <Link href="/participant/dashboard" style={{ fontSize: 13, color: "#6A6A6A", textDecoration: "none" }}>
          ← Retour au tableau de bord
        </Link>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Procès-verbal de formation</h1>
      <p style={{ color: "#6A6A6A", fontSize: 13, marginBottom: 24 }}>
        Signez le PV pour attester officiellement de votre participation.
      </p>

      {/* Formation info */}
      <div style={{ background: "#F9F7F4", border: "1px solid #E0E0E0", borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{data.formation.titre}</div>
        <div style={{ fontSize: 13, color: "#6A6A6A" }}>📅 {data.formation.date}</div>
        <div style={{ fontSize: 13, color: "#6A6A6A" }}>🎓 {data.formation.formateurNom}</div>
      </div>

      {!data.pvFormateurSigne && (
        <div style={{ background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: 10, padding: "12px 16px", marginBottom: 24, fontSize: 13 }}>
          ⏳ Le formateur n&apos;a pas encore signé le PV. Vous serez notifié(e) par email dès qu&apos;il sera disponible.
        </div>
      )}

      {signed ? (
        <div style={{ background: "#e8f5e9", border: "1.5px solid #c8e6c9", borderRadius: 12, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#2e7d32", marginBottom: 4 }}>PV co-signé</div>
          {signedDateStr && <div style={{ fontSize: 13, color: "#388e3c" }}>Signé le {signedDateStr}</div>}
          <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "center" }}>
            <a
              href={`/api/pdf/pv-formation/${data.formation.id}/participant/${data.emargementId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: "#0F0F0F", color: "white", borderRadius: 8, padding: "10px 20px", textDecoration: "none", fontSize: 13, fontWeight: 700 }}
            >
              📄 Télécharger mon PV signé
            </a>
          </div>
        </div>
      ) : data.pvFormateurSigne ? (
        <div>
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Votre signature</div>
          <canvas
            ref={canvasRef}
            width={520}
            height={140}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            style={{ border: "1.5px solid #E0E0E0", borderRadius: 10, width: "100%", background: "white", cursor: "crosshair", touchAction: "none", display: "block" }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 16 }}>
            <button onClick={clearCanvas} style={{ background: "none", border: "1px solid #E0E0E0", borderRadius: 7, padding: "6px 14px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              Effacer
            </button>
            <span style={{ fontSize: 12, color: "#6A6A6A", alignSelf: "center" }}>Dessinez votre signature ci-dessus</span>
          </div>

          {error && (
            <div style={{ background: "#fff5f6", border: "1.5px solid #ffc5cc", borderRadius: 8, padding: "10px 14px", marginBottom: 12, color: "#c62828", fontSize: 13 }}>
              {error}
            </div>
          )}

          <button
            onClick={doSign}
            disabled={loading}
            style={{ background: "#C8102E", color: "white", border: "none", borderRadius: 10, padding: "14px 24px", fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", width: "100%", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "⏳ Signature en cours…" : "✍️ Signer le PV"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
