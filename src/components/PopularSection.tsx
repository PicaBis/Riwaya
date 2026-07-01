"use client";

import { TrendingUp, BookOpen, Clock, Star } from "lucide-react";
import Link from "next/link";
import { novels } from "@/data/novels";
import { useApp } from "@/context/AppContext";

export function PopularSection() {
  const { readHistory, bookmarks, ratings } = useApp();

  const novelStats = novels.map((novel) => {
    const readers = readHistory.filter((e) => e.novelId === novel.id).length;
    const hasBookmark = bookmarks[novel.id] && bookmarks[novel.id] > 1;
    const hasRating = ratings[novel.id] && ratings[novel.id] > 0;
    return { novel, readers, hasBookmark, hasRating };
  });

  const hasData = novelStats.some((s) => s.readers > 0);

  if (!hasData) return null;

  return (
    <div className="mb-10" dir="rtl">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gold-500 rounded-full" />
          <TrendingUp className="w-5 h-5 text-gold-500" />
          <h2 className="font-arabic text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            الأكثر قراءة
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {novelStats.map(({ novel, readers, hasBookmark, hasRating }, i) => (
          <Link
            key={novel.id}
            href={`/novel/${novel.id}`}
            className="group flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-onyx-800 border border-parchment-200 dark:border-white/8 shadow-sm hover:shadow-md hover:border-gold-500/30 transition-all duration-200 animate-fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-gold-500 font-bold font-arabic">{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-arabic font-bold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-gold-500 transition-colors">
                {novel.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400 font-arabic flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {novel.genre}
                </span>
                {readers > 0 && (
                  <span className="text-xs text-gold-500 font-arabic flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {readers} {readers === 1 ? "قارئ" : "قارئ"}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {hasRating && <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />}
              {hasBookmark && <Clock className="w-3.5 h-3.5 text-gold-500/60" />}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}