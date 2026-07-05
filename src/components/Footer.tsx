"use client";

import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { AUTHOR } from "@/lib/constants";

export function Footer() {
  const { lang } = useApp();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";

  return (
    <footer className="border-t border-parchment-200 dark:border-white/8 py-10 mt-16 bg-white/50 dark:bg-onyx-900/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8" dir={dir}>
          {/* Brand */}
          <div>
            <h3 className={`text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 ${fontClass}`}>{t("site.name", lang)}</h3>
            <p className={`text-sm text-gray-500 dark:text-gray-400 leading-relaxed ${fontClass}`}>
              {t("footer.brandDesc", lang)}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className={`text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 ${fontClass}`}>{t("footer.quickLinks", lang)}</h4>
            <ul className="space-y-2">
              <li><a href="/" className={`text-sm text-gray-500 dark:text-gray-400 hover:text-gold-500 transition-colors ${fontClass}`}>{t("nav.home", lang)}</a></li>
              <li><a href="/library" className={`text-sm text-gray-500 dark:text-gray-400 hover:text-gold-500 transition-colors ${fontClass}`}>{t("footer.libraryLink", lang)}</a></li>
              <li><a href="/about" className={`text-sm text-gray-500 dark:text-gray-400 hover:text-gold-500 transition-colors ${fontClass}`}>{t("nav.about", lang)}</a></li>
            </ul>
          </div>

          {/* Social / Contact */}
          <div>
            <h4 className={`text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 ${fontClass}`}>{t("footer.contactAuthor", lang)}</h4>
            <div className="flex flex-wrap gap-2">
              <a
                href={`mailto:${AUTHOR.email}`}
                className={`px-3 py-1.5 rounded-lg bg-parchment-100 dark:bg-white/5 border border-parchment-200 dark:border-white/10 text-xs text-gray-600 dark:text-gray-400 hover:text-gold-500 hover:border-gold-500/30 transition-colors ${fontClass}`}
              >
                {t("footer.email", lang)}
              </a>
               <a
                 href={AUTHOR.instagramUrl}
                 target="_blank"
                 rel="noopener noreferrer"
                className={`px-3 py-1.5 rounded-lg bg-parchment-100 dark:bg-white/5 border border-parchment-200 dark:border-white/10 text-xs text-gray-600 dark:text-gray-400 hover:text-gold-500 hover:border-gold-500/30 transition-colors ${fontClass}`}
              >
                {t("footer.instagram", lang)}
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-3" dir="ltr">
              {AUTHOR.email}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-parchment-200 dark:border-white/8 pt-6 text-center">
          <p className={`text-sm text-gray-400 dark:text-gray-600 ${fontClass}`}>
            {t("site.name", lang)} · riwayati.vercel.app
          </p>
          <p className={`text-xs text-gray-300 dark:text-gray-700 mt-1 ${fontClass}`}>
            {t("footer.copyright", lang)} &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
