"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

/* ─── Types ─────────────────────────────────────────────── */
interface GuestUser {
  name: string;
  loggedInAt: number;
}

interface AppContextValue {
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
}

/* ─── Context ────────────────────────────────────────────── */
const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [guest, setGuest] = useState<GuestUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [bookmarks, setBookmarks] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);

  /* Hydrate from localStorage on client */
  useEffect(() => {
    const savedTheme = localStorage.getItem("riwayati_theme");
    const savedGuest = localStorage.getItem("riwayati_guest");
    const savedRatings = localStorage.getItem("riwayati_ratings");
    const savedAdmin = localStorage.getItem("riwayati_admin");
    const savedBookmarks = localStorage.getItem("riwayati_bookmarks");

    if (savedTheme === "dark") setIsDark(true);
    if (savedGuest) setGuest(JSON.parse(savedGuest));
    if (savedRatings) setRatings(JSON.parse(savedRatings));
    if (savedAdmin === "1") setIsAdmin(true);
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
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

  const saveBookmark = useCallback((novelId: string, page: number) => {
    setBookmarks((prev) => {
      const next = { ...prev, [novelId]: page };
      localStorage.setItem("riwayati_bookmarks", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
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
