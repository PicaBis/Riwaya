"use client";

import { useState } from "react";
import { Lock, Wallet, Eye, EyeOff, CheckCircle2, AlertCircle, Copy, Mail } from "lucide-react";
import { verifyDevCode } from "@/lib/auth";
import { getUserKey } from "@/lib/device";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

interface PaywallProps {
  onUnlock: () => void;
  price?: number;
  ripNumber?: string;
  title?: string;
  preview?: string;
}

const RIP_NUMBER = "00799999002885975343";
const AUTHOR_EMAIL = "Medjahed10abdelhadi@gmail.com";

export function Paywall({ onUnlock, price = 500, ripNumber = RIP_NUMBER, title, preview }: PaywallProps) {
  const { lang } = useApp();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setChecking(true);
    setError("");

    // 1) Developer bypass code (never expires).
    const isDev = await verifyDevCode(code.trim());
    if (isDev) {
      sessionStorage.setItem("riwayati_unlocked", "1");
      localStorage.setItem("riwayati_unlocked", "1");
      onUnlock();
      setChecking(false);
      return;
    }

    // 2) Subscription activation code (single-use, verified server-side).
    try {
      const guest = localStorage.getItem("riwayati_guest");
      const guestName = guest ? (JSON.parse(guest).name as string) : null;
      const res = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), userKey: getUserKey(guestName) }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        sessionStorage.setItem("riwayati_unlocked", "1");
        localStorage.setItem("riwayati_unlocked", "1");
        onUnlock();
      } else {
        setError(data.error || t("paywall.wrongCode", lang));
      }
    } catch {
      setError(t("paywall.verifyError", lang));
    }
    setChecking(false);
  };

  const copyRIP = async () => {
    await navigator.clipboard.writeText(ripNumber).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const openEmail = () => {
    window.open(`mailto:${AUTHOR_EMAIL}?subject=${encodeURIComponent(t("paywall.emailSubject", lang))}`, "_blank");
  };

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-parchment-50/95 dark:bg-onyx-950/97 backdrop-blur-md p-4"
      dir={dir}
    >
      <div className="w-full max-w-sm">
        {title && (
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 ${fontClass}`}>
              {title}
            </h2>
            {preview && (
              <p className={`text-sm text-gray-500 dark:text-gray-400 leading-relaxed ${fontClass}`}>
                {preview}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-gold-500" />
          </div>
        </div>

        <h3 className={`text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center ${fontClass}`}>
          {t("paywall.title", lang)}
        </h3>
        <p className={`text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs leading-relaxed mb-2 ${fontClass}`}>
          {t("paywall.limit", lang)}
        </p>
        <p className={`text-xl font-bold text-gold-500 mb-8 text-center ${fontClass}`}>
          {price} {t("paywall.price", lang)}
        </p>

        {!showPayment ? (
          <div className="flex flex-col items-center gap-3 w-full">
            <button
              onClick={() => setShowPayment(true)}
              className={`w-full flex items-center justify-center gap-2 py-3 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white rounded-xl font-medium transition-all duration-150 shadow-md ${fontClass}`}
            >
              <Wallet className="w-4 h-4" />
              {t("paywall.subscribe", lang)}
            </button>

            <div className="text-center">
              <p className={`text-xs text-gray-400 dark:text-gray-600 mb-2 ${fontClass}`}>
                {t("paywall.hasCode", lang)}
              </p>
              <form onSubmit={handleCodeSubmit} className="flex gap-2">
                <div className="relative">
                  <input
                    type={showCode ? "text" : "password"}
                    value={code}
                    onChange={(e) => { setCode(e.target.value); setError(""); }}
                    placeholder={t("paywall.enterCode", lang)}
                    className={`ps-10 pe-4 py-2 rounded-lg border border-parchment-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 w-44 ${fontClass}`}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode((s) => !s)}
                    className="absolute inset-y-0 start-0 ps-3 flex items-center text-gray-400"
                  >
                    {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={checking || !code.trim()}
                  className={`px-4 py-2 bg-gray-900 dark:bg-white hover:bg-gold-500 dark:hover:bg-gold-500 text-white dark:text-gray-900 hover:text-white text-sm rounded-lg transition-all duration-150 disabled:opacity-40 ${fontClass}`}
                >
                  {checking ? "…" : t("paywall.enter", lang)}
                </button>
              </form>
              {error && (
                <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5 justify-center">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full bg-white dark:bg-onyx-800 rounded-2xl border border-parchment-200 dark:border-white/10 p-5 shadow-xl">
            <h3 className={`font-bold text-gray-900 dark:text-gray-100 mb-4 text-center ${fontClass}`}>
              {t("paywall.steps", lang)}
            </h3>

            <div className="space-y-3 mb-4">
              {/* Step 1: Payment info */}
              <div className="rounded-xl bg-gold-500/5 border border-gold-500/20 p-3">
                <p className={`text-xs text-gold-600 dark:text-gold-400 font-bold mb-2 ${fontClass}`}>
                  {t("paywall.step1Title", lang)}
                </p>
                <div className="rounded-lg bg-white dark:bg-white/5 border border-parchment-200 dark:border-white/10 p-3 mb-2">
                  <p className="text-[10px] text-gray-400 mb-1 font-sans">{t("paywall.ripLabel", lang)}</p>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={copyRIP}
                      className={`flex items-center gap-1 text-xs text-gold-500 hover:text-gold-600 transition-colors flex-shrink-0 ${fontClass}`}
                    >
                      {copied
                        ? <><CheckCircle2 className="w-3.5 h-3.5" />{t("paywall.copied", lang)}</>
                        : <><Copy className="w-3.5 h-3.5" />{t("paywall.copy", lang)}</>}
                    </button>
                    <span dir="ltr" className="font-mono text-sm font-bold text-gray-900 dark:text-gray-100 tracking-wider select-all">
                      {ripNumber}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white dark:bg-white/5 border border-parchment-200 dark:border-white/10 p-2.5">
                  <span className={`text-xs text-gray-400 ${fontClass}`}>{t("paywall.amount", lang)}</span>
                  <span className={`font-bold text-gold-500 text-sm ${fontClass}`}>{price} {t("paywall.amountCurrency", lang)}</span>
                </div>
              </div>

              {/* Step 2: Send receipt */}
              <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 p-3">
                <p className={`text-xs text-amber-700 dark:text-amber-400 font-bold mb-2 ${fontClass}`}>
                  {t("paywall.step2Title", lang)}
                </p>
                <p className={`text-xs text-amber-700/80 dark:text-amber-400/80 leading-relaxed mb-2 ${fontClass}`}>
                  {t("paywall.step2Desc", lang)}
                </p>
                <button
                  onClick={openEmail}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-amber-100 dark:bg-amber-800/30 border border-amber-200 dark:border-amber-700/30 text-amber-800 dark:text-amber-300 text-sm font-sans font-medium hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {AUTHOR_EMAIL}
                </button>
              </div>

              {/* Step 3: Verification */}
              <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/30 p-3">
                <p className={`text-xs text-green-700 dark:text-green-400 font-bold mb-1 ${fontClass}`}>
                  {t("paywall.step3Title", lang)}
                </p>
                <p className={`text-xs text-green-700/80 dark:text-green-400/80 leading-relaxed ${fontClass}`}>
                  {t("paywall.step3Desc", lang)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPayment(false)}
              className={`w-full py-2.5 rounded-xl border border-parchment-300 dark:border-white/10 text-sm text-gray-600 dark:text-gray-400 hover:bg-parchment-100 dark:hover:bg-white/5 transition-colors ${fontClass}`}
            >
              {t("paywall.back", lang)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
