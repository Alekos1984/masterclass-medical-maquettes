"use client";

import { useState, useEffect, useRef } from "react";

type Ressource = { id: string; nom: string; url: string | null; taille: number | null };

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
}

type Tab = "notes" | "ressources" | "questions" | "ia";

type AiMessage = { role: "user" | "assistant"; content: string };

export default function SessionClient({
  formationId, titre, specialite, heureDebut, heureFin,
  modaliteSession, hasSlides, initialPage, ressources: initialRessources, description,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("notes");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [ressources, setRessources] = useState(initialRessources);

  // Notes (localStorage)
  const [notes, setNotes] = useState("");
  useEffect(() => {
    setNotes(localStorage.getItem(`notes-session-${formationId}`) ?? "");
  }, [formationId]);
  function saveNotes(v: string) {
    setNotes(v);
    localStorage.setItem(`notes-session-${formationId}`, v);
  }

  // Questions
  const [questionText, setQuestionText] = useState("");
  const [questionSending, setQuestionSending] = useState(false);
  const [myQuestions, setMyQuestions] = useState<{ id: string; texte: string; createdAt: string }[]>([]);

  // AI
  const [aiHistory, setAiHistory] = useState<AiMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiEndRef = useRef<HTMLDivElement>(null);

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
          ressources: Ressource[];
        };
        if (data.sessionStatus === "TERMINEE") setSessionEnded(true);
        if (data.currentPage !== currentPage) setCurrentPage(data.currentPage);
        if (data.ressources) setRessources(data.ressources);
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
      const data = await res.json() as { reply?: string; error?: string };
      setAiHistory([...newHistory, {
        role: "assistant",
        content: data.reply ?? data.error ?? "Erreur",
      }]);
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
      <div style={{ background: "#161b22", borderBottom: "1px solid #30363d", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3fb950", boxShadow: "0 0 6px #3fb950" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#f0f6fc" }}>{titre}</span>
          <span style={{ fontSize: 11, color: "#8b949e", background: "#21262d", padding: "2px 8px", borderRadius: 4 }}>{specialite}</span>
        </div>
        <div style={{ fontSize: 12, color: "#8b949e" }}>{heureDebut} – {heureFin}</div>
      </div>

      {/* MAIN AREA */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: hasSlides && showVideo ? "1fr 380px" : hasSlides || showVideo ? "1fr 380px" : "1fr", gridTemplateRows: "1fr auto", gap: 0 }}>
        {/* SLIDES */}
        {hasSlides && (
          <div style={{ position: "relative", background: "#0d1117", borderRight: showVideo ? "1px solid #30363d" : "none" }}>
            <iframe
              key={currentPage}
              src={`/api/formateur/formations/${formationId}/slides#page=${currentPage}`}
              style={{ width: "100%", height: "100%", minHeight: 480, border: "none" }}
            />
            <div style={{
              position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.75)", borderRadius: 20, padding: "4px 14px",
              fontSize: 12, color: "white", backdropFilter: "blur(4px)",
            }}>
              Page <strong>{currentPage}</strong> (sync automatique avec le formateur)
            </div>
          </div>
        )}

        {/* No slides placeholder */}
        {!hasSlides && !showVideo && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#8b949e", fontSize: 13 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
              <div>Aucun diaporama partagé par le formateur</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>Utilisez les outils ci-dessous</div>
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

      {/* BOTTOM PANEL */}
      <div style={{ background: "#161b22", borderTop: "1px solid #30363d", minHeight: 220 }}>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #30363d" }}>
          {([ ["notes", "📝 Notes"], ["ressources", "📎 Ressources"], ["questions", "❓ Questions"], ["ia", "🤖 IA contextuelle"] ] as [Tab, string][]).map(([tab, label]) => (
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

        {/* Panel content */}
        <div style={{ padding: "14px 20px", maxHeight: 220, overflowY: "auto" }}>

          {/* NOTES */}
          {activeTab === "notes" && (
            <textarea
              value={notes}
              onChange={(e) => saveNotes(e.target.value)}
              placeholder="Prenez vos notes ici — elles sont sauvegardées localement sur votre appareil…"
              style={{
                width: "100%", minHeight: 160, background: "#0d1117", color: "#f0f6fc",
                border: "1px solid #30363d", borderRadius: 8, padding: 12,
                fontSize: 13, fontFamily: "inherit", resize: "none", outline: "none", boxSizing: "border-box",
              }}
            />
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

          {/* IA CONTEXTUELLE */}
          {activeTab === "ia" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ flex: 1, maxHeight: 130, overflowY: "auto" }}>
                {aiHistory.length === 0 && (
                  <div style={{ color: "#8b949e", fontSize: 12, marginBottom: 8 }}>
                    Posez une question en lien avec le cours. L&apos;IA répond uniquement sur les sujets de cette formation.
                    <br /><span style={{ color: "#f0a853" }}>⚠️ Les références citées sont à vérifier sur PubMed.</span>
                  </div>
                )}
                {aiHistory.map((m, i) => (
                  <div key={i} style={{
                    marginBottom: 8, padding: "6px 10px", borderRadius: 8,
                    background: m.role === "user" ? "#1f3d5c" : "#21262d",
                    fontSize: 12, color: "#f0f6fc", whiteSpace: "pre-wrap",
                  }}>
                    <span style={{ color: m.role === "user" ? "#58a6ff" : "#3fb950", fontWeight: 700, marginRight: 6 }}>
                      {m.role === "user" ? "Vous" : "IA"}
                    </span>
                    {m.content}
                  </div>
                ))}
                {aiLoading && (
                  <div style={{ fontSize: 12, color: "#8b949e" }}>…</div>
                )}
                <div ref={aiEndRef} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendAiMessage()}
                  placeholder="Question sur le contenu du cours…"
                  style={{
                    flex: 1, background: "#0d1117", color: "#f0f6fc", border: "1px solid #30363d",
                    borderRadius: 8, padding: "8px 12px", fontSize: 13, fontFamily: "inherit", outline: "none",
                  }}
                />
                <button
                  onClick={sendAiMessage}
                  disabled={aiLoading || !aiInput.trim()}
                  style={{
                    background: "#6e40c9", color: "white", border: "none", borderRadius: 8,
                    padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    opacity: aiLoading || !aiInput.trim() ? 0.5 : 1,
                  }}
                >
                  {aiLoading ? "…" : "→"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
