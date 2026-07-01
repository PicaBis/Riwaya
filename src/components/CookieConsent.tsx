"use client";

import { useApp } from "@/context/AppContext";

export function CookieConsent() {
  const { cookieConsent, acceptCookies, rejectCookies } = useApp();

  if (cookieConsent !== null) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg bg-white dark:bg-onyx-800 rounded-2xl shadow-2xl border border-parchment-200 dark:border-white/10 p-4 animate-fade-up" dir="rtl">
      <p className="text-sm text-gray-700 dark:text-gray-300 font-arabic leading-relaxed mb-3">
        هذا الموقع يستخدم ملفات تعريف الارتباط (cookies) والتخزين المحلي لحفظ تفضيلاتك (الوضع الليلي، تقدم القراءة، التقييمات).
        باستمرارك في التصفح فإنك توافق على ذلك.
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={acceptCookies}
          className="flex-1 py-2 rounded-xl bg-gold-500 hover:bg-gold-600 active:scale-95 text-white text-sm font-arabic font-medium transition-all duration-150"
        >
          موافق
        </button>
        <button
          onClick={rejectCookies}
          className="flex-1 py-2 rounded-xl border border-parchment-300 dark:border-white/10 text-sm font-arabic text-gray-500 dark:text-gray-400 hover:bg-parchment-100 dark:hover:bg-white/5 transition-colors"
        >
          رفض
        </button>
      </div>
    </div>
  );
}