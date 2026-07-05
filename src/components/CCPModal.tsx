"use client";

import { X, Wallet, Copy, CheckCheck, Mail } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

interface CCPModalProps {
  novelTitle: string;
  onClose: () => void;
}

import { BANK, AUTHOR } from "@/lib/constants";

export function CCPModal({ novelTitle, onClose }: CCPModalProps) {
  const { lang } = useApp();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";
  const [copied, setCopied] = useState(false);

  const copyAccount = async () => {
    await navigator.clipboard.writeText(BANK.ripNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md bg-white dark:bg-onyx-800 rounded-2xl shadow-2xl p-6 animate-scale-in">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gold-500/10 flex items-center justify-center mx-auto mb-3">
            <Wallet className="w-7 h-7 text-gold-500" />
          </div>
          <h2 className={`text-xl font-bold text-gray-900 dark:text-gray-100 ${fontClass}`}>
            {t("ccp.title", lang)}
          </h2>
          <p className={`text-sm text-gray-500 dark:text-gray-400 mt-1 ${fontClass}`}>
            {novelTitle}
          </p>
        </div>

        {/* RIP / BaridiMob Details */}
        <div className="space-y-3 mb-5">
          <div className="rounded-xl bg-parchment-100 dark:bg-white/5 border border-parchment-300 dark:border-white/10 p-4">
            <p className={`text-xs text-gray-400 dark:text-gray-500 mb-1 font-sans ${dir === "rtl" ? "text-right" : "text-left"}`}>
              {t("ccp.ripLabel", lang)}
            </p>
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={copyAccount}
                className={`flex items-center gap-1.5 text-xs text-gold-500 hover:text-gold-600 transition-colors ${fontClass}`}
              >
                {copied ? (
                  <CheckCheck className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? t("ccp.copied", lang) : t("ccp.copy", lang)}
              </button>
              <span
                dir="ltr"
                className="text-base font-mono font-semibold text-gray-900 dark:text-gray-100 tracking-widest"
              >
                {BANK.ripNumber}
              </span>
            </div>
          </div>

          <div className={`rounded-xl bg-parchment-100 dark:bg-white/5 border border-parchment-300 dark:border-white/10 p-3 ${dir === "rtl" ? "text-right" : "text-left"}`}>
            <p className={`text-xs text-gray-400 dark:text-gray-500 mb-0.5 ${fontClass}`}>{t("ccp.name", lang)}</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {AUTHOR.name}
            </p>
          </div>

          <div className={`rounded-xl bg-parchment-100 dark:bg-white/5 border border-parchment-300 dark:border-white/10 p-3 ${dir === "rtl" ? "text-right" : "text-left"}`}>
            <p className={`text-xs text-gray-400 dark:text-gray-500 mb-0.5 ${fontClass}`}>{t("ccp.note", lang)}</p>
            <p className={`text-sm text-gray-700 dark:text-gray-300 ${fontClass}`}>
              {t("ccp.notePrefix", lang)} {novelTitle}
            </p>
          </div>

          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 p-3">
            <p className={`text-xs text-amber-700 dark:text-amber-400 leading-relaxed ${fontClass}`}>
              {t("ccp.hint", lang)}
            </p>
            <a
              href={`mailto:${AUTHOR.email}`}
              className={`inline-flex items-center gap-1 text-xs text-gold-500 hover:text-gold-600 mt-1.5 transition-colors ${fontClass}`}
            >
              <Mail className="w-3.5 h-3.5" />
              {AUTHOR.email}
            </a>
          </div>
        </div>

        <p className={`text-center text-xs text-gray-400 dark:text-gray-500 leading-relaxed ${fontClass}`}>
          {t("ccp.thanks", lang)}
        </p>
      </div>
    </div>
  );
}
