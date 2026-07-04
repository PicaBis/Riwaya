"use client";

import { useState } from "react";
import Image from "next/image";
import { X, BookOpen, PenTool, Code2, Smartphone, Quote, Feather, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

export function AboutModal({ onClose }: { onClose: () => void }) {
  const { isAdmin, setAdmin, lang } = useApp();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";
  const [showDevInput, setShowDevInput] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [devError, setDevError] = useState("");
  const [devSuccess, setDevSuccess] = useState("");

  const handleDevCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (devCode.trim() === "Blazixz") {
      setAdmin(true);
      setDevSuccess(t("aboutModal.devSuccess", lang));
      setDevError("");
      setTimeout(() => setShowDevInput(false), 1200);
    } else {
      setDevError(t("aboutModal.devError", lang));
      setDevSuccess("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-onyx-800 rounded-3xl shadow-2xl p-6 sm:p-8 animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          {/* Profile image */}
          <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-gold-500/20 mx-auto mb-4 shadow-lg">
          <Image
            src="/author.jpg"
            alt={t("author.penName", lang)}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
          </div>
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 mb-3">
            <BookOpen className="w-3.5 h-3.5 text-gold-500" />
            <span className={`text-xs text-gold-600 dark:text-gold-400 ${fontClass}`}>{t("aboutModal.platform", lang)}</span>
          </span>
          <h2 className={`text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 ${fontClass}`}>
            {t("author.penName", lang)} — Pica
          </h2>
          <p className={`text-sm text-gold-500 font-medium mt-1 ${fontClass}`}>@ProfPica</p>
          <p className={`text-sm text-gray-500 dark:text-gray-400 mt-2 ${fontClass}`}>
            {t("aboutModal.official", lang)}
          </p>
        </div>

        {/* Identity / Bio */}
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-parchment-50 to-white dark:from-onyx-700/30 dark:to-onyx-800 border border-parchment-200 dark:border-white/10">
          <div className="flex items-start gap-3" dir={dir}>
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Feather className="w-5 h-5 text-gold-500" />
            </div>
            <p className={`text-sm text-gray-700 dark:text-gray-300 leading-loose ${fontClass}`}>
              {t("about.bio", lang)}
            </p>
          </div>
        </div>

        {/* Skills — 2x2 grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-xl bg-white dark:bg-onyx-700/40 border border-parchment-200 dark:border-white/10 flex items-center gap-3 hover-lift card-glow">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
              <Code2 className="w-4 h-4 text-gold-500" />
            </div>
            <div>
              <p className={`text-xs font-bold text-gray-800 dark:text-gray-200 ${fontClass}`}>{t("aboutModal.web", lang)}</p>
              <p className="text-[11px] text-gray-400 font-sans">Web Development</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-onyx-700/40 border border-parchment-200 dark:border-white/10 flex items-center gap-3 hover-lift card-glow">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-4 h-4 text-gold-500" />
            </div>
            <div>
              <p className={`text-xs font-bold text-gray-800 dark:text-gray-200 ${fontClass}`}>{t("aboutModal.mobile", lang)}</p>
              <p className="text-[11px] text-gray-400 font-sans">Mobile Apps</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-onyx-700/40 border border-parchment-200 dark:border-white/10 flex items-center gap-3 hover-lift card-glow">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
              <Feather className="w-4 h-4 text-gold-500" />
            </div>
            <div>
              <p className={`text-xs font-bold text-gray-800 dark:text-gray-200 ${fontClass}`}>{t("aboutModal.novels", lang)}</p>
              <p className="text-[11px] text-gray-400 font-sans">Fantasy · Mystery · Horror</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-onyx-700/40 border border-parchment-200 dark:border-white/10 flex items-center gap-3 hover-lift card-glow">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
              <PenTool className="w-4 h-4 text-gold-500" />
            </div>
            <div>
              <p className={`text-xs font-bold text-gray-800 dark:text-gray-200 ${fontClass}`}>{t("aboutModal.art", lang)}</p>
              <p className="text-[11px] text-gray-400 font-sans">Illustration · Digital Art</p>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="relative bg-parchment-100 dark:bg-white/5 rounded-2xl border border-parchment-200 dark:border-white/8 p-5">
          <Quote className={`absolute top-4 w-6 h-6 text-gold-500/20 ${lang === "ar" ? "right-4" : "left-4"}`} />
          <p className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-center ${fontClass}`}>
            {t("aboutModal.mission", lang)}
          </p>
        </div>

        {/* ── Developer Code Entry (Shield Icon) ──── */}
        <div className="mt-5 pt-4 border-t border-parchment-200 dark:border-white/8">
          {!showDevInput ? (
            <button
              onClick={() => setShowDevInput(true)}
              title={t("aboutModal.devCode", lang)}
              className={`flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 hover:text-gold-500 dark:hover:text-gold-400 transition-colors mx-auto ${fontClass}`}
            >
              <Shield className="w-4 h-4" />
              {isAdmin ? t("aboutModal.devActive", lang) : t("aboutModal.devCode", lang)}
            </button>
          ) : (
            <form onSubmit={handleDevCode} className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gold-500" />
                <input
                  type="password"
                  value={devCode}
                  onChange={(e) => { setDevCode(e.target.value); setDevError(""); setDevSuccess(""); }}
                  placeholder={t("aboutModal.devPlaceholder", lang)}
                  className={`px-3 py-1.5 rounded-lg border border-parchment-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500/40 w-44 ${fontClass}`}
                  dir="ltr"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!devCode.trim()}
                  className={`px-3 py-1.5 bg-gray-900 dark:bg-white hover:bg-gold-500 dark:hover:bg-gold-500 text-white dark:text-gray-900 hover:text-white text-xs rounded-lg transition-all duration-150 disabled:opacity-40 ${fontClass}`}
                >
                  {t("aboutModal.devLogin", lang)}
                </button>
              </div>
              {devError && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="w-3 h-3" />
                  {devError}
                </p>
              )}
              {devSuccess && (
                <p className="flex items-center gap-1 text-xs text-gold-500">
                  <CheckCircle2 className="w-3 h-3" />
                  {devSuccess}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
