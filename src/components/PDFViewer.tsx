"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, BookOpen, Speaker, VolumeX, List, Layout, ChevronLeft, ChevronRight } from "lucide-react";
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

  const [pdf, setPdf] = useState<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const defaultScale = 4.0;
  const [displayScale, setDisplayScale] = useState(1.0);
  const [status, setStatus] = useState<RenderStatus>("idle");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const ytIframeRef = useRef<HTMLIFrameElement | null>(null);
  const ytReadyRef = useRef(false);
  const [tocOpen, setTocOpen] = useState(false);
  const renderedPages = useRef<Set<number>>(new Set());
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const pageHeights = useRef<Map<number, number>>(new Map());
  const touchStartX = useRef(0);
  const [centerContent, setCenterContent] = useState(false);
  const [horizontalPage, setHorizontalPage] = useState(false);

  // YouTube music
  useEffect(() => {
    if (novelId !== "shajarat-sina" || typeof window === "undefined") return;
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = `https://www.youtube.com/embed/mm0QSsRwzUo?enablejsapi=1&autoplay=0&controls=0&loop=1&playlist=mm0QSsRwzUo&origin=${encodeURIComponent(window.location.origin)}`;
    iframe.allow = "autoplay";
    document.body.appendChild(iframe);
    ytIframeRef.current = iframe;

    const msgHandler = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.event === "onReady") ytReadyRef.current = true;
        if (data.event === "onStateChange" && data.info === 0) {
          iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "playVideo" }), "*");
        }
      } catch {}
    };
    window.addEventListener("message", msgHandler);
    return () => {
      window.removeEventListener("message", msgHandler);
      iframe.remove();
      ytIframeRef.current = null;
      ytReadyRef.current = false;
    };
  }, [novelId]);

  const toggleMusic = () => {
    const iframe = ytIframeRef.current;
    if (!iframe?.contentWindow) return;
    if (playing) {
      iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: "pauseVideo" }), "*");
      setPlaying(false);
    } else {
      iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: "playVideo" }), "*");
      setPlaying(true);
    }
  };

  /* ── Paywall ──────────────────────────────────────── */
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

  /* ── Load PDF ──────────────────────────────────────── */
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
  }, [pdfUrl]);

  /* ── Render individual page ────────────────────────── */
  const renderPageToCanvas = useCallback(async (pageNum: number, canvas: HTMLCanvasElement) => {
    if (!pdf) return;
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: defaultScale });
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = "100%";
    canvas.style.height = "auto";
    canvas.style.backgroundColor = "#ffffff";
    await page.render({ canvasContext: ctx, viewport }).promise;
    const naturalH = viewport.height / viewport.width;
    pageHeights.current.set(pageNum, naturalH);
    renderedPages.current.add(pageNum);

    try {
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item: any) => item.str).join(" ");
      canvas.setAttribute("data-text", text);
    } catch {}
  }, [pdf]);

  /* ── Scroll-based page detection ───────────────────── */
  const updateCurrentFromScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container || totalPages === 0) return;
    const scrollTop = container.scrollTop;
    const children = container.querySelectorAll("[data-page]");
    let closest = 1;
    let closestDist = Infinity;
    children.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const dist = Math.abs(rect.top - containerRect.top);
      if (dist < closestDist) { closestDist = dist; closest = parseInt(el.getAttribute("data-page")!); }
    });
    if (closest !== currentPage) {
      setCurrentPage(closest);
      onPageChange?.(closest, totalPages);
    }
  }, [totalPages, currentPage, onPageChange]);

  /* ── Intersection observer for lazy render ──────────── */
  useEffect(() => {
    if (!scrollRef.current || !pdf) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const pageNum = parseInt(entry.target.getAttribute("data-page")!);
        if (entry.isIntersecting && !renderedPages.current.has(pageNum)) {
          const canvas = entry.target.querySelector("canvas");
          if (canvas) renderPageToCanvas(pageNum, canvas);
        }
      });
    }, { root: scrollRef.current, rootMargin: "200% 0px" });

    const containers = scrollRef.current.querySelectorAll("[data-page]");
    containers.forEach((c) => observer.observe(c));

    return () => observer.disconnect();
  }, [pdf, renderPageToCanvas]);

  /* ── Scroll to initial page ─────────────────────────── */
  useEffect(() => {
    if (status !== "ready" || totalPages === 0) return;
    const el = scrollRef.current?.querySelector(`[data-page="${initialPage}"]`);
    if (el) el.scrollIntoView({ block: "start" });
  }, [status, totalPages, initialPage]);

  /* ── Zoom ──────────────────────────────────────────── */
  const zoomIn = () => setDisplayScale((s) => Math.min(s + 0.2, 3.0));
  const zoomOut = () => setDisplayScale((s) => Math.max(s - 0.2, 0.5));
  const resetZoom = () => setDisplayScale(1.0);

  /* ── Fullscreen ────────────────────────────────────── */
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

  /* ── Pinch-to-zoom ─────────────────────────────────── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let lastDist = 0;
    const getDist = (t1: Touch, t2: Touch) => Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    const onTouchS = (e: TouchEvent) => { if (e.touches.length === 2) lastDist = getDist(e.touches[0], e.touches[1]); };
    const onTouchM = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const d = getDist(e.touches[0], e.touches[1]);
        const delta = d - lastDist;
        if (Math.abs(delta) > 3) {
          setDisplayScale((s) => Math.min(Math.max(s + delta * 0.008, 0.5), 3.0));
          lastDist = d;
        }
      }
    };
    el.addEventListener("touchstart", onTouchS, { passive: true });
    el.addEventListener("touchmove", onTouchM, { passive: true });
    return () => { el.removeEventListener("touchstart", onTouchS); el.removeEventListener("touchmove", onTouchM); };
  }, []);

  /* ── Mouse wheel zoom ──────────────────────────────── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setDisplayScale((s) => Math.min(Math.max(s + (e.deltaY < 0 ? 0.1 : -0.1), 0.5), 3.0));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  /* ── Vertical center when content is shorter than viewport ── */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || totalPages === 0) return;
    const check = () => setCenterContent(el.scrollHeight <= el.clientHeight);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => { ro.disconnect(); };
  }, [totalPages]);

  /* ── Horizontal page navigation ────────────────────── */
  const goNext = useCallback(() => {
    if (currentPage < totalPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      onPageChange?.(next, totalPages);
    }
  }, [currentPage, totalPages, onPageChange]);

  const goPrev = useCallback(() => {
    if (currentPage > 1) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      onPageChange?.(prev, totalPages);
    }
  }, [currentPage, onPageChange]);

  /* ── Keyboard navigation in horizontal mode ────────── */
  useEffect(() => {
    if (!horizontalPage) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); goNext(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); goPrev(); }
      else if (e.key === " ") { e.preventDefault(); goNext(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [horizontalPage, goNext, goPrev]);

  /* ── Touch swipe for horizontal mode ───────────────── */
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  return (
    <div
      ref={containerRef}
      className={clsx(
        "flex flex-col bg-parchment-100 dark:bg-onyx-950 select-none transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-[9999] h-[100dvh] w-screen overflow-hidden pdf-fullscreen-active" : "h-full"
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-onyx-900 border-b border-parchment-200 dark:border-white/8 flex-shrink-0 overflow-hidden">
        <div className="hidden sm:flex items-center gap-0.5">
          <ToolBtn onClick={zoomOut} title="تصغير"><ZoomOut className="w-4 h-4" /></ToolBtn>
          <span onClick={resetZoom} className="px-1.5 py-1 text-[11px] font-mono text-gray-600 dark:text-gray-400 cursor-pointer min-w-[42px] text-center font-bold">{Math.round(displayScale * 100)}%</span>
          <ToolBtn onClick={zoomIn} title="تكبير"><ZoomIn className="w-4 h-4" /></ToolBtn>
          <ToolBtn onClick={resetZoom} title="الحجم الافتراضي"><RotateCcw className="w-3.5 h-3.5" /></ToolBtn>
        </div>
        <div className="flex sm:hidden items-center gap-0.5">
          <ToolBtn onClick={zoomOut} title="تصغير"><ZoomOut className="w-3.5 h-3.5" /></ToolBtn>
          <span className="text-[10px] font-mono text-gray-400 font-bold min-w-[32px] text-center">{Math.round(displayScale * 100)}%</span>
          <ToolBtn onClick={zoomIn} title="تكبير"><ZoomIn className="w-3.5 h-3.5" /></ToolBtn>
        </div>
        <span className="text-xs font-sans text-gray-400 font-bold">{currentPage} / {totalPages}</span>
        <div className="flex items-center gap-0.5">
          {chapters && chapters.length > 0 && (
            <ToolBtn onClick={() => setTocOpen((v) => !v)} title="جدول الفصول"><List className="w-4 h-4" /></ToolBtn>
          )}
          {novelId === "shajarat-sina" && (
            <ToolBtn onClick={toggleMusic} title={playing ? "إيقاف الموسيقى" : "تشغيل الموسيقى"}>
              {playing ? <VolumeX className="w-4 h-4 text-gold-500" /> : <Speaker className="w-4 h-4" />}
            </ToolBtn>
          )}
          <ToolBtn onClick={() => setHorizontalPage(p => !p)} title={horizontalPage ? "عرض التمرير" : "قلب الصفحات"}>
            <Layout className={clsx("w-4 h-4", horizontalPage && "text-gold-500")} />
          </ToolBtn>
          <ToolBtn onClick={toggleFullscreen} title={isFullscreen ? "الخروج من ملء الشاشة" : "ملء الشاشة"} className="bg-gold-500/10 dark:bg-white/10 rounded-lg hover:bg-gold-500/20 dark:hover:bg-white/20">
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-gold-500" /> : <Maximize2 className="w-4 h-4 text-gold-500" />}
          </ToolBtn>
        </div>
      </div>

      {/* TOC Dropdown */}
      {tocOpen && chapters && chapters.length > 0 && (
        <div className="absolute top-11 right-0 z-50 w-64 bg-white dark:bg-onyx-800 rounded-b-2xl shadow-xl border border-parchment-200 dark:border-white/8 max-h-[60vh] overflow-y-auto animate-fade-in" dir="rtl">
          <div className="p-3 border-b border-parchment-200 dark:border-white/8"><h3 className="font-arabic text-sm font-bold text-gray-900 dark:text-gray-100">جدول الفصول</h3></div>
          {chapters.map((ch, i) => {
            const isLocked = ch.startPage > freeUntilPage;
            const isCurrent = currentPage >= ch.startPage && (i === chapters.length - 1 || currentPage < chapters[i + 1].startPage);
            return (
              <button key={i} onClick={() => {
                setTocOpen(false);
                if (horizontalPage) {
                  setCurrentPage(ch.startPage);
                  onPageChange?.(ch.startPage, totalPages);
                } else {
                  const el = scrollRef.current?.querySelector(`[data-page="${ch.startPage}"]`);
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }} disabled={isLocked && !isUnlocked}
                className={`w-full flex items-center gap-3 px-4 py-3 text-right border-b border-parchment-100 dark:border-white/5 last:border-0 hover:bg-parchment-100 dark:hover:bg-white/5 ${isCurrent ? "bg-gold-500/5 border-r-2 border-r-gold-500" : ""}`}>
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${isCurrent ? "bg-gold-500 text-white" : "bg-parchment-100 dark:bg-white/10 text-gray-500"}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-arabic truncate ${isCurrent ? "text-gold-600 dark:text-gold-400 font-bold" : "text-gray-700 dark:text-gray-300"}`}>{ch.title}</p>
                  <p className="text-[10px] text-gray-400 font-sans">صفحة {ch.startPage}</p>
                </div>
                {isLocked && !isUnlocked && <span className="text-[10px] text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full font-arabic flex-shrink-0">🔒</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Progress Bar */}
      {totalPages > 0 && (
        <div className="h-0.5 bg-parchment-200 dark:bg-white/5 flex-shrink-0">
          <div className="h-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-300" style={{ width: `${Math.round((currentPage / totalPages) * 100)}%` }} />
        </div>
      )}

      {/* Reading Area */}
      {horizontalPage ? (
        /* Horizontal page-flip mode */
        <div className="flex-1 flex items-center justify-center relative overflow-hidden select-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Previous page button */}
          {currentPage > 1 && (
            <button onClick={goPrev}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/80 dark:bg-onyx-800/80 hover:bg-white dark:hover:bg-onyx-800 shadow-lg text-gray-600 dark:text-gray-300 transition-all active:scale-90"
              title="الصفحة السابقة"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
          {/* Current page */}
          <div className="flex items-center justify-center w-full h-full p-1 sm:p-4">
            <canvas
              ref={(el) => {
                if (el) { canvasRefs.current.set(currentPage, el); if (!renderedPages.current.has(currentPage)) renderPageToCanvas(currentPage, el); }
                else { canvasRefs.current.delete(currentPage); renderedPages.current.delete(currentPage); }
              }}
              className="rounded-sm shadow-lg"
              style={{ maxWidth: "100%", maxHeight: "100%", width: "auto", height: "100%", objectFit: "contain", backgroundColor: "#fff" }}
            />
          </div>
          {/* Next page button */}
          {currentPage < totalPages && (
            <button onClick={goNext}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/80 dark:bg-onyx-800/80 hover:bg-white dark:hover:bg-onyx-800 shadow-lg text-gray-600 dark:text-gray-300 transition-all active:scale-90"
              title="الصفحة التالية"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
          {/* Page indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-black/50 text-white text-xs font-sans">
            {currentPage} / {totalPages}
          </div>
          {/* Paywall for locked pages */}
          {isLocked && currentPage > freeUntilPage && (
            <div className="absolute inset-0 flex items-center justify-center bg-parchment-50/90 dark:bg-onyx-950/95 backdrop-blur-sm z-20">
              <Paywall onUnlock={() => setIsUnlocked(true)} price={500} title={title} preview={preview} />
            </div>
          )}
        </div>
      ) : (
        /* Scroll Mode */
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden"
          onScroll={updateCurrentFromScroll}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div
            className={clsx(
              "flex flex-col items-center w-full",
              centerContent && "justify-center min-h-full",
              "py-4 sm:py-8"
            )}
            style={{ gap: "1rem" }}
          >
            {status === "error" && (
              <div className="flex flex-col items-center justify-center gap-4 text-gray-400">
                <BookOpen className="w-16 h-16 text-gold-500/30" />
                <p className="font-arabic text-center">تعذّر تحميل الملف. الرجاء التحقق من الاتصال.</p>
              </div>
            )}

            {status === "ready" && totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <div
                key={pageNum}
                data-page={pageNum}
                className="relative w-full flex justify-center"
                style={{ maxWidth: `${displayScale * 100}%` }}
              >
                <canvas
                  ref={(el) => {
                    if (el) { canvasRefs.current.set(pageNum, el); if (!renderedPages.current.has(pageNum)) renderPageToCanvas(pageNum, el); }
                    else { canvasRefs.current.delete(pageNum); renderedPages.current.delete(pageNum); }
                  }}
                  className="rounded-sm shadow-lg"
                  style={{ maxWidth: "100%", height: "auto", backgroundColor: "#fff" }}
                />
                {/* Paywall for locked pages */}
                {isLocked && pageNum > freeUntilPage && pageNum === currentPage + 1 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-parchment-50/90 dark:bg-onyx-950/95 backdrop-blur-sm z-20">
                    <Paywall onUnlock={() => setIsUnlocked(true)} price={500} title={title} preview={preview} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
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