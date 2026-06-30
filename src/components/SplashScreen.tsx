"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-parchment-50 dark:bg-onyx-950 animate-fade-in">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="font-arabic text-2xl font-bold text-gold-500">روايتي</span>
        </div>
        <p className="font-arabic text-sm text-gray-400 dark:text-gray-500">جاري التحميل...</p>
      </div>
    </div>
  );
}
