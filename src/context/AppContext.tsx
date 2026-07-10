"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import type { Lang } from "@/lib/i18n";
import { getUserKey, setAccountKey } from "@/lib/device";
import { getSupabase } from "@/lib/supabase";

interface AuthUser {
  id: string;
  email: string | null;
}

/* ─── UI sound presets (synthesized, no asset files) ─────── */
export type SoundType =
  | "click"
  | "open"
  | "close"
  | "toggle"
  | "login"
  | "logout"
  | "success"
  | "error"
  | "navigate";

interface Note {
  freq: number;
  dur: number;
  type: OscillatorType;
  gain: number;
}

const SOUND_PRESETS: Record<SoundType, Note[]> = {
  click: [{ freq: 620, dur: 0.045, type: "triangle", gain: 0.035 }],
  open: [
    { freq: 523, dur: 0.08, type: "sine", gain: 0.05 },
    { freq: 784, dur: 0.1, type: "sine", gain: 0.04 },
  ],
  close: [
    { freq: 440, dur: 0.08, type: "sine", gain: 0.05 },
    { freq: 320, dur: 0.12, type: "sine", gain: 0.04 },
  ],
  toggle: [{ freq: 700, dur: 0.045, type: "triangle", gain: 0.02 }],
  login: [
    { freq: 523, dur: 0.1, type: "sine", gain: 0.06 },
    { freq: 784, dur: 0.16, type: "sine", gain: 0.05 },
  ],
  logout: [
    { freq: 440, dur: 0.1, type: "sine", gain: 0.05 },
    { freq: 311, dur: 0.16, type: "sine", gain: 0.04 },
  ],
  success: [
    { freq: 587, dur: 0.1, type: "sine", gain: 0.06 },
    { freq: 880, dur: 0.18, type: "sine", gain: 0.05 },
  ],
  error: [{ freq: 196, dur: 0.2, type: "sawtooth", gain: 0.035 }],
  navigate: [{ freq: 560, dur: 0.035, type: "sine", gain: 0.022 }],
};

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
  readingTheme: "light" | "dark" | "sepia";
}

interface AppContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  isDark: boolean;
  toggleTheme: (e?: React.MouseEvent) => void;
  guest: GuestUser | null;
  loginAsGuest: (name: string) => void;
  logout: () => void;
  /* ── Real accounts (Supabase Auth, email OTP) ─────────── */
  authUser: AuthUser | null;
  authReady: boolean;
  /** Whether Supabase Auth is configured/available in this deployment. */
  authAvailable: boolean;
  /** Send a 6-digit login code to the email. */
  signInWithEmail: (email: string) => Promise<{ ok: boolean; error?: string }>;
  /** Verify the code and sign in; migrates guest data into the account. */
  verifyEmailOtp: (email: string, code: string) => Promise<{ ok: boolean; error?: string }>;
  /** Sign out of the account (guest mode remains usable). */
  signOutAccount: () => Promise<void>;
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
  introReady: boolean;
  dismissIntro: () => void;
  totalReadingTime: number;
  addReadingTime: (seconds: number) => void;
  achievements: Achievement[];
  readerPrefs: ReaderPreferences;
  setReaderPrefs: (prefs: ReaderPreferences) => void;
  novelViews: Record<string, number>;
  trackNovelView: (novelId: string) => void;
  favorites: string[];
  toggleFavorite: (novelId: string) => void;
  /* ── Subscription / unlock state (reactive) ───────────── */
  hydrated: boolean;
  /** Global subscription/unlock (all novels) — set after purchase or redeem. */
  unlocked: boolean;
  /** Developer code active (session-scoped). */
  devUnlocked: boolean;
  /** Persist + broadcast the global unlock immediately. */
  unlock: () => void;
  /** Set/clear developer unlock (session-scoped). */
  setDevUnlocked: (v: boolean) => void;
  /** Lightweight toast for inline feedback (e.g. reading gate). */
  showToast: (message: string, type?: "info" | "success" | "error") => void;
  /** Play a synthesized UI sound. */
  playSound: (type?: SoundType) => void;
  /** Whether UI sounds are enabled. */
  soundEnabled: boolean;
  /** Toggle UI sounds on/off. */
  toggleSound: () => void;
}

