"use client";

import { Mail, Instagram, MessageCircle } from "lucide-react";

interface ContactModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-onyx-800 rounded-3xl shadow-2xl border border-parchment-200 dark:border-white/10 w-full max-w-md p-6 sm:p-8 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-parchment-100 dark:hover:bg-white/10 transition-colors"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gold-500/10 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-gold-500" />
          </div>
          <div>
            <h2 className="font-arabic text-xl font-bold text-gray-900 dark:text-gray-100">تواصل مع بيكا</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-arabic">أرسل ملاحظاتك واقتراحاتك</p>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href="https://www.instagram.com/profpica"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-2xl border border-parchment-200 dark:border-white/8 hover:bg-parchment-50 dark:hover:bg-white/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-arabic font-medium text-gray-900 dark:text-gray-100">انستغرام</p>
              <p className="text-xs text-gray-500 font-sans">@ProfPica</p>
            </div>
          </a>

          <a
            href="mailto:profpica@proton.me"
            className="flex items-center gap-3 p-4 rounded-2xl border border-parchment-200 dark:border-white/8 hover:bg-parchment-50 dark:hover:bg-white/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-gold-600 dark:text-gold-400" />
            </div>
            <div>
              <p className="text-sm font-arabic font-medium text-gray-900 dark:text-gray-100">بريد إلكتروني</p>
              <p className="text-xs text-gray-500 font-sans">profpica@proton.me</p>
            </div>
          </a>
        </div>

        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-4 font-arabic">
          للعروض التجارية والنشر الشراكة — يرجى ذكر اسم المنصة
        </p>
      </div>
    </div>
  );
}
