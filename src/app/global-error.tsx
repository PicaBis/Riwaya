"use client";

import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [lang, setLang] = useState<Lang>("ar");
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    try {
      const saved = localStorage.getItem("riwayati_lang") as Lang | null;
      if (saved === "en" || saved === "ar") setLang(saved);
    } catch {}
  }, []);

  return (
    <html lang={lang} dir={dir}>
      <body className="bg-parchment-50 dark:bg-onyx-950 min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <BookOpen className="w-20 h-20 text-gold-500/20 mx-auto mb-6" />
          <h1 className={`${fontClass} text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3`}>
            {t("error.globalTitle", lang)}
          </h1>
          <p className={`text-gray-500 dark:text-gray-400 text-sm mb-6 ${fontClass}`}>
            {t("error.globalDesc", lang)}
          </p>
          <button
            onClick={reset}
            className={`px-6 py-3 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white rounded-xl text-sm font-medium transition-all ${fontClass}`}
          >
            {t("error.refresh", lang)}
          </button>
        </div>
      </body>
    </html>
  );
}