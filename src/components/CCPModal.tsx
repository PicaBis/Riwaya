"use client";

import { X, CreditCard, Copy, CheckCheck } from "lucide-react";
import { useState } from "react";

interface CCPModalProps {
  novelTitle: string;
  onClose: () => void;
}

// ✏️  Replace with your real CCP details
const CCP_DETAILS = {
  accountNumber: "XXXX XXXX XXXX",
  key: "XX",
  name: "اسمك الكامل",
  note: "دعم رواية: ",
};

export function CCPModal({ novelTitle, onClose }: CCPModalProps) {
  const [copied, setCopied] = useState(false);

  const copyAccount = async () => {
    await navigator.clipboard.writeText(CCP_DETAILS.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md bg-white dark:bg-onyx-800 rounded-2xl shadow-2xl p-6 animate-scale-in">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gold-500/10 flex items-center justify-center mx-auto mb-3">
            <CreditCard className="w-7 h-7 text-gold-500" />
          </div>
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-gray-100">
            دعم المؤلف
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-arabic">
            {novelTitle}
          </p>
        </div>

        {/* CCP Details */}
        <div className="space-y-3 mb-5">
          <div className="rounded-xl bg-parchment-100 dark:bg-white/5 border border-parchment-300 dark:border-white/10 p-4">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-sans text-right">
              رقم الحساب البريدي (CCP)
            </p>
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={copyAccount}
                className="flex items-center gap-1.5 text-xs text-gold-500 hover:text-gold-600 transition-colors"
              >
                {copied ? (
                  <CheckCheck className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "تم النسخ!" : "نسخ"}
              </button>
              <span
                dir="ltr"
                className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100 tracking-widest"
              >
                {CCP_DETAILS.accountNumber}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-parchment-100 dark:bg-white/5 border border-parchment-300 dark:border-white/10 p-3 text-right">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">المفتاح</p>
              <p className="font-mono font-bold text-gray-900 dark:text-gray-100">
                {CCP_DETAILS.key}
              </p>
            </div>
            <div className="rounded-xl bg-parchment-100 dark:bg-white/5 border border-parchment-300 dark:border-white/10 p-3 text-right">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">الاسم</p>
              <p className="font-arabic text-sm text-gray-900 dark:text-gray-100">
                {CCP_DETAILS.name}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-parchment-100 dark:bg-white/5 border border-parchment-300 dark:border-white/10 p-3 text-right">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">الملاحظة</p>
            <p className="font-arabic text-sm text-gray-700 dark:text-gray-300">
              {CCP_DETAILS.note}
              {novelTitle}
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 font-arabic leading-relaxed">
          شكراً لدعمك، يُحفّزني على الاستمرار في الكتابة 💛
        </p>
      </div>
    </div>
  );
}
