"use client";

import { BookOpen } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-parchment-50 dark:bg-onyx-950 min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <BookOpen className="w-20 h-20 text-gold-500/20 mx-auto mb-6" />
          <h1 className="font-arabic text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            عذراً، حدث خطأ
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-arabic text-sm mb-6">
            حدث خطأ في تحميل الموقع. يرجى التحديث للمحاولة مرة أخرى.
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-arabic text-sm font-medium transition-colors"
          >
            تحديث الصفحة
          </button>
        </div>
      </body>
    </html>
  );
}