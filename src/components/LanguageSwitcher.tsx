"use client";

import { useApp } from "@/context/AppContext";

export function LanguageSwitcher() {
  const { lang, setLang } = useApp();

  return (
    <button
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      className="px-2 py-1 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 transition-colors font-sans"
      title={lang === "ar" ? "Switch to English" : "التبديل للعربية"}
    >
      {lang === "ar" ? "EN" : "ع"}
    </button>
  );
}