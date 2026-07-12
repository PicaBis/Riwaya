"use client";

import { useState } from "react";
import Link from "next/link";
import { Quote as QuoteIcon, ArrowRight, Copy, Check, BookOpen } from "lucide-react";
import { quotes } from "@/data/quotes";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

export function QuotesContent() {
  const { lang, playSound } = useApp();
  const ar = lang === "ar";
  const dir = ar ? "rtl" : "ltr";
  const fontClass = ar ? "font-arabic" : "font-sans";
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyQuote = async (i: number) => {
    const q = quotes[i];
    try {
      await navigator.clipboard.writeText(`“${ar ? q.ar : q.en}” — ${ar ? "شجرة سينا" : "Shajarat Sina"}`);
      setCopiedIdx(i);
      playSound?.("success");
      setTimeout(() => setCopiedIdx((c) => (c === i ? null : c)), 2000);
    } catch {}
  };

  return (
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 py-10 ${fontClass}`} dir={dir}>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gold-500 transition-colors mb-6"
      >
        <ArrowRight className={`w-4 h-4 ${!ar ? "rotate-180" : ""}`} />
        {t("quotes.back", lang)}
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-2xl bg-gold-500/10 flex items-center justify-center">
          <QuoteIcon className="w-5 h-5 text-gold-500" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t("quotes.title", lang)}</h1>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{t("quotes.subtitle", lang)}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quotes.map((q, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-2xl border border-parchment-200 dark:border-white/10 bg-white/70 dark:bg-onyx-800/60 p-5 sm:p-6 flex flex-col hover:border-gold-500/30 hover:-translate-y-0.5 transition-all duration-200"
          >
            <QuoteIcon className="absolute -top-1 -end-1 w-14 h-14 text-gold-500/[0.07] rotate-6" />
            <p className="relative text-base font-medium text-gray-800 dark:text-gray-100 leading-relaxed flex-1">
              {ar ? q.ar : q.en}
            </p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-parchment-200/70 dark:border-white/8">
              <span className="text-xs text-gold-600 dark:text-gold-400 font-medium">
                {ar ? "شجرة سينا" : "Shajarat Sina"}
              </span>
              <button
                onClick={() => copyQuote(i)}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gold-600 dark:hover:text-gold-400 transition-colors"
              >
                {copiedIdx === i ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedIdx === i ? t("quotes.copied", lang) : t("quotes.copy", lang)}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/novel/shajarat-sina"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 active:scale-95 text-white text-sm font-medium transition-all"
        >
          <BookOpen className="w-4 h-4" />
          {t("quotes.readNovel", lang)}
        </Link>
      </div>
    </div>
  );
}
