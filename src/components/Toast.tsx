"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import clsx from "clsx";

/* ─── Types ───────────────────────────────────────────── */
type ToastKind = "success" | "error" | "info";
interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}
interface ToastContextValue {
  toast: (message: string, kind?: ToastKind) => void;
}

/* ─── Context ─────────────────────────────────────────── */
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const toast = useCallback((message: string, kind: ToastKind = "info") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* ── Toast Stack ─────────────────────────────── */}
      <div
        aria-live="polite"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none"
        dir="rtl"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={clsx(
              "flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-arabic pointer-events-auto",
              "animate-fade-up border",
              t.kind === "success" &&
                "bg-emerald-50 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700",
              t.kind === "error" &&
                "bg-red-50 dark:bg-red-900/80 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700",
              t.kind === "info" &&
                "bg-white dark:bg-onyx-800 text-gray-800 dark:text-gray-200 border-parchment-200 dark:border-white/10"
            )}
          >
            {t.kind === "success" && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
            {t.kind === "error" && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {t.kind === "info" && <Info className="w-4 h-4 flex-shrink-0 text-gold-500" />}
            <span>{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="ms-1 p-0.5 rounded opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}
