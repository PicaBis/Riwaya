"use client";

import { useState } from "react";
import { Settings, X, Type, AlignLeft, FileText, Sun } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function ReaderPrefsPanel() {
  const { readerPrefs, setReaderPrefs } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-arabic text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-parchment-100 dark:hover:bg-white/10 transition-colors"
      >
        <Settings className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">إعدادات القراءة</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="relative w-full max-w-sm bg-white dark:bg-onyx-800 rounded-2xl shadow-2xl p-5 animate-scale-in" dir="rtl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-arabic font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gold-500" />
                إعدادات القراءة
              </h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Font Size */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-arabic text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-gold-500" />
                    حجم الخط
                  </label>
                  <span className="text-xs font-sans text-gray-400">{readerPrefs.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min={14}
                  max={24}
                  step={1}
                  value={readerPrefs.fontSize}
                  onChange={(e) => setReaderPrefs({ ...readerPrefs, fontSize: Number(e.target.value) })}
                  className="w-full h-2 bg-parchment-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-gold-500"
                />
              </div>

              {/* Line Height */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-arabic text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <AlignLeft className="w-4 h-4 text-gold-500" />
                    تباعد الأسطر
                  </label>
                  <span className="text-xs font-sans text-gray-400">{readerPrefs.lineHeight.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={1.6}
                  max={2.8}
                  step={0.1}
                  value={readerPrefs.lineHeight}
                  onChange={(e) => setReaderPrefs({ ...readerPrefs, lineHeight: Number(e.target.value) })}
                  className="w-full h-2 bg-parchment-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-gold-500"
                />
              </div>

              {/* Font Family */}
              <div>
                <label className="text-sm font-arabic text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mb-2">
                  <FileText className="w-4 h-4 text-gold-500" />
                  نوع الخط
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setReaderPrefs({ ...readerPrefs, fontFamily: "amiri" })}
                    className={`py-2.5 rounded-xl text-sm font-arabic border transition-all ${
                      readerPrefs.fontFamily === "amiri"
                        ? "bg-gold-500/10 border-gold-500 text-gold-600"
                        : "bg-white dark:bg-white/5 border-parchment-200 dark:border-white/10 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    أميري
                  </button>
                  <button
                    onClick={() => setReaderPrefs({ ...readerPrefs, fontFamily: "sans" })}
                    className={`py-2.5 rounded-xl text-sm font-sans border transition-all ${
                      readerPrefs.fontFamily === "sans"
                        ? "bg-gold-500/10 border-gold-500 text-gold-600"
                        : "bg-white dark:bg-white/5 border-parchment-200 dark:border-white/10 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    Sans
                  </button>
                </div>
              </div>

              {/* Sepia Mode */}
              <div>
                <label className="text-sm font-arabic text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mb-2">
                  <Sun className="w-4 h-4 text-gold-500" />
                  وضع الصفحات
                </label>
                <button
                  onClick={() => setReaderPrefs({ ...readerPrefs, sepiaMode: !readerPrefs.sepiaMode })}
                  className={`w-full py-2.5 rounded-xl text-sm font-arabic border transition-all ${
                    readerPrefs.sepiaMode
                      ? "bg-amber-100 dark:bg-amber-900/30 border-amber-400 text-amber-700 dark:text-amber-300"
                      : "bg-white dark:bg-white/5 border-parchment-200 dark:border-white/10 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {readerPrefs.sepiaMode ? "وضع سيبيا (مفعل)" : "وضع عادي"}
                </button>
              </div>

              {/* Preview */}
              <div
                className={`p-4 rounded-xl border border-parchment-200 dark:border-white/10 ${
                  readerPrefs.sepiaMode ? "bg-[#f4ecd8]" : "bg-white dark:bg-white/5"
                }`}
                style={{
                  fontFamily: readerPrefs.fontFamily === "amiri" ? "'Amiri', serif" : "system-ui, sans-serif",
                  fontSize: readerPrefs.fontSize,
                  lineHeight: readerPrefs.lineHeight,
                }}
              >
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  هذا النص يوضح شكل القراءة. يمكنك تعديل الإعدادات كما تشاء.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}