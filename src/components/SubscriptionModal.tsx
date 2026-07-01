"use client";

import { useState } from "react";
import Link from "next/link";
import { X, BookOpen, Lock, Coins, ChevronLeft, ArrowLeft } from "lucide-react";
import clsx from "clsx";
import { novels } from "@/data/novels";

export function SubscriptionModal({ onClose }: { onClose: () => void }) {
  const [selectedNovelId, setSelectedNovelId] = useState<string | null>(null);
  const selectedNovel = novels.find((n) => n.id === selectedNovelId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-onyx-800 rounded-2xl shadow-2xl p-6 animate-scale-in max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gold-500/10 flex items-center justify-center mx-auto mb-3">
            <Coins className="w-7 h-7 text-gold-500" />
          </div>
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-gray-100">
            الاشتراكات
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-arabic">
            {selectedNovel ? "اختر فصلاً للقراءة" : "اختر رواية للقراءة"}
          </p>
        </div>

        {selectedNovel ? (
          /* ── Chapters list ───────────────────────────── */
          <div dir="rtl">
            <button
              onClick={() => setSelectedNovelId(null)}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gold-500 font-arabic mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة للروايات
            </button>

            <div className="mb-4 p-3 rounded-xl bg-parchment-100 dark:bg-white/5 border border-parchment-200 dark:border-white/8">
              <h3 className="font-arabic font-bold text-gray-900 dark:text-gray-100 text-sm">
                {selectedNovel.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-arabic mt-0.5">
                {selectedNovel.author}
              </p>
            </div>

            <div className="space-y-2">
              {(selectedNovel.chapters || []).length > 0 ? (
                selectedNovel.chapters!.map((ch, i) => {
                  const isLocked = ch.startPage > selectedNovel.freeUntilPage;
                  return (
                    <Link
                      key={i}
                      href={`/novel/${selectedNovel.id}?page=${ch.startPage}`}
                      onClick={onClose}
                      className={clsx(
                        "flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 hover:shadow-md",
                        isLocked
                          ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-700/30"
                          : "bg-white dark:bg-white/5 border-parchment-200 dark:border-white/8 hover:border-gold-500/30"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={clsx(
                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                            isLocked
                              ? "bg-amber-100 dark:bg-amber-800/30 text-amber-600"
                              : "bg-gold-500/10 text-gold-500"
                          )}
                        >
                          {isLocked ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <BookOpen className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold font-arabic text-gray-900 dark:text-gray-100 truncate">
                            {ch.title}
                          </p>
                          <p className="text-xs text-gray-400 font-sans">
                            صفحة {ch.startPage}
                          </p>
                        </div>
                      </div>
                      {isLocked ? (
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-arabic bg-amber-100 dark:bg-amber-800/30 px-2 py-0.5 rounded-full flex-shrink-0">
                          اشتراك
                        </span>
                      ) : (
                        <ChevronLeft className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                    </Link>
                  );
                })
              ) : (
                /* Fallback: no chapters defined, just show read button */
                <Link
                  href={`/novel/${selectedNovel.id}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-white/5 border border-parchment-200 dark:border-white/8 hover:border-gold-500/30 transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-gold-500" />
                    <span className="font-arabic text-sm font-bold text-gray-900 dark:text-gray-100">
                      اقرأ الرواية كاملة
                    </span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                </Link>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-parchment-200 dark:border-white/8 text-xs text-gray-400 font-arabic justify-center">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-gold-500" /> مجاني
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-500" /> يتطلب اشتراك
              </span>
            </div>
          </div>
        ) : (
          /* ── Novels list ─────────────────────────────── */
          <div className="space-y-3" dir="rtl">
            {novels.map((novel) => (
              <button
                key={novel.id}
                onClick={() => setSelectedNovelId(novel.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-white/5 border border-parchment-200 dark:border-white/8 hover:border-gold-500/30 hover:shadow-md transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-gold-500" />
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <p className="font-arabic font-bold text-gray-900 dark:text-gray-100 text-sm truncate">
                    {novel.title}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-arabic mt-0.5">
                    {novel.genre} · {novel.year}
                  </p>
                  <p className="text-[11px] text-gold-500 mt-1 font-arabic">
                    {(novel.chapters || []).length > 0
                      ? `${novel.chapters!.length} فصول`
                      : "قراءة كاملة"}
                  </p>
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </button>
            ))}

            {novels.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-arabic text-sm">لا توجد روايات متاحة حالياً</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}