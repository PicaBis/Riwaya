"use client";

import { TrendingUp, BookOpen } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { novels } from "@/data/novels";

export function ReadingStreak() {
  const { readHistory } = useApp();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  let check = new Date(today);

  while (true) {
    const dayTs = check.getTime();
    const nextDayTs = dayTs + 86400000;
    const hasRead = readHistory.some(
      (e) => e.timestamp >= dayTs && e.timestamp < nextDayTs
    );
    if (hasRead) {
      streak++;
      check = new Date(dayTs - 86400000);
    } else {
      break;
    }
  }

  if (streak === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20" dir="rtl">
      <span className="text-lg">🔥</span>
      <span className="text-xs font-arabic text-gold-600 dark:text-gold-400 font-medium">
        {streak} {streak === 1 ? "يوم" : "أيام"} متتالية
      </span>
    </div>
  );
}