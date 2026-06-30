"use client";

import { useState } from "react";
import { X, User, ArrowLeft } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface GuestLoginModalProps {
  onClose: () => void;
}

export function GuestLoginModal({ onClose }: GuestLoginModalProps) {
  const { loginAsGuest } = useApp();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("الرجاء إدخال اسم أو لقب");
      return;
    }
    loginAsGuest(trimmed);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-sm bg-white dark:bg-onyx-800 rounded-2xl shadow-2xl p-6 animate-scale-in">
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
            <User className="w-7 h-7 text-gold-500" />
          </div>
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-gray-100">
            دخول كضيف
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-arabic">
            لا حاجة لتسجيل، فقط أدخل اسمك
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
          <div>
            <label
              htmlFor="guestName"
              className="block text-sm font-arabic text-gray-700 dark:text-gray-300 mb-1.5"
            >
              اسمك أو لقبك
            </label>
            <input
              id="guestName"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="مثال: قارئ مجهول، فارس الكلمة…"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-parchment-300 dark:border-white/10 bg-parchment-50 dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 font-arabic text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all"
            />
            {error && (
              <p className="text-xs text-red-500 mt-1 font-arabic">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white rounded-xl font-arabic text-sm font-medium transition-all duration-150 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            دخول وبدء القراءة
          </button>
        </form>
      </div>
    </div>
  );
}
