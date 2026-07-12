"use client";

import { useEffect, useState, useCallback } from "react";
import { X, ArrowLeft, BookOpen, UserCircle, Coins, Shield, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

const STORAGE_KEY = "riwayati_onboarding_v1";

type SlideKey = "welcome" | "guest" | "subs" | "devcode" | "done";

const SLIDE_ORDER: SlideKey[] = ["welcome", "guest", "subs", "devcode"];

interface IconProps { className?: string }
const SLIDE_ICON: Record<Exclude<SlideKey, "done">, (p: IconProps) => JSX.Element> = {
  welcome: ({ className }: IconProps) => <BookOpen className={className} />,
  guest: ({ className }: IconProps) => <UserCircle className={className} />,
  subs: ({ className }: IconProps) => <Coins className={className} />,
  devcode: ({ className }: IconProps) => <Shield className={className} />,
};

export function OnboardingTour() {
  const { lang, hydrated, guest, soundEnabled } = useApp();
  const ar = lang === "ar";
  const dir = ar ? "rtl" : "ltr";
  const fontClass = ar ? "font-arabic" : "font-sans";

  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState<SlideKey>("welcome");

  useEffect(() => {
    if (!hydrated) return;
    if (guest) return; // returning users who already logged in skip the tour
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        const t = window.setTimeout(() => setOpen(true), 1200);
        return () => window.clearTimeout(t);
      }
    } catch {}
  }, [hydrated, guest]);

  const close = useCallback(() => {
    setOpen(false);
    try { localStorage.setItem(STORAGE_KEY, "dismissed"); } catch {}
  }, []);

  const finish = useCallback(() => {
    setOpen(false);
    try { localStorage.setItem(STORAGE_KEY, "done"); } catch {}
    // soft success tone — synthesized; respect soundEnabled and avoid heavy deps
    if (soundEnabled && typeof window !== "undefined") {
      try {
        const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(660, ctx.currentTime);
          gain.gain.setValueAtTime(0.0001, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
          osc.connect(gain).connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.22);
        }
      } catch {}
    }
  }, [soundEnabled]);

  const next = useCallback(() => {
    setSlide((s) => {
      const i = SLIDE_ORDER.indexOf(s);
      if (i < 0 || i >= SLIDE_ORDER.length - 1) {
        finish();
        return s;
      }
      return SLIDE_ORDER[i + 1];
    });
  }, [finish]);

  const back = useCallback(() => {
    setSlide((s) => {
      const i = SLIDE_ORDER.indexOf(s);
      if (i <= 0) return s;
      return SLIDE_ORDER[i - 1];
    });
  }, []);

  if (!open) return null;

  const stepIndex = Math.max(0, SLIDE_ORDER.indexOf(slide));
  const total = SLIDE_ORDER.length;
  const IconCmp = SLIDE_ICON[slide as Exclude<SlideKey, "done">] ?? SLIDE_ICON.welcome;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      dir={dir}
      role="dialog"
      aria-modal="true"
      aria-label={t("onboarding.welcome", lang)}
    >
      <div
        className={`relative w-full max-w-md bg-white dark:bg-onyx-800 rounded-3xl border border-parchment-200 dark:border-white/10 shadow-2xl overflow-hidden animate-scale-in ${fontClass}`}
      >
        {/* Decorative top bar */}
        <div className="h-1.5 bg-gradient-to-l from-gold-400 via-gold-500 to-gold-600" />

        {/* Close button */}
        <button
          onClick={close}
          className="absolute top-4 end-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          aria-label={t("common.close", lang)}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 pt-7">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {SLIDE_ORDER.map((s, i) => (
              <span
                key={s}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === stepIndex ? "w-6 bg-gold-500" : "w-1.5 bg-gold-500/30"
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="relative w-16 h-16 rounded-2xl bg-gold-500/10 flex items-center justify-center mx-auto mb-4">
            <IconCmp className="w-8 h-8 text-gold-500" />
            <div className="absolute -top-1 -end-1 w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Title + body */}
          <div className="text-center mb-6 min-h-[110px]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {t(`onboarding.${slide}.title`, lang)}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {t(`onboarding.${slide}.desc`, lang)}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={back}
              disabled={stepIndex === 0}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-gold-500/10 transition-colors disabled:opacity-30 disabled:pointer-events-none ${fontClass}`}
            >
              <ArrowLeft className={`w-4 h-4 ${ar ? "rotate-180" : ""}`} />
              {ar ? "السابق" : "Back"}
            </button>

            <span className="text-xs text-gray-400 font-sans tabular-nums">
              {stepIndex + 1} / {total}
            </span>

            {stepIndex === total - 1 ? (
              <button
                onClick={finish}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-l from-gold-600 to-gold-500 text-white shadow-lg shadow-gold-500/20 active:scale-[0.98] transition-all ${fontClass}`}
              >
                {ar ? "يلا، نبدأ!" : "Let's start!"}
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={next}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-l from-gold-600 to-gold-500 text-white shadow-lg shadow-gold-500/20 active:scale-[0.98] transition-all ${fontClass}`}
              >
                {ar ? "التالي" : "Next"}
                <ArrowLeft className={`w-4 h-4 ${ar ? "" : "rotate-180"}`} />
              </button>
            )}
          </div>

          {/* Skip */}
          <button
            onClick={close}
            type="button"
            className={`w-full mt-3 py-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ${fontClass}`}
          >
            {t("onboarding.skip", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}