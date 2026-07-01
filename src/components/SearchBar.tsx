"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { novels } from "@/data/novels";

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = query.trim()
    ? novels.filter(
        (n) =>
          n.title.includes(query.trim()) ||
          n.genre.includes(query.trim()) ||
          (n.tags || []).some((t) => t.includes(query.trim()))
      )
    : [];

  return (
    <>
      <button
        onClick={() => { setOpen(true); setQuery(""); }}
        className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-arabic text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-parchment-100 dark:hover:bg-white/8 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden lg:inline">بحث</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="relative w-full max-w-lg bg-white dark:bg-onyx-800 rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-parchment-200 dark:border-white/8" dir="rtl">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن رواية، تصنيف، أو وسوم..."
                autoFocus
                className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm font-arabic focus:outline-none"
              />
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto" dir="rtl">
              {query.trim() === "" ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400 font-arabic">
                  اكتب اسم الرواية أو التصنيف للبحث
                </div>
              ) : results.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400 font-arabic">
                  لا توجد نتائج لـ "{query}"
                </div>
              ) : (
                results.map((novel) => (
                  <Link
                    key={novel.id}
                    href={`/novel/${novel.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-parchment-100 dark:hover:bg-white/5 transition-colors border-b border-parchment-100 dark:border-white/5 last:border-0"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-gold-500 font-arabic">
                        {novel.title.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold font-arabic text-gray-900 dark:text-gray-100 truncate">
                        {novel.title}
                      </p>
                      <p className="text-xs text-gray-400 font-arabic">
                        {novel.genre} · {novel.year}
                      </p>
                    </div>
                    <span className="text-[11px] text-gray-400 font-sans ms-auto flex-shrink-0">
                      {novel.language === "ar" ? "عربي" : novel.language.toUpperCase()}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}