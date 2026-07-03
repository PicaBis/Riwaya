"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Wallet, Star, Flame, Sparkles, PenLine } from "lucide-react";
import dynamic from "next/dynamic";
import { Novel } from "@/data/novels";
import { StarRating } from "@/components/StarRating";
import { CCPModal } from "@/components/CCPModal";
import { Comments } from "@/components/Comments";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SkeletonReader } from "@/components/Skeleton";
import { useApp } from "@/context/AppContext";

/* Lazy-load PDF viewer (client only, no SSR) */
const PDFViewer = dynamic(
  () => import("@/components/PDFViewer").then((m) => m.PDFViewer),
  {
    ssr: false,
    loading: () => <SkeletonReader />,
  }
);

interface NovelReadingClientProps {
  novel: Novel;
  startPage?: number;
}

export function NovelReadingClient({ novel, startPage }: NovelReadingClientProps) {
  const { bookmarks, saveBookmark, trackNovelView } = useApp();
  const [showCCP, setShowCCP] = useState(false);

  const track = useCallback(() => {
    void trackNovelView(novel.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [novel.id]);

  useEffect(() => {
    track();
  }, [track]);

  const pdfUrl = `/api/novel-asset/${novel.pdfFile}`;
  const initialPage = startPage || bookmarks[novel.id] || 1;

  const handlePageChange = useCallback(
    (page: number, total?: number) => {
      saveBookmark(novel.id, page);
    },
    [novel.id, saveBookmark]
  );

  const isComingSoon = novel.status === "coming-soon";

  if (isComingSoon) {
    return (
      <>
        <div className="min-h-screen flex flex-col" dir="rtl">
          <Breadcrumb items={[{ label: novel.title }]} />

          {/* ── Coming-soon hero ─────────────────────── */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20">
            <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-book border border-gold-500/20 animate-scale-in">
              {/* Fiery gradient backdrop */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-red-900 to-gold-600" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
              {/* Shimmer sweep */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background:
                    "linear-gradient(115deg, transparent 30%, rgba(255,240,200,0.4) 50%, transparent 70%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 4s linear infinite",
                }}
              />
              {/* Ember dots */}
              <div className="absolute inset-0 pointer-events-none">
                <span className="absolute top-[15%] left-[18%] w-1.5 h-1.5 rounded-full bg-amber-200/70 animate-gentle-pulse" />
                <span className="absolute top-[25%] right-[22%] w-2 h-2 rounded-full bg-gold-400/50 animate-gentle-pulse" style={{ animationDelay: "1s" }} />
                <span className="absolute bottom-[40%] left-[25%] w-1 h-1 rounded-full bg-amber-100/60 animate-gentle-pulse" style={{ animationDelay: "1.8s" }} />
                <span className="absolute bottom-[20%] right-[30%] w-1.5 h-1.5 rounded-full bg-amber-300/50 animate-gentle-pulse" style={{ animationDelay: "0.5s" }} />
              </div>

              <div className="relative z-10 p-8 sm:p-12 text-center">
                <div className="flex justify-center mb-5">
                  <div className="relative">
                    <Flame className="w-12 h-12 text-amber-200 animate-float drop-shadow-lg" />
                    <Sparkles className="w-4 h-4 text-gold-400 absolute -top-1 -right-2 animate-gentle-pulse" />
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-amber-50 text-xs font-arabic font-bold mb-6 border border-white/20">
                  <PenLine className="w-3.5 h-3.5" />
                  هذه الرواية قيد الكتابة
                </span>

                <h1 className="font-arabic text-4xl sm:text-5xl font-bold text-white drop-shadow-lg mb-2 leading-tight">
                  {novel.title}
                </h1>
                {novel.subtitle && (
                  <p className="font-arabic text-base text-amber-200/80 mb-5">{novel.subtitle}</p>
                )}

                <p className="font-arabic text-sm sm:text-base text-amber-50/90 leading-relaxed max-w-xl mx-auto mb-6">
                  {novel.description}
                </p>

                {novel.tags && novel.tags.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-7">
                    {novel.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-white/10 text-amber-100/90 text-xs font-arabic border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-amber-200/70">
                  <span className="h-px w-8 bg-gradient-to-r from-transparent to-amber-200/40" />
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="font-arabic text-sm font-medium">قريباً بإذن الله</span>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="h-px w-8 bg-gradient-to-l from-transparent to-amber-200/40" />
                </div>
              </div>
            </div>

            {/* Author + back */}
            <div className="mt-6 flex flex-col items-center gap-3">
              <p className="text-xs text-gray-400 font-arabic">{novel.author}</p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white dark:bg-onyx-800 border border-parchment-200 dark:border-white/10 text-sm font-arabic text-gray-700 dark:text-gray-300 hover:border-gold-500/40 hover:text-gold-500 transition-all duration-200"
              >
                <ArrowRight className="w-4 h-4" />
                العودة إلى المكتبة
              </Link>
            </div>
          </div>

          {/* ── Comments Section ───────────────────────── */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full" dir="rtl">
            <Comments novelId={novel.id} />
          </div>
        </div>

        {showCCP && (
          <CCPModal novelTitle={novel.title} onClose={() => setShowCCP(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col" dir="rtl">
        <Breadcrumb items={[{ label: novel.title }]} />
        {/* ── PDF Viewer ─────────────────────────────── */}
        <div className="min-h-[50vh] sm:min-h-[65vh] flex flex-col" dir="ltr">
          <PDFViewer
            pdfUrl={pdfUrl}
            title={novel.title}
            freeUntilPage={novel.freeUntilPage}
            initialPage={initialPage}
            onPageChange={handlePageChange}
            preview={novel.description}
            novelId={novel.id}
            chapters={novel.chapters}
          />
        </div>

        {/* ── Comments Section ───────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6" dir="rtl">
          <Comments novelId={novel.id} />
        </div>
      </div>

      {showCCP && (
        <CCPModal novelTitle={novel.title} onClose={() => setShowCCP(false)} />
      )}
    </>
  );
}
