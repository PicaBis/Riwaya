"use client";

/**
 * BookViewer — immersive full-height PDF reader with 3-D page-flip animation.
 *
 * Desktop:  Page fills full viewport height, centered.
 *           Arrows on left/right side to navigate.
 *           3D rotateY flip animation between pages.
 *
 * Mobile:   Single-page, full-screen.
 *           Tap left 30% = prev, tap right 30% = next.
 *           Swipe left/right to navigate.
 *           Controls auto-hide after 3 s.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import clsx from "clsx";
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Keyboard,
  X,
  BookOpen,
} from "lucide-react";
import { Paywall } from "./Paywall";
import { useToast } from "./Toast";

/* ─── Types ───────────────────────────────────────────── */
interface BookViewerProps {
  pdfUrl: string;
  title: string;
  novelId?: string;
  freeUntilPage?: number;
}

type FlipDir   = "next" | "prev";
type FlipPhase = "idle" | "out" | "in";

/* ─── Constants ───────────────────────────────────────── */
const FLIP_DURATION_MS = 300; // half-turn duration
const CONTROL_HIDE_MS  = 3000;

/* ═══════════════════════════════════════════════════════ */
export function BookViewer({
  pdfUrl,
  title,
  novelId = "novel",
  freeUntilPage = 20,
}: BookViewerProps) {
  const { toast } = useToast();

  /* ── refs ─────────────────────────────────────────── */
  const wrapRef       = useRef<HTMLDivElement>(null); // outer container
  const stageRef      = useRef<HTMLDivElement>(null); // reading stage
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const hiddenRef     = useRef<HTMLCanvasElement>(null);
  const renderRef     = useRef<{ cancel: () => void } | null>(null);
  const touchStartX   = useRef<number | null>(null);
  const hideTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── PDF state ────────────────────────────────────── */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdf, setPdf]                   = useState<any>(null);
  const [totalPages, setTotalPages]     = useState(0);
  const [currentPage, setCurrentPage]   = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem(`rp_${novelId}`) || "1", 10);
    }
    return 1;
  });
  const [scale, setScale]               = useState(1.0);
  const [loadStatus, setLoadStatus]     = useState<"loading" | "ready" | "error">("loading");

  /* ── Flip animation state ─────────────────────────── */
  const [flipPhase, setFlipPhase]       = useState<FlipPhase>("idle");
  const [flipDir, setFlipDir]           = useState<FlipDir>("next");
  const [fromSrc, setFromSrc]           = useState<string | null>(null);
  const [toSrc,   setToSrc]             = useState<string | null>(null);
  const [pendingPage, setPendingPage]   = useState<number | null>(null);

  /* ── UI state ─────────────────────────────────────── */
  const [showUI, setShowUI]             = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showHelp, setShowHelp]         = useState(false);
  const [isUnlocked, setIsUnlocked]     = useState(() =>
    typeof window !== "undefined"
      ? sessionStorage.getItem("riwayati_unlocked") === "1"
      : false
  );

  const isLocked = !isUnlocked && currentPage > freeUntilPage;
  const progress  = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  /* ══════════════════════════════════════════════════
     1.  Load PDF
  ══════════════════════════════════════════════════ */
  useEffect(() => {
    let dead = false;
    setLoadStatus("loading");

    (async () => {
      try {
        const lib = await import("pdfjs-dist");
        lib.GlobalWorkerOptions.workerSrc =
          `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version}/pdf.worker.min.js`;
        const doc = await lib.getDocument(pdfUrl).promise;
        if (dead) return;
        setPdf(doc);
        setTotalPages(doc.numPages);
        setLoadStatus("ready");
      } catch {
        if (!dead) setLoadStatus("error");
      }
    })();

    return () => { dead = true; };
  }, [pdfUrl]);

  /* ══════════════════════════════════════════════════
     2.  Auto-scale: fit page to stage height
  ══════════════════════════════════════════════════ */
  const calcScale = useCallback(async (pageNum: number) => {
    if (!pdf || !stageRef.current) return;
    const page = await pdf.getPage(pageNum);
    const vp1  = page.getViewport({ scale: 1 });
    const avH  = stageRef.current.clientHeight  - 32;
    const avW  = stageRef.current.clientWidth   - 48;
    const s    = Math.min(avH / vp1.height, avW / vp1.width, 2.2);
    setScale(Math.max(0.4, s));
  }, [pdf]);

  useEffect(() => {
    if (loadStatus === "ready") calcScale(currentPage);
  }, [loadStatus, calcScale, currentPage]);

  // Re-calc on window resize
  useEffect(() => {
    const ro = new ResizeObserver(() => calcScale(currentPage));
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [calcScale, currentPage]);

  /* ══════════════════════════════════════════════════
     3.  Render a page to a canvas element
  ══════════════════════════════════════════════════ */
  const renderToCanvas = useCallback(
    async (pageNum: number, canvas: HTMLCanvasElement, s: number) => {
      if (!pdf) return;
      if (renderRef.current) renderRef.current.cancel();

      const page     = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: s });
      canvas.width   = viewport.width;
      canvas.height  = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const task = page.render({ canvasContext: ctx, viewport });
      renderRef.current = { cancel: () => task.cancel() };
      try { await task.promise; } catch (_) { /* RenderingCancelled */ }
    },
    [pdf]
  );

  /* ── Initial render ──────────────────────────────── */
  useEffect(() => {
    if (loadStatus !== "ready" || !canvasRef.current || flipPhase !== "idle") return;
    renderToCanvas(currentPage, canvasRef.current, scale);
    try { localStorage.setItem(`rp_${novelId}`, String(currentPage)); } catch {}
    // bookmark indicator
    const bm = localStorage.getItem(`rb_${novelId}`);
    setIsBookmarked(bm === String(currentPage));
  }, [loadStatus, currentPage, scale, flipPhase, renderToCanvas, novelId]);

  /* ══════════════════════════════════════════════════
     4.  Navigation with flip animation
  ══════════════════════════════════════════════════ */
  const navigate = useCallback(
    async (dir: FlipDir) => {
      if (!pdf || !canvasRef.current || !hiddenRef.current) return;
      if (flipPhase !== "idle") return;

      const newPage = dir === "next" ? currentPage + 1 : currentPage - 1;
      if (newPage < 1 || newPage > totalPages) return;

      // Paywall gate
      if (!isUnlocked && newPage > freeUntilPage) {
        setCurrentPage(newPage); // triggers paywall
        return;
      }

      // Capture current page as image snapshot
      const fromDataUrl = canvasRef.current.toDataURL("image/jpeg", 0.92);

      // Pre-render next page to hidden canvas
      await renderToCanvas(newPage, hiddenRef.current, scale);
      const toDataUrl = hiddenRef.current.toDataURL("image/jpeg", 0.92);

      setFromSrc(fromDataUrl);
      setToSrc(toDataUrl);
      setFlipDir(dir);
      setPendingPage(newPage);
      setFlipPhase("out");
    },
    [pdf, currentPage, totalPages, scale, flipPhase, isUnlocked, freeUntilPage, renderToCanvas]
  );

  /* ── Flip phase machine ───────────────────────────── */
  useEffect(() => {
    if (flipPhase === "out") {
      const t = setTimeout(() => setFlipPhase("in"), FLIP_DURATION_MS);
      return () => clearTimeout(t);
    }
    if (flipPhase === "in") {
      const t = setTimeout(() => {
        if (pendingPage !== null) setCurrentPage(pendingPage);
        setPendingPage(null);
        setFlipPhase("idle");
        setFromSrc(null);
        setToSrc(null);
      }, FLIP_DURATION_MS);
      return () => clearTimeout(t);
    }
  }, [flipPhase, pendingPage]);

  /* ══════════════════════════════════════════════════
     5.  Controls auto-hide
  ══════════════════════════════════════════════════ */
  const revealUI = useCallback(() => {
    setShowUI(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowUI(false), CONTROL_HIDE_MS);
  }, []);

  useEffect(() => {
    // Start timer after mount
    hideTimer.current = setTimeout(() => setShowUI(false), CONTROL_HIDE_MS * 2);
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, []);

  /* ══════════════════════════════════════════════════
     6.  Touch / swipe
  ══════════════════════════════════════════════════ */
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    revealUI();
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) navigate(dx < 0 ? "next" : "prev");
    touchStartX.current = null;
  };

  /* ── Click zones (mobile tap) ────────────────────── */
  const onStageClick = (e: React.MouseEvent) => {
    revealUI();
    if (isLocked) return;
    const { left, width } = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - left;
    if (x < width * 0.28) navigate("prev");
    else if (x > width * 0.72) navigate("next");
  };

  /* ── Keyboard ─────────────────────────────────────── */
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      revealUI();
      if (e.key === "?"  ) { setShowHelp((v) => !v); return; }
      if (e.key === "Escape") { setShowHelp(false);  return; }
      if (isLocked) return;
      if (e.key === "ArrowLeft"  || e.key === "PageDown") navigate("next");
      if (e.key === "ArrowRight" || e.key === "PageUp")   navigate("prev");
      if (e.key === "Home") setCurrentPage(1);
      if (e.key === "End")  setCurrentPage(totalPages);
      if (e.key === "+" || e.key === "=") setScale((s) => Math.min(+(s + 0.15).toFixed(2), 2.5));
      if (e.key === "-") setScale((s) => Math.max(+(s - 0.15).toFixed(2), 0.4));
      if (e.key === "0") calcScale(currentPage);
      if (e.key === "b") toggleBookmark();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [navigate, revealUI, isLocked, totalPages, currentPage, calcScale]); // eslint-disable-line

  /* ── Bookmark ─────────────────────────────────────── */
  const toggleBookmark = () => {
    const key = `rb_${novelId}`;
    if (isBookmarked) {
      localStorage.removeItem(key);
      setIsBookmarked(false);
      toast("تم إزالة الإشارة المرجعية", "info");
    } else {
      localStorage.setItem(key, String(currentPage));
      setIsBookmarked(true);
      toast(`تم حفظ الصفحة ${currentPage} ✓`, "success");
    }
  };

  const goToBookmark = () => {
    const bm = localStorage.getItem(`rb_${novelId}`);
    if (bm) { setCurrentPage(parseInt(bm, 10)); toast("الانتقال للإشارة ←", "info"); }
  };

  /* ══════════════════════════════════════════════════
     7.  Render
  ══════════════════════════════════════════════════ */
  return (
    <div
      ref={wrapRef}
      className="relative flex flex-col h-full bg-[#F5F0E8] dark:bg-[#0E0D0B] overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseMove={revealUI}
    >
      {/* ── Reading progress bar ────────────────────── */}
      <div className="h-0.5 w-full bg-stone-200 dark:bg-white/5 flex-shrink-0 z-10">
        <div
          className="h-full bg-gold-500 transition-[width] duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Top toolbar (auto-hide) ──────────────────── */}
      <div
        className={clsx(
          "absolute top-0.5 left-0 right-0 z-20 flex items-center justify-between px-4 py-2",
          "bg-white/80 dark:bg-onyx-900/80 backdrop-blur-md border-b border-white/20 dark:border-white/8",
          "transition-all duration-300",
          showUI ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        )}
        dir="rtl"
      >
        {/* Zoom */}
        <div className="flex items-center gap-1">
          <ToolBtn onClick={() => setScale((s) => Math.max(+(s - 0.15).toFixed(2), 0.4))} title="-">
            <ZoomOut className="w-3.5 h-3.5" />
          </ToolBtn>
          <button
            onClick={() => calcScale(currentPage)}
            className="px-2 py-0.5 text-xs font-mono text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors min-w-[44px] text-center"
          >
            {Math.round(scale * 100)}%
          </button>
          <ToolBtn onClick={() => setScale((s) => Math.min(+(s + 0.15).toFixed(2), 2.5))} title="+">
            <ZoomIn className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn onClick={() => calcScale(currentPage)} title="ملاءمة">
            <RotateCcw className="w-3.5 h-3.5" />
          </ToolBtn>
        </div>

        {/* Title + page */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="hidden sm:inline font-arabic truncate max-w-[120px]">{title}</span>
          <span className="font-sans">{currentPage} / {totalPages}</span>
          {localStorage.getItem(`rb_${novelId}`) && (
            <button
              onClick={goToBookmark}
              className="text-gold-500 hover:text-gold-600 transition-colors text-xs"
              title="الانتقال للإشارة"
            >
              🔖
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <ToolBtn onClick={toggleBookmark} title={isBookmarked ? "إزالة إشارة (b)" : "إشارة مرجعية (b)"}>
            {isBookmarked
              ? <BookmarkCheck className="w-3.5 h-3.5 text-gold-500" />
              : <Bookmark className="w-3.5 h-3.5" />}
          </ToolBtn>
          <ToolBtn onClick={() => setShowHelp(true)} title="اختصارات (?)">
            <Keyboard className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn onClick={() => {
            if (!document.fullscreenElement) wrapRef.current?.requestFullscreen();
            else document.exitFullscreen();
          }} title="ملء الشاشة">
            <Maximize2 className="w-3.5 h-3.5" />
          </ToolBtn>
        </div>
      </div>

      {/* ── Main stage ──────────────────────────────── */}
      <div
        ref={stageRef}
        className="flex-1 flex items-center justify-center overflow-hidden cursor-pointer"
        style={{ perspective: "1400px" }}
        onClick={onStageClick}
      >
        {/* Loading */}
        {loadStatus === "loading" && (
          <div className="flex flex-col items-center gap-3 text-stone-400">
            <div className="w-12 h-12 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
            <span className="font-arabic text-sm">جارٍ تحميل الرواية…</span>
          </div>
        )}

        {/* Error */}
        {loadStatus === "error" && (
          <div className="flex flex-col items-center gap-3 text-stone-400">
            <BookOpen className="w-14 h-14 opacity-30" />
            <p className="font-arabic">تعذّر تحميل الملف</p>
          </div>
        )}

        {/* Book frame */}
        {loadStatus === "ready" && (
          <div className="relative" style={{ transformStyle: "preserve-3d" }}>
            {/* ── Actual canvas (shown when idle) ────── */}
            <canvas
              ref={canvasRef}
              className={clsx(
                "rounded-sm shadow-2xl block",
                flipPhase !== "idle" ? "opacity-0" : "opacity-100",
                "transition-opacity duration-75"
              )}
              style={{ maxHeight: "calc(100dvh - 120px)", maxWidth: "calc(100vw - 48px)" }}
            />

            {/* Hidden pre-render canvas */}
            <canvas
              ref={hiddenRef}
              className="absolute top-0 left-0 opacity-0 pointer-events-none"
              aria-hidden
            />

            {/* ── Flip OUT ────────────────────────────── */}
            {flipPhase === "out" && fromSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fromSrc}
                alt=""
                className="absolute top-0 left-0 rounded-sm shadow-2xl w-full h-full object-fill"
                style={{
                  animation: `flipOut${flipDir === "next" ? "Next" : "Prev"} ${FLIP_DURATION_MS}ms ease-in forwards`,
                  transformOrigin: flipDir === "next" ? "left center" : "right center",
                  willChange: "transform, opacity",
                }}
              />
            )}

            {/* ── Flip IN ─────────────────────────────── */}
            {flipPhase === "in" && toSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={toSrc}
                alt=""
                className="absolute top-0 left-0 rounded-sm shadow-2xl w-full h-full object-fill"
                style={{
                  animation: `flipIn${flipDir === "next" ? "Next" : "Prev"} ${FLIP_DURATION_MS}ms ease-out forwards`,
                  transformOrigin: flipDir === "next" ? "left center" : "right center",
                  willChange: "transform, opacity",
                }}
              />
            )}

            {/* Page shadow (book depth effect) */}
            <div
              className="absolute inset-0 pointer-events-none rounded-sm"
              style={{
                boxShadow: "inset -4px 0 12px rgba(0,0,0,0.15), inset 4px 0 12px rgba(0,0,0,0.08)",
              }}
            />
          </div>
        )}

        {/* Paywall */}
        {isLocked && <Paywall onUnlock={() => setIsUnlocked(true)} price={500} />}
      </div>

      {/* ── Side arrows (desktop, auto-hide) ────────── */}
      <button
        onClick={() => navigate("prev")}
        disabled={currentPage <= 1}
        className={clsx(
          "absolute left-3 top-1/2 -translate-y-1/2 z-20",
          "w-10 h-10 rounded-full bg-white/70 dark:bg-onyx-900/70 backdrop-blur-sm",
          "border border-white/40 dark:border-white/10 shadow-lg",
          "flex items-center justify-center text-gray-600 dark:text-gray-400",
          "hover:bg-white dark:hover:bg-onyx-800 hover:text-gold-500 active:scale-90",
          "disabled:opacity-0 disabled:pointer-events-none",
          "transition-all duration-300",
          showUI ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        title="الصفحة السابقة (→)"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <button
        onClick={() => navigate("next")}
        disabled={currentPage >= totalPages || isLocked}
        className={clsx(
          "absolute right-3 top-1/2 -translate-y-1/2 z-20",
          "w-10 h-10 rounded-full bg-white/70 dark:bg-onyx-900/70 backdrop-blur-sm",
          "border border-white/40 dark:border-white/10 shadow-lg",
          "flex items-center justify-center text-gray-600 dark:text-gray-400",
          "hover:bg-white dark:hover:bg-onyx-800 hover:text-gold-500 active:scale-90",
          "disabled:opacity-0 disabled:pointer-events-none",
          "transition-all duration-300",
          showUI ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        title="الصفحة التالية (←)"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* ── Bottom bar (auto-hide) ───────────────────── */}
      <div
        className={clsx(
          "absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-3",
          "bg-white/80 dark:bg-onyx-900/80 backdrop-blur-md border-t border-white/20 dark:border-white/8",
          "transition-all duration-300",
          showUI ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
        )}
        dir="rtl"
      >
        <button
          onClick={() => navigate("prev")}
          disabled={currentPage <= 1}
          className="flex items-center gap-1.5 text-sm font-arabic text-gray-600 dark:text-gray-400 hover:text-gold-500 disabled:opacity-30 active:scale-95 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
          السابقة
        </button>

        {/* Page dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            const pageForDot = Math.round(i * (totalPages - 1) / Math.max(6, 1)) + 1;
            const isActive   = Math.abs(pageForDot - currentPage) < totalPages / 14;
            return (
              <div
                key={i}
                className={clsx(
                  "rounded-full transition-all duration-300",
                  isActive
                    ? "w-2 h-2 bg-gold-500"
                    : "w-1.5 h-1.5 bg-stone-300 dark:bg-white/20"
                )}
              />
            );
          })}
        </div>

        <button
          onClick={() => navigate("next")}
          disabled={currentPage >= totalPages || isLocked}
          className="flex items-center gap-1.5 text-sm font-arabic text-gray-600 dark:text-gray-400 hover:text-gold-500 disabled:opacity-30 active:scale-95 transition-all"
        >
          التالية
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* ── Keyboard help modal ───────────────────────── */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowHelp(false)}
          dir="rtl"
        >
          <div
            className="bg-white dark:bg-onyx-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-arabic font-bold text-gray-900 dark:text-gray-100">اختصارات لوحة المفاتيح</h3>
              <button onClick={() => setShowHelp(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {[
                ["→ / PageUp",   "الصفحة السابقة"],
                ["← / PageDown", "الصفحة التالية"],
                ["Home / End",   "أول / آخر صفحة"],
                ["+  /  -",      "تكبير / تصغير"],
                ["0",            "إعادة الحجم تلقائياً"],
                ["b",            "حفظ إشارة مرجعية"],
                ["?",            "هذه النافذة"],
              ].map(([k, d]) => (
                <div key={k} className="flex items-center justify-between py-1.5 border-b border-parchment-100 dark:border-white/5 last:border-0">
                  <span className="font-arabic text-sm text-gray-600 dark:text-gray-300">{d}</span>
                  <kbd className="px-2 py-0.5 rounded bg-parchment-100 dark:bg-white/10 text-xs font-mono text-gray-500 dark:text-gray-400 border border-parchment-200 dark:border-white/10">{k}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Small toolbar button ────────────────────────────── */
function ToolBtn({
  children, onClick, title,
}: { children: React.ReactNode; onClick?: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 dark:text-gray-400 hover:bg-black/8 dark:hover:bg-white/10 active:scale-90 transition-all duration-150"
    >
      {children}
    </button>
  );
}
