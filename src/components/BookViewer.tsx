"use client";

/**
 * BookViewer — immersive full-height PDF reader with 3-D page-flip animation.
 *
 * BUG FIX (v2):
 *   Canvas was inside {loadStatus === "ready" && (...)} so canvasRef.current
 *   was null when the very first render-effect fired.
 *   Fix: canvas is ALWAYS mounted; only the loading/error overlays are conditional.
 *
 * Desktop:  Page fills full viewport height, centered.
 *           Arrows on left/right, 3D rotateY flip between pages.
 * Mobile:   Full-screen single page. Tap zones + swipe navigation.
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

/* ─── Types ─────────────────────────────────────────── */
interface BookViewerProps {
  pdfUrl: string;
  title: string;
  novelId?: string;
  freeUntilPage?: number;
}
type FlipDir   = "next" | "prev";
type FlipPhase = "idle" | "out" | "in";
type LoadState = "loading" | "ready" | "error";

const FLIP_MS       = 300;
const HIDE_DELAY_MS = 3000;

/* ══════════════════════════════════════════════════════ */
export function BookViewer({
  pdfUrl,
  title,
  novelId = "novel",
  freeUntilPage = 20,
}: BookViewerProps) {
  const { toast } = useToast();

  /* ── refs ──────────────────────────────────────────── */
  const wrapRef      = useRef<HTMLDivElement>(null);
  const stageRef     = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);   // ← always mounted
  const hiddenRef    = useRef<HTMLCanvasElement>(null);   // ← always mounted
  const renderRef    = useRef<{ cancel: () => void } | null>(null);
  const touchStartX  = useRef<number | null>(null);
  const hideTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── state ─────────────────────────────────────────── */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdf, setPdf]               = useState<any>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [curPage, setCurPage]       = useState(() => {
    try { return parseInt(localStorage.getItem(`rp_${novelId}`) || "1", 10); }
    catch { return 1; }
  });
  const [scale, setScale]           = useState(1.0);
  const [loadState, setLoadState]   = useState<LoadState>("loading");

  /* flip */
  const [flipPhase, setFlipPhase]   = useState<FlipPhase>("idle");
  const [flipDir, setFlipDir]       = useState<FlipDir>("next");
  const [fromSrc, setFromSrc]       = useState<string | null>(null);
  const [toSrc,   setToSrc]         = useState<string | null>(null);
  const [pendingPg, setPendingPg]   = useState<number | null>(null);

  /* UI */
  const [showUI, setShowUI]         = useState(true);
  const [isBookmarked, setBM]       = useState(false);
  const [showHelp, setShowHelp]     = useState(false);
  const [isUnlocked, setUnlocked]   = useState(() => {
    try { return sessionStorage.getItem("riwayati_unlocked") === "1"; }
    catch { return false; }
  });

  const isLocked = !isUnlocked && curPage > freeUntilPage;
  const progress  = totalPages > 0 ? (curPage / totalPages) * 100 : 0;

  /* ══════════════════════════════════════════════════
     1.  Load PDF
  ══════════════════════════════════════════════════ */
  useEffect(() => {
    let dead = false;
    setLoadState("loading");

    (async () => {
      try {
        const lib = await import("pdfjs-dist");
        lib.GlobalWorkerOptions.workerSrc =
          `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version}/pdf.worker.min.js`;
        const doc = await lib.getDocument(pdfUrl).promise;
        if (dead) return;
        setPdf(doc);
        setTotalPages(doc.numPages);
        // loadState is set to "ready" AFTER first page renders (see step 2)
      } catch {
        if (!dead) setLoadState("error");
      }
    })();

    return () => { dead = true; };
  }, [pdfUrl]);

  /* ══════════════════════════════════════════════════
     2.  First render: pdf loaded → calculate scale → paint
         KEY FIX: canvas is always mounted so canvasRef.current
         is guaranteed to be non-null here.
  ══════════════════════════════════════════════════ */
  useEffect(() => {
    if (!pdf) return;
    let dead = false;

    const init = async () => {
      const canvas = canvasRef.current;
      const stage  = stageRef.current;
      if (!canvas || !stage) return;

      try {
        const page = await pdf.getPage(curPage);
        if (dead) return;

        /* Auto-scale to fill the stage */
        const vp1 = page.getViewport({ scale: 1 });
        // Wait one rAF so the stage has been laid out
        await new Promise<void>((res) => requestAnimationFrame(() => res()));
        if (dead) return;

        const avH = Math.max(stage.clientHeight - 40, 200);
        const avW = Math.max(stage.clientWidth  - 60, 200);
        const s   = Math.max(0.4, Math.min(avH / vp1.height, avW / vp1.width, 2.4));
        setScale(s);

        /* Render */
        const viewport = page.getViewport({ scale: s });
        canvas.width   = viewport.width;
        canvas.height  = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx || dead) return;

        await page.render({ canvasContext: ctx, viewport }).promise;
        if (!dead) setLoadState("ready");
      } catch {
        if (!dead) setLoadState("error");
      }
    };

    init();
    return () => { dead = true; };
  }, [pdf]); // ← only runs once when pdf changes (avoids scale race condition)

  /* ══════════════════════════════════════════════════
     3.  Re-render on page / scale change (after initial load)
  ══════════════════════════════════════════════════ */
  const renderPage = useCallback(
    async (pageNum: number, canvas: HTMLCanvasElement, s: number) => {
      if (!pdf) return;
      if (renderRef.current) { renderRef.current.cancel(); renderRef.current = null; }

      const page     = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: s });
      canvas.width   = viewport.width;
      canvas.height  = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const task = page.render({ canvasContext: ctx, viewport });
      renderRef.current = { cancel: () => task.cancel() };
      try { await task.promise; } catch { /* RenderingCancelledException is ok */ }
    },
    [pdf]
  );

  /* re-render when curPage or scale changes (excluding the very first render) */
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (loadState !== "ready") return;
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (!canvasRef.current || flipPhase !== "idle") return;

    renderPage(curPage, canvasRef.current, scale);
    try { localStorage.setItem(`rp_${novelId}`, String(curPage)); } catch {}
    try { setBM(localStorage.getItem(`rb_${novelId}`) === String(curPage)); } catch {}
  }, [curPage, scale, flipPhase, loadState, renderPage, novelId]);

  /* ── Auto-resize ───────────────────────────────────── */
  const recalcScale = useCallback(async () => {
    if (!pdf || !stageRef.current) return;
    const page = await pdf.getPage(curPage);
    const vp1  = page.getViewport({ scale: 1 });
    const avH  = Math.max(stageRef.current.clientHeight - 40, 200);
    const avW  = Math.max(stageRef.current.clientWidth  - 60, 200);
    setScale(Math.max(0.4, Math.min(avH / vp1.height, avW / vp1.width, 2.4)));
  }, [pdf, curPage]);

  useEffect(() => {
    const ro = new ResizeObserver(() => recalcScale());
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [recalcScale]);

  /* ══════════════════════════════════════════════════
     4.  Navigate with flip animation
  ══════════════════════════════════════════════════ */
  const navigate = useCallback(
    async (dir: FlipDir) => {
      if (!pdf || !canvasRef.current || !hiddenRef.current) return;
      if (flipPhase !== "idle" || loadState !== "ready") return;

      const newPage = dir === "next" ? curPage + 1 : curPage - 1;
      if (newPage < 1 || newPage > totalPages) return;

      if (!isUnlocked && newPage > freeUntilPage) {
        setCurPage(newPage); return;   // show paywall
      }

      /* Snapshot current page */
      const fromUrl = canvasRef.current.toDataURL("image/jpeg", 0.9);

      /* Pre-render destination page */
      await renderPage(newPage, hiddenRef.current, scale);
      const toUrl = hiddenRef.current.toDataURL("image/jpeg", 0.9);

      setFromSrc(fromUrl);
      setToSrc(toUrl);
      setFlipDir(dir);
      setPendingPg(newPage);
      setFlipPhase("out");
    },
    [pdf, curPage, totalPages, scale, flipPhase, loadState, isUnlocked, freeUntilPage, renderPage]
  );

  /* ── Flip phase machine ─────────────────────────────── */
  useEffect(() => {
    if (flipPhase === "out") {
      const t = setTimeout(() => setFlipPhase("in"), FLIP_MS);
      return () => clearTimeout(t);
    }
    if (flipPhase === "in") {
      const t = setTimeout(() => {
        if (pendingPg !== null) { setCurPage(pendingPg); setPendingPg(null); }
        setFlipPhase("idle");
        setFromSrc(null);
        setToSrc(null);
      }, FLIP_MS);
      return () => clearTimeout(t);
    }
  }, [flipPhase, pendingPg]);

  /* ══════════════════════════════════════════════════
     5.  UI helpers
  ══════════════════════════════════════════════════ */
  const revealUI = useCallback(() => {
    setShowUI(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowUI(false), HIDE_DELAY_MS);
  }, []);

  useEffect(() => {
    hideTimer.current = setTimeout(() => setShowUI(false), HIDE_DELAY_MS * 2);
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, []);

  /* touch */
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

  /* click zones */
  const onStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    revealUI();
    if (isLocked) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    if (x < width * 0.28) navigate("prev");
    else if (x > width * 0.72) navigate("next");
  };

  /* keyboard */
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      revealUI();
      if (e.key === "?" ) { setShowHelp((v) => !v); return; }
      if (e.key === "Escape") { setShowHelp(false); return; }
      if (isLocked) return;
      if (e.key === "ArrowLeft"  || e.key === "PageDown") navigate("next");
      if (e.key === "ArrowRight" || e.key === "PageUp")   navigate("prev");
      if (e.key === "Home") setCurPage(1);
      if (e.key === "End")  setCurPage(totalPages);
      if (e.key === "+" || e.key === "=") setScale((s) => Math.min(+(s + 0.15).toFixed(2), 2.5));
      if (e.key === "-") setScale((s) => Math.max(+(s - 0.15).toFixed(2), 0.4));
      if (e.key === "0") recalcScale();
      if (e.key === "b") toggleBM();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, revealUI, isLocked, totalPages, recalcScale]);

  /* bookmark */
  const toggleBM = () => {
    const key = `rb_${novelId}`;
    if (isBookmarked) {
      try { localStorage.removeItem(key); } catch {}
      setBM(false);
      toast("تم إزالة الإشارة المرجعية", "info");
    } else {
      try { localStorage.setItem(key, String(curPage)); } catch {}
      setBM(true);
      toast(`تم حفظ الصفحة ${curPage} ✓`, "success");
    }
  };

  const goToBM = () => {
    try {
      const bm = localStorage.getItem(`rb_${novelId}`);
      if (bm) { setCurPage(parseInt(bm, 10)); toast("الانتقال للإشارة ←", "info"); }
    } catch {}
  };

  /* ══════════════════════════════════════════════════
     6.  Render
  ══════════════════════════════════════════════════ */
  return (
    <div
      ref={wrapRef}
      className="relative flex flex-col h-full bg-[#F2ECE0] dark:bg-[#0E0D0B] overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseMove={revealUI}
    >
      {/* ── Progress bar ──────────────────────────────── */}
      <div className="h-0.5 flex-shrink-0 bg-stone-200 dark:bg-white/5 z-10">
        <div
          className="h-full bg-gold-500 transition-[width] duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Top toolbar (auto-hide) ─────────────────────── */}
      <div
        className={clsx(
          "absolute top-0.5 inset-x-0 z-30 flex items-center justify-between px-4 py-2",
          "bg-white/85 dark:bg-onyx-900/85 backdrop-blur-md",
          "border-b border-black/5 dark:border-white/8",
          "transition-all duration-300",
          showUI ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        )}
        dir="rtl"
      >
        {/* Zoom */}
        <div className="flex items-center gap-0.5">
          <ToolBtn onClick={() => setScale((s) => Math.max(+(s-0.15).toFixed(2), 0.4))}>
            <ZoomOut className="w-3.5 h-3.5" />
          </ToolBtn>
          <button
            onClick={recalcScale}
            className="px-2 py-0.5 text-[11px] font-mono text-gray-500 dark:text-gray-400 hover:bg-black/6 dark:hover:bg-white/10 rounded min-w-[40px] text-center transition-colors"
          >
            {Math.round(scale * 100)}%
          </button>
          <ToolBtn onClick={() => setScale((s) => Math.min(+(s+0.15).toFixed(2), 2.5))}>
            <ZoomIn className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn onClick={recalcScale} title="ملاءمة (0)">
            <RotateCcw className="w-3 h-3" />
          </ToolBtn>
        </div>

        {/* Title + page counter */}
        <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
          <span className="hidden sm:block font-arabic truncate max-w-[130px]">{title}</span>
          <span className="font-mono">{curPage} / {totalPages}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <ToolBtn onClick={toggleBM} title={isBookmarked ? "إزالة إشارة (b)" : "حفظ إشارة (b)"}>
            {isBookmarked
              ? <BookmarkCheck className="w-3.5 h-3.5 text-gold-500" />
              : <Bookmark className="w-3.5 h-3.5" />}
          </ToolBtn>
          <ToolBtn onClick={() => setShowHelp(true)} title="اختصارات (?)">
            <Keyboard className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn
            onClick={() => {
              if (!document.fullscreenElement) wrapRef.current?.requestFullscreen();
              else document.exitFullscreen();
            }}
            title="ملء الشاشة"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </ToolBtn>
        </div>
      </div>

      {/* ══ STAGE (reading area) ══════════════════════════ */}
      <div
        ref={stageRef}
        className="flex-1 flex items-center justify-center overflow-hidden relative"
        style={{ perspective: "1400px" }}
        onClick={onStageClick}
      >
        {/* Loading overlay */}
        {loadState === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-stone-400 z-10 bg-[#F2ECE0] dark:bg-[#0E0D0B]">
            <div className="w-12 h-12 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
            <span className="font-arabic text-sm">جارٍ تحميل الرواية…</span>
          </div>
        )}

        {/* Error overlay */}
        {loadState === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-stone-400 z-10">
            <BookOpen className="w-14 h-14 opacity-30" />
            <p className="font-arabic">تعذّر تحميل الملف</p>
          </div>
        )}

        {/* ─────────────────────────────────────────────────
            CANVAS — always in the DOM (fixes the main bug).
            canvasRef.current is guaranteed non-null when
            effects fire after the PDF loads.
        ───────────────────────────────────────────────── */}
        <div
          className="relative"
          style={{ transformStyle: "preserve-3d", display: loadState === "loading" ? "none" : "block" }}
        >
          {/* Main canvas */}
          <canvas
            ref={canvasRef}
            className={clsx(
              "rounded-sm shadow-2xl block select-none",
              /* hide during flip (images take over) */
              flipPhase !== "idle" ? "opacity-0" : "opacity-100",
              "transition-opacity duration-[50ms]"
            )}
            style={{ maxHeight: "calc(100dvh - 116px)", maxWidth: "calc(100vw - 48px)" }}
          />

          {/* Hidden canvas for pre-rendering next page */}
          <canvas
            ref={hiddenRef}
            className="absolute top-0 left-0 opacity-0 pointer-events-none"
            aria-hidden
          />

          {/* ── Flip OUT (current page folds away) ── */}
          {flipPhase === "out" && fromSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fromSrc} alt=""
              className="absolute top-0 left-0 rounded-sm shadow-2xl select-none"
              style={{
                width: canvasRef.current?.style.width   || "100%",
                height: canvasRef.current?.style.height || "100%",
                maxWidth: "calc(100vw - 48px)",
                maxHeight: "calc(100dvh - 116px)",
                animation: `flipOut${flipDir === "next" ? "Next" : "Prev"} ${FLIP_MS}ms ease-in forwards`,
                transformOrigin: flipDir === "next" ? "left center" : "right center",
                willChange: "transform, opacity",
              }}
            />
          )}

          {/* ── Flip IN (new page unfolds) ── */}
          {flipPhase === "in" && toSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={toSrc} alt=""
              className="absolute top-0 left-0 rounded-sm shadow-2xl select-none"
              style={{
                width: canvasRef.current?.style.width   || "100%",
                height: canvasRef.current?.style.height || "100%",
                maxWidth: "calc(100vw - 48px)",
                maxHeight: "calc(100dvh - 116px)",
                animation: `flipIn${flipDir === "next" ? "Next" : "Prev"} ${FLIP_MS}ms ease-out forwards`,
                transformOrigin: flipDir === "next" ? "left center" : "right center",
                willChange: "transform, opacity",
              }}
            />
          )}

          {/* Subtle inner shadow (book-spine depth) */}
          <div
            className="absolute inset-0 pointer-events-none rounded-sm"
            style={{ boxShadow: "inset -6px 0 14px rgba(0,0,0,0.12), inset 6px 0 14px rgba(0,0,0,0.06)" }}
          />
        </div>

        {/* Paywall */}
        {isLocked && <Paywall onUnlock={() => setUnlocked(true)} price={500} />}
      </div>

      {/* ── Side arrows (desktop, auto-hide) ───────────── */}
      {(["prev","next"] as const).map((dir) => {
        const isPrev = dir === "prev";
        return (
          <button
            key={dir}
            onClick={() => navigate(dir)}
            disabled={isPrev ? curPage <= 1 : curPage >= totalPages || isLocked}
            className={clsx(
              "absolute top-1/2 -translate-y-1/2 z-20",
              isPrev ? "left-3" : "right-3",
              "w-11 h-11 rounded-full",
              "bg-white/75 dark:bg-onyx-900/75 backdrop-blur-sm",
              "border border-black/8 dark:border-white/10 shadow-lg",
              "flex items-center justify-center",
              "text-gray-600 dark:text-gray-300",
              "hover:bg-white dark:hover:bg-onyx-800 hover:text-gold-500",
              "active:scale-90 transition-all duration-300",
              "disabled:opacity-0 disabled:pointer-events-none",
              showUI ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            {isPrev
              ? <ChevronRight className="w-5 h-5" />
              : <ChevronLeft  className="w-5 h-5" />}
          </button>
        );
      })}

      {/* ── Bottom bar (auto-hide) ──────────────────────── */}
      <div
        className={clsx(
          "absolute bottom-0 inset-x-0 z-20 flex items-center justify-between px-6 py-3",
          "bg-white/85 dark:bg-onyx-900/85 backdrop-blur-md",
          "border-t border-black/5 dark:border-white/8",
          "transition-all duration-300",
          showUI ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
        )}
        dir="rtl"
      >
        <button
          onClick={() => navigate("prev")}
          disabled={curPage <= 1}
          className="flex items-center gap-1.5 text-sm font-arabic text-gray-600 dark:text-gray-400 hover:text-gold-500 disabled:opacity-30 active:scale-95 transition-all"
        >
          <ChevronRight className="w-4 h-4" /> السابقة
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: Math.min(9, totalPages) }, (_, i) => {
            const frac = totalPages > 1 ? i / (Math.min(9, totalPages) - 1) : 0;
            const mapped = Math.round(frac * (totalPages - 1)) + 1;
            const dist   = Math.abs(mapped - curPage) / totalPages;
            return (
              <button
                key={i}
                onClick={() => setCurPage(mapped)}
                className={clsx(
                  "rounded-full transition-all duration-300",
                  dist < 0.05
                    ? "w-2.5 h-2.5 bg-gold-500"
                    : dist < 0.15
                    ? "w-2 h-2 bg-gold-500/50"
                    : "w-1.5 h-1.5 bg-stone-300 dark:bg-white/20"
                )}
              />
            );
          })}
        </div>

        <button
          onClick={() => navigate("next")}
          disabled={curPage >= totalPages || isLocked}
          className="flex items-center gap-1.5 text-sm font-arabic text-gray-600 dark:text-gray-400 hover:text-gold-500 disabled:opacity-30 active:scale-95 transition-all"
        >
          التالية <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* ── Keyboard shortcuts modal ────────────────────── */}
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
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5">
              {[
                ["→ / PageUp",   "الصفحة السابقة"],
                ["← / PageDown", "الصفحة التالية"],
                ["Home / End",   "أول / آخر صفحة"],
                ["+ / -",        "تكبير / تصغير"],
                ["0",            "إعادة الحجم"],
                ["b",            "إشارة مرجعية"],
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

/* ── Toolbar button ────────────────────────────────────── */
function ToolBtn({ children, onClick, title }: {
  children: React.ReactNode; onClick?: () => void; title?: string;
}) {
  return (
    <button
      onClick={onClick} title={title}
      className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 dark:text-gray-400 hover:bg-black/8 dark:hover:bg-white/10 active:scale-90 transition-all duration-150"
    >
      {children}
    </button>
  );
}
