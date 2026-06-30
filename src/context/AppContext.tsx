"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

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
  isAdmin: boolean;
  setAdmin: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark]   = useState(false);
  const [guest, setGuest]     = useState<GuestUser | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [isAdmin, setAdmin]   = useState(false);
  const [mounted, setMounted] = useState(false);
  const ratingsRef = useRef(ratings);
  ratingsRef.current = ratings;

  const debouncedRatings = useDebounce(ratings, 400);

  useEffect(() => {
    try {
      const savedTheme   = localStorage.getItem("riwayati_theme");
      const savedGuest   = localStorage.getItem("riwayati_guest");
      const savedRatings = localStorage.getItem("riwayati_ratings");
      const savedAdmin   = localStorage.getItem("riwayati_admin");

      if (savedTheme === "dark")  setIsDark(true);
      else if (savedTheme === "light") setIsDark(false);
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setIsDark(true);
      }

      if (savedGuest)   setGuest(JSON.parse(savedGuest));
      if (savedRatings) setRatings(JSON.parse(savedRatings));
      if (savedAdmin === "1") setAdmin(true);
    } catch { /* ignore */ }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem("riwayati_theme", isDark ? "dark" : "light");
    } catch {}
  }, [isDark, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("riwayati_ratings", JSON.stringify(debouncedRatings));
    } catch {}
  }, [debouncedRatings, mounted]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handle = (e: MediaQueryListEvent) => {
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
    // Auto-detect admin code
    if (name === "Blazixz") {
      setAdmin(true);
      try { localStorage.setItem("riwayati_admin", "1"); } catch {}
    }
  }, []);

  const logout = useCallback(() => {
    setGuest(null);
    setAdmin(false);
    try {
      localStorage.removeItem("riwayati_guest");
      localStorage.removeItem("riwayati_admin");
    } catch {}
  }, []);

  const setRating = useCallback((novelId: string, stars: number) => {
    setRatings((prev) => ({ ...prev, [novelId]: stars }));
    try {
      localStorage.setItem(
        "riwayati_ratings",
        JSON.stringify({ ...ratingsRef.current, [novelId]: stars })
      );
    } catch {}
  }, []);

  return (
    <AppContext.Provider
      value={{ isDark, toggleTheme, guest, loginAsGuest, logout, ratings, setRating, isAdmin, setAdmin }}
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
