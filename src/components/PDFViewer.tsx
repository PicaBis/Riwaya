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
  Speaker,
  VolumeX,
} from "lucide-react";
import clsx from "clsx";
import { Paywall } from "./Paywall";

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  /** Page after which the paywall activates (chapter 3 gate) */
  freeUntilPage?: number;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  preview?: string;
  novelId?: string;
}

type RenderStatus = "idle" | "loading" | "rendering" | "ready" | "error";

export function PDFViewer({ pdfUrl, title, freeUntilPage = 20, initialPage = 1, onPageChange, preview, novelId }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [pdf, setPdf] = useState<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const defaultScale = typeof window !== "undefined" && window.innerWidth < 768 ? 3.0 : 1.2;
  const [scale, setScale] = useState(defaultScale);
  const [status, setStatus] = useState<RenderStatus>("idle");
  const [pageInput, setPageInput] = useState(String(initialPage));
  const renderTaskRef = useRef<import("pdfjs-dist").RenderTask | null>(null);
  const [playing, setPlaying] = useState(false);
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);

  // YouTube medieval music for shajarat-sina
  useEffect(() => {
    if (novelId !== "shajarat-sina" || typeof window === "undefined") return;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    const onReady = () => {
      if (!ytContainerRef.current) return;
      const YT = (window as any).YT;
      if (!YT) return;
      ytPlayerRef.current = new YT.Player(ytContainerRef.current, {
        videoId: "MOXc6WW-Ess",
        playerVars: {
          autoplay: 0,
          loop: 1,
          playlist: "MOXc6WW-Ess",
          controls: 0,
          showinfo: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onStateChange: (e: any) => {
            if (e.data === YT.PlayerState.ENDED) {
              ytPlayerRef.current?.playVideo();
            }
          },
        },
      });
    };

    const existing = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      existing?.();
      onReady();
    };

    return () => {
      ytPlayerRef.current?.destroy();
      ytPlayerRef.current = null;
    };
  }, [novelId]);

  const toggleMusic = () => {
    if (!ytPlayerRef.current) return;
    const player = ytPlayerRef.current;
    const YT = (window as any).YT;
    const state = player.getPlayerState();
    if (YT && state === YT.PlayerState.PLAYING) {
      player.pauseVideo();
      setPlaying(false);
    } else {
      player.playVideo();
      setPlaying(true);
    }
  };

  useEffect(() => {
    onPageChange?.(currentPage);
  }, [currentPage, onPageChange]);

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

  const zoomIn = () => setScale((s) => Math.min(s + 0.2, defaultScale >= 3 ? 4.5 : 3.0));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, defaultScale >= 3 ? 2.0 : 0.8));
  const resetZoom = () => setScale(defaultScale);

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

    const onCanvasCtx = (e: MouseEvent) => e.preventDefault();
    const onCanvasDrag = (e: DragEvent) => e.preventDefault();

    useEffect(() => {
      const c = canvasRef.current;
      if (!c) return;
      c.addEventListener("contextmenu", onCanvasCtx);
      c.addEventListener("dragstart", onCanvasDrag);
      return () => {
        c.removeEventListener("contextmenu", onCanvasCtx);
        c.removeEventListener("dragstart", onCanvasDrag);
      };
    }, [pdf]);

  /* ── Keyboard shortcuts ───────────────────────────── */
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (isLocked) return;
      if (e.key === "ArrowLeft" || e.key === "PageDown") goTo(currentPage + 1);
      if (e.key === "ArrowRight" || e.key === "PageUp") goTo(currentPage - 1);
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "0") resetZoom();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [currentPage, totalPages, isLocked]);

  /* ── Pinch-to-zoom (mobile) ───────────────────────── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === "undefined") return;
    let lastDist = 0;

    const getDistance = (t1: Touch, t2: Touch) => {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.hypot(dx, dy);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) lastDist = getDistance(e.touches[0], e.touches[1]);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const newDist = getDistance(e.touches[0], e.touches[1]);
        const delta = newDist - lastDist;
        if (Math.abs(delta) > 5) {
          setScale((s) => Math.min(Math.max(s + delta * 0.005, 1.2), 4.0));
          lastDist = newDist;
        }
      }
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full bg-parchment-100 dark:bg-onyx-950 select-none"
    >
      {/* ── Toolbar ──────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-onyx-900 border-b border-parchment-200 dark:border-white/8 flex-shrink-0">
        {/* Left: zoom controls */}
        <div className="flex items-center gap-0.5">
          <ToolBtn onClick={zoomOut} title="تصغير (-)">
            <ZoomOut className="w-4 h-4" />
          </ToolBtn>
          <button
            onClick={resetZoom}
            className="px-2 py-1 text-[11px] font-mono text-gray-600 dark:text-gray-400 hover:bg-parchment-100 dark:hover:bg-white/10 rounded-md transition-colors min-w-[48px] text-center font-bold"
            title="إعادة الضبط"
          >
            {Math.round(scale * 100)}%
          </button>
          <ToolBtn onClick={zoomIn} title="تكبير (+">
            <ZoomIn className="w-4 h-4" />
          </ToolBtn>
          <ToolBtn onClick={resetZoom} title="الحجم الافتراضي">
            <RotateCcw className="w-3.5 h-3.5" />
          </ToolBtn>
        </div>

        {/* Center: page navigation */}
        <div className="flex items-center gap-1.5" dir="rtl">
          <ToolBtn
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage <= 1}
            title="الصفحة السابقة"
          >
            <ChevronRight className="w-4 h-4" />
          </ToolBtn>
          <div className="flex items-center gap-1 text-xs font-sans text-gray-600 dark:text-gray-400">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={handlePageInputKey}
              onBlur={() => goTo(Number(pageInput))}
              className="w-10 text-center px-1 py-0.5 rounded border border-parchment-300 dark:border-white/15 bg-parchment-50 dark:bg-white/5 text-gray-800 dark:text-gray-200 text-[11px] focus:outline-none focus:ring-1 focus:ring-gold-500/50"
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

        {/* Right: fullscreen + music */}
        <div className="flex items-center gap-0.5">
          {novelId === "shajarat-sina" && (
            <ToolBtn onClick={() => setPlaying((p) => !p)} title={playing ? "إيقاف الموسيقى" : "تشغيل الموسيقى"}>
              {playing ? <VolumeX className="w-4 h-4 text-gold-500" /> : <Speaker className="w-4 h-4" />}
            </ToolBtn>
          )}
          <ToolBtn onClick={toggleFullscreen} title="ملء الشاشة" className="bg-parchment-100 dark:bg-white/10 rounded-lg">
            <Maximize2 className="w-4 h-4" />
          </ToolBtn>
        </div>
      </div>

      {/* ── Canvas area ──────────────────────────────── */}
      <div
        className="flex-1 overflow-auto flex items-start justify-center p-4 sm:p-8 relative"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="relative select-none" draggable={false}>
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
              status === "ready" ? "opacity-100" : "opacity-0",
              "pdf-canvas"
            )}
            style={{ maxWidth: "100%" }}
          />
        </div>

        {/* ── Paywall overlay ───────────────────────── */}
        {isLocked && (
          <Paywall onUnlock={() => setIsUnlocked(true)} price={500} title={title} preview={preview} />
        )}
      </div>

      {/* ── Bottom nav bar (mobile) ───────────────────── */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-white dark:bg-onyx-900 border-t border-parchment-200 dark:border-white/8 flex-shrink-0 sm:hidden gap-2">
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 text-xs font-arabic text-gray-600 dark:text-gray-400 disabled:opacity-30 active:scale-95 transition-transform px-2 py-1.5 rounded-lg hover:bg-parchment-100 dark:hover:bg-white/10"
        >
          <ChevronRight className="w-4 h-4" />
          السابقة
        </button>
        <span className="text-xs font-sans text-gray-400 font-bold min-w-[70px] text-center">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage >= totalPages || isLocked}
          className="flex items-center gap-1 text-xs font-arabic text-gray-600 dark:text-gray-400 disabled:opacity-30 active:scale-95 transition-transform px-2 py-1.5 rounded-lg hover:bg-parchment-100 dark:hover:bg-white/10"
        >
          التالية
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* YouTube hidden player (shajarat-sina only) */}
      {novelId === "shajarat-sina" && (
        <div ref={ytContainerRef} className="hidden" />
      )}
    </div>
  );
}

/* ── Utility button ──────────────────────────────────── */
function ToolBtn({
  children,
  onClick,
  disabled,
  title,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={clsx(
        "w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-parchment-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition-all duration-150",
        className
      )}
    >
      {children}
    </button>
  );
}
