"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  BookOpen,
} from "lucide-react";
import clsx from "clsx";
import { Paywall } from "./Paywall";

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  /** Page after which the paywall activates (chapter 3 gate) */
  freeUntilPage?: number;
}

type RenderStatus = "idle" | "loading" | "rendering" | "ready" | "error";

export function PDFViewer({ pdfUrl, title, freeUntilPage = 20 }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [pdf, setPdf] = useState<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [status, setStatus] = useState<RenderStatus>("idle");
  const [pageInput, setPageInput] = useState("1");
  const renderTaskRef = useRef<import("pdfjs-dist").RenderTask | null>(null);

  /* ── Paywall state ────────────────────────────────── */
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("riwayati_unlocked") === "1";
    }
    return false;
  });
  const isLocked = !isUnlocked && currentPage > freeUntilPage;

  /* ── Load PDF ─────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const loadedPdf = await pdfjsLib.getDocument(pdfUrl).promise;
        if (cancelled) return;

        setPdf(loadedPdf);
        setTotalPages(loadedPdf.numPages);
        setStatus("idle");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => { cancelled = true; };
  }, [pdfUrl]);

  /* ── Render Page ──────────────────────────────────── */
  const renderPage = useCallback(
    async (pageNum: number, targetScale: number) => {
      if (!pdf || !canvasRef.current) return;

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      setStatus("rendering");
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: targetScale });
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const task = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = task;
        await task.promise;
        setStatus("ready");
      } catch (err: unknown) {
        if ((err as { name?: string })?.name !== "RenderingCancelledException") {
          setStatus("error");
        }
      }
    },
    [pdf]
  );

  useEffect(() => {
    if (pdf) renderPage(currentPage, scale);
  }, [pdf, currentPage, scale, renderPage]);

  /* ── Navigation ───────────────────────────────────── */
  const goTo = (page: number) => {
    const p = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(p);
    setPageInput(String(p));
  };

  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 3.0));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));
  const resetZoom = () => setScale(1.2);

  const handlePageInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") goTo(Number(pageInput));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  /* ── Keyboard shortcuts ───────────────────────────── */
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (isLocked) return; // No keyboard nav when locked
      if (e.key === "ArrowLeft" || e.key === "PageDown") goTo(currentPage + 1);
      if (e.key === "ArrowRight" || e.key === "PageUp") goTo(currentPage - 1);
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "0") resetZoom();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [currentPage, totalPages, isLocked]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full bg-parchment-100 dark:bg-onyx-950 select-none"
    >
      {/* ── Toolbar ──────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-white dark:bg-onyx-900 border-b border-parchment-200 dark:border-white/8 flex-shrink-0">
        {/* Left: zoom controls */}
        <div className="flex items-center gap-1">
          <ToolBtn onClick={zoomOut} title="تصغير (-)">
            <ZoomOut className="w-4 h-4" />
          </ToolBtn>
          <button
            onClick={resetZoom}
            className="px-2.5 py-1 text-xs font-mono text-gray-600 dark:text-gray-400 hover:bg-parchment-100 dark:hover:bg-white/10 rounded-md transition-colors min-w-[52px] text-center"
            title="إعادة الضبط"
          >
            {Math.round(scale * 100)}%
          </button>
          <ToolBtn onClick={zoomIn} title="تكبير (+)">
            <ZoomIn className="w-4 h-4" />
          </ToolBtn>
          <ToolBtn onClick={resetZoom} title="الحجم الافتراضي (0)">
            <RotateCcw className="w-4 h-4" />
          </ToolBtn>
        </div>

        {/* Center: title + page navigation */}
        <div className="flex items-center gap-3 flex-1 justify-center" dir="rtl">
          <span className="hidden sm:block font-arabic text-sm text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
            {title}
          </span>
          <div className="flex items-center gap-1.5">
            <ToolBtn
              onClick={() => goTo(currentPage - 1)}
              disabled={currentPage <= 1}
              title="الصفحة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
            </ToolBtn>
            <div className="flex items-center gap-1 text-sm font-sans text-gray-600 dark:text-gray-400">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onKeyDown={handlePageInputKey}
                onBlur={() => goTo(Number(pageInput))}
                className="w-12 text-center px-1 py-0.5 rounded border border-parchment-300 dark:border-white/15 bg-parchment-50 dark:bg-white/5 text-gray-800 dark:text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-gold-500/50"
              />
              <span className="text-gray-400">/</span>
              <span>{totalPages}</span>
            </div>
            <ToolBtn
              onClick={() => goTo(currentPage + 1)}
              disabled={currentPage >= totalPages || isLocked}
              title="الصفحة التالية"
            >
              <ChevronLeft className="w-4 h-4" />
            </ToolBtn>
          </div>
        </div>

        {/* Right: fullscreen */}
        <ToolBtn onClick={toggleFullscreen} title="ملء الشاشة">
          <Maximize2 className="w-4 h-4" />
        </ToolBtn>
      </div>

      {/* ── Canvas area ──────────────────────────────── */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-4 sm:p-8 relative">
        <div className="relative">
          {/* Loading / rendering overlay */}
          {(status === "loading" || status === "rendering") && (
            <div
              className={clsx(
                "flex flex-col items-center justify-center gap-3 text-gray-400",
                status === "loading"
                  ? "min-h-[60vh] min-w-[300px]"
                  : "absolute inset-0 bg-parchment-50/60 dark:bg-onyx-900/60 rounded-sm z-10"
              )}
            >
              <div className="w-10 h-10 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
              <span className="text-sm font-arabic">
                {status === "loading" ? "جارٍ تحميل الرواية…" : "جارٍ تهيئة الصفحة…"}
              </span>
            </div>
          )}

          {/* Error state */}
          {status === "error" && (
            <div className="flex flex-col items-center justify-center gap-4 min-h-[60vh] min-w-[300px] text-gray-400">
              <BookOpen className="w-16 h-16 text-gold-500/30" />
              <p className="font-arabic text-center">
                تعذّر تحميل الملف. الرجاء التحقق من الاتصال.
              </p>
            </div>
          )}

          {/* PDF Canvas */}
          <canvas
            ref={canvasRef}
            className={clsx(
              "rounded-sm shadow-2xl transition-opacity duration-300",
              status === "ready" ? "opacity-100" : "opacity-0"
            )}
            style={{ maxWidth: "100%" }}
          />
        </div>

        {/* ── Paywall overlay ───────────────────────── */}
        {isLocked && (
          <Paywall onUnlock={() => setIsUnlocked(true)} price={500} />
        )}
      </div>

      {/* ── Bottom nav bar (mobile) ───────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-onyx-900 border-t border-parchment-200 dark:border-white/8 flex-shrink-0 sm:hidden">
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 text-sm font-arabic text-gray-600 dark:text-gray-400 disabled:opacity-30 active:scale-95 transition-transform"
        >
          <ChevronRight className="w-4 h-4" />
          السابقة
        </button>
        <span className="text-xs font-sans text-gray-400">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage >= totalPages || isLocked}
          className="flex items-center gap-1 text-sm font-arabic text-gray-600 dark:text-gray-400 disabled:opacity-30 active:scale-95 transition-transform"
        >
          التالية
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Utility button ──────────────────────────────────── */
function ToolBtn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-parchment-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition-all duration-150"
    >
      {children}
    </button>
  );
}
