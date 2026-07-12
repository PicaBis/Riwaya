"use client";

import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

export default function NotFound() {
  const { lang } = useApp();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center" dir={dir}>
      <BookOpen className="w-24 h-24 text-gold-500/15 mb-6" />
      <h1 className={`${fontClass} text-8xl font-bold mb-4 text-transparent`} style={{ backgroundImage: "linear-gradient(135deg, #b8860b 0%, #d4af37 50%, #b8860b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>404</h1>
      <h2 className={`${fontClass} text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3`}>
        {t("notFound.title", lang)}
      </h2>
      <p className={`text-gray-500 dark:text-gray-400 text-sm mb-8 max-w-md ${fontClass}`}>
        {t("notFound.desc", lang)}
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className={`flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white rounded-xl font-medium transition-all ${fontClass}`}
        >
          <ArrowRight className={`w-4 h-4 ${dir === "ltr" ? "rotate-180" : ""}`} />
          {t("notFound.home", lang)}
        </Link>
        <Link
          href="/library"
          className={`px-6 py-3 border border-parchment-300 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-xl text-sm hover:bg-parchment-100 dark:hover:bg-white/5 active:scale-95 transition-all ${fontClass}`}
        >
          {t("notFound.library", lang)}
        </Link>
      </div>

      {/* Helpful quick links */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-8">
        {[
          { href: "/quotes", label: t("nav.quotes", lang) },
          { href: "/faq", label: t("nav.faq", lang) },
          { href: "/how-to-subscribe", label: t("nav.howTo", lang) },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`text-xs text-gray-400 dark:text-gray-500 hover:text-gold-500 dark:hover:text-gold-400 underline underline-offset-4 transition-colors ${fontClass}`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}