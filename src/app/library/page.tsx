"use client";

import Link from "next/link";
import { BookOpen, ArrowRight, Clock, Star } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { novels } from "@/data/novels";

export default function LibraryPage() {
  const { bookmarks, ratings, readHistory } = useApp();

  const hasBookmarks = Object.keys(bookmarks).length > 0;
  const hasRatings = Object.keys(ratings).length > 0;

  const bookmarkedNovels = novels.filter((n) => bookmarks[n.id] && bookmarks[n.id] > 1);
  const ratedNovels = novels.filter((n) => ratings[n.id] && ratings[n.id] > 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gold-500 transition-colors font-arabic"
        >
          <ArrowRight className="w-4 h-4" />
          الرئيسية
        </Link>
        <span className="text-gray-300 dark:text-gray-700">|</span>
        <h1 className="font-arabic text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          مكتبتي
        </h1>
      </div>

      {!hasBookmarks && !hasRatings ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <BookOpen className="w-16 h-16 mb-4 opacity-30" />
          <p className="font-arabic text-lg">مكتبتك فارغة</p>
          <p className="font-arabic text-sm mt-1 text-gray-300 dark:text-gray-600">
            ابدأ بقراءة رواية لتظهر هنا
          </p>
          <Link
            href="/"
            className="mt-6 px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-arabic text-sm font-medium transition-all active:scale-95"
          >
            تصفح الروايات
          </Link>
        </div>
      ) : (
        <>
          {/* Continue Reading */}
          {bookmarkedNovels.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-gold-500 rounded-full" />
                <Clock className="w-4 h-4 text-gold-500" />
                <h2 className="font-arabic font-bold text-gray-900 dark:text-gray-100">
                  متابعة القراءة
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarkedNovels.map((novel) => {
                  const page = bookmarks[novel.id];
                  const pct = Math.min(Math.round((page / (novel.freeUntilPage + 80)) * 100), 100);
                  const historyEntry = readHistory.find((e) => e.novelId === novel.id);
                  const daysAgo = historyEntry
                    ? Math.floor((Date.now() - historyEntry.timestamp) / (1000 * 60 * 60 * 24))
                    : null;

                  return (
                    <Link
                      key={novel.id}
                      href={`/novel/${novel.id}`}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-onyx-800/60 border border-parchment-200 dark:border-white/8 shadow-sm hover:shadow-md hover:border-gold-500/30 transition-all duration-200 group"
                    >
                      <div className="w-12 h-16 bg-gold-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-gold-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-arabic font-bold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-gold-500 transition-colors">
                          {novel.title}
                        </p>
                        <p className="text-xs text-gray-400 font-arabic mt-0.5">
                          الصفحة {page}
                          {daysAgo !== null && (
                            <span>
                              {" "}·{" "}
                              {daysAgo === 0 ? "اليوم" : daysAgo === 1 ? "أمس" : `قبل ${daysAgo} أيام`}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1 bg-parchment-200 dark:bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gold-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[11px] text-gray-400 font-sans">{pct}%</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rated Novels */}
          {ratedNovels.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-gold-500 rounded-full" />
                <Star className="w-4 h-4 text-gold-500" />
                <h2 className="font-arabic font-bold text-gray-900 dark:text-gray-100">
                  الروايات المقيمة
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ratedNovels.map((novel) => (
                  <Link
                    key={novel.id}
                    href={`/novel/${novel.id}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-onyx-800/60 border border-parchment-200 dark:border-white/8 shadow-sm hover:shadow-md hover:border-gold-500/30 transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                      <Star className="w-5 h-5 text-gold-500 fill-gold-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-arabic font-bold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-gold-500 transition-colors">
                        {novel.title}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < (ratings[novel.id] || 0) ? "text-gold-500 fill-gold-500" : "text-gray-300 dark:text-gray-600"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* All novels with interaction data */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-gold-500 rounded-full" />
              <BookOpen className="w-4 h-4 text-gold-500" />
              <h2 className="font-arabic font-bold text-gray-900 dark:text-gray-100">
                جميع الروايات
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {novels.map((novel) => {
                const hasBookmark = bookmarks[novel.id] && bookmarks[novel.id] > 1;
                const hasRating = ratings[novel.id] && ratings[novel.id] > 0;

                return (
                  <Link
                    key={novel.id}
                    href={hasBookmark ? `/novel/${novel.id}` : `/novel/${novel.id}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-onyx-800/60 border border-parchment-200 dark:border-white/8 shadow-sm hover:shadow-md hover:border-gold-500/30 transition-all duration-200 group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-gold-500 font-bold font-arabic">{novel.title.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-arabic font-bold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-gold-500 transition-colors">
                        {novel.title}
                      </p>
                      <p className="text-xs text-gray-400 font-arabic">{novel.genre} · {novel.year}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {hasRating && <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />}
                      {hasBookmark && <Clock className="w-3.5 h-3.5 text-gold-500/60" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}