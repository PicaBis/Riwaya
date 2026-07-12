"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, ChevronDown, ArrowRight, MessageCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { AUTHOR } from "@/lib/constants";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8"];

export function FaqContent() {
  const { lang } = useApp();
  const ar = lang === "ar";
  const dir = ar ? "rtl" : "ltr";
  const fontClass = ar ? "font-arabic" : "font-sans";
  const [open, setOpen] = useState<string | null>("1");

  return (
    <div className={`max-w-3xl mx-auto px-4 sm:px-6 py-10 ${fontClass}`} dir={dir}>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gold-500 transition-colors mb-6"
      >
        <ArrowRight className={`w-4 h-4 ${!ar ? "rotate-180" : ""}`} />
        {t("faq.back", lang)}
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-2xl bg-gold-500/10 flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-gold-500" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t("faq.title", lang)}</h1>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{t("faq.subtitle", lang)}</p>

      <div className="space-y-3">
        {KEYS.map((k) => {
          const isOpen = open === k;
          return (
            <div
              key={k}
              className="rounded-2xl border border-parchment-200 dark:border-white/10 bg-white/70 dark:bg-onyx-800/60 overflow-hidden transition-colors hover:border-gold-500/30"
            >
              <button
                onClick={() => setOpen(isOpen ? null : k)}
                data-sound="click"
                className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-start"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100">
                  {t(`faq.q${k}`, lang)}
                </span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 text-gold-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {t(`faq.a${k}`, lang)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Still need help */}
      <div className="mt-10 rounded-2xl border border-gold-500/20 bg-gold-500/[0.05] p-6 text-center">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{t("faq.stillTitle", lang)}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t("faq.stillDesc", lang)}</p>
        <a
          href={`https://wa.me/${AUTHOR.whatsappNumber.replace(/\+/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 active:scale-95 text-white text-sm font-medium transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          {t("faq.contactUs", lang)}
        </a>
      </div>
    </div>
  );
}
