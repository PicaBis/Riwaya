"use client";

import { Mail, Instagram, MessageCircle, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { AUTHOR } from "@/lib/constants";

interface ContactModalProps {
  onClose: () => void;
}

export function ContactModal({ onClose }: ContactModalProps) {
  const { lang } = useApp();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="relative bg-white dark:bg-onyx-800 rounded-3xl shadow-2xl border border-parchment-200 dark:border-white/10 w-full max-w-md p-6 sm:p-8 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        dir={dir}
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gold-500/10 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-gold-500" />
          </div>
          <div>
            <h2 className={`text-xl font-bold text-gray-900 dark:text-gray-100 ${fontClass}`}>{t("contact.title", lang)}</h2>
            <p className={`text-xs text-gray-500 dark:text-gray-400 ${fontClass}`}>{t("contact.desc", lang)}</p>
          </div>
        </div>

        <div className="space-y-3">
           <a
             href={AUTHOR.instagramUrl}
             target="_blank"
             rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-2xl border border-parchment-200 dark:border-white/8 hover:bg-parchment-50 dark:hover:bg-white/5 hover:border-gold-500/20 hover-lift transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-sm font-medium text-gray-900 dark:text-gray-100 ${fontClass}`}>{t("contact.instagram", lang)}</p>
              <p className="text-xs text-gray-500 font-sans">@{AUTHOR.instagramHandle}</p>
            </div>
          </a>

           <a
             href={`mailto:${AUTHOR.email}`}
            className="flex items-center gap-3 p-4 rounded-2xl border border-parchment-200 dark:border-white/8 hover:bg-parchment-50 dark:hover:bg-white/5 hover:border-gold-500/20 hover-lift transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-gold-600 dark:text-gold-400" />
            </div>
            <div>
              <p className={`text-sm font-medium text-gray-900 dark:text-gray-100 ${fontClass}`}>{t("contact.email", lang)}</p>
               <p className="text-xs text-gray-500 font-sans">{AUTHOR.email}</p>
            </div>
          </a>
        </div>

        <p className={`text-[10px] text-gray-400 dark:text-gray-500 text-center mt-4 ${fontClass}`}>
          {t("contact.commercial", lang)}
        </p>
      </div>
    </div>
  );
}
