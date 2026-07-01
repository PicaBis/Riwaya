"use client";

import { useState } from "react";
import { Trophy, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function Achievements() {
  const { achievements } = useApp();
  const [open, setOpen] = useState(false);

  const unlocked = achievements.filter((a) => a.unlockedAt);
  const locked = achievements.filter((a) => !a.unlockedAt);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-arabic text-gray-500 dark:text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 transition-colors relative"
      >
        <Trophy className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">الإنجازات</span>
        {unlocked.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unlocked.length}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="relative w-full max-w-sm bg-white dark:bg-onyx-800 rounded-2xl shadow-2xl p-5 animate-scale-in" dir="rtl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-arabic font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-gold-500" />
                الإنجازات
              </h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {[...unlocked, ...locked].map((a) => (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    a.unlockedAt
                      ? "bg-gold-500/5 border-gold-500/20"
                      : "bg-parchment-100 dark:bg-white/5 border-parchment-200 dark:border-white/10 opacity-50"
                  }`}
                >
                  <span className="text-2xl">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold font-arabic text-gray-900 dark:text-gray-100">
                      {a.title}
                    </p>
                    <p className="text-xs text-gray-400 font-arabic">
                      {a.description}
                    </p>
                  </div>
                  {a.unlockedAt ? (
                    <span className="text-[11px] text-gold-500 font-arabic bg-gold-500/10 px-2 py-0.5 rounded-full">
                      ✓
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400 font-arabic">🔒</span>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 font-arabic text-center mt-4">
              {unlocked.length} / {achievements.length} إنجاز
            </p>
          </div>
        </div>
      )}
    </>
  );
}