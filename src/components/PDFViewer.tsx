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
  Bookmark,
  BookmarkCheck,
  Keyboard,
  X,
} from "lucide-react";
import clsx from "clsx";
import { Paywall } from "./Paywall";
import { useToast } from "./Toast";

/* ────────────────────────────────────────────────────────────
   Types
─────────────────────────────────────────────────────────── */
interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  novelId?: string;
  /** Page after which the paywall activates */
  freeUntilPage?: number;
}

type RenderStatus = "idle" | "loading" | "rendering" | "ready" | "error";

/* ────────────────────────────────────────────────────────────
   Component
─────────────────────────────────────────────────────────── */
export function PDFViewer({
  pdfUrl,
  title,
  novelId = "novel",
  freeUntilPage = 20,
}: PDFViewerProps) {
  const { toast } = useToast();
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const containerRef   = useRef<HTMLDivElement>(null);
  const wrapRef        = useRef<HTMLDivElement>(null);  // scroll container
  const renderTaskRef  = useRef<import("pdfjs-dist").RenderTask | null>(null);
  const preloadRef     = useRef<HTMLCanvasElement>(document.createElement("canvas"));
  const touchStartX    = useRef<number | null>(null);

  const [pdf, setPdf]                 = useState<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages]   = useState(0);
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`riwayati_page_${novelId}`);
      return saved ? parseInt(saved, 10) : 1;
    }
    return 1;
  });
  const [scale, setScale]             = useState(1.2);
  const [status, setStatus]           = useState<RenderStatus>("idle");
  const [pageInput, setPageInput]     = useState(String(currentPage));
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [pageTransition, setPageTransition] = useState<"none" | "fade-out" | "fade-in">("none");
  const [isBookmarked, setIsBookmarked]     = useState(false);

  /* Paywall */
  const [isUnlocked, setIsUnlocked] = useState(() =>
    typeof window !== "undefined"
      ? sessionStorage.getItem("riwayati_unlocked") === "1"
      : false
  );
  const isLocked = !isUnlocked && currentPage > freeUntilPage;

  /* ── Load PDF ────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const loaded = await pdfjsLib.getDocument(pdfUrl).promise;
        if (cancelled) return;

        setPdf(loaded);
        setTotalPages(loaded.numPages);
        setStatus("idle");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => { cancelled = true; };
  }, [pdfUrl]);

  /* ── Render Page ─────────────────────────────────────── */
  const renderPage = useCallback(
    async (pageNum: number, targetScale: number, withTransition = false) => {
      if (!pdf || !canvasRef.current) return;

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      if (withTransition) {
        setPageTransition("fade-out");
        await new Promise((r) => setTimeout(r, 150));
      }

      setStatus("rendering");

      try {
        const page     = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: targetScale });
        const canvas   = canvasRef.current;
        const ctx      = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width  = viewport.width;
        canvas.height = viewport.height;

        const task = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = task;
        await task.promise;

        setStatus("ready");
        if (withTransition) {
          setPageTransition("fade-in");
          setTimeout(() => setPageTransition("none"), 300);
        }

        // ── Preload next page silently ─────────────────
        if (pageNum < (pdf.numPages ?? 0)) {
          pdf.getPage(pageNum + 1).then((nextPage) => {
            const vp  = nextPage.getViewport({ scale: targetScale });
            const cvs = preloadRef.current;
            cvs.width = vp.width;
            cvs.height = vp.height;
            nextPage.render({ canvasContext: cvs.getContext("2d")!, viewport: vp });
          }).catch(() => {});
        }
      } catch (err: unknown) {
        if ((err as { name?: string })?.name !== "RenderingCancelledException") {
          setStatus("error");
        }
      }
    },
    [pdf]
  );

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (!pdf) return;
    const isFirst = isFirstRender.current;
    isFirstRender.current = false;
    renderPage(currentPage, scale, !isFirst);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdf, currentPage, scale]);

  /* ── Save page to localStorage ───────────────────────── */
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`riwayati_page_${novelId}`, String(currentPage));
    }
    setPageInput(String(currentPage));
  }, [currentPage, novelId]);

  /* ── Bookmark ─────────────────────────────────────────── */
  useEffect(() => {
    const key = `riwayati_bookmark_${novelId}`;
    const bm  = localStorage.getItem(key);
    setIsBookmarked(bm === String(currentPage));
  }, [currentPage, novelId]);

  const toggleBookmark = () => {
    const key = `riwayati_bookmark_${novelId}`;
    if (isBookmarked) {
      localStorage.removeItem(key);
      setIsBookmarked(false);
      toast("تم إزالة الإشارة المرجعية", "info");
    } else {
      localStorage.setItem(key, String(currentPage));
      setIsBookmarked(true);
      toast(`تم حفظ الصفحة ${currentPage} كإشارة مرجعية ✓`, "success");
    }
  };

  const goToBookmark = () => {
    const bm = localStorage.getItem(`riwayati_bookmark_${novelId}`);
    if (bm) {
      goTo(parseInt(bm, 10));
      toast(`الانتقال إلى الصفحة ${bm}`, "info");
    }
  };

  /* ── Navigation ───────────────────────────────────────── */
  const goTo = useCallback((page: number) => {
    const p = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(p);
    wrapRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [totalPages]);

  const zoomIn  = () => setScale((s) => Math.min(+(s + 0.2).toFixed(1), 3.0));
  const zoomOut = () => setScale((s) => Math.max(+(s - 0.2).toFixed(1), 0.5));
  const resetZoom = () => setScale(1.2);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  /* ── Touch / Swipe ────────────────────────────────────── */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      // RTL: swipe left → next page, swipe right → prev
      if (delta < 0 && !isLocked) goTo(currentPage + 1);
      else if (delta > 0) goTo(currentPage - 1);
    }
    touchStartX.current = null;
  };

  /* ── Keyboard ─────────────────────────────────────────── */
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "?"|| (e.key === "/" && e.shiftKey)) { setShowShortcuts((v) => !v); return; }
      if (showShortcuts && e.key === "Escape") { setShowShortcuts(false); return; }
      if (isLocked) return;
      if (e.key === "ArrowLeft"  || e.key === "PageDown") goTo(currentPage + 1);
      if (e.key === "ArrowRight" || e.key === "PageUp")   goTo(currentPage - 1);
      if (e.key === "Home")  goTo(1);
      if (e.key === "End")   goTo(totalPages);
      if (e.key === "+"  || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "0") resetZoom();
      if (e.key === "b") toggleBookmark();
      if (e.key === "g") goToBookmark();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [currentPage, totalPages, isLocked, showShortcuts, isBookmarked]); // eslint-disable-line

  /* ── Progress % ───────────────────────────────────────── */
  const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  /* ────────────────────────────────────────────────────────
     Render
  ─────────────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full bg-parchment-100 dark:bg-onyx-950 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Reading Progress Bar ─────────────────────── */}
      <div className="h-0.5 w-full bg-parchment-200 dark:bg-white/5 flex-shrink-0">
        <div
          className="h-full bg-gold-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Toolbar ──────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-white dark:bg-onyx-900 border-b border-parchment-200 dark:border-white/8 flex-shrink-0">
        {/* Left: zoom */}
        <div className="flex items-center gap-1">
          <ToolBtn onClick={zoomOut} title="تصغير (-)">
            <ZoomOut className="w-4 h-4" />
          </ToolBtn>
          <button
            onClick={resetZoom}
            className="px-2 py-1 text-xs font-mono text-gray-600 dark:text-gray-400 hover:bg-parchment-100 dark:hover:bg-white/10 rounded-md transition-colors min-w-[48px] text-center"
          >
            {Math.round(scale * 100)}%
          </button>
          <ToolBtn onClick={zoomIn} title="تكبير (+)">
            <ZoomIn className="w-4 h-4" />
          </ToolBtn>
        </div>

        {/* Center: title + page nav */}
        <div className="flex items-center gap-2 flex-1 justify-center" dir="rtl">
          <span className="hidden sm:block font-arabic text-xs text-gray-400 dark:text-gray-500 truncate max-w-[120px]">
            {title}
          </span>
          <div className="flex items-center gap-1">
            <ToolBtn
              onClick={() => goTo(currentPage - 1)}
              disabled={currentPage <= 1}
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
                onKeyDown={(e) => e.key === "Enter" && goTo(Number(pageInput))}
                onBlur={() => goTo(Number(pageInput))}
                className="w-11 text-center px-1 py-0.5 rounded border border-parchment-300 dark:border-white/15 bg-parchment-50 dark:bg-white/5 text-gray-800 dark:text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-gold-500/50"
              />
              <span className="text-gray-400">/</span>
              <span>{totalPages}</span>
            </div>
            <ToolBtn
              onClick={() => goTo(currentPage + 1)}
              disabled={currentPage >= totalPages || isLocked}
            >
              <ChevronLeft className="w-4 h-4" />
            </ToolBtn>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1">
          <ToolBtn onClick={toggleBookmark} title={isBookmarked ? "إزالة الإشارة (b)" : "إضافة إشارة مرجعية (b)"}>
            {isBookmarked
              ? <BookmarkCheck className="w-4 h-4 text-gold-500" />
              : <Bookmark className="w-4 h-4" />}
          </ToolBtn>
          <ToolBtn onClick={() => setShowShortcuts(true)} title="اختصارات لوحة المفاتيح (?)">
            <Keyboard className="w-4 h-4" />
          </ToolBtn>
          <ToolBtn onClick={toggleFullscreen} title="ملء الشاشة">
            <Maximize2 className="w-4 h-4" />
          </ToolBtn>
        </div>
      </div>

      {/* ── Progress label ───────────────────────────── */}
      <div className="flex items-center justify-center gap-2 py-1 text-xs text-gray-400 dark:text-gray-600 bg-parchment-50 dark:bg-onyx-900/50 border-b border-parchment-100 dark:border-white/4 flex-shrink-0 font-arabic">
        <span>{Math.round(progress)}% من الرواية</span>
        {localStorage.getItem(`riwayati_bookmark_${novelId}`) && (
          <button
            onClick={goToBookmark}
            className="text-gold-500 hover:text-gold-600 transition-colors"
          >
            ← الانتقال للإشارة المرجعية
          </button>
        )}
      </div>

      {/* ── Canvas area ──────────────────────────────── */}
      <div
        ref={wrapRef}
        className="flex-1 overflow-auto flex items-start justify-center p-4 sm:p-8 relative"
      >
        <div className="relative">
          {/* Loading overlay */}
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
                {status === "loading" ? "جارٍ تحميل الرواية…" : ""}
              </span>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="flex flex-col items-center justify-center gap-4 min-h-[60vh] min-w-[300px] text-gray-400">
              <BookOpen className="w-16 h-16 text-gold-500/30" />
              <p className="font-arabic text-center">تعذّر تحميل الملف.</p>
            </div>
          )}

          {/* PDF Canvas */}
          <canvas
            ref={canvasRef}
            className={clsx(
              "rounded-sm shadow-2xl",
              pageTransition === "fade-out" && "opacity-0 scale-[0.98]",
              pageTransition === "fade-in"  && "opacity-100 scale-100",
              pageTransition === "none"     && "opacity-100 scale-100",
              "transition-all duration-200"
            )}
            style={{ maxWidth: "100%" }}
          />
        </div>

        {/* Paywall overlay */}
        {isLocked && <Paywall onUnlock={() => setIsUnlocked(true)} price={500} />}
      </div>

      {/* ── Mobile bottom nav ────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-onyx-900 border-t border-parchment-200 dark:border-white/8 flex-shrink-0 sm:hidden">
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 text-sm font-arabic text-gray-600 dark:text-gray-400 disabled:opacity-30 active:scale-95 transition-transform"
        >
          <ChevronRight className="w-4 h-4" /> السابقة
        </button>
        <span className="text-xs font-sans text-gray-400">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage >= totalPages || isLocked}
          className="flex items-center gap-1 text-sm font-arabic text-gray-600 dark:text-gray-400 disabled:opacity-30 active:scale-95 transition-transform"
        >
          التالية <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* ── Keyboard Shortcuts Modal ─────────────────── */}
      {showShortcuts && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowShortcuts(false)}
          dir="rtl"
        >
          <div
            className="bg-white dark:bg-onyx-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-arabic font-bold text-gray-900 dark:text-gray-100">
                اختصارات لوحة المفاتيح
              </h3>
              <button onClick={() => setShowShortcuts(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {[
                ["→ / PageUp", "الصفحة السابقة"],
                ["← / PageDown", "الصفحة التالية"],
                ["Home", "أول صفحة"],
                ["End", "آخر صفحة"],
                ["+", "تكبير"],
                ["-", "تصغير"],
                ["0", "إعادة الحجم"],
                ["b", "إشارة مرجعية"],
                ["g", "الانتقال للإشارة"],
                ["?", "إظهار/إخفاء هذه النافذة"],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between py-1.5 border-b border-parchment-100 dark:border-white/5 last:border-0">
                  <span className="font-arabic text-sm text-gray-600 dark:text-gray-300">{desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-parchment-100 dark:bg-white/10 text-xs font-mono text-gray-500 dark:text-gray-400 border border-parchment-200 dark:border-white/10">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Utility button ────────────────────────────────── */
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
