"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { resolveProtectedPdfSource } from "@/lib/asset-client";

interface PDFCoverProps {
  pdfUrl: string;
  /** Novel id — used to request a short-lived asset token for the protected file. */
  novelId?: string;
  title: string;
  className?: string;
}

export function PDFCover({ pdfUrl, novelId, title, className = "" }: PDFCoverProps) {
  const { lang } = useApp();
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "blank">("loading");

  useEffect(() => {
    let cancelled = false;

    const isCanvasBlank = (canvas: HTMLCanvasElement): boolean => {
      try {
        const ctx = canvas.getContext("2d");
        if (!ctx) return true;
        const imageData = ctx.getImageData(0, 0, canvas.width || 1, canvas.height || 1);
        const data = imageData.data;
        let whitePixels = 0;
        const total = data.length / 4;
        const sampleStep = Math.max(1, Math.floor(total / 200));
        let sampled = 0;
        for (let i = 0; i < data.length; i += 4 * sampleStep) {
          sampled++;
          if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) whitePixels++;
        }
        return sampled > 0 && whitePixels / sampled > 0.92;
      } catch {
        return false;
      }
    };

    const render = async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

        const source = novelId
          ? await resolveProtectedPdfSource(novelId, pdfUrl)
          : { url: pdfUrl };
        if (cancelled) return;
        const loadingTask = pdfjsLib.getDocument({
          url: source.url,
          httpHeaders: source.httpHeaders,
          withCredentials: true,
        });
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const page = await pdf.getPage(1);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

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
        if (cancelled) return;

        if (isCanvasBlank(canvas)) {
          if (!cancelled) setStatus("blank");
        } else {
          if (!cancelled) setStatus("ready");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[PDFCover] failed to render cover:", err);
          setStatus("error");
        }
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [pdfUrl, novelId]);

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
          <span className={`text-xs text-gray-400 dark:text-gray-600 font-sans ${fontClass}`}>
            {t("pdfcover.loading", lang)}
          </span>
        </div>
      )}

      {/* Blank / error fallback — styled cover with title */}
      {(status === "error" || status === "blank") && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-onyx-800 to-gold-700 flex flex-col items-center justify-center gap-2 p-4">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
          <div className="absolute inset-0 opacity-30" style={{
            width: "200%", left: "-100%",
            background: "linear-gradient(115deg, transparent 30%, rgba(255,240,200,0.4) 50%, transparent 70%)",
            backgroundSize: "200% 100%", animation: "shimmer 4s linear infinite",
          }} />
          <BookOpen className="w-8 h-8 text-amber-200/80 relative z-10 drop-shadow-lg" />
          <span className={`text-xs text-center text-amber-50/90 leading-relaxed relative z-10 font-arabic font-medium line-clamp-3 ${fontClass}`}>
            {title}
          </span>
        </div>
      )}

      {/* Spine effect */}
      <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
    </div>
  );
}
