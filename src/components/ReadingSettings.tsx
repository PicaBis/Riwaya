"use client";

import { useState } from "react";
import {
  Settings,
  X,
  Sun,
  Moon,
  Type,
  AlignJustify,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import clsx from "clsx";
import { useApp } from "@/context/AppContext";

interface ReadingSettingsProps {
  scale: number;
  onScaleChange: (s: number) => void;
}

export function ReadingSettings({ scale, onScaleChange }: ReadingSettingsProps) {
  const { isDark, toggleTheme } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        title="إعدادات القراءة"
        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 dark:text-gray-400 hover:bg-black/8 dark:hover:bg-white/10 active:scale-90 transition-all duration-150"
      >
        <Settings className="w-3.5 h-3.5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          {/* Panel */}
          <div
            className={clsx(
              "absolute top-0 right-0 h-full w-80 max-w-[85vw]",
              "bg-white dark:bg-onyx-900 shadow-2xl",
              "border-l border-parchment-200 dark:border-white/10",
              "animate-slide-in-right"
            )}
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-parchment-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-gold-500" />
                <h3 className="font-arabic font-bold text-gray-900 dark:text-gray-100">
                  إعدادات القراءة
                </h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-6 overflow-y-auto h-[calc(100%-64px)]">
              {/* Dark Mode */}
              <section>
                <h4 className="font-arabic text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  {isDark ? (
                    <Moon className="w-4 h-4 text-gold-500" />
                  ) : (
                    <Sun className="w-4 h-4 text-gold-500" />
                  )}
                  المظهر
                </h4>
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-parchment-50 dark:bg-white/5 border border-parchment-200 dark:border-white/10 hover:border-gold-500/40 transition-colors"
                >
                  <span className="font-arabic text-sm text-gray-700 dark:text-gray-300">
                    {isDark ? "الوضع الداكن" : "الوضع النهاري"}
                  </span>
                  <div
                    className={clsx(
                      "w-10 h-5 rounded-full relative transition-colors duration-300",
                      isDark ? "bg-gold-500" : "bg-gray-300"
                    )}
                  >
                    <div
                      className={clsx(
                        "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300",
                        isDark ? "translate-x-5" : "translate-x-0.5"
                      )}
                    />
                  </div>
                </button>
              </section>

              {/* Zoom */}
              <section>
                <h4 className="font-arabic text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Type className="w-4 h-4 text-gold-500" />
                  حجم العرض
                </h4>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onScaleChange(Math.max(+(scale - 0.15).toFixed(2), 0.4))}
                    className="w-10 h-10 rounded-xl bg-parchment-50 dark:bg-white/5 border border-parchment-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:border-gold-500/40 active:scale-95 transition-all"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <div className="flex-1 text-center">
                    <span className="font-mono text-lg font-bold text-gold-500">
                      {Math.round(scale * 100)}%
                    </span>
                  </div>
                  <button
                    onClick={() => onScaleChange(Math.min(+(scale + 0.15).toFixed(2), 2.5))}
                    className="w-10 h-10 rounded-xl bg-parchment-50 dark:bg-white/5 border border-parchment-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:border-gold-500/40 active:scale-95 transition-all"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => onScaleChange(1.2)}
                  className="w-full mt-2 py-2 rounded-xl border border-parchment-200 dark:border-white/10 text-sm font-arabic text-gray-500 dark:text-gray-400 hover:border-gold-500/40 flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  إعادة الحجم الافتراضي
                </button>
              </section>

              {/* Reading tips */}
              <section>
                <h4 className="font-arabic text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <AlignJustify className="w-4 h-4 text-gold-500" />
                  نصائح القراءة
                </h4>
                <div className="space-y-2">
                  {[
                    "اضغط على يمين أو يسار الصفحة للتنقل",
                    "اسحب الشاشة يميناً أو يساراً على الهاتف",
                    "اضغط على مفتاح b لحفظ إشارة مرجعية",
                    "اضغط على ? لعرض جميع الاختصارات",
                  ].map((tip, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-parchment-50 dark:bg-white/5 border border-parchment-100 dark:border-white/5"
                    >
                      <span className="w-5 h-5 rounded-full bg-gold-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-gold-600 dark:text-gold-400">
                          {i + 1}
                        </span>
                      </span>
                      <span className="font-arabic text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        {tip}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
