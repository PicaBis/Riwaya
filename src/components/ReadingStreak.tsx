"use client";

import { TrendingUp, BookOpen } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

export function ReadingStreak() {
  const { readHistory, lang } = useApp();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";

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

  const suffix = streak === 1
    ? t("stats.streakDaySingular", lang)
    : t("stats.streakDayPlural", lang);

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20`} dir={dir}>
      <span className="text-lg">🔥</span>
      <span className={`text-xs text-gold-600 dark:text-gold-400 font-medium ${fontClass}`}>
        {streak} {suffix}
      </span>
    </div>
  );
}
