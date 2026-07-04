"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

export function SplashScreen() {
  const { lang } = useApp();
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 900);
    const removeTimer = setTimeout(() => setVisible(false), 1400);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-parchment-50 dark:bg-onyx-950 transition-opacity duration-500"
      style={{ opacity: fadeOut ? 0 : 1 }}
    >
      <div className="text-center">
        <div
          className="w-20 h-20 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-4"
          style={{ animation: "scaleIn 0.5s ease-out both, gentlePulse 2.5s ease-in-out infinite 0.5s" }}
        >
          <span className={`text-2xl font-bold text-gold-500 ${fontClass}`}>{t("splash.name", lang)}</span>
        </div>
        <div className="flex items-center justify-center gap-1 h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-500/40 animate-gentle-pulse" style={{ animationDelay: "0s" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-gold-500/40 animate-gentle-pulse" style={{ animationDelay: "0.3s" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-gold-500/40 animate-gentle-pulse" style={{ animationDelay: "0.6s" }} />
        </div>
      </div>
    </div>
  );
}
