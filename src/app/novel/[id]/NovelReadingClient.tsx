"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Wallet, Star, BookOpen, Tag, Calendar } from "lucide-react";
import dynamic from "next/dynamic";
import { Novel } from "@/data/novels";
import { StarRating } from "@/components/StarRating";
import { CCPModal } from "@/components/CCPModal";
import { Comments } from "@/components/Comments";
import { useApp } from "@/context/AppContext";

/* Lazy-load PDF viewer (client only, no SSR) */
const PDFViewer = dynamic(
  () => import("@/components/PDFViewer").then((m) => m.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-parchment-100 dark:bg-onyx-950 min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-10 h-10 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
          <span className="font-arabic text-sm">جارٍ تهيئة القارئ…</span>
        </div>
      </div>
    ),
  }
);

interface NovelReadingClientProps {
  novel: Novel;
}

export function NovelReadingClient({ novel }: NovelReadingClientProps) {
  const { ratings, setRating, bookmarks, saveBookmark, guest } = useApp();
  const [showCCP, setShowCCP] = useState(false);
  const currentRating = ratings[novel.id] ?? 0;
  const pdfUrl = `/novels/${novel.pdfFile}`;
  const initialPage = bookmarks[novel.id] || 1;

  const handlePageChange = (page: number) => {
    saveBookmark(novel.id, page);
  };

  useEffect(() => {
    const enterFullscreen = () => {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    };
    const handleFirstInteraction = () => {
      enterFullscreen();
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);
    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  return (
    <>
      <div className="min-h-screen flex flex-col" dir="rtl">
        {/* ── Top info bar ────────────────────────────── */}
        <div className="sticky top-16 z-30 flex items-center gap-3 px-4 sm:px-6 py-3 bg-white dark:bg-onyx-900 border-b border-parchment-200 dark:border-white/8">
          {/* Back */}
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 transition-colors font-arabic group flex-shrink-0"
          >
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            المكتبة
          </Link>

          <span className="text-gray-200 dark:text-gray-700">|</span>

          {/* Novel info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <BookOpen className="w-4 h-4 text-gold-500 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="font-arabic font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate leading-tight">
                {novel.title}
              </h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-arabic truncate">
                {novel.author}
              </p>
            </div>
          </div>

          {/* Meta chips (hidden on small screens) */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center gap-1 text-xs text-gold-500 bg-gold-500/10 px-2 py-0.5 rounded-full font-arabic">
              <Tag className="w-3 h-3" />
              {novel.genre}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <Calendar className="w-3 h-3" />
              {novel.year}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Rating */}
            <div className="hidden sm:flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-gold-500/60" />
              <StarRating
                novelId={novel.id}
                initialRating={currentRating}
                onRate={(s) => setRating(novel.id, s)}
                size="sm"
                readOnly={!guest}
              />
            </div>

            {/* CCP */}
            <button
              onClick={() => setShowCCP(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-parchment-300 dark:border-white/10 text-xs font-arabic text-gold-500 hover:bg-gold-500/10 active:scale-95 transition-all duration-150"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">دعم</span>
            </button>
          </div>
        </div>

        {/* ── PDF Viewer ─────────────────────────────── */}
        <div dir="ltr">
          <PDFViewer
            pdfUrl={pdfUrl}
            title={novel.title}
            freeUntilPage={novel.freeUntilPage}
            initialPage={initialPage}
            onPageChange={handlePageChange}
            preview={novel.description}
            novelId={novel.id}
          />
        </div>

        {/* ── Comments Section ───────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8" dir="rtl">
          <Comments novelId={novel.id} />
        </div>
      </div>

      {showCCP && (
        <CCPModal novelTitle={novel.title} onClose={() => setShowCCP(false)} />
      )}
    </>
  );
}
