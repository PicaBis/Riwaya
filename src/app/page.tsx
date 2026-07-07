"use client";

import Link from "next/link";
import { Sparkles, BookOpen, Feather, ChevronDown, ArrowLeft, Library, ShieldCheck, Smartphone, RefreshCw } from "lucide-react";
import { novels } from "@/data/novels";
import { NovelCard } from "@/components/NovelCard";
import { ContinueReading } from "@/components/ContinueReading";
import { PopularSection } from "@/components/PopularSection";
import { ReadingStats } from "@/components/ReadingStats";
import { Reveal } from "@/components/Reveal";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

export default function HomePage() {
  const { lang } = useApp();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4">

      {/* ── Hero Banner ────────────────────────────── */}
      <section className="relative overflow-hidden mb-8 sm:mb-10 -mt-8 sm:-mt-10 pt-10 sm:pt-20 pb-14 sm:pb-20">
        <div className="absolute inset-0 pointer-events-none hero-anim-bg">
          {/* Floating golden orbs */}
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          {/* Drifting particles */}
          <div className="hero-particle hero-particle-1" />
          <div className="hero-particle hero-particle-2" />
          <div className="hero-particle hero-particle-3" />
          <div className="hero-particle hero-particle-4" />
          <div className="hero-particle hero-particle-5" />
          {/* Soft glow halos */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold-500/[0.04] rounded-full blur-3xl" />
          <div className="absolute bottom-24 left-[15%] w-48 h-48 bg-gold-500/[0.02] rounded-full blur-3xl" />
          <div className="absolute bottom-16 right-[15%] w-48 h-48 bg-gold-500/[0.02] rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 mb-4 sm:mb-5 animate-float" dir={dir}>
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span className={`text-xs text-gold-600 dark:text-gold-400 font-medium ${fontClass}`}>{t("hero.subtitle", lang)}</span>
          </div>

          <div className="mb-4 sm:mb-5 w-full flex flex-col items-center">
            <div className="flex items-center justify-center gap-3 mb-2 sm:mb-3 w-full">
              <div className="w-10 sm:w-16 h-px bg-gradient-to-l from-transparent to-gold-500/60" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold-500/40" />
              <div className="w-6 sm:w-10 h-px bg-gradient-to-r from-gold-500/60 to-transparent" />
              <Feather className="w-4 h-4 sm:w-5 sm:h-5 text-gold-500" />
              <div className="w-6 sm:w-10 h-px bg-gradient-to-l from-gold-500/60 to-transparent" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold-500/40" />
              <div className="w-10 sm:w-16 h-px bg-gradient-to-r from-transparent to-gold-500/60" />
            </div>
            <h1 className={`${fontClass} text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight text-center`}>
              <span className="text-shimmer" style={{ backgroundImage: "linear-gradient(135deg, #b8860b 0%, #d4af37 30%, #f5d26b 50%, #d4af37 70%, #b8860b 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", filter: "drop-shadow(0 2px 4px rgba(184,134,11,0.15))" }}>{t("site.name", lang)}</span>
            </h1>
            <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4 w-full">
              <div className="w-4 h-px bg-gold-500/30" /><div className="w-1.5 h-1.5 rounded-full bg-gold-500/50" /><div className="w-8 sm:w-12 h-px bg-gold-500/40" /><BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-500/50" /><div className="w-8 sm:w-12 h-px bg-gold-500/40" /><div className="w-1.5 h-1.5 rounded-full bg-gold-500/50" /><div className="w-4 h-px bg-gold-500/30" />
            </div>
          </div>
          <p className={`text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg text-center mb-5 sm:mb-6 ${fontClass}`}>{t("hero.desc", lang)}</p>

          {/* ── Primary CTAs ─────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6 sm:mb-7" dir={dir}>
            <a
              href="#novels"
              className={`group inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-l from-gold-600 to-gold-500 text-white text-sm sm:text-base font-medium shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 ${fontClass}`}
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              {t("cta.startReading", lang)}
              <ArrowLeft className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${dir === "ltr" ? "rotate-180 group-hover:translate-x-1" : ""}`} />
            </a>
            <Link
              href="/library"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-parchment-300 dark:border-white/10 text-gray-700 dark:text-gray-200 text-sm sm:text-base font-medium hover:border-gold-500/40 hover:text-gold-600 dark:hover:text-gold-400 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 ${fontClass}`}
            >
              <Library className="w-4 h-4 sm:w-5 sm:h-5" />
              {t("cta.browseLibrary", lang)}
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3" dir={dir}>
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-parchment-200 dark:border-white/10 shadow-sm hover-lift"><BookOpen className="w-4 h-4 text-gold-500" /><div><p className="text-base font-bold text-gray-900 dark:text-gray-100 leading-none">{novels.length}</p><p className={`text-xs text-gray-400 mt-0.5 ${fontClass}`}>{novels.length === 1 ? t("hero.novels", lang) : t("hero.novelsPlural", lang)}</p></div></div>
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-parchment-200 dark:border-white/10 shadow-sm hover-lift"><Feather className="w-4 h-4 text-gold-500" /><div><p className="text-base font-bold text-gray-900 dark:text-gray-100 leading-none">{t("author.penName", lang)}</p><p className={`text-xs text-gray-400 mt-0.5 ${fontClass}`}>{t("hero.author", lang)}</p></div></div>
          </div>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

        {/* ── Scroll-down hint ─────────────────────────── */}
        <a
          href="#novels"
          className={`absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gold-500/70 hover:text-gold-500 transition-colors animate-bounce-slow ${fontClass}`}
          aria-label={t("scroll.hint", lang)}
        >
          <span className="text-[11px] tracking-wide">{t("scroll.hint", lang)}</span>
          <ChevronDown className="w-4 h-4" />
        </a>
      </section>

      {/* ── Features / trust strip ─────────────────────── */}
      <Reveal className="mb-10 sm:mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" dir={dir}>
          {[
            { icon: ShieldCheck, title: t("feature.secure.title", lang), desc: t("feature.secure.desc", lang) },
            { icon: Smartphone, title: t("feature.devices.title", lang), desc: t("feature.devices.desc", lang) },
            { icon: RefreshCw, title: t("feature.updates.title", lang), desc: t("feature.updates.desc", lang) },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group flex items-center gap-3 p-4 rounded-2xl bg-white/70 dark:bg-onyx-800/70 backdrop-blur-sm border border-parchment-200 dark:border-white/8 hover:border-gold-500/30 transition-all duration-200 hover-lift"
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gold-500/10 text-gold-500 flex-shrink-0 group-hover:scale-110 group-hover:bg-gold-500/15 transition-all duration-200">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-bold text-gray-900 dark:text-gray-100 ${fontClass}`}>{title}</p>
                <p className={`text-xs text-gray-400 dark:text-gray-500 mt-0.5 ${fontClass}`}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <span id="novels" className="block -mt-4 pt-4" />

      <Reveal><ContinueReading /></Reveal>
      <Reveal><ReadingStats /></Reveal>
      <Reveal><PopularSection /></Reveal>

      {/* ── Section header ────────────────────────────── */}
      <Reveal>
      <div className="flex items-center gap-3 mb-6" dir={dir}>
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full" />
          <h2 className={`text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 ${fontClass}`}>
            {t("section.available", lang)}
          </h2>
        </div>
        <span className={`text-sm text-gray-400 bg-parchment-100 dark:bg-white/5 px-2.5 py-0.5 rounded-full border border-parchment-200 dark:border-white/8 ${fontClass}`}>
          {novels.length} {novels.length === 1 ? t("hero.novels", lang) : t("hero.novelsPlural", lang)}
        </span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-parchment-300 dark:via-white/10 to-transparent ms-2" />
      </div>
      </Reveal>

      {/* ── Novel Grid ────────────────────────────────── */}
      {novels.length > 0 ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 pb-10"
          dir={dir}
        >
          {novels.map((novel, i) => (
            <div
              key={novel.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
            >
              <NovelCard novel={novel} index={i} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gold-500/20 blur-2xl rounded-full" />
            <BookOpen className="relative w-16 h-16 opacity-40 text-gold-500" />
          </div>
          <p className={`text-lg text-gray-500 dark:text-gray-400 ${fontClass}`}>{t("reader.empty", lang)}</p>
          <p className={`text-sm mt-1 text-gray-400 dark:text-gray-600 ${fontClass}`}>
            {t("reader.emptyHint", lang)}
          </p>
        </div>
      )}
    </div>
  );
}