/**
 * Parses a JSON value that may have been written by an older build, edited
 * by hand in devtools, truncated by a storage-quota error, or otherwise be
 * malformed. `JSON.parse` throwing here is NOT hypothetical — this hydration
 * step runs on every full page load (including landing directly on a novel
 * page via a bookmark/refresh), and an uncaught throw inside it took down
 * the entire app to the generic error screen for any returning visitor with
 * stale localStorage. Never let a single bad key break the whole session.
 */
function safeParse<T>(raw: string | null, validate?: (v: unknown) => v is T): T | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (validate && !validate(parsed)) return null;
    return parsed as T;
  } catch {
    return null;
  }
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
  const [introReady, setIntroReady] = useState(false);
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
    readingTheme: "light",
  });
  const [novelViews, setNovelViews] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const lastSyncRef = useRef<Record<string, number>>({});
  const guestRef = useRef<GuestUser | null>(null);

  /* ── Auth ─────────────────────────────────────────────── */
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const authAvailable = !!getSupabase();

  /* ── Subscription / unlock (reactive, persisted) ──────── */
  const [unlocked, setUnlocked] = useState(false);
  const [devUnlocked, setDevUnlockedState] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string; type: string } | null>(null);
  const toastTimer = useRef<number | null>(null);

  /* ── UI sounds (on by default; the user can still mute via the header toggle) ── */
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  /* Hydrate from localStorage on client.
   *
   * Defensive by construction: every read is independently guarded so a
   * single corrupted/legacy/hand-edited key (or a browser that blocks
   * storage access entirely — Safari ITP, private-mode quota errors,
   * privacy extensions) can never throw past this effect and take down the
   * whole app to the generic error screen. Each field simply keeps its
   * default value when its stored form can't be trusted. */
  useEffect(() => {
    const getItem = (key: string): string | null => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    };
    const getSessionItem = (key: string): string | null => {
      try {
        return sessionStorage.getItem(key);
      } catch {
        return null;
      }
    };

    try {
      const savedLang = getItem("riwayati_lang") as Lang | null;
      if (savedLang === "en" || savedLang === "ar") setLangState(savedLang);

      if (getItem("riwayati_theme") === "dark") setIsDark(true);

      const savedGuest = safeParse<GuestUser>(getItem("riwayati_guest"));
      if (savedGuest && typeof savedGuest.name === "string") setGuest(savedGuest);

      const savedRatings = safeParse<Record<string, number>>(getItem("riwayati_ratings"));
      if (savedRatings && typeof savedRatings === "object") setRatings(savedRatings);

      if (getItem("riwayati_admin") === "1") setIsAdmin(true);

      const savedBookmarks = safeParse<Record<string, number>>(getItem("riwayati_bookmarks"));
      if (savedBookmarks && typeof savedBookmarks === "object") setBookmarks(savedBookmarks);

      const savedHistory = safeParse<ReadEntry[]>(getItem("riwayati_history"));
      if (Array.isArray(savedHistory)) setReadHistory(savedHistory);

      const savedCookie = getItem("riwayati_cookies");
      if (savedCookie) setCookieConsent(savedCookie === "1");

      // The old splash screen used to flip this on; it's disabled now, so
      // enable the intro layer straight away so the cookie prompt appears on
      // entry. `void getSessionItem` keeps the import referenced.
      void getSessionItem;
      setIntroReady(true);

      const savedTime = getItem("riwayati_reading_time");
      if (savedTime) setTotalReadingTime(parseInt(savedTime, 10) || 0);

      const savedAchievements = safeParse<Achievement[]>(getItem("riwayati_achievements"));
      if (Array.isArray(savedAchievements)) setAchievements(savedAchievements);

      const savedPrefs = safeParse<ReaderPreferences>(getItem("riwayati_reader_prefs"));
      if (savedPrefs && typeof savedPrefs === "object") setReaderPrefs(savedPrefs);

      const savedViews = safeParse<Record<string, number>>(getItem("riwayati_views"));
      if (savedViews && typeof savedViews === "object") setNovelViews(savedViews);

      const savedFavorites = safeParse<string[]>(getItem("riwayati_favorites"));
      if (Array.isArray(savedFavorites)) setFavorites(savedFavorites);

      /* Hydrate subscription / unlock state */
      setUnlocked(getItem("riwayati_unlocked") === "1");
      setDevUnlockedState(
        getSessionItem("riwayati_dev_token") === "1" || getSessionItem("riwayati_devcode") != null
      );
      /* Sounds default to on; only respect an explicit prior mute. */
      if (getItem("riwayati_sound") === "0") {
        setSoundEnabled(false);
        soundEnabledRef.current = false;
      }
    } catch (err) {
      // Should be unreachable given the guards above, but this hydration
      // step must never be the reason the whole app fails to render.
      console.error("[AppContext] hydration failed, continuing with defaults:", err);
    } finally {
      setMounted(true);
    }
  }, []);

  /* Sync theme class to <html> */
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("riwayati_theme", isDark ? "dark" : "light");
  }, [isDark, mounted]);

  /* Pull server-side reading progress once hydrated, merge (keep furthest page) */
  useEffect(() => {
    if (!mounted) return;
    const userKey = getUserKey(guest?.name);
    let cancelled = false;
    // Restore this user's saved ratings from the server (survives device swaps).
    (async () => {
      try {
        const res = await fetch(`/api/ratings?userKey=${encodeURIComponent(userKey)}`);
        if (!res.ok) return;
        const serverRatings: Record<string, number> = await res.json();
        if (cancelled || !serverRatings || typeof serverRatings !== "object") return;
        setRatings((prev) => {
          const next = { ...prev, ...serverRatings };
          localStorage.setItem("riwayati_ratings", JSON.stringify(next));
          return next;
        });
      } catch {}
    })();
    (async () => {
      try {
        const res = await fetch(`/api/progress?userKey=${encodeURIComponent(userKey)}`);
        if (!res.ok) return;
        const rows: { novel_id: string; last_page: number; updated_at: string }[] = await res.json();
        if (cancelled || !Array.isArray(rows) || rows.length === 0) return;
        setBookmarks((prev) => {
          const next = { ...prev };
          for (const r of rows) {
            const local = next[r.novel_id] || 0;
            if (r.last_page > local) next[r.novel_id] = r.last_page;
          }
          localStorage.setItem("riwayati_bookmarks", JSON.stringify(next));
          return next;
        });
        setReadHistory((prev) => {
          const map = new Map(prev.map((e) => [e.novelId, e]));
          for (const r of rows) {
            const existing = map.get(r.novel_id);
            const ts = new Date(r.updated_at).getTime();
            if (!existing || r.last_page > existing.lastPage) {
              map.set(r.novel_id, { novelId: r.novel_id, lastPage: r.last_page, timestamp: ts });
            }
          }
          const updated = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
          localStorage.setItem("riwayati_history", JSON.stringify(updated));
          return updated;
        });
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [mounted, guest?.name, authUser?.id]);

  useEffect(() => { guestRef.current = guest; }, [guest]);

  /* Initialise auth: restore any existing session + subscribe to changes so
     the account identity (account:<uid>) stays in sync across reloads/tabs. */
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) { setAuthReady(true); return; }
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const u = data.session?.user;
      if (u) {
        setAccountKey(u.id);
        setAuthUser({ id: u.id, email: u.email ?? null });
      }
      setAuthReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      if (u) {
        setAccountKey(u.id);
        setAuthUser({ id: u.id, email: u.email ?? null });
      } else {
        setAccountKey(null);
        setAuthUser(null);
      }
    });

    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) return { ok: false, error: "auth unavailable" };
    const clean = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) return { ok: false, error: "invalid email" };
    const { error } = await supabase.auth.signInWithOtp({
      email: clean,
      options: { shouldCreateUser: true },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  const verifyEmailOtp = useCallback(async (email: string, code: string) => {
    const supabase = getSupabase();
    if (!supabase) return { ok: false, error: "auth unavailable" };
    const clean = email.trim().toLowerCase();
    // Guest/device identity captured BEFORE the account key takes over.
    const previousKey = getUserKey(guestRef.current?.name);
    const { data, error } = await supabase.auth.verifyOtp({
      email: clean,
      token: code.trim(),
      type: "email",
    });
    if (error) return { ok: false, error: error.message };
    const u = data.user;
    const accessToken = data.session?.access_token;
    if (u) {
      setAccountKey(u.id);
      setAuthUser({ id: u.id, email: u.email ?? null });
      // Merge guest purchases/ratings/progress into the account (best-effort).
      if (accessToken && previousKey && !previousKey.startsWith("account:")) {
        fetch("/api/account/migrate", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ fromKey: previousKey }),
        }).catch(() => {});
      }
    }
    return { ok: true };
  }, []);

  const signOutAccount = useCallback(async () => {
    const supabase = getSupabase();
    setAccountKey(null);
    setAuthUser(null);
    if (supabase) { try { await supabase.auth.signOut(); } catch {} }
  }, []);

  const toggleTheme = useCallback((e?: React.MouseEvent) => {
    // Anchor the reveal at the click point (falls back to top-center).
    try {
      if (typeof document !== "undefined" && e) {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        document.documentElement.style.setProperty("--theme-x", `${x}%`);
        document.documentElement.style.setProperty("--theme-y", `${y}%`);
      }
    } catch {}
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (doc.startViewTransition && !prefersReduced) {
      doc.startViewTransition(() => setIsDark((d) => !d));
    } else {
      setIsDark((d) => !d);
    }
  }, []);

  const loginAsGuest = useCallback((name: string) => {
    const clean = name.trim();
    const user: GuestUser = { name: clean, loggedInAt: Date.now() };
    setGuest(user);
    localStorage.setItem("riwayati_guest", JSON.stringify(user));
    localStorage.removeItem("riwayati_admin");
    setIsAdmin(false);
    /* Sync subscription state to this identity immediately so permissions
       (e.g. carried over from an anonymous session) are not lost on login. */
    try {
      const map = JSON.parse(localStorage.getItem("riwayati_entitlements") || "{}");
      if (map[clean]?.unlocked || localStorage.getItem("riwayati_unlocked") === "1") {
        setUnlocked(true);
        localStorage.setItem("riwayati_unlocked", "1");
      }
    } catch {}
  }, []);

  const setAdmin = useCallback((v: boolean) => {
    setIsAdmin(v);
    localStorage.setItem("riwayati_admin", v ? "1" : "0");
  }, []);

  /* ── Subscription / unlock helpers ──────────────────── */
  const unlock = useCallback(() => {
    setUnlocked(true);
    try {
      localStorage.setItem("riwayati_unlocked", "1");
      const name = guestRef.current?.name;
      if (name) {
        const map = JSON.parse(localStorage.getItem("riwayati_entitlements") || "{}");
        map[name] = { unlocked: true };
        localStorage.setItem("riwayati_entitlements", JSON.stringify(map));
      }
    } catch {}
  }, []);

  const setDevUnlocked = useCallback((v: boolean) => {
    setDevUnlockedState(v);
    try {
      if (v) {
        sessionStorage.setItem("riwayati_dev_token", "1");
        localStorage.setItem("riwayati_unlocked", "1");
        setUnlocked(true);
      } else {
        sessionStorage.removeItem("riwayati_dev_token");
      }
    } catch {}
  }, []);

  const showToast = useCallback(
    (message: string, type: "info" | "success" | "error" = "info") => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      setToast({ id: Date.now(), message, type });
      toastTimer.current = window.setTimeout(() => setToast(null), 4000);
    },
    []
  );

  /* ── UI sound engine (Web Audio, synthesized) ────────── */
  const playSound = useCallback((type: SoundType = "click") => {
    if (!soundEnabledRef.current) return;
    try {
      if (typeof window === "undefined") return;
      const AC: typeof AudioContext | undefined =
        window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AC();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") void ctx.resume();
      const notes = SOUND_PRESETS[type] || SOUND_PRESETS.click;
      let t = ctx.currentTime;
      for (const n of notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = n.type;
        osc.frequency.setValueAtTime(n.freq, t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(n.gain, t + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + n.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + n.dur + 0.02);
        t += n.dur * 0.6;
      }
    } catch {}
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      soundEnabledRef.current = next;
      try {
        localStorage.setItem("riwayati_sound", next ? "1" : "0");
      } catch {}
      if (next) {
        // Resume context on this user gesture so the toggle itself can sound.
        try {
          if (!audioCtxRef.current) {
            const AC: typeof AudioContext | undefined =
              window.AudioContext ||
              (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
            if (AC) audioCtxRef.current = new AC();
          }
          void audioCtxRef.current?.resume();
        } catch {}
        playSound("toggle");
      }
      return next;
    });
  }, [playSound]);

  /* Mobile browsers keep the AudioContext suspended until the very first user
   * gesture. Unlock it on the first touch/pointer so button taps make sound on
   * phones from then on (the `click` that follows can be too late on iOS). */
  useEffect(() => {
    const unlock = () => {
      try {
        const AC: typeof AudioContext | undefined =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AC && !audioCtxRef.current) audioCtxRef.current = new AC();
        void audioCtxRef.current?.resume();
      } catch {}
    };
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  /* Global tap → subtle UI sounds + light haptic buzz for buttons / links /
   * cards. Works on both desktop clicks and mobile taps. */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("input, textarea, select, [contenteditable='true']")) return;
      const interactive = target.closest(
        "button, a, [role='button'], [data-sound], [data-tappable]"
      ) as HTMLElement | null;
      if (!interactive) return;
      // Light haptic feedback on supporting phones.
      try {
        if (soundEnabledRef.current && typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(8);
        }
      } catch {}
      const tagged = target.closest("[data-sound]") as HTMLElement | null;
      const s = tagged?.getAttribute("data-sound");
      if (s && (SOUND_PRESETS as Record<string, Note[]>)[s]) {
        playSound(s as SoundType);
        return;
      }
      playSound("click");
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [playSound]);

  /* Forward uncaught client errors to the logging endpoint. Also self-heal
     from a stale-asset-reference class of crash: if a browser tab has an
     older HTML shell open (or an old service worker cache) referencing a JS
     chunk that a newer deployment no longer serves, the resulting
     "Loading chunk X failed" / ChunkLoadError would otherwise take down the
     whole app. A single hard reload picks up the current deployment's
     shell/chunks; the session-scoped guard prevents a reload loop if the
     network is genuinely down. */
  useEffect(() => {
    const isChunkLoadError = (msg: unknown): boolean => {
      const text = msg instanceof Error ? `${msg.name} ${msg.message}` : String(msg ?? "");
      return /ChunkLoadError|Loading chunk [\w-]+ failed|Importing a module script failed/i.test(text);
    };
    const recoverFromStaleChunk = (source: unknown) => {
      if (!isChunkLoadError(source)) return false;
      try {
        if (sessionStorage.getItem("riwayati_chunk_reload")) return true;
        sessionStorage.setItem("riwayati_chunk_reload", "1");
      } catch {
        /* if we can't set the guard, still avoid an uncontrolled loop */
        return true;
      }
      window.location.reload();
      return true;
    };
    const onError = (e: ErrorEvent) => {
      if (recoverFromStaleChunk(e.error || e.message)) return;
      import("@/lib/error-report").then((m) => m.reportError(e.error || e.message, { source: e.filename, line: e.lineno }));
    };
    const onReject = (e: PromiseRejectionEvent) => {
      if (recoverFromStaleChunk(e.reason)) return;
      import("@/lib/error-report").then((m) => m.reportError(e.reason, { kind: "unhandledrejection" }));
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onReject);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onReject);
    };
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
    // Persist to the server so the rating survives device/browser changes.
    try {
      const userKey = getUserKey(guestRef.current?.name);
      fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novelId, userKey, stars }),
      }).catch(() => {});
    } catch {}
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

    // Sync to server (throttled to once / 4s per novel), fire-and-forget.
    const now = Date.now();
    const key = `${novelId}`;
    if (now - (lastSyncRef.current[key] || 0) > 4000) {
      lastSyncRef.current[key] = now;
      const userKey = getUserKey(guestRef.current?.name);
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userKey, novelId, page }),
      }).catch(() => {});
    }
  }, [unlockAchievement]);

  const acceptCookies = useCallback(() => {
    setCookieConsent(true);
    localStorage.setItem("riwayati_cookies", "1");
  }, []);

  const rejectCookies = useCallback(() => {
    setCookieConsent(false);
    localStorage.setItem("riwayati_cookies", "0");
  }, []);

  const dismissIntro = useCallback(() => {
    setIntroReady(true);
  }, []);

  const addReadingTime = useCallback((seconds: number) => {
    setTotalReadingTime((prev) => {
      const next = prev + seconds;
      localStorage.setItem("riwayati_reading_time", String(next));
      return next;
    });
  }, []);

  const setLang = useCallback((l: Lang) => {
    if (l === lang) return;
    const main = document.querySelector("main");
    if (main && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      main.style.transition = "opacity 0.22s ease, transform 0.22s ease";
      main.style.opacity = "0";
      main.style.transform = "translateY(10px)";
      setTimeout(() => {
        setLangState(l);
        localStorage.setItem("riwayati_lang", l);
        document.documentElement.lang = l;
        document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
        requestAnimationFrame(() => {
          main.style.opacity = "1";
          main.style.transform = "translateY(0)";
        });
      }, 220);
    } else {
      setLangState(l);
      localStorage.setItem("riwayati_lang", l);
      document.documentElement.lang = l;
      document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    }
  }, [lang]);

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
    document.title =
      lang === "ar"
        ? "روايتي — مكتبة الروايات الشخصية"
        : "Rewayati — Personal Novel Library";
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
        authUser,
        authReady,
        authAvailable,
        signInWithEmail,
        verifyEmailOtp,
        signOutAccount,
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
        introReady,
        dismissIntro,
        totalReadingTime,
        addReadingTime,
        achievements,
        readerPrefs,
        setReaderPrefs: setReaderPrefsPersist,
        novelViews,
        trackNovelView,
        favorites,
        toggleFavorite,
        hydrated: mounted,
        unlocked,
        devUnlocked,
        unlock,
        setDevUnlocked,
        showToast,
        playSound,
        soundEnabled,
        toggleSound,
      }}
    >
      {children}
      {toast && (
        <div
          key={toast.id}
          className="fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4 pointer-events-none animate-fade-in"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          <div
            className={
              "max-w-sm w-full sm:w-auto px-5 py-3 rounded-2xl shadow-2xl text-sm font-arabic text-center border " +
              (toast.type === "error"
                ? "bg-red-50 dark:bg-red-950/90 border-red-300 dark:border-red-700 text-red-700 dark:text-red-200"
                : toast.type === "success"
                ? "bg-green-50 dark:bg-green-950/90 border-green-300 dark:border-green-700 text-green-700 dark:text-green-200"
                : "bg-white dark:bg-onyx-800 border-parchment-200 dark:border-white/10 text-gray-800 dark:text-gray-100")
            }
            role="status"
          >
            {toast.message}
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
