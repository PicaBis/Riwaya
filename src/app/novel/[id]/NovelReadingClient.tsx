"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Wallet, Star, BookOpen, Tag, Calendar, List, Flame, Sparkles, PenLine } from "lucide-react";
import dynamic from "next/dynamic";
import { Novel } from "@/data/novels";
import { StarRating } from "@/components/StarRating";
import { CCPModal } from "@/components/CCPModal";
import { Comments } from "@/components/Comments";
import { ShareButtons } from "@/components/ShareButtons";
import { Achievements } from "@/components/Achievements";
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
  const { ratings, setRating, bookmarks, saveBookmark, guest, trackNovelView } = useApp();
  const pathname = usePathname();
  const [showCCP, setShowCCP] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    trackNovelView(novel.id);
  }, [novel.id, trackNovelView]);
  const currentRating = ratings[novel.id] ?? 0;
  const pdfUrl = `/api/novel-asset/${novel.pdfFile}`;
  const initialPage = startPage || bookmarks[novel.id] || 1;

  const handlePageChange = useCallback(
    (page: number, total?: number) => {
      saveBookmark(novel.id, page);
      if (total && total > 0) {
        setReadingProgress(Math.round((page / total) * 100));
      }
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
        {/* ── Top info bar ────────────────────────────── */}
        <div className="sticky top-16 z-30 bg-white dark:bg-onyx-900 border-b border-parchment-200 dark:border-white/8">
          {/* Row 1: navigation + title */}
          <div className="flex items-center gap-2 px-3 sm:px-6 py-2">
            {/* Back */}
            <Link
              href="/"
              className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 transition-colors font-arabic group flex-shrink-0"
            >
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              <span className="hidden sm:inline">المكتبة</span>
            </Link>

            <span className="text-gray-200 dark:text-gray-700 hidden sm:inline">|</span>

            {/* Novel info */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-500 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="font-arabic font-bold text-gray-900 dark:text-gray-100 text-xs sm:text-sm truncate leading-tight">
                  {novel.title}
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-arabic truncate">
                  {novel.author}
                </p>
              </div>
            </div>

            {/* Desktop extras */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <span className="inline-flex items-center gap-1 text-xs text-gold-500 bg-gold-500/10 px-2 py-0.5 rounded-full font-arabic">
                <Tag className="w-3 h-3" />
                {novel.genre}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <Calendar className="w-3 h-3" />
                {novel.year}
              </span>
            </div>
          </div>

          {/* Row 2: tool buttons */}
          <div className="flex items-center gap-1 px-3 sm:px-6 pb-2 sm:pb-2.5 overflow-x-auto">
            {/* Mobile: genre chip */}
            <span className="sm:hidden inline-flex items-center gap-1 text-[10px] text-gold-500 bg-gold-500/10 px-2 py-0.5 rounded-full font-arabic flex-shrink-0">
              <Tag className="w-2.5 h-2.5" />
              {novel.genre}
            </span>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ms-auto">
              {/* Reading Progress */}
              {readingProgress > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-12 sm:w-20 h-1 sm:h-1.5 bg-parchment-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold-500 rounded-full transition-all duration-500"
                      style={{ width: `${readingProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-400 font-sans">{readingProgress}%</span>
                </div>
              )}

              {/* Rating (always visible but compact on mobile) */}
              <div className="flex items-center gap-0.5 sm:gap-1.5">
                <StarRating
                  novelId={novel.id}
                  initialRating={currentRating}
                  onRate={(s) => setRating(novel.id, s)}
                  size="sm"
                  readOnly={!guest}
                />
              </div>

              {/* CCP */}
              <button
                onClick={() => setShowCCP(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg border border-parchment-300 dark:border-white/10 text-[10px] sm:text-xs font-arabic text-gold-500 hover:bg-gold-500/10 active:scale-95 transition-all duration-150"
              >
                <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">دعم</span>
              </button>

              {/* Share */}
              <ShareButtons title={novel.title} url={pathname} />

              {/* Achievements (desktop only) */}
              <span className="hidden sm:contents"><Achievements /></span>
            </div>
          </div>
        </div>

        {/* ── Novel metadata + chapters ───────────────── */}
        <div className="px-4 sm:px-6 py-5 bg-parchment-50 dark:bg-onyx-900/50 border-b border-parchment-200 dark:border-white/8 animate-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            {/* Description */}
            <div className="flex-1">
              <p className="font-arabic text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {novel.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400 font-arabic">
                <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {novel.genre}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {novel.year}</span>
                {novel.lastUpdated && <span>آخر تحديث: {novel.lastUpdated}</span>}
              </div>
            </div>

            {/* Chapters quick list */}
            {novel.chapters && novel.chapters.length > 0 && (
              <div className="flex-shrink-0 w-full sm:w-64">
                <h3 className="flex items-center gap-2 font-arabic text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
                  <List className="w-4 h-4 text-gold-500" />
                  الفصول ({novel.chapters.length})
                </h3>
                <div className="space-y-1">
                  {novel.chapters.map((ch, i) => {
                    const isLocked = ch.startPage > novel.freeUntilPage;
                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-arabic ${
                          isLocked
                            ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        <span className="truncate">{ch.title}</span>
                        <span className="text-[10px] font-sans flex-shrink-0 ms-2">
                          {isLocked ? "🔒" : `ص ${ch.startPage}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── PDF Viewer ─────────────────────────────── */}
        <div dir="ltr">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8" dir="rtl">
          <Comments novelId={novel.id} />
        </div>
      </div>

      {showCCP && (
        <CCPModal novelTitle={novel.title} onClose={() => setShowCCP(false)} />
      )}
    </>
  );
}
