"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen } from "lucide-react";

interface PDFCoverProps {
  pdfUrl: string;
  title: string;
  className?: string;
}

export function PDFCover({ pdfUrl, title, className = "" }: PDFCoverProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const page = await pdf.getPage(1);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Fit within the card at 2× for retina
        const desiredWidth = canvas.parentElement?.clientWidth || 240;
        const scale = (desiredWidth / page.getViewport({ scale: 1 }).width) * 2;
        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        await page.render({ canvasContext: ctx, viewport }).promise;
        if (!cancelled) setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  return (
    <div className={`relative overflow-hidden bg-parchment-100 dark:bg-onyx-900 ${className}`}>
      {/* Canvas (PDF first page) */}
      <canvas
        ref={canvasRef}
        className={`object-cover w-full h-full transition-opacity duration-500 ${
          status === "ready" ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Skeleton loader */}
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
          <span className="text-xs text-gray-400 dark:text-gray-600 font-sans">
            جارٍ التحميل…
          </span>
        </div>
      )}

      {/* Error fallback */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
          <BookOpen className="w-10 h-10 text-gold-500/50" />
          <span className="text-xs text-center text-gray-400 dark:text-gray-500 font-arabic leading-relaxed">
            {title}
          </span>
        </div>
      )}

      {/* Spine effect */}
      <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
    </div>
  );
}
