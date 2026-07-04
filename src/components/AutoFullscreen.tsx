"use client";

import { useState, useEffect } from "react";
import { Maximize2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

export function AutoFullscreen() {
  const [show, setShow] = useState(false);
  const { lang, dismissIntro } = useApp();

  useEffect(() => {
    const dismissed = sessionStorage.getItem("riwayati_fs");
    if (!dismissed) setShow(true);
  }, []);

  const triggerFullscreen = async () => {
    try {
      if (document.fullscreenEnabled) {
        await document.documentElement.requestFullscreen();
      }
    } catch {}
    sessionStorage.setItem("riwayati_fs", "1");
    dismissIntro();
    setShow(false);
  };

  const dismiss = () => {
    sessionStorage.setItem("riwayati_fs", "1");
    dismissIntro();
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in cursor-pointer"
      onClick={triggerFullscreen}
    >
      <div className="text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-20 h-20 rounded-3xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center mx-auto mb-5 animate-float">
          <Maximize2 className="w-10 h-10 text-gold-500" />
        </div>
        <h2 className={`text-2xl font-bold text-white mb-2 ${lang === "ar" ? "font-arabic" : "font-sans"}`}>{t("fullscreen.welcome", lang)}</h2>
        <p className={`text-white/60 text-sm mb-6 ${lang === "ar" ? "font-arabic" : "font-sans"}`}>
          {t("fullscreen.click", lang)}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={triggerFullscreen}
            className={`px-6 py-3 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white rounded-xl font-medium text-sm transition-all shadow-lg ${lang === "ar" ? "font-arabic" : "font-sans"}`}
          >
            {t("fullscreen.enter", lang)}
          </button>
          <button
            onClick={dismiss}
            className={`px-6 py-3 border border-white/20 hover:border-white/40 text-white/60 hover:text-white/90 rounded-xl text-sm transition-all ${lang === "ar" ? "font-arabic" : "font-sans"}`}
          >
            {t("fullscreen.skip", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
