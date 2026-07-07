"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { BookOpen, Wallet, Calendar, Tag, Clock, Eye, Flame, Hourglass } from "lucide-react";
import { Novel } from "@/data/novels";
import { PDFCover } from "./PDFCover";
import { StarRating } from "./StarRating";
import { CCPModal } from "./CCPModal";
import { FavoriteButton } from "./FavoriteButton";
import { useApp } from "@/context/AppContext";
import { t, type Lang } from "@/lib/i18n";
import { prefetchProtectedPdf } from "@/lib/asset-client";

const prefetched = new Set<string>();

function prefetchPdf(novelId: string, pdfFile: string) {
  if (!pdfFile || prefetched.has(pdfFile)) return;
  prefetched.add(pdfFile);
  // The asset route now requires a short-lived signed token (see
  // src/lib/asset-token.ts), so a plain <link rel="prefetch"> — which can't
  // carry a custom header — would just get a 403. Warm the cache with a real
  // fetch() carrying the token instead; the response is still cached the
  // same way for the follow-up load in PDFViewer/PDFCover.
  void prefetchProtectedPdf(novelId, `/api/novel-asset/${pdfFile}`);
}

export function estimateReadTime(novel: Novel, lang: Lang): string {
  const totalPages = novel.freeUntilPage + 80;
  const mins = Math.round(totalPages / 2);
  const minLabel = t("timer.minutes", lang);
  const hrLabel = t("timer.hours", lang);
  if (mins < 60) return `~${mins} ${minLabel}`;
  const hrs = Math.floor(mins / 60);
  const remain = mins % 60;
  return remain > 0 ? `~${hrs} ${hrLabel} ${remain} ${minLabel}` : `~${hrs} ${hrLabel}`;
}

interface NovelCardProps {
  novel: Novel;
  index?: number;
}

