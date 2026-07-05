"use client";

import { Bug } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { AUTHOR } from "@/lib/constants";

export function BugReporter() {
  const { lang } = useApp();
  const handleReport = () => {
    window.open(
      `mailto:${AUTHOR.email}?subject=${encodeURIComponent(t("bug.subject", lang))}&body=${encodeURIComponent(t("bug.body", lang))}:%0D%0A%0D%0A%0D%0A`,
      "_blank"
    );
  };

  return (
    <button
      onClick={handleReport}
      title={t("bug.title", lang)}
      className="bug-reporter fixed bottom-6 left-6 z-50 w-11 h-11 rounded-2xl bg-white dark:bg-onyx-800 border border-parchment-200 dark:border-white/10 shadow-lg flex items-center justify-center text-gray-400 hover:text-amber-600 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95"
    >
      <Bug className="w-5 h-5" />
    </button>
  );
}