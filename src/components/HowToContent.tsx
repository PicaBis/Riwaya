"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Wallet, Send, KeyRound, Library, MessageCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { AUTHOR } from "@/lib/constants";

const STEPS = [
  { n: "1", icon: BookOpen },
  { n: "2", icon: Wallet },
  { n: "3", icon: Send },
  { n: "4", icon: KeyRound },
] as const;

export function HowToContent() {
  const { lang } = useApp();
  const ar = lang === "ar";
  const dir = ar ? "rtl" : "ltr";
  const fontClass = ar ? "font-arabic" : "font-sans";

  return (
    <div className={`max-w-3xl mx-auto px-4 sm:px-6 py-10 ${fontClass}`} dir={dir}>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gold-500 transition-colors mb-6"
      >
        <ArrowRight className={`w-4 h-4 ${!ar ? "rotate-180" : ""}`} />
        {t("howto.back", lang)}
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-2xl bg-gold-500/10 flex items-center justify-center">
          <KeyRound className="w-5 h-5 text-gold-500" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t("howto.title", lang)}</h1>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{t("howto.subtitle", lang)}</p>

      <div className="relative space-y-4">
        {STEPS.map(({ n, icon: Icon }) => (
          <div
            key={n}
            className="relative flex items-start gap-4 rounded-2xl border border-parchment-200 dark:border-white/10 bg-white/70 dark:bg-onyx-800/60 p-5 hover:border-gold-500/30 transition-colors"
          >
            <div className="relative flex-shrink-0">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-lg shadow-gold-500/20">
                <Icon className="w-5 h-5" />
              </div>
              <span className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] font-bold flex items-center justify-center">
                {n}
              </span>
            </div>
            <div className="min-w-0 pt-0.5">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
                {t(`howto.step${n}Title`, lang)}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {t(`howto.step${n}Desc`, lang)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/library"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 active:scale-95 text-white text-sm font-medium transition-all"
        >
          <Library className="w-4 h-4" />
          {t("howto.cta", lang)}
        </Link>
        <a
          href={`https://wa.me/${AUTHOR.whatsappNumber.replace(/\+/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-parchment-300 dark:border-white/10 text-gray-600 dark:text-gray-300 text-sm font-medium hover:border-gold-500/40 hover:text-gold-600 dark:hover:text-gold-400 transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          {t("howto.needHelp", lang)}
        </a>
      </div>
    </div>
  );
}
