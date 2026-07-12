"use client";

import { useEffect, useState } from "react";
import { Quote as QuoteIcon, RefreshCw, Copy, Check } from "lucide-react";
import { quotes } from "@/data/quotes";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

/**
 * Elegant "Quote of the day" strip for the home page. The daily index is
 * computed client-side (in an effect) so the server and client markup match
 * and there's no hydration mismatch. Purely additive.
 */
export function QuoteOfDay() {
  const { lang, playSound } = useApp();
  const ar = lang === "ar";
  const dir = ar ? "rtl" : "ltr";
  const fontClass = ar ? "font-arabic" : "font-sans";

  const [idx, setIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Deterministic day-of-year based pick, so it changes daily.
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    setIdx(dayOfYear % quotes.length);
  }, []);

  if (idx === null) return null;
  const quote = quotes[idx];
  const text = ar ? quote.ar : quote.en;

  const nextQuote = () => {
    playSound?.("click");
    setCopied(false);
    setIdx((prev) => ((prev ?? 0) + 1) % quotes.length);
  };

  const copyQuote = async () => {
    try {
      await navigator.clipboard.writeText(`“${text}” — ${ar ? "شجرة سينا" : "Shajarat Sina"}`);
      setCopied(true);
      playSound?.("success");
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div
      dir={dir}
      className="relative overflow-hidden rounded-2xl border border-gold-500/20 bg-gradient-to-br from-gold-500/[0.06] via-white/40 to-transparent dark:from-gold-500/[0.08] dark:via-white/[0.02] dark:to-transparent p-5 sm:p-6"
    >
      <QuoteIcon className="absolute -top-2 -start-2 w-16 h-16 text-gold-500/10 rotate-6" />
      <div className="relative flex items-start gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold-500/10 text-gold-500 flex-shrink-0">
          <QuoteIcon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[11px] font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400 ${fontClass}`}>
              {t("quote.badge", lang)}
            </span>
          </div>
          <p className={`text-base sm:text-lg font-medium text-gray-800 dark:text-gray-100 leading-relaxed ${fontClass}`}>
            {text}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={nextQuote}
              data-sound="click"
              className={`inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gold-600 dark:hover:text-gold-400 transition-colors ${fontClass}`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t("quote.next", lang)}
            </button>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <button
              onClick={copyQuote}
              className={`inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gold-600 dark:hover:text-gold-400 transition-colors ${fontClass}`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t("quotes.copied", lang) : t("quotes.copy", lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
