"use client";

import { useEffect } from "react";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { lang } = useApp();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";

  useEffect(() => {
    console.error(error);
    import("@/lib/error-report").then((m) => m.reportError(error)).catch(() => {});
  }, [error]);

  // Last-resort self-heal: if something we didn't anticipate left a corrupted
  // value in this site's own storage keys, wipe just those (never anything
  // belonging to another site) and reload from a clean slate.
  const clearLocalDataAndRetry = () => {
    try {
      const prefixes = ["riwayati_"];
      for (const store of [localStorage, sessionStorage]) {
        const toRemove: string[] = [];
        for (let i = 0; i < store.length; i++) {
          const key = store.key(i);
          if (key && prefixes.some((p) => key.startsWith(p))) toRemove.push(key);
        }
        toRemove.forEach((k) => store.removeItem(k));
      }
    } catch {}
    window.location.href = "/";
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center" dir={dir}>
      <BookOpen className="w-20 h-20 text-gold-500/20 mb-6" />
      <h2 className={`${fontClass} text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3`}>
        {t("error.title", lang)}
      </h2>
      <p className={`text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-md ${fontClass}`}>
        {t("error.desc", lang)}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className={`px-5 py-2.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white rounded-xl text-sm font-medium transition-all ${fontClass}`}
        >
          {t("error.retry", lang)}
        </button>
        <Link
          href="/"
          className={`px-5 py-2.5 border border-parchment-300 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-xl text-sm hover:bg-parchment-100 dark:hover:bg-white/5 transition-colors ${fontClass}`}
        >
          {t("error.home", lang)}
        </Link>
      </div>
      <button
        onClick={clearLocalDataAndRetry}
        className={`mt-5 text-xs text-gray-400 dark:text-gray-600 hover:text-gold-500 dark:hover:text-gold-400 underline underline-offset-4 transition-colors ${fontClass}`}
      >
        {t("error.clearData", lang)}
      </button>
    </div>
  );
}