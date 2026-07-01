"use client";

import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { novels } from "@/data/novels";
import { NovelCard } from "./NovelCard";

export function ContinueReading() {
  const { bookmarks, readHistory } = useApp();

  const continueNovels = readHistory
    .filter((e) => bookmarks[e.novelId] && bookmarks[e.novelId] > 1)
    .map((e) => {
      const novel = novels.find((n) => n.id === e.novelId);
      if (!novel) return null;
      return { novel, page: bookmarks[e.novelId], timestamp: e.timestamp };
    })
    .filter(Boolean) as { novel: typeof novels[0]; page: number; timestamp: number }[];

  if (continueNovels.length === 0) return null;

  return (
    <div className="mb-10" dir="rtl">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gold-500 rounded-full" />
          <h2 className="font-arabic text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            متابعة القراءة
          </h2>
        </div>
        {continueNovels.length > 1 && (
          <Link
            href="/library"
            className="text-xs text-gold-500 hover:text-gold-600 font-arabic transition-colors ms-auto"
          >
            عرض الكل
            <ArrowLeft className="w-3 h-3 inline-block ms-0.5" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {continueNovels.slice(0, 3).map(({ novel, page, timestamp }) => {
          const pct = Math.min(
            Math.round((page / (novel.freeUntilPage + 80)) * 100),
            100
          );
          const daysAgo = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));

          return (
            <Link
              key={novel.id}
              href={`/novel/${novel.id}`}
              className="group flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-onyx-800 border border-parchment-200 dark:border-white/8 shadow-sm hover:shadow-md hover:border-gold-500/30 transition-all duration-200"
            >
              <div className="w-12 h-16 bg-gold-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-gold-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-arabic font-bold text-sm text-gray-900 dark:text-gray-100 truncate">
                  {novel.title}
                </p>
                <p className="text-xs text-gray-400 font-arabic mt-0.5">
                  {daysAgo === 0 ? "اليوم" : daysAgo === 1 ? "أمس" : `قبل ${daysAgo} أيام`}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1 bg-parchment-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 font-sans">{pct}%</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}