export function NovelCard({ novel, index = 0 }: NovelCardProps) {
  const { ratings, setRating, guest, bookmarks, novelViews, lang } = useApp();
  const [showCCP, setShowCCP] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const currentRating = ratings[novel.id] ?? 0;
  const bookmarkPage = bookmarks[novel.id];
  const viewCount = novelViews[novel.id] || 0;
  const isComingSoon = novel.status === "coming-soon";

  useEffect(() => {
    if (isComingSoon || !novel.pdfFile) return;
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            prefetchPdf(novel.id, novel.pdfFile!);
            observer.unobserve(el);
          }
        });
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [novel.id, novel.pdfFile, isComingSoon]);

  return (
    <>
      <article
        ref={cardRef}
        className="group flex flex-col bg-white dark:bg-onyx-800 rounded-2xl overflow-hidden shadow-book hover:shadow-book-hover border border-parchment-200 dark:border-white/8 transition-all duration-300 hover:-translate-y-1 card-glow"
        style={{ animationDelay: `${index * 80}ms` }}
      >
        {/* Cover Image (PDF first page) or Coming-soon teaser */}
        <Link
          href={`/novel/${novel.id}`}
          className="block relative"
          onMouseEnter={() => {
            if (novel.pdfFile) prefetchPdf(novel.id, novel.pdfFile);
          }}
        >
          {isComingSoon ? (
            <div className="relative w-full aspect-[3/4] overflow-hidden">
              {/* Fiery gradient backdrop */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-red-900 to-gold-600" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
              {/* Synchronized diagonal shine */}
              <div className="novel-shine" />
              {/* Floating particles */}
              <div className="absolute inset-0 pointer-events-none">
                <span className="absolute top-[15%] left-[20%] w-1.5 h-1.5 rounded-full bg-amber-300/80 animate-float" style={{ animationDelay: "0s" }} />
                <span className="absolute top-[40%] right-[25%] w-1 h-1 rounded-full bg-gold-400/60 animate-float" style={{ animationDelay: "0.8s" }} />
                <span className="absolute bottom-[25%] left-[35%] w-1 h-1 rounded-full bg-amber-200/70 animate-float" style={{ animationDelay: "1.5s" }} />
                <span className="absolute bottom-[45%] right-[15%] w-1.5 h-1.5 rounded-full bg-gold-300/50 animate-float" style={{ animationDelay: "2.1s" }} />
              </div>
              {/* Cover content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
                <Flame className="w-9 h-9 text-amber-200 mb-3 animate-float drop-shadow-lg" />
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-amber-50 text-[10px] font-arabic font-bold mb-4 border border-white/20">
                  <Hourglass className="w-3 h-3" />
                  {t("comingSoon.writing", lang)}
                </span>
                <h3 className="font-arabic text-2xl font-bold text-white drop-shadow-lg leading-tight px-2">
                  {novel.title}
                </h3>
                {novel.subtitle && (
                  <p className="font-arabic text-sm text-amber-200/80 mt-1.5">{novel.subtitle}</p>
                )}
              </div>
              {/* Spine */}
              <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-black/30 to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="relative w-full aspect-[3/4] overflow-hidden">
              <PDFCover
                pdfUrl={`/api/novel-asset/${novel.pdfFile}`}
                novelId={novel.id}
                title={novel.title}
                className="w-full aspect-[3/4] object-cover"
              />
              {/* Synchronized diagonal shine (same as coming-soon card) */}
              <div className="novel-shine" />
              {/* Floating particles (same as coming-soon card) */}
              <div className="absolute inset-0 pointer-events-none">
                <span className="absolute top-[15%] left-[20%] w-1.5 h-1.5 rounded-full bg-amber-200/70 animate-float" style={{ animationDelay: "0s" }} />
                <span className="absolute top-[40%] right-[25%] w-1 h-1 rounded-full bg-gold-400/50 animate-float" style={{ animationDelay: "0.8s" }} />
                <span className="absolute bottom-[25%] left-[35%] w-1 h-1 rounded-full bg-amber-200/60 animate-float" style={{ animationDelay: "1.5s" }} />
                <span className="absolute bottom-[45%] right-[15%] w-1.5 h-1.5 rounded-full bg-gold-300/40 animate-float" style={{ animationDelay: "2.1s" }} />
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="flex items-center gap-1.5 text-white text-sm font-arabic">
                  <BookOpen className="w-4 h-4" />
                  {t("card.startReading", lang)}
                </span>
              </div>
            </div>
          )}
        </Link>

        {/* Card body */}
        <div className="flex flex-col flex-1 p-5 gap-3" dir="rtl">
          {/* Genre + Year */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-gold-500 font-arabic bg-gold-500/10 px-2.5 py-0.5 rounded-full">
              <Tag className="w-3 h-3" />
              {novel.genre}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <Calendar className="w-3 h-3" />
              {novel.year}
            </span>
          </div>

          {/* Title */}
          <Link href={`/novel/${novel.id}`}>
            <h2 className="font-arabic text-lg font-bold text-gray-900 dark:text-gray-100 leading-snug hover:text-gold-500 dark:hover:text-gold-400 transition-colors line-clamp-2">
              {novel.title}
            </h2>
          </Link>

          {/* Author */}
          <p className="text-sm text-gray-500 dark:text-gray-400 font-arabic -mt-1">
            {novel.author}
          </p>

          {/* Meta line */}
          {isComingSoon ? (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 -mt-1">
              <Hourglass className="w-3 h-3" />
              <span className="font-arabic">{t("card.inAuthorship", lang)}</span>
              {novel.lastUpdated && (
                <>
                  <span className="text-gray-300 dark:text-gray-700">·</span>
                  <span className="font-sans text-gray-400">{novel.lastUpdated}</span>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 -mt-1">
              <Clock className="w-3 h-3" />
              <span className="font-arabic">{t("card.readingDuration", lang)}: {estimateReadTime(novel, lang)}</span>
              {viewCount > 0 && (
                <>
                  <span className="text-gray-300 dark:text-gray-700">·</span>
                  <Eye className="w-3 h-3" />
                  <span className="font-sans">{viewCount}</span>
                </>
              )}
              {novel.lastUpdated && (
                <>
                  <span className="text-gray-300 dark:text-gray-700">·</span>
                  <span className="font-sans">{novel.lastUpdated}</span>
                </>
              )}
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-300 font-arabic leading-relaxed line-clamp-3 flex-1">
            {novel.description}
          </p>

          {/* Reading Progress */}
          {bookmarkPage && bookmarkPage > 1 && (
            <div className="flex items-center gap-2 -mt-1">
              <div className="flex-1 h-1 bg-parchment-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-500 rounded-full progress-bar-fill"
                  style={{ width: `${Math.min(Math.round((bookmarkPage / (novel.freeUntilPage + 80)) * 100), 100)}%` }}
                />
              </div>
              <span className="text-[11px] text-gold-500 font-sans font-medium">
                {Math.min(Math.round((bookmarkPage / (novel.freeUntilPage + 80)) * 100), 100)}%
              </span>
            </div>
          )}

          {/* Star Rating */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-arabic">
              {t("card.yourRating", lang)}:
            </span>
            <StarRating
              initialRating={currentRating}
              onRate={(s) => setRating(novel.id, s)}
              size="sm"
              readOnly={!guest}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-1">
            {isComingSoon ? (
              <Link
                href={`/novel/${novel.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-amber-700 to-gold-600 text-white text-sm font-arabic font-medium rounded-xl transition-all duration-200 active:scale-95 hover:from-amber-600 hover:to-gold-500"
              >
                <Hourglass className="w-4 h-4" />
                {t("card.comingSoonBtn", lang)}
              </Link>
            ) : (
              <Link
                href={`/novel/${novel.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-900 dark:bg-white hover:bg-gold-500 dark:hover:bg-gold-500 text-white dark:text-gray-900 hover:text-white text-sm font-arabic font-medium rounded-xl transition-all duration-200 active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                {t("card.readNow", lang)}
              </Link>
            )}
            <FavoriteButton novelId={novel.id} />
            <button
              onClick={() => setShowCCP(true)}
              title={t("card.supportCCP", lang)}
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-parchment-300 dark:border-white/10 text-gold-500 hover:bg-gold-500/10 active:scale-95 transition-all duration-150"
            >
              <Wallet className="w-4 h-4" />
            </button>
          </div>
        </div>
      </article>

      {showCCP && (
        <CCPModal novelTitle={novel.title} onClose={() => setShowCCP(false)} />
      )}
    </>
  );
}
