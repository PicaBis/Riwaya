"use client";

import Link from "next/link";
import { ArrowRight, Wallet, Star, Shield } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Novel, getFreeUntilPage, getLockedChapter } from "@/data/novels";
import { StarRating } from "@/components/StarRating";
import { CCPModal } from "@/components/CCPModal";
import { Comments } from "@/components/Comments";
import { useApp } from "@/context/AppContext";

const BookViewer = dynamic(
  () => import("@/components/BookViewer").then((m) => m.BookViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-[#F5F0E8] dark:bg-[#0E0D0B]" style={{ minHeight: "80vh" }}>
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-12 h-12 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
          <span className="font-arabic text-sm">جارٍ تهيئة القارئ…</span>
        </div>
      </div>
    ),
  }
);

export function NovelReadingClient({ novel }: { novel: Novel }) {
  const { ratings, setRating, guest, isAdmin } = useApp();
  const [showCCP, setShowCCP] = useState(false);
  const currentRating = ratings[novel.id] ?? 0;
  const pdfUrl = `/novels/${novel.pdfFile}`;
  const freeUntilPage = getFreeUntilPage(novel);
  const lockedChapter = getLockedChapter(novel);

  useEffect(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, []);

  return (
    <>
      {/* ── Slim top bar ──────────────────────────────── */}
      <div
        className="flex items-center justify-between gap-3 px-4 sm:px-5 py-2 bg-white dark:bg-onyx-900 border-b border-parchment-200 dark:border-white/8 flex-shrink-0"
        dir="rtl"
      >
        <Link
          href="/"
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gold-500 transition-colors font-arabic group flex-shrink-0"
        >
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          <span className="hidden sm:inline">المكتبة</span>
        </Link>

        <h1 className="font-arabic text-sm font-semibold text-gray-700 dark:text-gray-300 truncate flex-1 text-center">
          {novel.title}
        </h1>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isAdmin && (
            <span className="flex items-center gap-1 text-xs text-gold-600 dark:text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full">
              <Shield className="w-3 h-3" />
              مشرف
            </span>
          )}
          <div className="hidden sm:flex items-center gap-1">
            <Star className="w-3 h-3 text-gold-500/50" />
            <StarRating
              novelId={novel.id}
              initialRating={currentRating}
              onRate={(s) => setRating(novel.id, s)}
              size="sm"
            />
          </div>
          <button
            onClick={() => setShowCCP(true)}
            className="flex items-center gap-1 text-xs font-arabic text-gold-500 hover:text-gold-600 border border-gold-500/20 hover:border-gold-500/40 px-2 py-1 rounded-lg transition-all"
          >
            <Wallet className="w-3 h-3" />
            <span className="hidden sm:inline">دعم</span>
          </button>
        </div>
      </div>

      {/* ── Scrollable area: Reader + Comments ───────── */}
      <div className="flex-1 overflow-y-auto" style={{ height: "calc(100dvh - 104px)" }}>
        {/* Reader — takes at least 80vh */}
        <div style={{ minHeight: "80vh" }}>
<BookViewer
             pdfUrl={pdfUrl}
             title={novel.title}
             novelId={novel.id}
             freeUntilPage={freeUntilPage}
             lockedChapterTitle={lockedChapter?.title}
             lockedChapterTeaser={lockedChapter?.teaser}
             lockedChapterPreview={lockedChapter?.preview}
           />
        </div>

        {/* Comments — below the reader */}
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pb-12">
          <Comments novelId={novel.id} />
        </div>
      </div>

      {showCCP && (
        <CCPModal novelTitle={novel.title} onClose={() => setShowCCP(false)} />
      )}
    </>
  );
}
