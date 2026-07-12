"use client";

import { useState } from "react";
import { X, BookOpen, Sparkles, ArrowLeft } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

interface WelcomeGateModalProps {
  onClose: () => void;
  onSkip?: () => void;
}

export function WelcomeGateModal({ onClose, onSkip }: WelcomeGateModalProps) {
  const { lang, loginAsGuest } = useApp();
  const ar = lang === "ar";
  const dir = ar ? "rtl" : "ltr";
  const fontClass = ar ? "font-arabic" : "font-sans";

  const [checking, setChecking] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      setError(t("guest.error", lang));
      return;
    }
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/guest-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, deviceId: "browser" }),
      });
      if (res.status === 409) {
        setChecking(false);
        setError(t("guest.taken", lang));
        return;
      }
    } catch {
      // network error → proceed anyway
    }
    loginAsGuest(trimmed);
    setChecking(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      dir={dir}
    >
      <div
        className={`relative w-full max-w-md bg-white dark:bg-onyx-800 rounded-3xl border border-parchment-200 dark:border-white/10 shadow-2xl overflow-hidden animate-scale-in ${fontClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative top bar */}
        <div className="h-1.5 bg-gradient-to-l from-gold-400 via-gold-500 to-gold-600" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 start-5 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 pt-6">
          {/* Icon + title */}
          <div className="text-center mb-6">
            <div className="relative w-16 h-16 rounded-2xl bg-gold-500/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gold-500" />
              <div className="absolute -top-1 -end-1 w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <h2 className={`text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 ${fontClass}`}>
              {t("welcomeGate.title", lang)}
            </h2>
            <p className={`text-sm text-gray-500 dark:text-gray-400 leading-relaxed ${fontClass}`}>
              {t("welcomeGate.desc", lang)}
            </p>
          </div>

          {/* Benefits */}
          <div className={`space-y-2.5 mb-6 ${ar ? "text-start" : ""}`}>
            {[
              { icon: "📖", key: "benefit1" },
              { icon: "💬", key: "benefit2" },
              { icon: "⭐", key: "benefit3" },
              { icon: "🔖", key: "benefit4" },
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-lg">{benefit.icon}</span>
                <span className={fontClass}>{t("welcomeGate." + benefit.key, lang)}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleGuestLogin} className="space-y-4" dir={dir}>
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder={t("guest.placeholder", lang)}
                autoFocus
                className={`w-full px-4 py-3 rounded-xl border border-parchment-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all ${fontClass}`}
              />
              {error && (
                <p className={`text-xs text-red-500 mt-1.5 ${fontClass}`}>{error}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={checking}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-l from-gold-600 to-gold-500 hover:from-gold-700 hover:to-gold-600 active:scale-[0.98] text-white rounded-xl text-sm font-bold shadow-lg shadow-gold-500/20 transition-all duration-150 disabled:opacity-60 ${fontClass}`}
            >
              {checking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("guest.checking", lang)}
                </>
              ) : (
                <>
                  <ArrowLeft className={`w-4 h-4 ${ar ? "" : "rotate-180"}`} />
                  {t("guest.submit", lang)}
                </>
              )}
            </button>
          </form>

          {/* Skip option */}
          <button
            onClick={onClose}
            className={`w-full mt-3 py-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ${fontClass}`}
          >
            {t("welcomeGate.skip", lang)}
          </button>
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className={`w-full mt-1 py-2 text-xs text-gold-600 hover:text-gold-700 dark:text-gold-400 dark:hover:text-gold-300 font-medium transition-colors ${fontClass}`}
            >
              {ar ? "دخول سريع باسماً عشوائياً" : "Quick entry with a random name"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
