"use client";

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
import { ReadingSettings } from "./ReadingSettings";

interface BookViewerProps {
   pdfUrl: string;
   title: string;
   novelId?: string;
   freeUntilPage?: number;
   lockedChapterTitle?: string;
   lockedChapterTeaser?: string;
   lockedChapterPreview?: string;
 }
type FlipDir   = "next" | "prev";
type FlipPhase = "idle" | "out" | "in";
type LoadState = "loading" | "ready" | "error";

const FLIP_MS       = 300;
const HIDE_DELAY_MS = 3000;

export function BookViewer({
   pdfUrl,
   title,
   novelId = "novel",
   freeUntilPage = 20,
   lockedChapterTitle,
   lockedChapterTeaser,
   lockedChapterPreview,
 }: BookViewerProps) {
  const { toast } = useToast();

  const wrapRef      = useRef<HTMLDivElement>(null);
  const stageRef     = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const hiddenRef    = useRef<HTMLCanvasElement>(null);
  const renderRef    = useRef<import("pdfjs-dist").RenderTask | null>(null);
  const touchStartX  = useRef<number | null>(null);
  const hideTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didInit      = useRef(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdf, setPdf]               = useState<any>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [curPage, setCurPage]       = useState(() => {
    try { return parseInt(localStorage.getItem(`rp_${novelId}`) || "1", 10); }
    catch { return 1; }
  });
  const [scale, setScale]           = useState(1.2);
  const [loadState, setLoadState]   = useState<LoadState>("loading");

  const [flipPhase, setFlipPhase]   = useState<FlipPhase>("idle");
  const [flipDir, setFlipDir]       = useState<FlipDir>("next");
  const [fromSrc, setFromSrc]       = useState<string | null>(null);
  const [toSrc,   setToSrc]         = useState<string | null>(null);
  const [pendingPg, setPendingPg]   = useState<number | null>(null);

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
      } catch {
        if (!dead) setLoadState("error");
      }
    })();

    return () => { dead = true; };
  }, [pdfUrl]);

  /* ══════════════════════════════════════════════════
     2.  Render page
  ══════════════════════════════════════════════════ */
  const renderPage = useCallback(
    async (pageNum: number, targetScale: number) => {
      if (!pdf) return;
      if (renderRef.current) {
        renderRef.current.cancel();
        renderRef.current = null;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        const page     = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: targetScale });
        const ctx      = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width  = viewport.width;
        canvas.height = viewport.height;

        const task = page.render({ canvasContext: ctx, viewport });
        renderRef.current = task;
        await task.promise;
        setLoadState("ready");
      } catch (err: unknown) {
        if (
          typeof err === "object" &&
          err !== null &&
          "name" in err &&
          (err as { name: string }).name !== "RenderingCancelledException"
        ) {
          setLoadState("error");
        }
      }
    },
    [pdf]
  );

  /* ── Re-render on page/scale/pdf change ─────────── */
  useEffect(() => {
    if (!pdf || flipPhase !== "idle") return;
    renderPage(curPage, scale);
    try { localStorage.setItem(`rp_${novelId}`, String(curPage)); } catch {}
    try { setBM(localStorage.getItem(`rb_${novelId}`) === String(curPage)); } catch {}
    didInit.current = true;
  }, [pdf, curPage, scale, flipPhase, renderPage, novelId]);

  /* ══════════════════════════════════════════════════
     3.  Auto-scale on resize
  ══════════════════════════════════════════════════ */
  useEffect(() => {
    if (!stageRef.current || !pdf) return;
    let dead = false;

    const ro = new ResizeObserver(async () => {
      if (dead || flipPhase !== "idle") return;
      try {
        await new Promise((r) => requestAnimationFrame(r));
        if (dead) return;
        const page = await pdf.getPage(curPage);
        const vp1  = page.getViewport({ scale: 1 });
        const avH  = Math.max(stageRef.current!.clientHeight - 40, 200);
        const avW  = Math.max(stageRef.current!.clientWidth  - 60, 200);
        const s    = Math.max(0.4, Math.min(avH / vp1.height, avW / vp1.width, 2.4));
        if (!dead) setScale(s);
      } catch { /* ignore */ }
    });

    ro.observe(stageRef.current);
    return () => { dead = true; ro.disconnect(); };
  }, [pdf, curPage, flipPhase]);

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
        setCurPage(newPage);
        return;
      }

      const fromUrl = canvasRef.current.toDataURL("image/jpeg", 0.9);

      try {
        // Pre-render destination on hidden canvas
        const nextPage = await pdf.getPage(newPage);
        const vp       = nextPage.getViewport({ scale });
        hiddenRef.current.width  = vp.width;
        hiddenRef.current.height = vp.height;
        await nextPage.render({
          canvasContext: hiddenRef.current.getContext("2d")!,
          viewport: vp,
        }).promise;
      } catch { /* will re-render naturally after flip */ }

      const toUrl = hiddenRef.current.toDataURL("image/jpeg", 0.9);

      setFromSrc(fromUrl);
      setToSrc(toUrl);
      setFlipDir(dir);
      setPendingPg(newPage);
      setFlipPhase("out");
    },
    [pdf, curPage, totalPages, scale, flipPhase, loadState, isUnlocked, freeUntilPage]
  );

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

  const onStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    revealUI();
    if (isLocked) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    if (x < width * 0.28) navigate("next");
    else if (x > width * 0.72) navigate("prev");
  };

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      revealUI();
      if (e.key === "?") { setShowHelp((v) => !v); return; }
      if (e.key === "Escape") { setShowHelp(false); return; }
      if (isLocked) return;
      if (e.key === "ArrowLeft"  || e.key === "PageDown") navigate("next");
      if (e.key === "ArrowRight" || e.key === "PageUp")   navigate("prev");
      if (e.key === "Home") setCurPage(1);
      if (e.key === "End")  setCurPage(totalPages);
      if (e.key === "+" || e.key === "=") setScale((s) => Math.min(+(s + 0.15).toFixed(2), 2.5));
      if (e.key === "-") setScale((s) => Math.max(+(s - 0.15).toFixed(2), 0.4));
      if (e.key === "0") setScale(1.2);
      if (e.key === "b") toggleBM();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, revealUI, isLocked, totalPages]);

  const toggleBM = () => {
    const key = `rb_${novelId}`;
    if (isBookmarked) {
      try { localStorage.removeItem(key); } catch {}
      setBM(false);
      toast("تم إزالة الإشارة المرجعية", "info");
    } else {
      try { localStorage.setItem(key, String(curPage)); } catch {}
      setBM(true);
      toast(`تم حفظ الصفحة ${curPage}`, "success");
    }
  };

  const goToBM = () => {
    try {
      const bm = localStorage.getItem(`rb_${novelId}`);
      if (bm) { setCurPage(parseInt(bm, 10)); toast("الانتقال للإشارة", "info"); }
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
      {/* Progress bar */}
      <div className="h-0.5 flex-shrink-0 bg-stone-200 dark:bg-white/5 z-10">
        <div
          className="h-full bg-gold-500 transition-[width] duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Top toolbar (auto-hide) */}
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
        <div className="flex items-center gap-0.5">
          <ToolBtn onClick={() => setScale((s) => Math.max(+(s-0.15).toFixed(2), 0.4))}>
            <ZoomOut className="w-3.5 h-3.5" />
          </ToolBtn>
          <button
            onClick={() => setScale(1.2)}
            className="px-2 py-0.5 text-[11px] font-mono text-gray-500 dark:text-gray-400 hover:bg-black/6 dark:hover:bg-white/10 rounded min-w-[40px] text-center transition-colors"
          >
            {Math.round(scale * 100)}%
          </button>
          <ToolBtn onClick={() => setScale((s) => Math.min(+(s+0.15).toFixed(2), 2.5))}>
            <ZoomIn className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn onClick={() => setScale(1.2)} title="ملاءمة (0)">
            <RotateCcw className="w-3 h-3" />
          </ToolBtn>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
          <span className="hidden sm:block font-arabic truncate max-w-[130px]">{title}</span>
          <span className="font-mono">{curPage} / {totalPages}</span>
        </div>

        <div className="flex items-center gap-0.5">
          {isBookmarked && (
            <ToolBtn onClick={goToBM} title="اذهب للإشارة">
              <BookmarkCheck className="w-3.5 h-3.5 text-gold-500" />
            </ToolBtn>
          )}
          <ToolBtn onClick={toggleBM} title={isBookmarked ? "إزالة إشارة (b)" : "حفظ إشارة (b)"}>
            {isBookmarked
              ? <BookmarkCheck className="w-3.5 h-3.5 text-gold-500" />
              : <Bookmark className="w-3.5 h-3.5" />}
          </ToolBtn>
          <ToolBtn onClick={() => setShowHelp(true)} title="اختصارات (?)">
            <Keyboard className="w-3.5 h-3.5" />
          </ToolBtn>
          <ReadingSettings scale={scale} onScaleChange={(s) => setScale(s)} />
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

      {/* ══ STAGE ═══════════════════════════════════════ */}
      <div
        ref={stageRef}
        className="flex-1 flex items-center justify-center overflow-hidden relative"
        style={{ perspective: "1400px" }}
        onClick={onStageClick}
      >
        {/* Loading */}
        {loadState === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-stone-400 z-10 bg-[#F2ECE0] dark:bg-[#0E0D0B]">
            <div className="w-12 h-12 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
            <span className="font-arabic text-sm">جارٍ تحميل الرواية…</span>
          </div>
        )}

        {/* Error */}
        {loadState === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-stone-400 z-10">
            <BookOpen className="w-14 h-14 opacity-30" />
            <p className="font-arabic">تعذّر تحميل الملف</p>
          </div>
        )}

        {/* Canvas + flip images */}
        <div className="relative" style={{ transformStyle: "preserve-3d" }}>
          <canvas
            ref={canvasRef}
            className={clsx(
              "rounded-sm shadow-2xl block select-none transition-opacity duration-300",
              loadState === "ready" ? "opacity-100" : "opacity-0"
            )}
            style={{ maxHeight: "calc(100dvh - 116px)", maxWidth: "calc(100vw - 48px)" }}
          />

          <canvas
            ref={hiddenRef}
            className="absolute top-0 left-0 opacity-0 pointer-events-none"
            aria-hidden
          />

          {flipPhase === "out" && fromSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fromSrc} alt=""
              className="absolute top-0 left-0 rounded-sm shadow-2xl select-none"
              style={{
                width: canvasRef.current?.style.width || "100%",
                height: canvasRef.current?.style.height || "100%",
                maxWidth: "calc(100vw - 48px)",
                maxHeight: "calc(100dvh - 116px)",
                animation: `flipOut${flipDir === "next" ? "Next" : "Prev"} ${FLIP_MS}ms ease-in forwards`,
                transformOrigin: flipDir === "next" ? "left center" : "right center",
                willChange: "transform, opacity",
              }}
            />
          )}

          {flipPhase === "in" && toSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={toSrc} alt=""
              className="absolute top-0 left-0 rounded-sm shadow-2xl select-none"
              style={{
                width: canvasRef.current?.style.width || "100%",
                height: canvasRef.current?.style.height || "100%",
                maxWidth: "calc(100vw - 48px)",
                maxHeight: "calc(100dvh - 116px)",
                animation: `flipIn${flipDir === "next" ? "Next" : "Prev"} ${FLIP_MS}ms ease-out forwards`,
                transformOrigin: flipDir === "next" ? "left center" : "right center",
                willChange: "transform, opacity",
              }}
            />
          )}

          <div
            className="absolute inset-0 pointer-events-none rounded-sm"
            style={{ boxShadow: "inset -6px 0 14px rgba(0,0,0,0.12), inset 6px 0 14px rgba(0,0,0,0.06)" }}
          />
        </div>

{/* Paywall */}
         {isLocked && (
           <Paywall
             onUnlock={() => setUnlocked(true)}
             price={500}
             chapterTitle={lockedChapterTitle}
             chapterTeaser={lockedChapterTeaser}
             previewText={lockedChapterPreview}
           />
         )}
      </div>

      {/* Side arrows */}
      {(["prev", "next"] as const).map((dir) => {
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

      {/* Bottom bar (auto-hide) */}
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

      {/* Keyboard shortcuts modal */}
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
