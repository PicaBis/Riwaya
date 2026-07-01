"use client";

import { BookOpen, Trophy, Clock, Flame, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { novels } from "@/data/novels";

export function ReadingStats() {
  const { readHistory, totalReadingTime, achievements, bookmarks } = useApp();

  const totalPages = Object.values(bookmarks).reduce((a, b) => a + (b > 0 ? b : 0), 0);
  const uniqueNovels = new Set(readHistory.map((e) => e.novelId)).size;
  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;
  const hours = Math.floor(totalReadingTime / 3600);
  const mins = Math.floor((totalReadingTime % 3600) / 60);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  let check = new Date(today);
  while (true) {
    const dayTs = check.getTime();
    const hasRead = readHistory.some((e) => e.timestamp >= dayTs && e.timestamp < dayTs + 86400000);
    if (hasRead) { streak++; check = new Date(dayTs - 86400000); }
    else break;
  }

  const hasData = readHistory.length > 0;

  return (
    <div className="mb-10" dir="rtl">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gold-500 rounded-full" />
          <Trophy className="w-5 h-5 text-gold-500" />
          <h2 className="font-arabic text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            إحصائياتك
          </h2>
        </div>
        <Link href="/library" className="text-xs text-gold-500 hover:text-gold-600 font-arabic ms-auto">
          عرض التفاصيل
        </Link>
      </div>

      {!hasData ? (
        <div className="p-6 rounded-2xl bg-white dark:bg-onyx-800/60 border border-parchment-200 dark:border-white/8 text-center">
          <BookOpen className="w-10 h-10 text-gold-500/20 mx-auto mb-2" />
          <p className="font-arabic text-sm text-gray-400">
            ابدأ بقراءة رواية لتظهر إحصائياتك هنا
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-onyx-800 border border-parchment-200 dark:border-white/8 text-center hover-lift">
            <BookOpen className="w-5 h-5 text-gold-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalPages}</p>
            <p className="text-xs text-gray-400 font-arabic mt-1">صفحة مقروءة</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-onyx-800 border border-parchment-200 dark:border-white/8 text-center hover-lift">
            <Clock className="w-5 h-5 text-gold-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{hours > 0 ? `${hours}س ${mins}د` : `${mins}د`}</p>
            <p className="text-xs text-gray-400 font-arabic mt-1">وقت القراءة</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-onyx-800 border border-parchment-200 dark:border-white/8 text-center hover-lift">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{streak}</p>
            <p className="text-xs text-gray-400 font-arabic mt-1">{streak === 1 ? "يوم متتالي" : "أيام متتالية"}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-onyx-800 border border-parchment-200 dark:border-white/8 text-center hover-lift">
            <TrendingUp className="w-5 h-5 text-gold-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{uniqueNovels}</p>
            <p className="text-xs text-gray-400 font-arabic mt-1">{uniqueNovels === 1 ? "رواية" : "روايات"}</p>
          </div>
        </div>
      )}

      {unlockedCount > 0 && (
        <div className="mt-3 text-center">
          <span className="text-xs text-gray-400 font-arabic">
            🏆 {unlockedCount} / {achievements.length} إنجاز محقق
          </span>
        </div>
      )}
    </div>
  );
}