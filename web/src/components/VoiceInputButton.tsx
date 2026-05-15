"use client";

import { useState, useRef } from "react";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: { [k: number]: { [k: number]: { transcript: string } }; length: number } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export default function VoiceInputButton({ onTranscript, disabled }: VoiceInputButtonProps) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [supported] = useState(() => getSpeechRecognition() !== null);

  if (!supported) {
    return (
      <span
        title="La dictée vocale n'est pas disponible sur ce navigateur. Compatible avec Chrome, Edge et Safari (14.1+). Non disponible sur Firefox."
        style={{
          fontSize: 11,
          color: "#aaa",
          border: "1px solid #E0E0E0",
          borderRadius: 7,
          padding: "5px 10px",
          cursor: "not-allowed",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          userSelect: "none",
        }}
      >
        🎤 <span>Non dispo</span>
      </span>
    );
  }

  const toggle = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const Ctor = getSpeechRecognition();
    if (!Ctor) return;

    const rec = new Ctor();
    rec.lang = "fr-FR";
    rec.continuous = true;
    rec.interimResults = false;

    rec.onresult = (e) => {
      const parts: string[] = [];
      for (let i = 0; i < e.results.length; i++) {
        parts.push(e.results[i][0].transcript);
      }
      onTranscript(parts.join(" "));
    };

    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      title={listening ? "Cliquez pour arrêter la dictée" : "Dicter (Chrome, Edge, Safari 14.1+)"}
      style={{
        background: listening ? "#fff0f2" : "var(--off-white, #F9F7F4)",
        color: listening ? "#C8102E" : "#6A6A6A",
        border: `1px solid ${listening ? "#C8102E" : "#E0E0E0"}`,
        borderRadius: 7,
        padding: "5px 10px",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        transition: "all 0.15s",
      }}
    >
      {listening ? "⏹ Arrêter" : "🎤 Dicter"}
    </button>
  );
}
