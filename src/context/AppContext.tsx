"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { Lang } from "@/lib/i18n";

/* ─── Types ─────────────────────────────────────────────── */
interface GuestUser {
  name: string;
  loggedInAt: number;
}

interface ReadEntry {
  novelId: string;
  lastPage: number;
  timestamp: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

interface ReaderPreferences {
  fontSize: number;       // 14-24
  lineHeight: number;     // 1.6-2.8
  fontFamily: "amiri" | "sans";
  sepiaMode: boolean;
}

interface AppContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  isDark: boolean;
  toggleTheme: () => void;
  guest: GuestUser | null;
  loginAsGuest: (name: string) => void;
  logout: () => void;
  isAdmin: boolean;
  setAdmin: (v: boolean) => void;
  ratings: Record<string, number>;
  setRating: (novelId: string, stars: number) => void;
  bookmarks: Record<string, number>;
  saveBookmark: (novelId: string, page: number) => void;
  readHistory: ReadEntry[];
  cookieConsent: boolean | null;
  acceptCookies: () => void;
  rejectCookies: () => void;
  totalReadingTime: number;
  addReadingTime: (seconds: number) => void;
  achievements: Achievement[];
  readerPrefs: ReaderPreferences;
  setReaderPrefs: (prefs: ReaderPreferences) => void;
  novelViews: Record<string, number>;
  trackNovelView: (novelId: string) => void;
  favorites: string[];
  toggleFavorite: (novelId: string) => void;
}

