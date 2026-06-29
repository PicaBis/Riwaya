"use client";

import { useState } from "react";
import Link from "next/link";
import { Moon, Sun, User, LogOut, BookOpen } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { GuestLoginModal } from "./GuestLoginModal";

export function Header() {
  const { isDark, toggleTheme, guest, logout } = useApp();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-parchment-200 dark:border-white/8 bg-parchment-50/90 dark:bg-onyx-900/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center transition-colors group-hover:bg-gold-500/20">
              <BookOpen className="w-4 h-4 text-gold-500" />
            </div>
            <span className="font-arabic text-xl font-bold text-gray-900 dark:text-gray-100 tracking-wide">
              روايتي
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? "الوضع النهاري" : "الوضع الليلي"}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-parchment-200 dark:hover:bg-white/10 transition-all duration-200"
            >
              <Sun
                className={`w-5 h-5 absolute transition-all duration-300 ${
                  isDark ? "opacity-100 rotate-0" : "opacity-0 rotate-90"
                }`}
              />
              <Moon
                className={`w-5 h-5 absolute transition-all duration-300 ${
                  isDark ? "opacity-0 -rotate-90" : "opacity-100 rotate-0"
                }`}
              />
            </button>

            {/* Guest auth */}
            {guest ? (
              <div className="flex items-center gap-1.5">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold-500/10 border border-gold-500/20">
                  <div className="w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {guest.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-arabic text-gold-600 dark:text-gold-400 font-medium">
                    {guest.name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="تسجيل الخروج"
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 active:scale-95 text-white text-sm font-arabic font-medium transition-all duration-150 shadow-sm"
              >
                <User className="w-4 h-4" />
                <span>دخول كضيف</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {showLogin && <GuestLoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
