"use client";

import { useState, useEffect } from "react";
import { Trophy, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

export function Achievements() {
  const { achievements, lang } = useApp();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [open]);

  const unlocked = achievements.filter((a) => a.unlockedAt);
  const locked = achievements.filter((a) => !a.unlockedAt);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 transition-colors relative ${fontClass}`}
      >
        <Trophy className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t("achievements.title", lang)}</span>
        {unlocked.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unlocked.length}
          </span>
        )}
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="relative w-full max-w-sm bg-white dark:bg-onyx-800 rounded-2xl shadow-2xl p-5 animate-scale-in max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()} dir={dir}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 ${fontClass}`}>
                <Trophy className="w-5 h-5 text-gold-500" />
                {t("achievements.title", lang)}
              </h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1">
              {[...unlocked, ...locked].map((a) => (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    a.unlockedAt
                      ? "bg-gold-500/5 border-gold-500/20"
                      : "bg-parchment-100 dark:bg-white/5 border-parchment-200 dark:border-white/10 opacity-50"
                  }`}
                >
                  <span className="text-2xl">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold text-gray-900 dark:text-gray-100 ${fontClass}`}>
                      {a.title}
                    </p>
                    <p className={`text-xs text-gray-400 ${fontClass}`}>
                      {a.description}
                    </p>
                  </div>
                  {a.unlockedAt ? (
                    <span className={`text-[11px] text-gold-500 bg-gold-500/10 px-2 py-0.5 rounded-full ${fontClass}`}>
                      ✓
                    </span>
                  ) : (
                    <span className={`text-[11px] text-gray-400 ${fontClass}`}>🔒</span>
                  )}
                </div>
              ))}
            </div>

            <p className={`text-xs text-gray-400 text-center mt-4 ${fontClass}`}>
              {unlocked.length} / {achievements.length} {t("achievements.count", lang)}
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}