/* ─── Context ────────────────────────────────────────────── */
const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");
  const [isDark, setIsDark] = useState(false);
  const [guest, setGuest] = useState<GuestUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [bookmarks, setBookmarks] = useState<Record<string, number>>({});
  const [readHistory, setReadHistory] = useState<ReadEntry[]>([]);
  const [cookieConsent, setCookieConsent] = useState<boolean | null>(null);
  const [totalReadingTime, setTotalReadingTime] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: "first-read", title: "بداية الرحلة", description: "قرأت أول صفحة", icon: "📖" },
    { id: "ten-pages", title: "عشرة صفحات", description: "قرأت 10 صفحات", icon: "📄" },
    { id: "fifty-pages", title: "قارئ متحمس", description: "قرأت 50 صفحة", icon: "🔥" },
    { id: "hundred-pages", title: "قارئ متمرس", description: "قرأت 100 صفحة", icon: "🏆" },
    { id: "thirty-min", title: "نصف ساعة", description: "قضيت 30 دقيقة في القراءة", icon: "⏱️" },
    { id: "one-hour", title: "ساعة كاملة", description: "قضيت ساعة في القراءة", icon: "⏰" },
    { id: "first-rating", title: "الناقد", description: "قمت بتقييم رواية", icon: "⭐" },
    { id: "first-comment", title: "المشارك", description: "كتبت أول تعليق", icon: "💬" },
    { id: "three-sessions", title: "قارئ وفي", description: "عدت للقراءة 3 مرات", icon: "🔄" },
  ]);
  const [readerPrefs, setReaderPrefs] = useState<ReaderPreferences>({
    fontSize: 18,
    lineHeight: 1.8,
    fontFamily: "amiri",
    sepiaMode: false,
  });
  const [novelViews, setNovelViews] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  /* Hydrate from localStorage on client */
  useEffect(() => {
    const savedLang = localStorage.getItem("riwayati_lang") as Lang | null;
    if (savedLang === "en" || savedLang === "ar") setLangState(savedLang);
    const savedTheme = localStorage.getItem("riwayati_theme");
    const savedGuest = localStorage.getItem("riwayati_guest");
    const savedRatings = localStorage.getItem("riwayati_ratings");
    const savedAdmin = localStorage.getItem("riwayati_admin");
    const savedBookmarks = localStorage.getItem("riwayati_bookmarks");
    const savedHistory = localStorage.getItem("riwayati_history");
    const savedCookie = localStorage.getItem("riwayati_cookies");

    if (savedTheme === "dark") setIsDark(true);
    if (savedGuest) setGuest(JSON.parse(savedGuest));
    if (savedRatings) setRatings(JSON.parse(savedRatings));
    if (savedAdmin === "1") setIsAdmin(true);
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
    if (savedHistory) setReadHistory(JSON.parse(savedHistory));
    if (savedCookie) setCookieConsent(savedCookie === "1");
    const savedTime = localStorage.getItem("riwayati_reading_time");
    if (savedTime) setTotalReadingTime(parseInt(savedTime, 10) || 0);
    const savedAchievements = localStorage.getItem("riwayati_achievements");
    if (savedAchievements) setAchievements(JSON.parse(savedAchievements));
    const savedPrefs = localStorage.getItem("riwayati_reader_prefs");
    if (savedPrefs) setReaderPrefs(JSON.parse(savedPrefs));
    const savedViews = localStorage.getItem("riwayati_views");
    if (savedViews) setNovelViews(JSON.parse(savedViews));
    const savedFavorites = localStorage.getItem("riwayati_favorites");
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    setMounted(true);
  }, []);

  /* Sync theme class to <html> */
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("riwayati_theme", isDark ? "dark" : "light");
  }, [isDark, mounted]);

  const toggleTheme = useCallback(() => setIsDark((d) => !d), []);

  const loginAsGuest = useCallback((name: string) => {
    if (name.trim() === "Blazixz") {
      setIsAdmin(true);
      localStorage.setItem("riwayati_admin", "1");
      localStorage.removeItem("riwayati_guest");
      setGuest(null);
      return;
    }
    const user: GuestUser = { name: name.trim(), loggedInAt: Date.now() };
    setGuest(user);
    localStorage.setItem("riwayati_guest", JSON.stringify(user));
    localStorage.removeItem("riwayati_admin");
    setIsAdmin(false);
  }, []);

  const setAdmin = useCallback((v: boolean) => {
    setIsAdmin(v);
    localStorage.setItem("riwayati_admin", v ? "1" : "0");
  }, []);

  const logout = useCallback(() => {
    setGuest(null);
    setIsAdmin(false);
    localStorage.removeItem("riwayati_guest");
    localStorage.removeItem("riwayati_admin");
  }, []);

  const setRating = useCallback((novelId: string, stars: number) => {
    setRatings((prev) => {
      const next = { ...prev, [novelId]: stars };
      localStorage.setItem("riwayati_ratings", JSON.stringify(next));
      return next;
    });
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    setAchievements((prev) => {
      const exists = prev.find((a) => a.id === id);
      if (!exists || exists.unlockedAt) return prev;
      const updated = prev.map((a) =>
        a.id === id ? { ...a, unlockedAt: Date.now() } : a
      );
      localStorage.setItem("riwayati_achievements", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const saveBookmark = useCallback((novelId: string, page: number) => {
    setBookmarks((prev) => {
      const next = { ...prev, [novelId]: page };
      localStorage.setItem("riwayati_bookmarks", JSON.stringify(next));
      return next;
    });
    setReadHistory((prev) => {
      const filtered = prev.filter((e) => e.novelId !== novelId);
      const updated = [{ novelId, lastPage: page, timestamp: Date.now() }, ...filtered].slice(0, 20);
      localStorage.setItem("riwayati_history", JSON.stringify(updated));
      return updated;
    });

    if (page >= 1) unlockAchievement("first-read");
    if (page >= 10) unlockAchievement("ten-pages");
    if (page >= 50) unlockAchievement("fifty-pages");
    if (page >= 100) unlockAchievement("hundred-pages");
  }, [unlockAchievement]);

  const acceptCookies = useCallback(() => {
    setCookieConsent(true);
    localStorage.setItem("riwayati_cookies", "1");
  }, []);

  const rejectCookies = useCallback(() => {
    setCookieConsent(false);
    localStorage.setItem("riwayati_cookies", "0");
  }, []);

  const addReadingTime = useCallback((seconds: number) => {
    setTotalReadingTime((prev) => {
      const next = prev + seconds;
      localStorage.setItem("riwayati_reading_time", String(next));
      return next;
    });
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("riwayati_lang", l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  }, []);

  const setReaderPrefsPersist = useCallback((prefs: ReaderPreferences) => {
    setReaderPrefs(prefs);
    localStorage.setItem("riwayati_reader_prefs", JSON.stringify(prefs));
  }, []);

  const trackNovelView = useCallback((novelId: string) => {
    setNovelViews((prev) => {
      const next = { ...prev, [novelId]: (prev[novelId] || 0) + 1 };
      localStorage.setItem("riwayati_views", JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((novelId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(novelId)
        ? prev.filter((id) => id !== novelId)
        : [...prev, novelId];
      localStorage.setItem("riwayati_favorites", JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang, mounted]);

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        isDark,
        toggleTheme,
        guest,
        loginAsGuest,
        logout,
        isAdmin,
        setAdmin,
        ratings,
        setRating,
        bookmarks,
        saveBookmark,
        readHistory,
        cookieConsent,
        acceptCookies,
        rejectCookies,
        totalReadingTime,
        addReadingTime,
        achievements,
        readerPrefs,
        setReaderPrefs: setReaderPrefsPersist,
        novelViews,
        trackNovelView,
        favorites,
        toggleFavorite,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
