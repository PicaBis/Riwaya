"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Wallet, Star, Flame, Sparkles, PenLine, BookOpen, Tag, Calendar, Clock, Lock, List } from "lucide-react";
import dynamic from "next/dynamic";
import { Novel } from "@/data/novels";
import { StarRating } from "@/components/StarRating";
import { CCPModal } from "@/components/CCPModal";
import { Comments } from "@/components/Comments";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SkeletonReader } from "@/components/Skeleton";
import { PDFCover } from "@/components/PDFCover";
import { PDFErrorBoundary } from "@/components/PDFErrorBoundary";
import { SafeBoundary } from "@/components/SafeBoundary";
import { ShareButtons } from "@/components/ShareButtons";
import { estimateReadTime } from "@/components/NovelCard";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

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
  showSubs?: boolean;
  onShowSubsChange?: (show: boolean) => void;
}

export function NovelReadingClient({ novel, startPage, showSubs: showSubsExternal, onShowSubsChange }: NovelReadingClientProps) {
  const { bookmarks, ratings, setRating, guest, saveBookmark, trackNovelView, readerPrefs, lang, unlocked, devUnlocked, showToast, hydrated } = useApp();
  const [showCCP, setShowCCP] = useState(false);
  const [showSubs, setShowSubs] = useState(false);
  const [pageCurl, setPageCurl] = useState(false);
  const [showOverview, setShowOverview] = useState(!startPage);
  const [entryPage, setEntryPage] = useState(startPage || bookmarks[novel.id] || 1);

  const setShowSubsSafe = useCallback((v: boolean) => {
    setShowSubs(v);
    onShowSubsChange?.(v);
  }, [onShowSubsChange]);

  const track = useCallback(() => {
    void trackNovelView(novel.id);
  }, [novel.id, trackNovelView]);

  useEffect(() => {
    track();
  }, [track]);

  useEffect(() => {
    const handler = () => setShowSubsSafe(true);
    window.addEventListener("riwayati:show-subscription", handler);
    return () => window.removeEventListener("riwayati:show-subscription", handler);
  }, [setShowSubsSafe]);

  const pdfUrl = `/api/novel-asset/${novel.pdfFile}`;
  const hasProgress = (bookmarks[novel.id] || 0) > 1;

  const canRead = hydrated && (guest !== null || devUnlocked);

  const beginReading = (page?: number) => {
    if (!canRead) {
      showToast(t("gate.loginRequired", lang));
      return;
    }
    setShowSubs(false);
    const targetPage = page || bookmarks[novel.id] || 1;
    const isChapterLocked = page ? !unlocked && !devUnlocked && page > novel.freeUntilPage && novel.freeUntilPage > 0 : false;

    if (isChapterLocked) {
      setShowSubs(true);
      return;
    }

    setEntryPage(targetPage);
    setShowOverview(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  /* Deep links (e.g. "Continue Reading" / chapter links) that target a page
     must also respect the reading gate once the app is hydrated. */
  useEffect(() => {
    if (hydrated && startPage && !canRead) {
      setShowOverview(true);
      showToast(t("gate.loginRequired", lang));
    }
  }, [hydrated, startPage, canRead, lang, showToast]);

  const handlePageChange = useCallback(
    (page: number, total?: number) => {
      saveBookmark(novel.id, page);
      setPageCurl(true);
      setTimeout(() => setPageCurl(false), 600);
    },
    [novel.id, saveBookmark]
  );

  const isComingSoon = novel.status === "coming-soon";
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";

  if (isComingSoon) {
    return (
      <>
        <div className="min-h-screen flex flex-col" dir={dir}>
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

                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-amber-50 text-xs font-bold mb-6 border border-white/20 ${fontClass}`}>
                  <PenLine className="w-3.5 h-3.5" />
                  {t("comingSoon.inWriting", lang)}
                </span>

                <h1 className={`text-4xl sm:text-5xl font-bold text-white drop-shadow-lg mb-2 leading-tight ${fontClass}`}>
                  {novel.title}
                </h1>
                {novel.subtitle && (
                  <p className={`text-base text-amber-200/80 mb-5 ${fontClass}`}>{novel.subtitle}</p>
                )}

                <p className={`text-sm sm:text-base text-amber-50/90 leading-relaxed max-w-xl mx-auto mb-6 ${fontClass}`}>
                  {novel.description}
                </p>

                {novel.tags && novel.tags.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-7">
                    {novel.tags.map((tag) => (
                      <span key={tag} className={`px-3 py-1 rounded-full bg-white/10 text-amber-100/90 text-xs border border-white/10 ${fontClass}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className={`flex items-center justify-center gap-2 text-amber-200/70`}>
                  <span className="h-px w-8 bg-gradient-to-r from-transparent to-amber-200/40" />
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className={`text-sm font-medium ${fontClass}`}>{t("comingSoon.soon", lang)}</span>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="h-px w-8 bg-gradient-to-l from-transparent to-amber-200/40" />
                </div>
              </div>
            </div>

            {/* Author + back */}
            <div className="mt-6 flex flex-col items-center gap-3">
              <p className={`text-xs text-gray-400 ${fontClass}`}>{novel.author}</p>
              <Link
                href="/"
                className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white dark:bg-onyx-800 border border-parchment-200 dark:border-white/10 text-sm text-gray-700 dark:text-gray-300 hover:border-gold-500/40 hover:text-gold-500 transition-all duration-200 ${fontClass}`}
              >
                <ArrowRight className={`w-4 h-4 ${dir === "ltr" ? "rotate-180" : ""}`} />
                {t("comingSoon.backToLibrary", lang)}
              </Link>
            </div>
          </div>

        {/* ── Comments Section (Moved for mobile) ───────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full order-first sm:order-last" dir={dir}>
          <Comments novelId={novel.id} />
        </div>
        </div>

        {showCCP && (
          <CCPModal novelTitle={novel.title} onClose={() => setShowCCP(false)} />
        )}
      </>
    );
  }

  const currentRating = ratings[novel.id] ?? 0;

  return (
    <>
      <div className="min-h-screen flex flex-col" dir={dir}>
        <Breadcrumb items={[{ label: novel.title }]} />

        {showOverview || !canRead ? (
          /* ── Overview screen ───────────────────────── */
          <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Cover */}
              <div className="w-full max-w-[220px] mx-auto md:mx-0 flex-shrink-0">
                <div className="rounded-2xl overflow-hidden shadow-book border border-parchment-200 dark:border-white/8">
                  <SafeBoundary name="novel-cover" silent>
                    <PDFCover pdfUrl={pdfUrl} novelId={novel.id} title={novel.title} className="w-full aspect-[3/4]" />
                  </SafeBoundary>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className="inline-flex items-center gap-1 text-xs text-gold-500 bg-gold-500/10 px-2.5 py-0.5 rounded-full">
                    <Tag className="w-3 h-3" />
                    {novel.genre}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {novel.year}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                    <Clock className="w-3 h-3" />
                    {t("card.readingDuration", lang)}: {estimateReadTime(novel, lang)}
                  </span>
                </div>

                <h1 className={`text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1 ${fontClass}`}>
                  {novel.title}
                </h1>
                {novel.subtitle && (
                  <p className={`text-gray-500 dark:text-gray-400 mb-2 ${fontClass}`}>{novel.subtitle}</p>
                )}
                <p className={`text-sm text-gray-500 dark:text-gray-400 mb-4 ${fontClass}`}>{novel.author}</p>

                <p className={`text-gray-700 dark:text-gray-300 leading-relaxed mb-5 ${fontClass}`}>
                  {novel.description}
                </p>

                {novel.tags && novel.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {novel.tags.map((tag) => (
                      <span key={tag} className={`text-xs px-2.5 py-1 rounded-full bg-parchment-100 dark:bg-white/5 border border-parchment-200 dark:border-white/10 text-gray-500 dark:text-gray-400 ${fontClass}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Reading progress */}
                {hasProgress && (
                  <div className="mb-5">
                    <p className={`text-xs text-gray-400 mb-1.5 ${fontClass}`}>{t("overview.readingProgress", lang)}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-parchment-200 dark:bg-white/10 rounded-full overflow-hidden max-w-xs">
                        <div
                          className="h-full bg-gold-500 rounded-full"
                          style={{ width: `${Math.min(Math.round((bookmarks[novel.id] / (novel.freeUntilPage + 80)) * 100), 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gold-500 font-sans font-medium">
                        {t("library.page", lang)} {bookmarks[novel.id]}
                      </span>
                    </div>
                  </div>
                )}

                {/* Rating */}
                <div className="flex items-center gap-2 mb-6">
                  <span className={`text-xs text-gray-400 dark:text-gray-500 ${fontClass}`}>
                    {t("card.yourRating", lang)}:
                  </span>
                  <StarRating
                    initialRating={currentRating}
                    onRate={(s) => setRating(novel.id, s)}
                    size="sm"
                    readOnly={!guest}
                  />
                </div>

                {/* CTA */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => beginReading()}
                    className={`flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white hover:bg-gold-500 dark:hover:bg-gold-500 text-white dark:text-gray-900 hover:text-white rounded-xl font-medium transition-all duration-200 active:scale-95 ${fontClass}`}
                  >
                    <BookOpen className="w-4 h-4" />
                    {hasProgress ? t("library.continue", lang) : t("card.startReading", lang)}
                  </button>
                  <button
                    onClick={() => setShowCCP(true)}
                    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-parchment-300 dark:border-white/10 text-gold-500 hover:bg-gold-500/10 active:scale-95 transition-all duration-150 ${fontClass}`}
                  >
                    <Wallet className="w-4 h-4" />
                    {t("card.supportCCP", lang)}
                  </button>
                  <SafeBoundary name="share" silent>
                    <ShareButtons title={novel.title} url={`/novel/${novel.id}`} />
                  </SafeBoundary>
                </div>
              </div>
            </div>

            {/* Chapters */}
            <div className="mt-10 pt-8 border-t border-parchment-200 dark:border-white/8">
              <h2 className={`flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 ${fontClass}`}>
                <List className="w-4.5 h-4.5 text-gold-500" />
                {t("overview.chapters", lang)}
              </h2>
              {novel.chapters && novel.chapters.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-2">
                  {novel.chapters.map((chapter, i) => {
                    const isLocked = !unlocked && !devUnlocked && chapter.startPage > novel.freeUntilPage && novel.freeUntilPage > 0;
                    return (
                      <button
                        key={i}
                        onClick={() => beginReading(chapter.startPage)}
                        className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white dark:bg-onyx-800/60 border border-parchment-200 dark:border-white/8 hover:border-gold-500/30 hover:shadow-sm transition-all text-start"
                      >
                        <span className={`text-sm text-gray-700 dark:text-gray-300 ${fontClass}`}>{chapter.title}</span>
                        {isLocked && <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className={`text-sm text-gray-400 ${fontClass}`}>{t("overview.noChapters", lang)}</p>
              )}
            </div>
          </div>
        ) : (
          <div className={`min-h-[50vh] sm:min-h-[65vh] flex flex-col reading-theme-${readerPrefs.readingTheme} ${pageCurl ? "animate-page-curl" : ""}`} dir="ltr">
              <PDFErrorBoundary>
                <PDFViewer
                  pdfUrl={pdfUrl}
                  title={novel.title}
                  freeUntilPage={novel.freeUntilPage}
                  initialPage={entryPage}
                  onPageChange={handlePageChange}
                  preview={novel.description}
                  novelId={novel.id}
                  chapters={novel.chapters}
                  readingTheme={readerPrefs.readingTheme}
                  totalPagesOverride={novel.pageCount}
                  showSubscription={showSubs}
                  onSubscriptionClose={() => setShowSubsSafe(false)}
                />
              </PDFErrorBoundary>
          </div>
        )}

        {/* ── Comments ───────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full" dir={dir}>
          <SafeBoundary
            name="novel-comments"
            fallback={
              <p className={`text-center text-sm text-gray-400 dark:text-gray-500 py-8 ${fontClass}`}>
                {t("comments.empty", lang)}
              </p>
            }
          >
            <Comments novelId={novel.id} />
          </SafeBoundary>
        </div>
      </div>

      {showCCP && (
        <CCPModal novelTitle={novel.title} onClose={() => setShowCCP(false)} />
      )}
    </>
  );
}