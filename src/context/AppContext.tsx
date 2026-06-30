"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

/* ─── Types ──────────────────────────────────────────── */
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
  ratings: Record<string, number>;
  setRating: (novelId: string, stars: number) => void;
}

/* ─── Context ────────────────────────────────────────── */
const AppContext = createContext<AppContextValue | null>(null);

/* ─── Debounce helper ────────────────────────────────── */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

/* ─── Provider ───────────────────────────────────────── */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark]   = useState(false);
  const [guest, setGuest]     = useState<GuestUser | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);
  const ratingsRef = useRef(ratings);
  ratingsRef.current = ratings;

  /* Debounced ratings for localStorage write */
  const debouncedRatings = useDebounce(ratings, 400);

  /* ── Hydrate from localStorage on client ────────── */
  useEffect(() => {
    try {
      const savedTheme  = localStorage.getItem("riwayati_theme");
      const savedGuest  = localStorage.getItem("riwayati_guest");
      const savedRatings = localStorage.getItem("riwayati_ratings");

      // 1. Explicit saved preference wins
      if (savedTheme === "dark")  setIsDark(true);
      else if (savedTheme === "light") setIsDark(false);
      // 2. No preference yet → follow OS
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setIsDark(true);
      }

      if (savedGuest)   setGuest(JSON.parse(savedGuest));
      if (savedRatings) setRatings(JSON.parse(savedRatings));
    } catch { /* quota / JSON errors */ }
    setMounted(true);
  }, []);

  /* ── Sync theme class ──────────────────────────── */
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem("riwayati_theme", isDark ? "dark" : "light");
    } catch {}
  }, [isDark, mounted]);

  /* ── Debounced ratings write ───────────────────── */
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("riwayati_ratings", JSON.stringify(debouncedRatings));
    } catch {}
  }, [debouncedRatings, mounted]);

  /* ── OS theme change listener ──────────────────── */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handle = (e: MediaQueryListEvent) => {
      // Only follow OS if user hasn't explicitly chosen
      if (!localStorage.getItem("riwayati_theme")) {
        setIsDark(e.matches);
      }
    };
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);

  const toggleTheme = useCallback(() => setIsDark((d) => !d), []);

  const loginAsGuest = useCallback((name: string) => {
    const user: GuestUser = { name, loggedInAt: Date.now() };
    setGuest(user);
    try { localStorage.setItem("riwayati_guest", JSON.stringify(user)); } catch {}
  }, []);

  const logout = useCallback(() => {
    setGuest(null);
    try { localStorage.removeItem("riwayati_guest"); } catch {}
  }, []);

  const setRating = useCallback((novelId: string, stars: number) => {
    setRatings((prev) => ({ ...prev, [novelId]: stars }));
    // Immediate write also (debounce is for rapid clicks)
    try {
      localStorage.setItem(
        "riwayati_ratings",
        JSON.stringify({ ...ratingsRef.current, [novelId]: stars })
      );
    } catch {}
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
