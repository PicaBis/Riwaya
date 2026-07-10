"use client";

import { useEffect, useState } from "react";
import { Maximize2, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

const STORAGE_KEY = "riwayati_fs_asked";

/**
 * One-time, opt-in fullscreen prompt shown on the home page right after the
 * visitor answers the cookie banner. On "Yes" it requests fullscreen (works
 * on the click gesture); the choice is remembered so it never nags again.
 * Intentionally lives only on the home page and never darkens the screen.
 */
export function FullscreenPrompt() {
  const { lang, cookieConsent, hydrated } = useApp();
  const [show, setShow] = useState(false);
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";

  useEffect(() => {
    if (!hydrated) return;
    // Wait until the cookie prompt has been answered so the two never stack.
    if (cookieConsent === null) return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
      if (typeof document !== "undefined" && document.fullscreenElement) return;
      // Fullscreen API must exist (absent on iOS Safari for iPhone).
      if (typeof document !== "undefined" && !document.documentElement.requestFullscreen) {
        localStorage.setItem(STORAGE_KEY, "1");
        return;
      }
    } catch {}
    const id = window.setTimeout(() => setShow(true), 500);
    return () => window.clearTimeout(id);
  }, [hydrated, cookieConsent]);

  const remember = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setShow(false);
  };

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      /* denied / unsupported — silently ignore */
    }
    remember();
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && remember()}
    >
      <div
        className="relative w-full max-w-sm bg-white dark:bg-onyx-800 rounded-3xl shadow-2xl border border-parchment-200 dark:border-white/10 p-6 animate-scale-in text-center"
        dir={dir}
      >
        <button
          onClick={remember}
          aria-label={t("common.close", lang)}
          data-sound="close"
          className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-gold-500/10 flex items-center justify-center mx-auto mb-4">
          <Maximize2 className="w-7 h-7 text-gold-500" />
        </div>

        <h2 className={`text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 ${fontClass}`}>
          {t("fs.title", lang)}
        </h2>
        <p className={`text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5 ${fontClass}`}>
          {t("fs.text", lang)}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={enterFullscreen}
            data-sound="success"
            className={`flex-1 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 active:scale-95 text-white text-sm font-medium transition-all duration-150 ${fontClass}`}
          >
            {t("fs.yes", lang)}
          </button>
          <button
            onClick={remember}
            data-sound="close"
            className={`flex-1 py-2.5 rounded-xl border border-parchment-300 dark:border-white/10 text-sm text-gray-500 dark:text-gray-400 hover:bg-parchment-100 dark:hover:bg-white/5 transition-colors ${fontClass}`}
          >
            {t("fs.no", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
