"use client";

import { Bug } from "lucide-react";

const AUTHOR_EMAIL = "Medjahed10abdelhadi@gmail.com";

export function BugReporter() {
  const handleReport = () => {
    window.open(
      `mailto:${AUTHOR_EMAIL}?subject=بلاغ عن مشكلة في منصة روايتي&body=السلام عليكم،%0D%0A%0D%0Aلقد وجدت مشكلة في الموقع:%0D%0A%0D%0A%0D%0Aشكراً`,
      "_blank"
    );
  };

  return (
    <button
      onClick={handleReport}
      title="الإبلاغ عن مشكلة"
      className="bug-reporter fixed bottom-6 right-6 z-50 w-11 h-11 rounded-2xl bg-white dark:bg-onyx-800 border border-parchment-200 dark:border-white/10 shadow-lg flex items-center justify-center text-gray-400 hover:text-amber-600 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95"
    >
      <Bug className="w-5 h-5" />
    </button>
  );
}