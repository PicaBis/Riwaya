"use client";

import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

export function CookieConsent() {
  const { cookieConsent, acceptCookies, rejectCookies, lang } = useApp();

  if (cookieConsent !== null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/20 animate-fade-in" onClick={(e) => e.target === e.currentTarget && null}>
      <div className="w-full max-w-lg bg-white dark:bg-onyx-800 rounded-2xl shadow-2xl border border-parchment-200 dark:border-white/10 p-5 animate-scale-in" dir={lang === "ar" ? "rtl" : "ltr"}>
        <p className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4 ${lang === "ar" ? "font-arabic" : "font-sans"}`}>
          {t("cookies.text", lang)}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={acceptCookies}
            className={`flex-1 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 active:scale-95 text-white text-sm font-medium transition-all duration-150 ${lang === "ar" ? "font-arabic" : "font-sans"}`}
          >
            {t("cookies.accept", lang)}
          </button>
          <button
            onClick={rejectCookies}
            className={`flex-1 py-2.5 rounded-xl border border-parchment-300 dark:border-white/10 text-sm text-gray-500 dark:text-gray-400 hover:bg-parchment-100 dark:hover:bg-white/5 transition-colors ${lang === "ar" ? "font-arabic" : "font-sans"}`}
          >
            {t("cookies.reject", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}