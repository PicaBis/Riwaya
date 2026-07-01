"use client";

import { useEffect } from "react";
import { BookOpen } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center" dir="rtl">
      <BookOpen className="w-20 h-20 text-gold-500/20 mb-6" />
      <h2 className="font-arabic text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
        حدث خطأ غير متوقع
      </h2>
      <p className="text-gray-500 dark:text-gray-400 font-arabic text-sm mb-6 max-w-md">
        نعتذر عن هذا الخلل. يرجى تحديث الصفحة أو العودة للصفحة الرئيسية.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-arabic text-sm font-medium transition-colors"
        >
          حاول مجدداً
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 border border-parchment-300 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-xl font-arabic text-sm hover:bg-parchment-100 dark:hover:bg-white/5 transition-colors"
        >
          الرئيسية
        </Link>
      </div>
    </div>
  );
}