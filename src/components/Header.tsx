"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Moon, Sun, User, LogOut, Menu, X, Shield, Coins, LayoutDashboard, Volume2, VolumeX } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { GuestLoginModal } from "./GuestLoginModal";
import { AboutModal } from "./AboutModal";
import { DevCodeModal } from "./DevCodeModal";
import { SubscriptionModal } from "./SubscriptionModal";

import { SearchBar } from "./SearchBar";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ContactModal } from "./ContactModal";
import { t } from "@/lib/i18n";
import { AUTHOR } from "@/lib/constants";

export function Header() {
  const { isDark, toggleTheme, guest, logout, lang, isAdmin, soundEnabled, toggleSound } = useApp();
  const [showLogin, setShowLogin] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showDevCode, setShowDevCode] = useState(false);
  const [showSubs, setShowSubs] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-parchment-200 dark:border-white/8 bg-parchment-50/90 dark:bg-onyx-900/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* ── Logo ──────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0" dir={lang === "ar" ? "rtl" : "ltr"} onClick={() => setMobileMenuOpen(false)}>
            <div className="w-8 h-8 flex-shrink-0">
              <Image src="/logo.svg" alt={t("site.name", lang)} width={32} height={32} />
            </div>
            <span className={`text-xl font-bold text-gray-900 dark:text-gray-100 tracking-wide ${lang === "ar" ? "font-arabic" : "font-sans"}`}>
              {t("site.name", lang)}
            </span>
          </Link>

          {/* ── Desktop Nav links ──────────────────────── */}
          <nav className="hidden sm:flex items-center gap-0.5" dir={lang === "ar" ? "rtl" : "ltr"}>
            <Link
              href="/"
              className={`px-2 py-1 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-parchment-100 dark:hover:bg-white/8 transition-colors ${lang === "ar" ? "font-arabic" : "font-sans"}`}
            >
              {t("nav.home", lang)}
            </Link>
            <Link
              href="/library"
              className={`px-2 py-1 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-parchment-100 dark:hover:bg-white/8 transition-colors ${lang === "ar" ? "font-arabic" : "font-sans"}`}
            >
              {t("nav.library", lang)}
            </Link>
            <button
              onClick={() => setShowAbout(true)}
              data-sound="open"
              className={`px-2 py-1 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-parchment-100 dark:hover:bg-white/8 transition-colors ${lang === "ar" ? "font-arabic" : "font-sans"}`}
            >
              {t("nav.about", lang)}
            </button>
            <button
              onClick={() => setShowContact(true)}
              data-sound="open"
              className={`px-2 py-1 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 hover:bg-parchment-100 dark:hover:bg-white/8 transition-colors ${lang === "ar" ? "font-arabic" : "font-sans"}`}
            >
              {t("contact.title", lang)}
            </button>
            <button
              onClick={() => setShowSubs(true)}
              data-sound="open"
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 hover:bg-parchment-100 dark:hover:bg-white/8 transition-colors ${lang === "ar" ? "font-arabic" : "font-sans"}`}
            >
              <Coins className="w-3.5 h-3.5" />
              {t("nav.subscriptions", lang)}
            </button>
            <button
              onClick={() => setShowDevCode(true)}
              data-sound="open"
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm text-gray-400 dark:text-gray-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-parchment-100 dark:hover:bg-white/8 transition-colors ${lang === "ar" ? "font-arabic" : "font-sans"}`}
              title={t("nav.devShield", lang)}
            >
              <Shield className="w-3.5 h-3.5" />
            </button>
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors font-arabic"
                title={t("nav.adminPanel", lang)}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
              </Link>
            )}
            <SearchBar />
          </nav>

          {/* ── Desktop Actions ────────────────────────── */}
          <div className="hidden sm:flex items-center gap-2">
            <LanguageSwitcher />
              <button
                onClick={toggleSound}
                title={soundEnabled ? t("sound.on", lang) : t("sound.off", lang)}
                data-sound={soundEnabled ? "toggle" : undefined}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-parchment-200 dark:hover:bg-white/10 transition-all duration-200"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                title={isDark ? t("theme.toDay", lang) : t("theme.toNight", lang)}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-parchment-200 dark:hover:bg-white/10 transition-all duration-200"
            >
              <Sun className={`w-5 h-5 absolute transition-all duration-300 ${isDark ? "opacity-100 rotate-0" : "opacity-0 rotate-90"}`} />
              <Moon className={`w-5 h-5 absolute transition-all duration-300 ${isDark ? "opacity-0 -rotate-90" : "opacity-100 rotate-0"}`} />
            </button>

            {/* Guest auth */}
            {guest ? (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold-500/10 border border-gold-500/20">
                  <div className="w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{guest.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-arabic text-gold-600 dark:text-gold-400 font-medium">{guest.name}</span>
                </div>
                <button
                  onClick={logout}
                  title={t("nav.logout", lang)}
                  data-sound="logout"
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
              onClick={() => setShowLogin(true)}
              data-sound="login"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 active:scale-95 text-white text-sm font-medium transition-all duration-150 shadow-sm ${lang === "ar" ? "font-arabic" : "font-sans"}`}
              >
                <User className="w-4 h-4" />
                <span>{t("nav.login", lang)}</span>
              </button>
            )}
          </div>

          {/* ── Mobile: theme + hamburger ──────────────── */}
          <div className="flex sm:hidden items-center gap-1.5">
            <LanguageSwitcher />
            <button
              onClick={toggleTheme}
              title={isDark ? t("theme.toDay", lang) : t("theme.toNight", lang)}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-parchment-200 dark:hover:bg-white/10 transition-all duration-200"
            >
              <Sun className={`w-5 h-5 absolute transition-all duration-300 ${isDark ? "opacity-100 rotate-0" : "opacity-0 rotate-90"}`} />
              <Moon className={`w-5 h-5 absolute transition-all duration-300 ${isDark ? "opacity-0 -rotate-90" : "opacity-100 rotate-0"}`} />
            </button>
            <button
              onClick={toggleSound}
              title={soundEnabled ? t("sound.on", lang) : t("sound.off", lang)}
              data-sound={soundEnabled ? "toggle" : undefined}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-parchment-200 dark:hover:bg-white/10 transition-all duration-200"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              data-sound="open"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-parchment-200 dark:hover:bg-white/10 transition-colors"
              aria-label={t("nav.menu", lang)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu Drawer ─────────────────────── */}
        {mobileMenuOpen && (
          <div className={`sm:hidden border-t border-parchment-200 dark:border-white/8 bg-parchment-50/98 dark:bg-onyx-900/98 backdrop-blur-md animate-fade-up pb-4 ${lang === "ar" ? "font-arabic" : "font-sans"}`} dir={lang === "ar" ? "rtl" : "ltr"}>
            {/* Nav links */}
            <nav className="px-4 pt-3 pb-3 flex flex-col gap-1 border-b border-parchment-200 dark:border-white/8">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-parchment-100 dark:hover:bg-white/8 transition-colors"
              >
                {t("nav.home", lang)}
              </Link>
              <Link
                href="/library"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-parchment-100 dark:hover:bg-white/8 transition-colors"
              >
                {t("nav.library", lang)}
              </Link>
              <button
                onClick={() => { setShowAbout(true); setMobileMenuOpen(false); }}
                className="px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-parchment-100 dark:hover:bg-white/8 transition-colors text-right"
              >
                {t("nav.about", lang)}
              </button>
              <button
                onClick={() => { setShowContact(true); setMobileMenuOpen(false); }}
                className="px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:text-gold-500 dark:hover:text-gold-400 hover:bg-parchment-100 dark:hover:bg-white/8 transition-colors text-right"
              >
                {t("contact.title", lang)}
              </button>
              <button
                onClick={() => { setShowSubs(true); setMobileMenuOpen(false); }}
                className="px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:text-gold-500 dark:hover:text-gold-400 hover:bg-parchment-100 dark:hover:bg-white/8 transition-colors text-right flex items-center gap-1.5"
              >
                <Coins className="w-4 h-4" />
                {t("nav.subscriptions", lang)}
              </button>
              <button
                onClick={() => { setShowDevCode(true); setMobileMenuOpen(false); }}
                className="px-3 py-2.5 rounded-xl text-sm text-gray-400 dark:text-gray-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-parchment-100 dark:hover:bg-white/8 transition-colors text-right flex items-center gap-1.5"
              >
                <Shield className="w-4 h-4" />
                {t("nav.devShield", lang)}
              </button>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-right flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t("nav.adminPanel", lang)}
                </Link>
              )}
            </nav>

            {/* Author profile card */}
            <div className="px-4 pt-4">
              <div className="rounded-2xl bg-white dark:bg-onyx-800 border border-parchment-200 dark:border-white/10 p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl overflow-hidden border border-gold-500/20 flex-shrink-0">
                    <Image src="/author.jpg" alt={t("author.penName", lang)} width={44} height={44} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{t("author.penName", lang)} — Pica</p>
                     <p className="text-xs text-gold-500">@{AUTHOR.instagramHandle}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                  {t("about.bio", lang)}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[t("tags.programming", lang), t("tags.novels", lang), t("tags.digitalArt", lang)].map(tag => (
                    <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-parchment-100 dark:bg-white/5 border border-parchment-200 dark:border-white/10 text-gray-500 dark:text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Guest auth in mobile menu */}
              <div className="mt-3">
                {guest ? (
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gold-500/10 border border-gold-500/20">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{guest.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="text-sm text-gold-600 dark:text-gold-400 font-medium">{guest.name}</span>
                    </div>
                    <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  data-sound="logout"
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      {t("nav.logout", lang)}
                    </button>
                  </div>
                ) : (
              <button
                onClick={() => { setShowLogin(true); setMobileMenuOpen(false); }}
                data-sound="login"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-white text-sm font-medium transition-all duration-150 active:scale-95"
                  >
                    <User className="w-4 h-4" />
                    {t("nav.login", lang)}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {showLogin && <GuestLoginModal onClose={() => setShowLogin(false)} />}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
      {showDevCode && <DevCodeModal onClose={() => setShowDevCode(false)} />}
      {showSubs && <SubscriptionModal onClose={() => setShowSubs(false)} />}
    </>
  );
}
