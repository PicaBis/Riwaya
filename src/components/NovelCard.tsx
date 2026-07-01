"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Wallet, Calendar, Tag, Clock } from "lucide-react";
import { Novel } from "@/data/novels";
import { PDFCover } from "./PDFCover";
import { StarRating } from "./StarRating";
import { CCPModal } from "./CCPModal";
import { useApp } from "@/context/AppContext";

function estimateReadTime(novel: Novel): string {
  const totalPages = novel.chapters && novel.chapters.length > 0
    ? novel.freeUntilPage + 80
    : novel.freeUntilPage + 80;
  const mins = Math.round(totalPages / 2);
  if (mins < 60) return `~${mins} د`;
  const hrs = Math.floor(mins / 60);
  const remain = mins % 60;
  return remain > 0 ? `~${hrs}س ${remain}د` : `~${hrs} ساعات`;
}

interface NovelCardProps {
  novel: Novel;
  index?: number;
}

export function NovelCard({ novel, index = 0 }: NovelCardProps) {
  const { ratings, setRating, guest, bookmarks } = useApp();
  const [showCCP, setShowCCP] = useState(false);
  const currentRating = ratings[novel.id] ?? 0;
  const bookmarkPage = bookmarks[novel.id];

  return (
    <>
      <article
        className="group flex flex-col bg-white dark:bg-onyx-800 rounded-2xl overflow-hidden shadow-book hover:shadow-book-hover border border-parchment-200 dark:border-white/8 transition-all duration-300 hover:-translate-y-1"
        style={{ animationDelay: `${index * 80}ms` }}
      >
        {/* Cover Image (PDF first page) */}
        <Link href={`/novel/${novel.id}`} className="block relative">
          <PDFCover
            pdfUrl={`/novels/${novel.pdfFile}`}
            title={novel.title}
            className="w-full aspect-[3/4] object-cover"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="flex items-center gap-1.5 text-white text-sm font-arabic">
              <BookOpen className="w-4 h-4" />
              ابدأ القراءة
            </span>
          </div>
        </Link>

        {/* Card body */}
        <div className="flex flex-col flex-1 p-5 gap-3" dir="rtl">
          {/* Genre + Year */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-gold-500 font-arabic bg-gold-500/10 px-2.5 py-0.5 rounded-full">
              <Tag className="w-3 h-3" />
              {novel.genre}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <Calendar className="w-3 h-3" />
              {novel.year}
            </span>
          </div>

          {/* Title */}
          <Link href={`/novel/${novel.id}`}>
            <h2 className="font-arabic text-lg font-bold text-gray-900 dark:text-gray-100 leading-snug hover:text-gold-500 dark:hover:text-gold-400 transition-colors line-clamp-2">
              {novel.title}
            </h2>
          </Link>

          {/* Author */}
          <p className="text-sm text-gray-500 dark:text-gray-400 font-arabic -mt-1">
            {novel.author}
          </p>

          {/* Reading time estimate */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 -mt-1">
            <Clock className="w-3 h-3" />
            <span className="font-arabic">مدة قراءة: {estimateReadTime(novel)}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-300 font-arabic leading-relaxed line-clamp-3 flex-1">
            {novel.description}
          </p>

          {/* Reading Progress */}
          {bookmarkPage && bookmarkPage > 1 && (
            <div className="flex items-center gap-2 -mt-1">
              <div className="flex-1 h-1 bg-parchment-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(Math.round((bookmarkPage / (novel.freeUntilPage + 80)) * 100), 100)}%` }}
                />
              </div>
              <span className="text-[11px] text-gold-500 font-sans font-medium">
                {Math.min(Math.round((bookmarkPage / (novel.freeUntilPage + 80)) * 100), 100)}%
              </span>
            </div>
          )}

          {/* Star Rating */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-arabic">
              تقييمك:
            </span>
            <StarRating
              novelId={novel.id}
              initialRating={currentRating}
              onRate={(s) => setRating(novel.id, s)}
              size="sm"
              readOnly={!guest}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-1">
            <Link
              href={`/novel/${novel.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-900 dark:bg-white hover:bg-gold-500 dark:hover:bg-gold-500 text-white dark:text-gray-900 hover:text-white text-sm font-arabic font-medium rounded-xl transition-all duration-200 active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              اقرأ الآن
            </Link>
            <button
              onClick={() => setShowCCP(true)}
              title="دعم عبر CCP"
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-parchment-300 dark:border-white/10 text-gold-500 hover:bg-gold-500/10 active:scale-95 transition-all duration-150"
            >
              <Wallet className="w-4 h-4" />
            </button>
          </div>
        </div>
      </article>

      {showCCP && (
        <CCPModal novelTitle={novel.title} onClose={() => setShowCCP(false)} />
      )}
    </>
  );
}
