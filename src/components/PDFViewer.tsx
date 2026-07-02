"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, BookOpen, Speaker, VolumeX, List, ChevronLeft, ChevronRight, BookMarked, Sun, Moon } from "lucide-react";
import clsx from "clsx";
import { Paywall } from "./Paywall";

export interface Chapter {
  title: string;
  startPage: number;
}

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  freeUntilPage?: number;
  initialPage?: number;
  onPageChange?: (page: number, total?: number) => void;
  preview?: string;
  novelId?: string;
  chapters?: Chapter[];
}

type RenderStatus = "idle" | "loading" | "ready" | "error";

export function PDFViewer({ pdfUrl, title, freeUntilPage = 20, initialPage = 1, onPageChange, preview, novelId, chapters }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [pdf, setPdf] = useState<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [displayScale, setDisplayScale] = useState(0.75);
  const [status, setStatus] = useState<RenderStatus>("idle");
  const [retryKey, setRetryKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [musicReady, setMusicReady] = useState(false);
  const [musicError, setMusicError] = useState(false);
  const ytIframeRef = useRef<HTMLIFrameElement | null>(null);
  const ytReadyRef = useRef(false);
  const ytPlayerReadyRef = useRef(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [centerContent, setCenterContent] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const pageRenderRef = useRef(0);
  const [currentChapter, setCurrentChapter] = useState<string>("");
  const [isZooming, setIsZooming] = useState(false);
  const zoomTimerRef = useRef<number | null>(null);
  const [readingMode, setReadingMode] = useState<"light" | "sepia" | "dark">("light");

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("riwayati_reading_mode");
        if (saved === "light" || saved === "sepia" || saved === "dark") setReadingMode(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") localStorage.setItem("riwayati_reading_mode", readingMode);
    } catch {}
  }, [readingMode]);

  const readingBg = readingMode === "light" ? "#ffffff" : readingMode === "sepia" ? "#f4ecd8" : "#1e1e1e";
  const readingText = readingMode === "dark" ? "#e5e5e5" : "#1a1a1a";
  const readingMuted = readingMode === "dark" ? "#a3a3a3" : "#6b7280";
  const readingWrapperBg = readingMode === "light" ? "bg-white" : readingMode === "sepia" ? "bg-[#f4ecd8]" : "bg-[#1e1e1e]";
  const renderScale = useMemo(() => Math.max(displayScale, 1.0), [displayScale]);

  /* ── YouTube music ──────────────────────────────────── */
  useEffect(() => {
    if (novelId !== "shajarat-sina" || typeof window === "undefined") return;
    setMusicReady(false);
    setMusicError(false);
    ytPlayerReadyRef.current = false;

    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/mm0QSsRwzUo?enablejsapi=1&autoplay=0&controls=0&loop=1&playlist=mm0QSsRwzUo&origin=${encodeURIComponent(window.location.origin)}`;
    iframe.allow = "autoplay";
    iframe.style.cssText = "position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;";
    iframe.setAttribute("allow", "autoplay; encrypted-media");
    document.body.appendChild(iframe);
    ytIframeRef.current = iframe;

    let messageTimer: number | null = null;
    let cleanupIframe = false;

    const msgHandler = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (!data || typeof data !== "object") return;

        if (data.event === "onReady") {
          ytReadyRef.current = true;
          setMusicReady(true);
        }

        if (data.event === "onStateChange" && data.info === 0) {
          if (!cleanupIframe) {
            iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "playVideo" }), "*");
          }
        }
      } catch {}
    };

    const readyTimer = window.setTimeout(() => {
      if (!ytReadyRef.current) {
        setMusicReady(true);
      }
    }, 4000);

    window.addEventListener("message", msgHandler);
    iframe.addEventListener("load", () => {
      window.setTimeout(() => {
        if (!ytReadyRef.current) setMusicReady(true);
      }, 3000);
    });

    return () => {
      window.removeEventListener("message", msgHandler);
      cleanupIframe = true;
      if (messageTimer) window.clearTimeout(messageTimer);
      if (readyTimer) window.clearTimeout(readyTimer);
      iframe.remove();
      ytIframeRef.current = null;
      ytReadyRef.current = false;
      ytPlayerReadyRef.current = false;
      setMusicReady(false);
      setPlaying(false);
    };
  }, [novelId]);

  const toggleMusic = useCallback(() => {
    const iframe = ytIframeRef.current;
    if (!iframe?.contentWindow) return;
    try {
      if (playing) {
        iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: "pauseVideo" }), "*");
        setPlaying(false);
      } else {
        iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: "playVideo" }), "*");
        setPlaying(true);
      }
    } catch {
      setMusicError(true);
    }
  }, [playing]);

  /* ── Paywall ────────────────────────────────────────── */
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        sessionStorage.getItem("riwayati_unlocked") === "1" ||
        localStorage.getItem("riwayati_unlocked") === "1"
      );
    }
    return false;
  });
  const isLocked = !isUnlocked && currentPage > freeUntilPage;

  /* ── Load PDF ───────────────────────────────────────── */
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
        setStatus("ready");
      } catch { if (!cancelled) setStatus("error"); }
    })();
    return () => { cancelled = true; };
  }, [pdfUrl, retryKey]);

  /* ── Measure scroll container ───────────────────────── */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── Render current page ────────────────────────────── */
  useEffect(() => {
    if (!pdf || !canvasRef.current || status !== "ready" || totalPages === 0) return;
    const renderId = ++pageRenderRef.current;
    let cancelled = false;

    const render = async () => {
      const canvas = canvasRef.current!;
      try {
        const page = await pdf.getPage(currentPage);
        if (cancelled || renderId !== pageRenderRef.current) return;

        const nativeViewport = page.getViewport({ scale: 1.0 });
        const targetPixelWidth = containerWidth > 0 ? containerWidth * displayScale : 0;
        const neededScale = targetPixelWidth > 0 ? targetPixelWidth / nativeViewport.width : Math.max(displayScale, 1.0);
        const optimalScale = Math.max(neededScale, 1.0);
        const viewport = page.getViewport({ scale: optimalScale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        canvas.style.backgroundColor = readingBg;

        if (cancelled || renderId !== pageRenderRef.current) return;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;
        await page.render({ canvasContext: ctx, viewport }).promise;

        if (!cancelled && renderId === pageRenderRef.current) {
          setPageSize({ width: viewport.width, height: viewport.height });
          onPageChange?.(currentPage, totalPages);
        }
      } catch (e) {
        if (!cancelled && renderId === pageRenderRef.current) {
          console.error(e);
        }
      }
    };

    render();
    return () => { cancelled = true; };
  }, [pdf, currentPage, status, totalPages, containerWidth, displayScale, onPageChange]);

  /* ── Navigation ─────────────────────────────────────── */
  const goToPrev = useCallback(() => {
    setCurrentPage((p) => {
      const next = Math.max(1, p - 1);
      if (next !== p && navigator.vibrate) navigator.vibrate(10);
      return next;
    });
  }, []);

  const goToNext = useCallback(() => {
    setCurrentPage((p) => {
      const next = Math.min(totalPages, p + 1);
      if (next !== p && navigator.vibrate) navigator.vibrate(10);
      return next;
    });
  }, [totalPages]);

  useEffect(() => {
    if (!chapters || chapters.length === 0) {
      setCurrentChapter("");
      return;
    }
    let current = "";
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (currentPage >= chapters[i].startPage) {
        current = chapters[i].title;
        break;
      }
    }
    setCurrentChapter(current);
  }, [currentPage, chapters]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goToPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goToPrev, goToNext]);

  /* ── Zoom ───────────────────────────────────────────── */
  const zoomIn = () => {
    setIsZooming(true);
    if (zoomTimerRef.current) window.clearTimeout(zoomTimerRef.current);
    zoomTimerRef.current = window.setTimeout(() => setIsZooming(false), 300);
    window.requestAnimationFrame(() => setDisplayScale((s) => Math.min(s + 0.1, 2.5)));
  };
  const zoomOut = () => {
    setIsZooming(true);
    if (zoomTimerRef.current) window.clearTimeout(zoomTimerRef.current);
    zoomTimerRef.current = window.setTimeout(() => setIsZooming(false), 300);
    window.requestAnimationFrame(() => setDisplayScale((s) => Math.max(s - 0.1, 0.3)));
  };
  const resetZoom = () => {
    setIsZooming(true);
    if (zoomTimerRef.current) window.clearTimeout(zoomTimerRef.current);
    zoomTimerRef.current = window.setTimeout(() => setIsZooming(false), 300);
    window.requestAnimationFrame(() => setDisplayScale(0.75));
  };

  /* ── Fullscreen ─────────────────────────────────────── */
  const toggleFullscreen = useCallback(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    if (isMobile || !document.fullscreenEnabled) { setIsFullscreen((p) => !p); return; }
    if (document.fullscreenElement === containerRef.current) document.exitFullscreen().catch(() => setIsFullscreen(false));
    else if (!document.fullscreenElement || document.fullscreenElement === document.documentElement) containerRef.current?.requestFullscreen().catch(() => setIsFullscreen((p) => !p));
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  /* ── Pinch-to-zoom ──────────────────────────────────── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let lastDist = 0;
    let raf = 0;
    const getDist = (t1: Touch, t2: Touch) => Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    const onTouchS = (e: TouchEvent) => { if (e.touches.length === 2) lastDist = getDist(e.touches[0], e.touches[1]); };
    const onTouchM = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const d = getDist(e.touches[0], e.touches[1]);
        const delta = d - lastDist;
        if (Math.abs(delta) > 1) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            setDisplayScale((s) => Math.min(Math.max(s + delta * 0.006, 0.3), 2.5));
          });
          lastDist = d;
        }
      }
    };
    el.addEventListener("touchstart", onTouchS, { passive: true });
    el.addEventListener("touchmove", onTouchM, { passive: true });
    return () => { el.removeEventListener("touchstart", onTouchS); el.removeEventListener("touchmove", onTouchM); cancelAnimationFrame(raf); };
  }, []);

  /* ── Mouse wheel zoom ───────────────────────────────── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let raf = 0;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          setDisplayScale((s) => Math.min(Math.max(s + (e.deltaY < 0 ? 0.08 : -0.08), 0.3), 2.5));
        });
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  /* ── Vertical center when content shorter than viewport ── */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || totalPages === 0) return;
    const check = () => setCenterContent(el.scrollHeight <= el.clientHeight);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [totalPages, pageSize, containerWidth, displayScale]);

  const pageWrapperWidth = containerWidth > 0 ? `${containerWidth * displayScale}px` : `${displayScale * 100}%`;

  const handleRetry = useCallback(() => {
    setPdf(null);
    setStatus("idle");
    setTotalPages(0);
    setRetryKey((k) => k + 1);
  }, []);

  return (
    <div
      ref={containerRef}
      className={clsx(
        "flex flex-col bg-parchment-100 dark:bg-onyx-950 select-none transition-all duration-300 isolate",
        isFullscreen ? "fixed inset-0 z-[9999] h-[100dvh] w-screen overflow-hidden pdf-fullscreen-active" : "h-full"
      )}
    >
      {/* Toolbar */}
      <div className="relative z-20 flex items-center justify-between gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-onyx-900 border-b border-parchment-200 dark:border-white/8 flex-shrink-0 overflow-hidden">
        <div className="hidden sm:flex items-center gap-0.5">
          <ToolBtn onClick={goToPrev} disabled={currentPage <= 1} title="الصفحة السابقة"><ChevronRight className="w-4 h-4" /></ToolBtn>
          <ToolBtn onClick={zoomOut} title="تصغير"><ZoomOut className="w-4 h-4" /></ToolBtn>
          <span onClick={resetZoom} className="px-1.5 py-1 text-[11px] font-mono text-gray-600 dark:text-gray-400 cursor-pointer min-w-[42px] text-center font-bold">{Math.round(displayScale * 100)}%</span>
          <ToolBtn onClick={zoomIn} title="تكبير"><ZoomIn className="w-4 h-4" /></ToolBtn>
          <ToolBtn onClick={resetZoom} title="الحجم الافتراضي"><RotateCcw className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn onClick={goToNext} disabled={currentPage >= totalPages || totalPages === 0} title="الصفحة التالية"><ChevronLeft className="w-4 h-4" /></ToolBtn>
        </div>
        <div className="flex sm:hidden items-center gap-0.5">
          <ToolBtn onClick={goToPrev} disabled={currentPage <= 1} title="السابق"><ChevronRight className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn onClick={zoomOut} title="تصغير"><ZoomOut className="w-3.5 h-3.5" /></ToolBtn>
          <span className="text-[10px] font-mono text-gray-400 font-bold min-w-[32px] text-center">{Math.round(displayScale * 100)}%</span>
          <ToolBtn onClick={zoomIn} title="تكبير"><ZoomIn className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn onClick={goToNext} disabled={currentPage >= totalPages || totalPages === 0} title="التالي"><ChevronLeft className="w-3.5 h-3.5" /></ToolBtn>
        </div>
        <span className="text-xs font-sans text-gray-400 font-bold">{currentPage} / {totalPages}</span>
        <div className="flex items-center gap-0.5">
          {chapters && chapters.length > 0 && (
            <ToolBtn onClick={() => setTocOpen((v) => !v)} title="جدول الفصول"><List className="w-4 h-4" /></ToolBtn>
          )}
          {novelId === "shajarat-sina" && (
            <ToolBtn
              onClick={toggleMusic}
              disabled={!musicReady || musicError}
              title={
                musicError
                  ? "تعذّر تحميل الموسيقى"
                  : playing
                    ? "إيقاف الموسيقى"
                    : "تشغيل الموسيقى"
              }
              className={clsx(
                musicError && "opacity-40 cursor-not-allowed",
                playing && "text-gold-500"
              )}
            >
              {musicError ? <VolumeX className="w-4 h-4" /> : playing ? <VolumeX className="w-4 h-4 text-gold-500" /> : <Speaker className="w-4 h-4" />}
            </ToolBtn>
          )}
          <ToolBtn onClick={toggleFullscreen} title={isFullscreen ? "الخروج من ملء الشاشة" : "ملء الشاشة"} className="bg-gold-500/10 dark:bg-white/10 rounded-lg hover:bg-gold-500/20 dark:hover:bg-white/20">
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-gold-500" /> : <Maximize2 className="w-4 h-4 text-gold-500" />}
          </ToolBtn>
          <ToolBtn
            onClick={() => setReadingMode((m) => (m === "light" ? "sepia" : m === "sepia" ? "dark" : "light"))}
            title={readingMode === "light" ? "الوضع النهاري" : readingMode === "sepia" ? "وضع الكرائية" : "الوضع الليلي"}
            className="rounded-lg hover:bg-parchment-200 dark:hover:bg-white/10"
          >
            {readingMode === "light" ? <Sun className="w-4 h-4 text-amber-500" /> : readingMode === "sepia" ? <BookOpen className="w-4 h-4 text-amber-700" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </ToolBtn>
        </div>
      </div>

      {/* TOC Dropdown */}
      {tocOpen && chapters && chapters.length > 0 && (
        <div className="absolute top-11 right-0 z-50 w-64 bg-white dark:bg-onyx-800 rounded-b-2xl shadow-xl border border-parchment-200 dark:border-white/8 max-h-[60vh] overflow-y-auto animate-fade-in" dir="rtl">
          <div className="p-3 border-b border-parchment-200 dark:border-white/8"><h3 className="font-arabic text-sm font-bold text-gray-900 dark:text-gray-100">جدول الفصول</h3></div>
          {chapters.map((ch, i) => {
            const isChapterLocked = ch.startPage > freeUntilPage;
            const isCurrent = currentPage >= ch.startPage && (i === chapters.length - 1 || currentPage < chapters[i + 1].startPage);
            return (
              <button key={i} onClick={() => {
                setTocOpen(false);
                setCurrentPage(ch.startPage);
              }} disabled={isChapterLocked && !isUnlocked}
                className={`w-full flex items-center gap-3 px-4 py-3 text-right border-b border-parchment-100 dark:border-white/5 last:border-0 hover:bg-parchment-100 dark:hover:bg-white/5 ${isCurrent ? "bg-gold-500/5 border-r-2 border-r-gold-500" : ""}`}>
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${isCurrent ? "bg-gold-500 text-white" : "bg-parchment-100 dark:bg-white/10 text-gray-500"}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-arabic truncate ${isCurrent ? "text-gold-600 dark:text-gold-400 font-bold" : "text-gray-700 dark:text-gray-300"}`}>{ch.title}</p>
                  <p className="text-[10px] text-gray-400 font-sans">صفحة {ch.startPage}</p>
                </div>
                {isChapterLocked && !isUnlocked && <span className="text-[10px] text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full font-arabic flex-shrink-0">🔒</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Progress Bar + Chapter Label */}
      {totalPages > 0 && (
        <div className="h-auto flex-shrink-0">
          {currentChapter && (
            <div className="px-3 sm:px-6 pt-1.5 pb-0.5 flex items-center gap-1.5">
              <BookMarked className="w-3 h-3 text-gold-500 flex-shrink-0" />
              <span className="text-[11px] sm:text-xs text-gold-600 dark:text-gold-400 font-arabic font-semibold truncate">
                {currentChapter}
              </span>
            </div>
          )}
          <div className="h-0.5 bg-parchment-200 dark:bg-white/5 cursor-pointer group" onClick={(e) => {
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              const target = Math.max(1, Math.min(totalPages, Math.round(ratio * totalPages)));
              setCurrentPage(target);
              if (navigator.vibrate) navigator.vibrate(8);
            }}>
            <div className="h-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-300 relative" style={{ width: `${Math.round((currentPage / totalPages) * 100)}%` }}>
              <span className="absolute right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow" />
            </div>
          </div>
        </div>
      )}

      {/* Vertical Scroll Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto overscroll-contain relative"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          className={clsx(
            "flex flex-col items-center",
            centerContent && "justify-center min-h-full",
            "py-4 sm:py-8"
          )}
          style={{ gap: "1rem", width: pageWrapperWidth, contain: "strict", position: "relative" }}
        >
          {status === "error" && (
            <div className="flex flex-col items-center justify-center gap-4 text-gray-400">
              <BookOpen className="w-16 h-16 text-gold-500/30" />
              <p className="font-arabic text-center">تعذّر تحميل الملف. الرجاء التحقق من الاتصال.</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 rounded-xl bg-gold-500 text-white text-sm font-arabic hover:bg-gold-600 transition-colors active:scale-95"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {status === "loading" && (
            <div className="flex flex-col items-center justify-center gap-4 text-gray-400 py-20">
              <div className="w-10 h-10 rounded-full border-2 border-gold-500/20 border-t-gold-500 animate-spin" />
              <p className="font-arabic text-sm text-gray-500 dark:text-gray-400">جاري تحميل الرواية…</p>
            </div>
          )}

          {status === "ready" && totalPages > 0 && (
            <div
              className={clsx("relative flex-shrink-0 mx-auto overflow-hidden flex items-center justify-center transition-all duration-200", readingWrapperBg)}
              style={{
                width: containerWidth > 0 ? `${containerWidth * displayScale}px` : `${displayScale * 100}%`,
                minHeight: containerWidth > 0 && pageSize.width > 0
                  ? `${(containerWidth * pageSize.height / pageSize.width) * displayScale}px`
                  : undefined,
              }}
            >
              <canvas
                ref={canvasRef}
                className="rounded-sm shadow-lg"
                style={{
                  width: "100%",
                  height: "auto",
                  backgroundColor: readingBg,
                }}
              />
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-parchment-50/90 dark:bg-onyx-950/95 backdrop-blur-sm z-20">
                  <Paywall onUnlock={() => setIsUnlocked(true)} price={500} title={title} preview={preview} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToolBtn({ children, onClick, disabled, title, className }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; title?: string; className?: string }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className={clsx("w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-parchment-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition-all duration-150", className)}>
      {children}
    </button>
  );
}
