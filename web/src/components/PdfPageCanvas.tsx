"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  pdfUrl: string;
  page: number;
  className?: string;
  style?: React.CSSProperties;
  onPageCount?: (total: number) => void;
  onRender?: (canvas: HTMLCanvasElement) => void;
}

export default function PdfPageCanvas({ pdfUrl, page, className, style, onPageCount, onRender }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const response = await fetch(pdfUrl);
        if (!response.ok) throw new Error("PDF introuvable");
        const arrayBuffer = await response.arrayBuffer();
        if (cancelled) return;

        const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        if (cancelled) return;

        pdfDocRef.current = doc;
        onPageCount?.(doc.numPages);
        renderPage(page);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erreur chargement PDF");
      }
    }

    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUrl]);

  useEffect(() => {
    if (pdfDocRef.current) renderPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function renderPage(pageNum: number) {
    const doc = pdfDocRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!doc || !canvas || !container) return;

    renderTaskRef.current?.cancel();

    doc.getPage(pageNum).then((pdfPage: { getViewport: (o: object) => { width: number; height: number }; render: (o: object) => { promise: Promise<void>; cancel: () => void } }) => {
      const containerWidth = container.clientWidth || 800;
      const containerHeight = container.clientHeight || 600;
      const viewport = pdfPage.getViewport({ scale: 1 });
      const scale = Math.min(containerWidth / viewport.width, containerHeight / viewport.height);
      const scaledViewport = pdfPage.getViewport({ scale });

      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const task = pdfPage.render({ canvasContext: ctx, viewport: scaledViewport });
      renderTaskRef.current = task;
      task.promise
        .then(() => { onRender?.(canvas); })
        .catch(() => {});
    }).catch(() => {});
  }

  if (error) {
    return (
      <div ref={containerRef} className={className} style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#8b949e", fontSize: 13, ...style }}>
        {error}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className} style={{ display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", ...style }}>
      <canvas ref={canvasRef} style={{ maxWidth: "100%", maxHeight: "100%", display: "block" }} />
    </div>
  );
}
