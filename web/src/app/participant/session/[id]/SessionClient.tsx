"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import PdfPageCanvas from "@/components/PdfPageCanvas";

type Ressource = { id: string; nom: string; url: string | null; taille: number | null };
type Stroke = { color: string; width: number; points: [number, number][] };
type DrawingData = { page: number; strokes: Stroke[] };

interface Props {
  formationId: string;
  titre: string;
  specialite: string;
  heureDebut: string;
  heureFin: string;
  modaliteSession: string;
  hasSlides: boolean;
  initialPage: number;
  ressources: Ressource[];
  description: string;
  emargementToken?: string;
}

type Tab = "notes" | "ressources" | "questions";
type AiMessage = { role: "user" | "assistant"; content: string };

export default function SessionClient({
  formationId, titre, specialite, heureDebut, heureFin,
  modaliteSession, hasSlides, initialPage, ressources: initialRessources, emargementToken,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("notes");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [ressources, setRessources] = useState(initialRessources);
  const [drawingData, setDrawingData] = useState<DrawingData | null>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Auto-emargement on session join
  useEffect(() => {
    if (!emargementToken) return;
    fetch(`/api/emarger/${emargementToken}`, { method: "POST" }).catch(() => {});
  }, [emargementToken]);

  // Notes (localStorage)
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  useEffect(() => {
    setNotes(localStorage.getItem(`notes-session-${formationId}`) ?? "");
  }, [formationId]);
  function saveNotes(v: string) {
    setNotes(v);
    localStorage.setItem(`notes-session-${formationId}`, v);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 1500);
  }
  function exportNotes() {
    const blob = new Blob([notes], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes-${titre.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Questions
  const [questionText, setQuestionText] = useState("");
  const [questionSending, setQuestionSending] = useState(false);
  const [myQuestions, setMyQuestions] = useState<{ id: string; texte: string; createdAt: string }[]>([]);

  // AI panel
  const [aiOpen, setAiOpen] = useState(false);
  const [aiHistory, setAiHistory] = useState<AiMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiEndRef = useRef<HTMLDivElement>(null);
  const aiInputRef = useRef<HTMLInputElement>(null);

  // Latest drawing data ref so onPdfRender closure always has current value
  const drawingDataRef = useRef<DrawingData | null>(null);
  drawingDataRef.current = drawingData;

  function paintStrokes(canvas: HTMLCanvasElement, data: DrawingData | null, page: number) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!data || data.page !== page || !data.strokes?.length) return;
    for (const stroke of data.strokes) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width * (canvas.width / 1000);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(stroke.points[0][0] * canvas.width, stroke.points[0][1] * canvas.height);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i][0] * canvas.width, stroke.points[i][1] * canvas.height);
      }
      ctx.stroke();
    }
  }

  const onPdfRender = useCallback((pdfCanvas: HTMLCanvasElement) => {
    const drawCanvas = drawingCanvasRef.current;
    const container = pdfContainerRef.current;
    if (!drawCanvas || !container) return;
    const pdfRect = pdfCanvas.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    drawCanvas.width = pdfCanvas.width;
    drawCanvas.height = pdfCanvas.height;
    drawCanvas.style.width = `${pdfRect.width}px`;
    drawCanvas.style.height = `${pdfRect.height}px`;
    drawCanvas.style.left = `${pdfRect.left - containerRect.left}px`;
    drawCanvas.style.top = `${pdfRect.top - containerRect.top}px`;
    paintStrokes(drawCanvas, drawingDataRef.current, currentPage);
  }, [currentPage]);

  useEffect(() => {
    const canvas = drawingCanvasRef.current;
    if (canvas && canvas.width > 0) paintStrokes(canvas, drawingData, currentPage);
  }, [drawingData, currentPage]);

  // Polling for slide sync + session state (every 3s)
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/session/${formationId}/state`);
        if (!res.ok) return;
        const data = await res.json() as {
          sessionStatus: string;
          currentPage: number;
          hasSlides: boolean;
          drawingData: string | null;
          ressources: Ressource[];
        };
        if (data.sessionStatus === "TERMINEE") setSessionEnded(true);
        if (data.currentPage !== currentPage) setCurrentPage(data.currentPage);
        if (data.ressources) setRessources(data.ressources);
        if (data.drawingData !== undefined) {
          try {
            setDrawingData(data.drawingData ? JSON.parse(data.drawingData) as DrawingData : null);
          } catch { /* ignore */ }
        }
      } catch { /* ignore */ }
    };
    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [formationId, currentPage]);

  // Scroll AI to bottom
  useEffect(() => {
    aiEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiHistory]);

  // Focus input when panel opens
  useEffect(() => {
    if (aiOpen) setTimeout(() => aiInputRef.current?.focus(), 100);
  }, [aiOpen]);

  async function sendQuestion() {
    if (!questionText.trim()) return;
    setQuestionSending(true);
    try {
      const res = await fetch(`/api/participant/formations/${formationId}/question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texte: questionText.trim() }),
      });
      if (res.ok) {
        const q = await res.json() as { id: string; texte: string; createdAt: string };
        setMyQuestions((prev) => [...prev, q]);
        setQuestionText("");
      }
    } catch { /* ignore */ } finally {
      setQuestionSending(false);
    }
  }

  async function sendAiMessage() {
    if (!aiInput.trim() || aiLoading) return;
    const msg = aiInput.trim();
    setAiInput("");
    const newHistory: AiMessage[] = [...aiHistory, { role: "user", content: msg }];
    setAiHistory(newHistory);
    setAiLoading(true);
    try {
      const res = await fetch("/api/participant/ai-contextual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formationId, message: msg, history: aiHistory }),
      });
      const data = await res.json() as { reply?: string; error?: string; pubmedUsed?: boolean };
      const content = (data.pubmedUsed ? "🔬 *Résultats PubMed en temps réel*\n\n" : "") + (data.reply ?? data.error ?? "Erreur");
      setAiHistory([...newHistory, { role: "assistant", content }]);
    } catch {
      setAiHistory([...newHistory, { role: "assistant", content: "Erreur réseau." }]);
    } finally {
      setAiLoading(false);
    }
  }

  const showVideo = modaliteSession === "VIRTUEL" || modaliteSession === "MIXTE";
  const jitsiRoom = `masterclassmed-${formationId}`;

  if (sessionEnded) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa" }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Session terminée</div>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>Merci pour votre participation à <strong>{titre}</strong></div>
          <a href="/participant/dashboard" style={{ background: "#C8102E", color: "white", padding: "12px 28px", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>
            Retour au tableau de bord →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "white", display: "flex", flexDirection: "column" }}>
      {/* TOP BAR */}
      <div style={{ background: "#161b22", borderBottom: "1px solid #30363d", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3fb950", boxShadow: "0 0 6px #3fb950" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#f0f6fc" }}>{titre}</span>
          <span style={{ fontSize: 11, color: "#8b949e", background: "#21262d", padding: "2px 8px", borderRadius: 4 }}>{specialite}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 12, color: "#8b949e" }}>{heureDebut} – {heureFin}</div>
          {/* AI toggle button in topbar */}
          <button
            onClick={() => setAiOpen((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: aiOpen ? "rgba(110,64,201,0.25)" : "rgba(110,64,201,0.12)",
              color: "#a78bfa", border: `1px solid ${aiOpen ? "rgba(110,64,201,0.6)" : "rgba(110,64,201,0.25)"}`,
              borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            🤖 IA contextuelle
          </button>
        </div>
      </div>

      {/* MAIN AREA — flex row so AI panel sits beside slides */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* SLIDES + JITSI column */}
        <div style={{
          flex: 1, display: "grid", minWidth: 0,
          gridTemplateColumns: hasSlides && showVideo ? "1fr 360px" : "1fr",
          gridTemplateRows: "1fr",
        }}>
          {/* SLIDES */}
          {hasSlides && (
            <div ref={pdfContainerRef} style={{ position: "relative", background: "#0d1117", borderRight: showVideo ? "1px solid #30363d" : "none", overflow: "hidden" }}>
              <PdfPageCanvas
                pdfUrl={`/api/formateur/formations/${formationId}/slides`}
                page={currentPage}
                onRender={onPdfRender}
                style={{ width: "100%", height: "100%", minHeight: 480 }}
              />
              <canvas ref={drawingCanvasRef} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }} />
              <div style={{
                position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
                background: "rgba(0,0,0,0.75)", borderRadius: 20, padding: "4px 14px",
                fontSize: 12, color: "white", backdropFilter: "blur(4px)",
              }}>
                Page <strong>{currentPage}</strong> · sync automatique
              </div>
            </div>
          )}

          {/* No slides + no video placeholder */}
          {!hasSlides && !showVideo && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#8b949e", fontSize: 13 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
                <div>Aucun diaporama partagé par le formateur</div>
              </div>
            </div>
          )}

          {/* JITSI VIDEO */}
          {showVideo && (
            <div style={{ background: "#000", borderLeft: "1px solid #30363d" }}>
              <iframe
                src={`https://meet.jit.si/${jitsiRoom}`}
                allow="camera; microphone; fullscreen; display-capture"
                style={{ width: "100%", height: "100%", minHeight: 480, border: "none" }}
              />
            </div>
          )}
        </div>

        {/* AI CHAT PANEL — inline on large screens */}
        {aiOpen && (
          <div style={{
            width: 360, flexShrink: 0,
            background: "#161b22", borderLeft: "1px solid #30363d",
            display: "flex", flexDirection: "column",
            // On small screens: fixed overlay covering right side
          }}>
            {/* AI Panel header */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #30363d", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa" }}>🤖 IA contextuelle</div>
                <div style={{ fontSize: 10, color: "#3fb950", marginTop: 2 }}>🔬 Références PubMed en temps réel</div>
              </div>
              <button
                onClick={() => setAiOpen(false)}
                style={{ background: "none", border: "none", color: "#8b949e", fontSize: 18, cursor: "pointer", lineHeight: 1, padding: 4 }}
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
              {aiHistory.length === 0 && (
                <div style={{ color: "#8b949e", fontSize: 12, lineHeight: 1.6, marginTop: 8 }}>
                  Posez une question sur le contenu du cours — l&apos;IA répond en contexte et recherche les références sur PubMed (NIH) en temps réel.
                </div>
              )}
              {aiHistory.map((m, i) => (
                <div key={i} style={{
                  padding: "8px 11px", borderRadius: 10,
                  background: m.role === "user" ? "#1f3d5c" : "#21262d",
                  fontSize: 12, color: "#f0f6fc", whiteSpace: "pre-wrap", lineHeight: 1.55,
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "92%",
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 4, color: m.role === "user" ? "#58a6ff" : "#3fb950" }}>
                    {m.role === "user" ? "Vous" : "IA"}
                  </div>
                  {m.content}
                </div>
              ))}
              {aiLoading && (
                <div style={{ alignSelf: "flex-start", background: "#21262d", borderRadius: 10, padding: "8px 12px" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{
                        width: 6, height: 6, borderRadius: "50%", background: "#3fb950",
                        animation: "bounce 1.2s infinite",
                        animationDelay: `${i * 0.2}s`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={aiEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "10px 12px", borderTop: "1px solid #30363d", display: "flex", gap: 8, flexShrink: 0 }}>
              <input
                ref={aiInputRef}
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendAiMessage()}
                placeholder="Question sur le cours…"
                disabled={aiLoading}
                style={{
                  flex: 1, background: "#0d1117", color: "#f0f6fc", border: "1px solid #30363d",
                  borderRadius: 8, padding: "8px 11px", fontSize: 12, fontFamily: "inherit",
                  outline: "none", opacity: aiLoading ? 0.6 : 1,
                }}
              />
              <button
                onClick={sendAiMessage}
                disabled={aiLoading || !aiInput.trim()}
                style={{
                  background: "#6e40c9", color: "white", border: "none", borderRadius: 8,
                  padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  fontFamily: "inherit", opacity: aiLoading || !aiInput.trim() ? 0.4 : 1,
                }}
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM PANEL — Notes, Ressources, Questions only */}
      <div style={{ background: "#161b22", borderTop: "1px solid #30363d", minHeight: 220, flexShrink: 0 }}>
        <div style={{ display: "flex", borderBottom: "1px solid #30363d" }}>
          {([ ["notes", "📝 Notes"], ["ressources", "📎 Ressources"], ["questions", "❓ Questions"] ] as [Tab, string][]).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 18px", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                background: "transparent", border: "none", borderBottom: `2px solid ${activeTab === tab ? "#58a6ff" : "transparent"}`,
                color: activeTab === tab ? "#58a6ff" : "#8b949e", cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding: "14px 20px", maxHeight: 220, overflowY: "auto" }}>

          {/* NOTES */}
          {activeTab === "notes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: notesSaved ? "#3fb950" : "#8b949e" }}>
                  {notesSaved ? "✓ Sauvegardé" : "Sauvegarde automatique"}
                </span>
                <button
                  onClick={exportNotes}
                  disabled={!notes.trim()}
                  style={{
                    background: "transparent", color: notes.trim() ? "#58a6ff" : "#484f58",
                    border: `1px solid ${notes.trim() ? "#58a6ff" : "#30363d"}`, borderRadius: 6,
                    padding: "3px 10px", fontSize: 11, fontWeight: 600,
                    cursor: notes.trim() ? "pointer" : "default", fontFamily: "inherit",
                  }}
                >
                  ↓ Exporter .txt
                </button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => saveNotes(e.target.value)}
                placeholder="Prenez vos notes ici — sauvegardées automatiquement dans ce navigateur…"
                style={{
                  width: "100%", minHeight: 145, background: "#0d1117", color: "#f0f6fc",
                  border: "1px solid #30363d", borderRadius: 8, padding: 12,
                  fontSize: 13, fontFamily: "inherit", resize: "none", outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
          )}

          {/* RESSOURCES */}
          {activeTab === "ressources" && (
            <div>
              {ressources.length === 0 && (
                <div style={{ color: "#8b949e", fontSize: 13, padding: "20px 0" }}>Aucune ressource partagée par le formateur pour l&apos;instant.</div>
              )}
              {ressources.map((r) => (
                <a
                  key={r.id}
                  href={r.url ?? `/api/session/${formationId}/resources?id=${r.id}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                    background: "#21262d", borderRadius: 8, marginBottom: 6,
                    textDecoration: "none", color: "#f0f6fc",
                  }}
                >
                  <span style={{ fontSize: 16 }}>📄</span>
                  <span style={{ flex: 1, fontSize: 13 }}>{r.nom}</span>
                  {r.taille && <span style={{ fontSize: 11, color: "#8b949e" }}>{Math.round(r.taille / 1024)} Ko</span>}
                  <span style={{ fontSize: 11, color: "#58a6ff" }}>↓</span>
                </a>
              ))}
            </div>
          )}

          {/* QUESTIONS */}
          {activeTab === "questions" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendQuestion()}
                  placeholder="Posez une question au formateur…"
                  style={{
                    flex: 1, background: "#0d1117", color: "#f0f6fc", border: "1px solid #30363d",
                    borderRadius: 8, padding: "8px 12px", fontSize: 13, fontFamily: "inherit", outline: "none",
                  }}
                />
                <button
                  onClick={sendQuestion}
                  disabled={questionSending || !questionText.trim()}
                  style={{
                    background: "#238636", color: "white", border: "none", borderRadius: 8,
                    padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    opacity: questionSending || !questionText.trim() ? 0.5 : 1,
                  }}
                >
                  Envoyer
                </button>
              </div>
              {myQuestions.length === 0 && (
                <div style={{ color: "#8b949e", fontSize: 12 }}>Vos questions envoyées apparaîtront ici.</div>
              )}
              {myQuestions.map((q) => (
                <div key={q.id} style={{ background: "#21262d", borderRadius: 8, padding: "8px 12px", marginBottom: 6, fontSize: 13, color: "#f0f6fc" }}>
                  <span style={{ fontSize: 10, color: "#8b949e", marginRight: 8 }}>
                    {new Date(q.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {q.texte}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
