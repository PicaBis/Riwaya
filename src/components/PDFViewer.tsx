"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, List, ChevronLeft, ChevronRight, BookMarked, BookOpen } from "lucide-react";
import clsx from "clsx";
import { Paywall } from "./Paywall";
import { Achievements } from "./Achievements";
import { ShareButtons } from "./ShareButtons";
import { ReadingTimer } from "./ReadingTimer";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { resolveProtectedPdfSource } from "@/lib/asset-client";

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
  readingTheme?: "light" | "dark" | "sepia";
  /** Controlled subscription modal visibility. */
  showSubscription?: boolean;
  onSubscriptionClose?: () => void;
}

type RenderStatus = "idle" | "loading" | "ready" | "error";

export function PDFViewer({ pdfUrl, title, freeUntilPage = 20, initialPage = 1, onPageChange, preview, novelId, chapters, readingTheme = "light", showSubscription, onSubscriptionClose }: PDFViewerProps) {
  const { lang, unlocked, devUnlocked, unlock } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [pdf, setPdf] = useState<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [displayScale, setDisplayScale] = useState(typeof window !== "undefined" && window.innerWidth < 768 ? 1.0 : 0.75);
  const [status, setStatus] = useState<RenderStatus>("idle");
  const [retryKey, setRetryKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const watermarkRef = useRef<HTMLDivElement | null>(null);
  const [tocOpen, setTocOpen] = useState(false);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [containerWidth, setContainerWidth] = useState(0);
  const pageRenderRef = useRef(0);
  const [currentChapter, setCurrentChapter] = useState<string>("");
  const [visualScale, setVisualScale] = useState(1);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ── "Hand tool": instant grab-to-pan ──────────────────────
   * Mouse: click-and-hold in fullscreen → cursor turns into a
   * grabbing hand → drag moves the viewport (scrollLeft/scrollTop).
   * Touch: long-press (300ms) → grab-to-pan takes over from native scroll.
   * Two-finger pinch-zoom continues to work independently. */
  const [panMode, setPanMode] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; sl: number; st: number } | null>(null);
  const swipeRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const startPan = useCallback((x: number, y: number) => {
    const el = scrollRef.current;
    if (!el) return;
    panStartRef.current = { x, y, sl: el.scrollLeft, st: el.scrollTop };
    setPanMode(true);
  }, []);

  const doPan = useCallback((x: number, y: number) => {
    const el = scrollRef.current;
    const start = panStartRef.current;
    if (!el || !start) return;
    el.scrollLeft = start.sl - (x - start.x);
    el.scrollTop = start.st - (y - start.y);
  }, []);

  const endPan = useCallback(() => {
    panStartRef.current = null;
    setPanMode(false);
  }, []);

  const onMouseDownPan = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("input")) return;
    startPan(e.clientX, e.clientY);
  }, [startPan]);

  const onMouseMovePan = useCallback((e: React.MouseEvent) => {
    if (!panMode) return;
    doPan(e.clientX, e.clientY);
  }, [panMode, doPan]);

  const endMousePan = useCallback(() => {
    if (panMode) endPan();
  }, [panMode, endPan]);

  const onTouchStartRef = useRef<{ x: number; y: number; timer?: ReturnType<typeof setTimeout> } | null>(null);

  const onTouchStartPan = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    onTouchStartRef.current = { x: t.clientX, y: t.clientY };
    const timer = setTimeout(() => {
      onTouchStartRef.current = null;
      startPan(t.clientX, t.clientY);
    }, 300);
    onTouchStartRef.current.timer = timer;
  }, [startPan]);

  const onTouchMovePan = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    if (panMode) {
      e.preventDefault();
      doPan(t.clientX, t.clientY);
    } else if (onTouchStartRef.current?.timer) {
      const dx = Math.abs(t.clientX - onTouchStartRef.current.x);
      const dy = Math.abs(t.clientY - onTouchStartRef.current.y);
      if (dx > 10 || dy > 10) {
        clearTimeout(onTouchStartRef.current.timer);
        onTouchStartRef.current = null;
      }
    }
  }, [panMode, doPan]);

  const onTouchEndPan = useCallback(() => {
    if (onTouchStartRef.current?.timer) {
      clearTimeout(onTouchStartRef.current.timer);
      onTouchStartRef.current = null;
    }
    if (panMode) endPan();
  }, [panMode, endPan]);


  /* ── Fast Swipe Navigation (Left/Right Slide) ──────────────────────────── */
  const swipeThreshold = 50;
  const swipeTimeThreshold = 300;
  const navRef = useRef({ goNext: () => {}, goPrev: () => {} });
  const lockedRef = useRef(false);

  const onSwipeStart = useCallback((x: number, y: number) => {
    swipeRef.current = { x, y, time: Date.now() };
  }, []);

  const onSwipeEnd = useCallback((x: number, y: number) => {
    if (!swipeRef.current || lockedRef.current) return;
    const deltaX = x - swipeRef.current.x;
    const deltaY = y - swipeRef.current.y;
    const deltaTime = Date.now() - swipeRef.current.time;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold && deltaTime < swipeTimeThreshold) {
      if (deltaX < 0) {
        navRef.current.goNext();
      } else {
        navRef.current.goPrev();
      }
      if (navigator.vibrate) navigator.vibrate(15);
    }
    swipeRef.current = null;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onSwipeStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1) {
        onSwipeEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [onSwipeStart, onSwipeEnd]);

  /* ── Watermark overlay effect ───────────────────────── */
  useEffect(() => {
    const el = watermarkRef.current;
    if (!el) return;
    let raf = 0;
    const move = () => {
      const x = Math.random() * 60 + 10;
      const y = Math.random() * 60 + 10;
      const r = Math.random() * 30 - 15;
      el.style.transform = `translate(${x}vw, ${y}vh) rotate(${r}deg)`;
      el.style.opacity = String(Math.random() * 0.06 + 0.03);
      raf = window.setTimeout(() => requestAnimationFrame(move), 3000 + Math.random() * 2000);
    };
    requestAnimationFrame(move);
    return () => window.clearTimeout(raf);
  }, []);

  /* ── Paywall (client-side CSS overlay protection) ────
   * The full PDF (all 255 pages) is always loaded into the document proxy.
   * `isUnlocked` is a purely client-side state flag — the server sends every
   * page regardless. `isLocked` only decides whether the blurred paywall
   * overlay should cover the currently-shown page. Lifting it (after a dev
   * code or a redeemed subscription code is verified client-side) instantly
   * hides the overlay — every page is already in the DOM proxy, so
   * navigation from 129 → 130 → 255 is immediate with zero re-fetching. */
  const isUnlocked = unlocked || devUnlocked;
  const isLocked = !isUnlocked && currentPage >= freeUntilPage && freeUntilPage > 0;
  lockedRef.current = isLocked;

  /* ── Load PDF (full document, once) ─────────────────── */
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        const source = novelId
          ? await resolveProtectedPdfSource(novelId, pdfUrl)
          : { url: pdfUrl };
        if (cancelled) return;
        const loadedPdf = await pdfjsLib.getDocument({
          url: source.url,
          httpHeaders: source.httpHeaders,
          withCredentials: true,
          disableRange: true,
          disableStream: true,
        }).promise;
        if (cancelled) return;
        setPdf(loadedPdf);
        setTotalPages(loadedPdf.numPages);
        setStatus("ready");
      } catch { if (!cancelled) setStatus("error"); }
    })();
    return () => { cancelled = true; };
  }, [pdfUrl, novelId, retryKey]);

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

  /* ── Render current page (double-buffered, no flash) ── */
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);

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
        const qualityFloor = isMobile ? 4.0 : 2.0;
        const optimalScale = Math.max(neededScale, qualityFloor);
        const viewport = page.getViewport({ scale: optimalScale });

        if (!offscreenRef.current) {
          offscreenRef.current = document.createElement("canvas");
        }
        const off = offscreenRef.current;
        off.width = viewport.width;
        off.height = viewport.height;
        const octx = off.getContext("2d", { alpha: false });
        if (!octx) return;

        await page.render({ canvasContext: octx, viewport }).promise;

        if (cancelled || renderId !== pageRenderRef.current) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        canvas.style.aspectRatio = `${viewport.width} / ${viewport.height}`;
        canvas.style.backgroundColor = "#ffffff";
        const ctx = canvas.getContext("2d", { alpha: false });
        if (ctx) ctx.drawImage(off, 0, 0);

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
  }, [pdf, currentPage, status, totalPages, containerWidth, displayScale, onPageChange, isMobile]);

  /* ── Navigation ─────────────────────────────────────── */
  const goToPrev = useCallback(() => {
    setCurrentPage((p) => {
      const next = Math.max(1, p - 1);
      if (next !== p && navigator.vibrate) navigator.vibrate(10);
      return next;
    });
  }, []);

  const goToNext = useCallback(() => {
    if (!isUnlocked && freeUntilPage > 0) {
      const next = currentPage + 1;
      if (next > freeUntilPage) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("riwayati:show-subscription"));
        }
        return;
      }
    }
    setCurrentPage((p) => {
      const next = Math.min(totalPages, p + 1);
      if (next !== p && navigator.vibrate) navigator.vibrate(10);
      return next;
    });
  }, [isUnlocked, freeUntilPage, currentPage, totalPages]);

  navRef.current = { goNext: goToNext, goPrev: goToPrev };

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
  const zoomDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateActualScale = useCallback((newScale: number) => {
    if (zoomDebounceRef.current) clearTimeout(zoomDebounceRef.current);
    setVisualScale(1);
    setDisplayScale(newScale);
  }, []);

  const zoomIn = useCallback(() => {
    updateActualScale(Math.min(displayScale + 0.2, 4.0));
  }, [displayScale, updateActualScale]);

  const zoomOut = useCallback(() => {
    updateActualScale(Math.max(displayScale - 0.2, 0.3));
  }, [displayScale, updateActualScale]);

  const resetZoom = useCallback(() => {
    updateActualScale(isMobile ? 1.0 : 0.75);
  }, [isMobile, updateActualScale]);

  /* ── Fullscreen ─────────────────────────────────────── */
  const toggleFullscreen = useCallback(async () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    if (isMobile || !document.fullscreenEnabled) {
      setIsFullscreen((p) => !p);
      return;
    }
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await containerRef.current?.requestFullscreen();
      }
    } catch {
      setIsFullscreen((p) => !p);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  /* ── Reading-page content guard ────────────────────────
   * Scoped to this component's lifetime only (i.e. only while a reading
   * page is open). Blocks the small set of default browser actions that
   * would let someone save/print/select the rendered page directly:
   * copy, cut, drag-out, text selection, and the Ctrl+C/S/P/A shortcuts.
   * Deliberately does NOT touch focus/blur/visibilitychange/pagehide and
   * never blanks or dims the page — normal tab-switching, alt-tabbing and
   * screenshots are left completely alone. */
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const el = e.target as HTMLElement | null;
      const isTypingTarget = !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (!isTypingTarget) {
        e.preventDefault();
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              const item = new ClipboardItem({ 'image/png': blob });
              navigator.clipboard.write([item]).catch(() => {});
            }
          });
        }
      }
    };
    
    const isTypingTarget = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
    };
    const onCopyCut = (e: ClipboardEvent) => { if (!isTypingTarget(e.target)) e.preventDefault(); };
    const onSelectStart = (e: Event) => { if (!isTypingTarget(e.target)) e.preventDefault(); };
    const onDragStart = (e: DragEvent) => { if (!isTypingTarget(e.target)) e.preventDefault(); };
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ["c", "s", "p", "a", "v"].includes(key)) {
        e.preventDefault();
      }
      if (key === "printscreen" || (e.shiftKey && key === "s")) {
        e.preventDefault();
      }
    };
    document.addEventListener("copy", onCopyCut);
    document.addEventListener("cut", onCopyCut);
    document.addEventListener("paste", onPaste);
    document.addEventListener("selectstart", onSelectStart);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("copy", onCopyCut);
      document.removeEventListener("cut", onCopyCut);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("selectstart", onSelectStart);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  /* ── Pinch-to-zoom (two fingers) ────────────────────── */
  const pinchScaleRef = useRef(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let lastDist = 0;
    let raf = 0;
    const getDist = (t1: Touch, t2: Touch) => Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    const onTouchS = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        lastDist = getDist(e.touches[0], e.touches[1]);
      }
    };
    const onTouchM = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const d = getDist(e.touches[0], e.touches[1]);
        const ratio = d / lastDist;
        
        if (Math.abs(ratio - 1) > 0.01) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            pinchScaleRef.current = Math.min(Math.max(pinchScaleRef.current * ratio, 0.5), 3.0);
            setVisualScale(pinchScaleRef.current);
            
            if (zoomDebounceRef.current) clearTimeout(zoomDebounceRef.current);
            zoomDebounceRef.current = setTimeout(() => {
              const accumulated = pinchScaleRef.current;
              setDisplayScale(s => {
                const newScale = Math.min(Math.max(s * accumulated, 0.3), 4.0);
                return newScale;
              });
              pinchScaleRef.current = 1;
              setVisualScale(1);
            }, 300);
          });
          lastDist = d;
        }
      }
    };
    const onTouchE = () => {
      lastDist = 0;
    };
    el.addEventListener("touchstart", onTouchS, { passive: false });
    el.addEventListener("touchmove", onTouchM, { passive: false });
    el.addEventListener("touchend", onTouchE);
    return () => { el.removeEventListener("touchstart", onTouchS); el.removeEventListener("touchmove", onTouchM); el.removeEventListener("touchend", onTouchE); cancelAnimationFrame(raf); };
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

  /* ── Center horizontal scroll when zoomed in ──────────── */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || totalPages === 0) return;
    const wrapper = el.firstElementChild as HTMLElement | null;
    if (!wrapper) return;
    const wrapperWidth = wrapper.scrollWidth;
    if (wrapperWidth > el.clientWidth) {
      el.scrollLeft = (wrapperWidth - el.clientWidth) / 2;
    } else {
      el.scrollLeft = 0;
    }
  }, [displayScale, containerWidth, totalPages]);

  const handleRetry = useCallback(() => {
    setPdf(null);
    setStatus("idle");
    setTotalPages(0);
    setRetryKey((k) => k + 1);
  }, []);

  const nextDisabled = !isUnlocked && freeUntilPage > 0 && currentPage >= freeUntilPage;

  return (
    <div
      ref={containerRef}
      className={clsx(
        "reader-guard flex flex-col bg-parchment-100 dark:bg-onyx-950 select-none transition-all duration-300 isolate",
        isFullscreen ? "fixed inset-0 z-[9999] h-[100dvh] w-screen overflow-hidden pdf-fullscreen-active" : "h-full"
      )}
    >
      {/* Toolbar */}
      <div className="relative z-20 flex items-center justify-between gap-1 px-2 sm:px-4 py-2 sm:py-3 bg-white/80 dark:bg-onyx-900/80 backdrop-blur-md border-b border-parchment-200 dark:border-white/8 flex-shrink-0 transition-all duration-300">
        {/* Left: zoom controls */}
        <div className="hidden sm:flex items-center gap-1">
          <ToolBtn onClick={zoomOut} title={t("pdf.zoomOut", lang)}><ZoomOut className="w-4 h-4" /></ToolBtn>
          <span onClick={resetZoom} className="px-2 py-1 text-xs font-mono text-gray-600 dark:text-gray-300 cursor-pointer min-w-[48px] text-center font-bold bg-parchment-100 dark:bg-white/5 rounded-md">
            {Math.round(displayScale * visualScale * 100)}%
          </span>
          <ToolBtn onClick={zoomIn} title={t("pdf.zoomIn", lang)}><ZoomIn className="w-4 h-4" /></ToolBtn>
        </div>

        {/* Center: prev + page counter + next */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ToolBtn onClick={goToPrev} disabled={currentPage <= 1} title={t("pdf.prevPage", lang)} sound="navigate" className="bg-parchment-50 dark:bg-white/5 shadow-sm">
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </ToolBtn>
          <div className="flex flex-col items-center">
            <h1 className={`hidden md:block text-sm font-bold text-gray-800 dark:text-gray-200 mb-0.5 truncate max-w-[160px] ${lang === "ar" ? "font-arabic" : "font-sans"}`}>
              {title}
            </h1>
            <div className="flex items-center gap-1.5 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/20">
              <span className="text-[10px] sm:text-xs font-mono text-gold-600 dark:text-gold-400 font-bold">
                {currentPage} <span className="opacity-40">/</span> {totalPages}
              </span>
            </div>
          </div>
          <ToolBtn onClick={goToNext} disabled={currentPage >= totalPages || totalPages === 0} title={t("pdf.nextPage", lang)} sound="navigate" className="bg-parchment-50 dark:bg-white/5 shadow-sm">
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </ToolBtn>
        </div>

        {/* Right: extras */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:flex items-center gap-1">
            <ReadingTimer />
            <Achievements />
          </div>
          <div className="flex items-center gap-1">
            {chapters && chapters.length > 0 && (
              <ToolBtn onClick={() => setTocOpen((v) => !v)} title={t("pdf.toc", lang)} className={clsx(tocOpen && "bg-gold-500/20 text-gold-600")}>
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </ToolBtn>
            )}
            <ToolBtn onClick={toggleFullscreen} title={isFullscreen ? t("pdf.exitFullscreen", lang) : t("pdf.fullscreen", lang)} 
              className="bg-gold-500/10 dark:bg-white/10 rounded-xl hover:bg-gold-500/20 dark:hover:bg-white/20 ring-1 ring-gold-500/20">
              {isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5 text-gold-500" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-gold-500" />}
            </ToolBtn>
          </div>
        </div>
      </div>

      {/* TOC Dropdown */}
      {tocOpen && chapters && chapters.length > 0 && (
        <div className="absolute top-11 right-0 z-50 w-64 bg-white dark:bg-onyx-800 rounded-b-2xl shadow-xl border border-parchment-200 dark:border-white/8 max-h-[60vh] overflow-y-auto animate-fade-in" dir={lang === "ar" ? "rtl" : "ltr"}>
          <div className="p-3 border-b border-parchment-200 dark:border-white/8"><h3 className={`text-sm font-bold text-gray-900 dark:text-gray-100 ${lang === "ar" ? "font-arabic" : "font-sans"}`}>{t("pdf.toc", lang)}</h3></div>
          {chapters.map((ch, i) => {
            const isChapterLocked = !isUnlocked && ch.startPage > freeUntilPage && freeUntilPage > 0;
            const isCurrent = currentPage >= ch.startPage && (i === chapters.length - 1 || currentPage < chapters[i + 1].startPage);
            return (
              <button key={i} onClick={() => {
                setTocOpen(false);
                if (isChapterLocked) {
                  window.dispatchEvent(new CustomEvent("riwayati:show-subscription"));
                  return;
                }
                setCurrentPage(ch.startPage);
              }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-right border-b border-parchment-100 dark:border-white/5 last:border-0 hover:bg-parchment-100 dark:hover:bg-white/5 ${isCurrent ? "bg-gold-500/5 border-r-2 border-r-gold-500" : ""}`}>
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${isCurrent ? "bg-gold-500 text-white" : "bg-parchment-100 dark:bg-white/10 text-gray-500"}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs truncate ${lang === "ar" ? "font-arabic" : "font-sans"} ${isCurrent ? "text-gold-600 dark:text-gold-400 font-bold" : "text-gray-700 dark:text-gray-300"}`}>{ch.title}</p>
                  <p className="text-[10px] text-gray-400 font-sans">{t("library.page", lang)} {ch.startPage}</p>
                </div>
                {isChapterLocked && !isUnlocked && <span className="text-[10px] text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full flex-shrink-0">🔒</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Progress Bar + Chapter Label */}
      {totalPages > 0 && (
        <div className="h-auto flex-shrink-0 bg-white/50 dark:bg-onyx-900/50 backdrop-blur-sm">
          {currentChapter && (
            <div className="px-4 sm:px-6 pt-2 pb-1 flex items-center gap-2 animate-in slide-in-from-top-1 duration-500">
              <div className="w-1 h-3 bg-gold-500 rounded-full" />
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-arabic font-bold tracking-tight uppercase">
                {currentChapter}
              </span>
            </div>
          )}
          <div className="h-1.5 bg-parchment-200/50 dark:bg-white/5 cursor-pointer group relative overflow-hidden" onClick={(e) => {
            if (nextDisabled) {
              window.dispatchEvent(new CustomEvent("riwayati:show-subscription"));
              return;
            }
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const target = Math.max(1, Math.min(totalPages, Math.round(ratio * totalPages)));
            setCurrentPage(target);
            if (navigator.vibrate) navigator.vibrate(8);
          }}>
            <div className="h-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 transition-all duration-500 ease-out relative shadow-[0_0_10px_rgba(212,175,55,0.3)]"
              style={{ width: `${Math.round((currentPage / totalPages) * 100)}%` }}>
              <div className="absolute inset-0 bg-[length:20px_20px] bg-gradient-to-r from-white/20 to-transparent animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>
      )}

      {/* Vertical Scroll Area */}
      <div
        ref={scrollRef}
        className={clsx(
          "flex-1 overflow-auto relative",
          panMode ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{
          touchAction: "pan-x pan-y",
          userSelect: panMode ? "none" : undefined,
        }}
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={onMouseDownPan}
        onMouseMove={onMouseMovePan}
        onMouseUp={endMousePan}
        onMouseLeave={endMousePan}
        onTouchStart={onTouchStartPan}
        onTouchMove={onTouchMovePan}
        onTouchEnd={onTouchEndPan}
        onTouchCancel={onTouchEndPan}
      >
        <div
          className="flex flex-col items-center w-full py-1 sm:py-2"
          style={{ gap: "0.5rem", position: "relative" }}
        >
          {status === "error" && (
            <div className="flex flex-col items-center justify-center gap-4 text-gray-400">
              <BookOpen className="w-16 h-16 text-gold-500/30" />
              <p className={`text-center ${lang === "ar" ? "font-arabic" : "font-sans"}`}>{t("pdf.loadError", lang)}</p>
              <button
                onClick={handleRetry}
                className={`px-4 py-2 rounded-xl bg-gold-500 text-white text-sm hover:bg-gold-600 transition-colors active:scale-95 ${lang === "ar" ? "font-arabic" : "font-sans"}`}
              >
                {t("pdf.retry", lang)}
              </button>
            </div>
          )}

          {status === "loading" && (
            <div className="flex flex-col items-center justify-center gap-4 text-gray-400 py-20">
              <div className="w-10 h-10 rounded-full border-2 border-gold-500/20 border-t-gold-500 animate-spin" />
              <p className={`text-sm text-gray-500 dark:text-gray-400 ${lang === "ar" ? "font-arabic" : "font-sans"}`}>{t("pdf.loading", lang)}</p>
            </div>
          )}

          {status === "ready" && totalPages > 0 && (
            <div
              className={clsx(
                "relative flex-shrink-0 mx-auto overflow-hidden flex items-center justify-center transition-all duration-200 bg-white",
                isMobile && "w-full"
              )}
              style={{
                width: !isMobile ? (containerWidth > 0 ? `${containerWidth * displayScale}px` : `${displayScale * 100}%`) : undefined,
                minHeight: containerWidth > 0 && pageSize.width > 0
                  ? `${(containerWidth * pageSize.height / pageSize.width) * (isMobile ? 1.0 : displayScale)}px`
                  : undefined,
              }}
            >
              <div 
                className="w-full h-full flex items-center justify-center will-change-transform transition-transform duration-75"
                style={{ transform: `scale(${visualScale})` }}
              >
                <canvas
                  ref={canvasRef}
                  className="rounded-sm shadow-2xl"
                  style={{
                    width: "100%",
                    height: "auto",
                    backgroundColor: "#ffffff",
                  }}
                />
              </div>
              <div
                ref={watermarkRef}
                className="pointer-events-none select-none fixed z-[9999] font-arabic font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap will-change-transform"
                style={{ opacity: 0.04, transition: "transform 2s ease-in-out, opacity 2s ease-in-out" }}
                aria-hidden="true"
              >
                روايتي — rewayati.vercel.app
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Paywall overlay (pure CSS, above the page, zoom-independent) ──
       * The mature page is always rendered underneath; this blurred layer
       * only covers it while `isLocked` is true. The moment a dev/activation
       * code flips `isUnlocked` client-side, this overlay unmounts and every
       * page (129 → 255) is instantly visible — no reload, no re-fetch. */}
      {isLocked && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-parchment-50/95 dark:bg-onyx-950/97 backdrop-blur-md p-2 sm:p-4">
          <Paywall
            onUnlock={() => unlock()}
            onBackToFree={() => setCurrentPage(Math.max(1, (freeUntilPage || 1) - 1))}
            price={500}
            title={title}
            preview={preview}
          />
        </div>
      )}
    </div>
  );
}

function ToolBtn({ children, onClick, disabled, title, className, sound }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; title?: string; className?: string; sound?: string }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title} aria-label={title} data-sound={sound}
      className={clsx("w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-parchment-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition-all duration-150", className)}>
      {children}
    </button>
  );
}