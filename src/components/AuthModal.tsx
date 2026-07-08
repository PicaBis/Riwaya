"use client";

import { useState } from "react";
import { X, Mail, KeyRound, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { lang, signInWithEmail, verifyEmailOtp } = useApp();
  const ar = lang === "ar";
  const dir = ar ? "rtl" : "ltr";
  const fontClass = ar ? "font-arabic" : "font-sans";

  const [step, setStep] = useState<"email" | "code" | "done">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signInWithEmail(email);
    setLoading(false);
    if (res.ok) setStep("code");
    else setError(res.error === "invalid email" ? t("auth.invalidEmail", lang) : t("auth.sendFailed", lang));
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await verifyEmailOtp(email, code);
    setLoading(false);
    if (res.ok) {
      setStep("done");
      setTimeout(onClose, 1400);
    } else {
      setError(t("auth.codeFailed", lang));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      dir={dir}
    >
      <div
        className={`relative w-full max-w-md bg-white dark:bg-onyx-800 rounded-3xl border border-parchment-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 animate-scale-in ${fontClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label={t("common.close", lang)}
          className="absolute top-4 ltr:right-4 rtl:left-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-parchment-100 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gold-500/10 flex items-center justify-center">
            {step === "done" ? (
              <CheckCircle2 className="w-7 h-7 text-green-500" />
            ) : step === "code" ? (
              <KeyRound className="w-7 h-7 text-gold-500" />
            ) : (
              <Mail className="w-7 h-7 text-gold-500" />
            )}
          </div>
        </div>

        {step === "email" && (
          <>
            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100 mb-1">{t("auth.title", lang)}</h2>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">{t("auth.emailHint", lang)}</p>
            <form onSubmit={sendCode} className="space-y-4">
              <input
                type="email"
                required
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-parchment-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 text-center focus:outline-none focus:ring-2 focus:ring-gold-500/40 transition-all"
              />
              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                data-sound="login"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-medium transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                {t("auth.sendCode", lang)}
              </button>
            </form>
          </>
        )}

        {step === "code" && (
          <>
            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100 mb-1">{t("auth.codeTitle", lang)}</h2>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
              {t("auth.codeHint", lang)} <span dir="ltr" className="font-medium text-gold-600 dark:text-gold-400">{email}</span>
            </p>
            <form onSubmit={verify} className="space-y-4">
              <input
                inputMode="numeric"
                required
                dir="ltr"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                className="w-full px-4 py-3 rounded-xl border border-parchment-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-gold-500/40 transition-all"
              />
              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading || code.length < 6}
                data-sound="success"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-medium transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <KeyRound className="w-5 h-5" />}
                {t("auth.verify", lang)}
              </button>
              <button
                type="button"
                onClick={() => { setStep("email"); setError(""); setCode(""); }}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-gold-500 transition-colors"
              >
                <ArrowLeft className={`w-4 h-4 ${!ar ? "rotate-180" : ""}`} />
                {t("auth.changeEmail", lang)}
              </button>
            </form>
          </>
        )}

        {step === "done" && (
          <>
            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100 mb-1">{t("auth.welcome", lang)}</h2>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">{t("auth.synced", lang)}</p>
          </>
        )}

        <p className="text-[11px] text-center text-gray-400 dark:text-gray-600 mt-6 leading-relaxed">
          {t("auth.privacyNote", lang)}
        </p>
      </div>
    </div>
  );
}
