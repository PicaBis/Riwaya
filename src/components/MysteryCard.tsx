"use client";

import { Lock, Sparkles, HelpCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

/**
 * Anonymous "coming in the future" teaser card. No title, author, or details
 * are revealed — the whole card reads as a locked mystery, matching the novel
 * grid's dimensions so the layout stays balanced.
 */
export function MysteryCard() {
  const { lang } = useApp();
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";

  return (
    <article
      className="group flex flex-col bg-white dark:bg-onyx-800 rounded-2xl overflow-hidden shadow-book border border-parchment-200 dark:border-white/8 transition-all duration-300 hover:-translate-y-1 card-glow select-none"
      aria-label={t("mystery.aria", lang)}
    >
      {/* Cover — obscured mystery */}
      <div className="relative w-full aspect-[3/4] overflow-hidden">
        {/* Dark mysterious backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-onyx-900 via-onyx-800 to-amber-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(212,175,55,0.12),transparent_60%)]" />
        {/* Heavy blur veil */}
        <div className="absolute inset-0 backdrop-blur-md" />
        {/* Synchronized shine (same as other cards) */}
        <div className="novel-shine" />
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          <span className="absolute top-[18%] left-[22%] w-1.5 h-1.5 rounded-full bg-gold-300/50 animate-float" style={{ animationDelay: "0s" }} />
          <span className="absolute top-[45%] right-[20%] w-1 h-1 rounded-full bg-gold-400/40 animate-float" style={{ animationDelay: "0.9s" }} />
          <span className="absolute bottom-[24%] left-[38%] w-1 h-1 rounded-full bg-amber-200/40 animate-float" style={{ animationDelay: "1.6s" }} />
        </div>

        {/* Center content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gold-500/20 blur-xl rounded-full animate-gentle-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <HelpCircle className="w-8 h-8 text-gold-300/80" />
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-gold-100 text-[11px] font-bold mb-3 border border-white/15 ${fontClass}`}>
            <Sparkles className="w-3 h-3" />
            {t("mystery.badge", lang)}
          </span>
          <p className={`text-3xl font-bold text-white/90 tracking-[0.3em] drop-shadow-lg ${fontClass}`}>؟؟؟</p>
        </div>

        {/* Spine */}
        <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-black/30 to-transparent pointer-events-none" />
      </div>

      {/* Body — obscured placeholder rows */}
      <div className="flex flex-col flex-1 p-5 gap-3" dir="rtl">
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1 text-xs text-gold-500/70 bg-gold-500/10 px-2.5 py-0.5 rounded-full ${fontClass}`}>
            <Lock className="w-3 h-3" />
            {t("mystery.locked", lang)}
          </span>
        </div>

        {/* Blurred skeleton title/description */}
        <div className="space-y-2 mt-1">
          <div className="h-4 w-3/4 rounded bg-parchment-200 dark:bg-white/10 blur-[2px]" />
          <div className="h-3 w-1/2 rounded bg-parchment-200 dark:bg-white/10 blur-[2px]" />
          <div className="h-3 w-full rounded bg-parchment-100 dark:bg-white/5 blur-[2px] mt-3" />
          <div className="h-3 w-5/6 rounded bg-parchment-100 dark:bg-white/5 blur-[2px]" />
        </div>

        <div className="mt-auto pt-2">
          <div className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-parchment-300 dark:border-white/10 text-gold-500/70 text-sm ${fontClass}`}>
            <Lock className="w-4 h-4" />
            {t("mystery.reveal", lang)}
          </div>
        </div>
      </div>
    </article>
  );
}
