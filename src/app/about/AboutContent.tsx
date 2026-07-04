"use client";

import Image from "next/image";
import { PenTool, Code2, BookOpen, Quote } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

export default function AboutContent() {
  const { lang } = useApp();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16" dir={dir}>
      {/* ── Hero ──────────────────────────────────────── */}
      <div className="text-center mb-16 animate-fade-up">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6">
          <BookOpen className="w-3.5 h-3.5 text-gold-500" />
          <span className={`text-xs text-gold-600 dark:text-gold-400 ${fontClass}`}>
            {t("about.platform", lang)}
          </span>
        </span>
        <h1 className={`text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 ${fontClass}`}>
          {t("nav.about", lang)}
        </h1>
        <p className={`text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed ${fontClass}`}>
          {t("about.heroDesc", lang)}
        </p>
      </div>

      {/* ── Identity Card ─────────────────────────────── */}
      <div className="bg-white dark:bg-onyx-800 rounded-3xl border border-parchment-200 dark:border-white/8 overflow-hidden shadow-book mb-12 animate-fade-up" style={{ animationDelay: "100ms" }}>
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-72 h-72 md:h-auto flex-shrink-0">
            <Image
              src="/author.jpg"
              alt={`${t("author.penName", lang)} — Medjahed Abdelhadi`}
              fill
              className="object-cover object-top"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-transparent to-white/60 dark:to-onyx-800/80" />
          </div>
          <div className="flex flex-col justify-center p-8 md:p-10">
            <h2 className={`text-2xl font-bold text-gray-900 dark:text-gray-100 ${fontClass}`}>
              Medjahed Abdelhadi — Pica
            </h2>
            <p className="text-gold-500 font-medium tracking-widest text-sm mt-1">
              {t("about.role", lang)}
            </p>
            <p className={`text-gray-600 dark:text-gray-300 leading-loose text-base mt-4 ${fontClass}`}>
              {t("about.bio", lang)}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {[t("tags.literature", lang), t("tags.programming", lang), t("tags.digitalArt", lang)].map((tag) => (
                <span key={tag} className={`text-xs px-3 py-1 rounded-full bg-parchment-100 dark:bg-white/5 border border-parchment-200 dark:border-white/10 text-gray-500 dark:text-gray-400 ${fontClass}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Skills ────────────────────────────────────── */}
      <div className="grid sm:grid-cols-3 gap-6 mb-12 animate-fade-up" style={{ animationDelay: "200ms" }}>
        <SkillCard
          icon={<Code2 className="w-6 h-6 text-gold-500" />}
          title={t("about.skill1Title", lang)}
          desc={t("about.skill1Desc", lang)}
          fontClass={fontClass}
        />
        <SkillCard
          icon={<BookOpen className="w-6 h-6 text-gold-500" />}
          title={t("about.skill2Title", lang)}
          desc={t("about.skill2Desc", lang)}
          fontClass={fontClass}
        />
        <SkillCard
          icon={<PenTool className="w-6 h-6 text-gold-500" />}
          title={t("about.skill3Title", lang)}
          desc={t("about.skill3Desc", lang)}
          fontClass={fontClass}
        />
      </div>

      {/* ── Mission ───────────────────────────────────── */}
      <div className="relative bg-parchment-100 dark:bg-onyx-900 rounded-2xl border border-parchment-200 dark:border-white/8 p-8 mb-12 animate-fade-up" style={{ animationDelay: "300ms" }}>
        <Quote className={`absolute top-6 w-8 h-8 text-gold-500/20 ${lang === "ar" ? "right-6" : "left-6"}`} />
        <h3 className={`text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 ${fontClass}`}>
          {t("about.missionTitle", lang)}
        </h3>
        <p className={`text-gray-700 dark:text-gray-300 leading-loose text-center ${fontClass}`}>
          {t("about.missionText", lang)}
        </p>
      </div>

      {/* ── Copyright ─────────────────────────────────── */}
      <p className={`text-center text-xs text-gray-400 dark:text-gray-500 ${fontClass}`}>
        {t("about.copyright", lang, { year: String(new Date().getFullYear()) })}
      </p>
    </div>
  );
}

function SkillCard({ icon, title, desc, fontClass }: { icon: React.ReactNode; title: string; desc: string; fontClass: string }) {
  return (
    <div className="bg-white dark:bg-onyx-800 rounded-2xl border border-parchment-200 dark:border-white/8 p-6 hover-lift card-glow">
      <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className={`font-bold text-gray-900 dark:text-gray-100 mb-2 ${fontClass}`}>{title}</h3>
      <p className={`text-sm text-gray-500 dark:text-gray-400 leading-relaxed ${fontClass}`}>{desc}</p>
    </div>
  );
}
