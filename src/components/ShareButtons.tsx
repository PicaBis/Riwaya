"use client";

import { useState } from "react";
import { Share2, Check, X } from "lucide-react";

export function ShareButtons({ title, url }: { title: string; url: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `https://riwayati.vercel.app${url}`;
  const shareText = `📖 ${title} — اقرأها الآن على منصة روايتي`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = (platform: string) => {
    const encoded = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    switch (platform) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodedText}%20${encoded}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encoded}`, "_blank");
        break;
    }
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-parchment-300 dark:border-white/10 text-xs font-arabic text-gray-600 dark:text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 active:scale-95 transition-all duration-150"
      >
        <Share2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">مشاركة</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="relative w-full max-w-xs bg-white dark:bg-onyx-800 rounded-2xl shadow-2xl p-6 animate-scale-in" dir="rtl">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 left-3 p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-arabic text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 text-center">
              مشاركة الرواية
            </h3>
            <p className="text-xs text-gray-400 font-arabic text-center mb-5">
              {title}
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => share("whatsapp")}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <span className="text-2xl">💬</span>
                <span className="text-[11px] font-arabic text-green-700 dark:text-green-400">واتساب</span>
              </button>
              <button
                onClick={() => share("facebook")}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <span className="text-2xl">📘</span>
                <span className="text-[11px] font-arabic text-blue-700 dark:text-blue-400">فيسبوك</span>
              </button>
              <button
                onClick={() => share("twitter")}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors"
              >
                <span className="text-2xl">🐦</span>
                <span className="text-[11px] font-arabic text-sky-700 dark:text-sky-400">تويتر</span>
              </button>
            </div>

            <button
              onClick={copyLink}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-parchment-100 dark:bg-white/5 border border-parchment-200 dark:border-white/10 text-sm font-arabic text-gray-700 dark:text-gray-300 hover:bg-parchment-200 dark:hover:bg-white/10 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  تم نسخ الرابط
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  نسخ الرابط
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}