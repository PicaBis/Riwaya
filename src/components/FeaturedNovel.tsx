"use client";

import Link from "next/link";
import { BookOpen, ArrowLeft, Star, Tag, Sparkles } from "lucide-react";
import { novels } from "@/data/novels";
import { PDFCover } from "./PDFCover";
import { SafeBoundary } from "./SafeBoundary";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

/**
 * Large "spotlight" card for the primary published novel. Sits near the top of
 * the homepage to give the flagship work a hero-grade presentation.
 */
export function FeaturedNovel() {
  const { lang } = useApp();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";

  const novel = novels.find((n) => n.status !== "coming-soon" && n.pdfFile);
  if (!novel) return null;

  return (
    <div className="mb-10 sm:mb-12" dir={dir}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-gold-500" />
        <h2 className={`text-sm font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 ${fontClass}`}>
          {t("featured.label", lang)}
        </h2>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-parchment-300 dark:via-white/10 to-transparent" />
      </div>

      <div className="group relative overflow-hidden rounded-3xl border border-parchment-200 dark:border-white/8 bg-white dark:bg-onyx-800 shadow-book hover:shadow-book-hover transition-all duration-300">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-amber-500/[0.07] blur-3xl" />

        <div className="relative flex flex-col sm:flex-row gap-0 sm:gap-6">
          {/* Cover */}
          <Link
            href={`/novel/${novel.id}`}
            className="relative sm:w-64 md:w-72 flex-shrink-0 overflow-hidden"
          >
            <div className="relative w-full aspect-[16/9] sm:aspect-[3/4] overflow-hidden">
              <SafeBoundary name="featured-cover" silent>
                <PDFCover
                  pdfUrl={`/api/novel-asset/${novel.pdfFile}`}
                  novelId={novel.id}
                  title={novel.title}
                  className="w-full h-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-105"
                />
              </SafeBoundary>
              <div className="novel-shine" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent sm:bg-gradient-to-l" />
            </div>
          </Link>

          {/* Details */}
          <div className="flex flex-col justify-center p-6 sm:p-7 md:py-9 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`inline-flex items-center gap-1 text-xs text-gold-600 dark:text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded-full ${fontClass}`}>
                <Tag className="w-3 h-3" />
                {novel.genre}
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs text-gold-500">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-gold-500" />
                ))}
              </span>
            </div>

            <Link href={`/novel/${novel.id}`}>
              <h3 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-1 hover:text-gold-600 dark:hover:text-gold-400 transition-colors ${fontClass}`}>
                {novel.title}
              </h3>
            </Link>
            {novel.subtitle && (
              <p className={`text-sm text-gold-600/80 dark:text-gold-400/80 mb-3 ${fontClass}`}>{novel.subtitle}</p>
            )}

            <p className={`text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 mb-5 max-w-xl ${fontClass}`}>
              {novel.description}
            </p>

            <div>
              <Link
                href={`/novel/${novel.id}`}
                className={`group/btn btn-sheen cta-glow inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-l from-gold-600 to-gold-500 text-white text-sm sm:text-base font-medium hover:-translate-y-0.5 active:scale-95 transition-all duration-200 ${fontClass}`}
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                {t("card.readNow", lang)}
                <ArrowLeft className={`w-4 h-4 transition-transform group-hover/btn:-translate-x-1 ${dir === "ltr" ? "rotate-180 group-hover/btn:translate-x-1" : ""}`} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
