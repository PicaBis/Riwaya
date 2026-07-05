"use client";

import { useState } from "react";
import { Lock, Wallet, Eye, EyeOff, CheckCircle2, AlertCircle, Copy, Mail } from "lucide-react";
import { verifyDevCode } from "@/lib/auth";
import { getUserKey } from "@/lib/device";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { BANK, AUTHOR } from "@/lib/constants";

interface PaywallProps {
  onUnlock: () => void;
  price?: number;
  ripNumber?: string;
  title?: string;
  preview?: string;
}

export function Paywall({ onUnlock, price = 500, ripNumber = BANK.ripNumber, title, preview }: PaywallProps) {
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

    const isDev = await verifyDevCode(code.trim());
    if (isDev) {
      try {
        const tok = await fetch("/api/admin/dev-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: code.trim() }),
        }).then(r => r.json().then(d => ({ ok: r.ok, token: d.token })));
        if (tok.ok && tok.token) {
          sessionStorage.setItem("riwayati_dev_token", tok.token as string);
        }
      } catch {}
      sessionStorage.setItem("riwayati_unlocked", "1");
      onUnlock();
      setChecking(false);
      return;
    }

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
    window.open(`mailto:${AUTHOR.email}?subject=${encodeURIComponent(t("paywall.emailSubject", lang))}`, "_blank");
  };

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-parchment-50/95 dark:bg-onyx-950/97 backdrop-blur-md p-3 sm:p-4"
      dir={dir}
    >
      <div className="w-full max-w-sm max-h-[90vh] flex flex-col rounded-[2.5rem] bg-white/95 dark:bg-onyx-900/95 border border-parchment-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="flex-1 overflow-y-auto overscroll-contain p-6 sm:p-8 space-y-6 scrollbar-none">
          {title && (
            <div className="text-center space-y-2">
              <h2 className={`text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight ${fontClass}`}>
                {title}
              </h2>
              <div className="h-1 w-12 bg-gold-500 mx-auto rounded-full opacity-50" />
              {preview && (
                <p className={`text-sm text-gray-500 dark:text-gray-400 leading-relaxed italic line-clamp-3 ${fontClass}`}>
                  &quot;{preview}&quot;
                </p>
              )}
            </div>
          )}

          <div className="flex justify-center relative">
            <div className="absolute inset-0 bg-gold-500/20 blur-3xl rounded-full" />
            <div className="relative w-20 h-20 rounded-[2rem] bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-500/40 flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <Lock className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="text-center space-y-1">
            <h3 className={`text-xl font-bold text-gray-900 dark:text-gray-100 ${fontClass}`}>
              {t("paywall.title", lang)}
            </h3>
            <p className={`text-xs uppercase tracking-widest text-gold-600 dark:text-gold-400 font-black ${fontClass}`}>
              {t("paywall.limit", lang)}
            </p>
            <div className="py-4">
              <div className="inline-flex items-baseline gap-1 bg-parchment-100 dark:bg-white/5 px-6 py-3 rounded-2xl border border-parchment-200 dark:border-white/10">
                <span className="text-3xl font-black text-gray-900 dark:text-white">{price}</span>
                <span className={`text-sm font-bold text-gray-500 dark:text-gray-400 ${fontClass}`}>{t("paywall.price", lang)}</span>
              </div>
            </div>
          </div>

          {!showPayment ? (
            <div className="flex flex-col items-center gap-3 w-full">
              <button
                onClick={() => setShowPayment(true)}
                className={`w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 active:scale-[0.98] text-white rounded-[1.25rem] font-bold transition-all duration-300 shadow-[0_10px_20px_rgba(212,175,55,0.3)] ${fontClass}`}
              >
                <Wallet className="w-5 h-5" />
                {t("paywall.subscribe", lang)}
              </button>

              <div className="text-center w-full pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-parchment-200 dark:bg-white/10" />
                  <p className={`text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold ${fontClass}`}>
                    {t("paywall.hasCode", lang)}
                  </p>
                  <div className="h-px flex-1 bg-parchment-200 dark:bg-white/10" />
                </div>
                <form onSubmit={handleCodeSubmit} className="flex gap-2">
                  <div className="relative flex-1 group">
                    <input
                      type={showCode ? "text" : "password"}
                      value={code}
                      onChange={(e) => { setCode(e.target.value); setError(""); }}
                      placeholder={t("paywall.enterCode", lang)}
                      className={`ps-10 pe-4 py-3 rounded-xl border border-parchment-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 w-full transition-all ${fontClass}`}
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCode((s) => !s)}
                      className="absolute inset-y-0 start-0 ps-3 flex items-center text-gray-400 group-focus-within:text-gold-500 transition-colors"
                    >
                      {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={checking || !code.trim()}
                    className={`px-6 py-3 bg-gray-900 dark:bg-white hover:bg-gold-500 dark:hover:bg-gold-500 text-white dark:text-gray-900 hover:text-white text-sm font-bold rounded-xl transition-all duration-300 disabled:opacity-40 active:scale-95 ${fontClass}`}
                  >
                    {checking ? <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" /> : t("paywall.enter", lang)}
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
            <div className="w-full rounded-xl border border-parchment-200 dark:border-white/10 bg-white dark:bg-onyx-800 p-4">
              <h3 className={`font-bold text-gray-900 dark:text-gray-100 mb-4 text-center ${fontClass}`}>
                {t("paywall.steps", lang)}
              </h3>

              <div className="space-y-3 mb-4">
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
                    {AUTHOR.email}
                  </button>
                </div>

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
    </div>
  );
}
