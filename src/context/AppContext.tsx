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
  // Theme
  isDark: boolean;
  toggleTheme: () => void;
  // Guest session
  guest: GuestUser | null;
  loginAsGuest: (name: string) => void;
  logout: () => void;
  // Ratings  (novelId → 1-5)
  ratings: Record<string, number>;
  setRating: (novelId: string, stars: number) => void;
}

/* ─── Context ────────────────────────────────────────────── */
const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [guest, setGuest] = useState<GuestUser | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);

  /* Hydrate from localStorage on client */
  useEffect(() => {
    const savedTheme = localStorage.getItem("riwayati_theme");
    const savedGuest = localStorage.getItem("riwayati_guest");
    const savedRatings = localStorage.getItem("riwayati_ratings");

    if (savedTheme === "dark") setIsDark(true);
    if (savedGuest) setGuest(JSON.parse(savedGuest));
    if (savedRatings) setRatings(JSON.parse(savedRatings));
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
    const user: GuestUser = { name, loggedInAt: Date.now() };
    setGuest(user);
    localStorage.setItem("riwayati_guest", JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    setGuest(null);
    localStorage.removeItem("riwayati_guest");
  }, []);

  const setRating = useCallback((novelId: string, stars: number) => {
    setRatings((prev) => {
      const next = { ...prev, [novelId]: stars };
      localStorage.setItem("riwayati_ratings", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{ isDark, toggleTheme, guest, loginAsGuest, logout, ratings, setRating }}
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
