"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Shield, AlertCircle, CheckCircle2, LayoutDashboard } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { verifyDevCode } from "@/lib/auth";

export function DevCodeModal({ onClose }: { onClose: () => void }) {
  const { isAdmin, setAdmin, setDevUnlocked, lang } = useApp();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError(t("dev.empty", lang));
      return;
    }
    const ok = await verifyDevCode(code.trim());
     if (ok) {
      setAdmin(true);
      setDevUnlocked(true);
      try { sessionStorage.setItem("riwayati_devcode", code.trim()); } catch {}
      setSuccess(t("dev.success", lang));
      setError("");
      setTimeout(() => onClose(), 1000);
    } else {
      setError(t("dev.error", lang));
      setSuccess("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-sm bg-white dark:bg-onyx-800 rounded-2xl shadow-2xl p-6 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-7 h-7 text-rose-500" />
          </div>
          <h2 className={`text-xl font-bold text-gray-900 dark:text-gray-100 ${fontClass}`}>
            {t("dev.title", lang)}
          </h2>
          <p className={`text-sm text-gray-500 dark:text-gray-400 mt-1 ${fontClass}`}>
            {t("dev.desc", lang)}
          </p>
        </div>

        {isAdmin ? (
          <div className="text-center py-4">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <p className={`text-sm text-green-600 dark:text-green-400 ${fontClass}`}>
              {t("dev.active", lang)}
            </p>
            <Link
              href="/admin"
              onClick={onClose}
              className={`mt-4 inline-flex items-center justify-center gap-2 w-full py-2.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white rounded-xl text-sm font-medium transition-all ${fontClass}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              {t("dev.openPanel", lang)}
            </Link>
            <button
              onClick={() => { setAdmin(false); onClose(); }}
              className={`mt-3 text-xs text-gray-400 hover:text-red-500 transition-colors ${fontClass}`}
            >
              {t("dev.disable", lang)}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" dir={dir}>
            <div>
              <input
                type="password"
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(""); setSuccess(""); }}
                placeholder={t("dev.placeholder", lang)}
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-parchment-300 dark:border-white/10 bg-parchment-50 dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 font-mono text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                dir="ltr"
              />
              {error && (
                <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5 justify-center">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </p>
              )}
              {success && (
                <p className="flex items-center gap-1 text-xs text-green-500 mt-1.5 justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {success}
                </p>
              )}
            </div>
            <button
              type="submit"
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white rounded-xl text-sm font-medium transition-all duration-150 shadow-sm ${fontClass}`}
            >
              <Shield className="w-4 h-4" />
              {t("dev.activate", lang)}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}