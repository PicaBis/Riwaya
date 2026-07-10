"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock, Wallet, Eye, EyeOff, CheckCircle2, AlertCircle, Copy, Mail, ShieldCheck, QrCode, RefreshCw, ArrowLeft } from "lucide-react";
import { verifyDevCode } from "@/lib/auth";
import { getUserKey } from "@/lib/device";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { BANK, AUTHOR } from "@/lib/constants";

const USD_PRICE = "3.76";
const RDOTPAY_ID = "1042494411";

interface PaywallProps {
  onUnlock: () => void;
  onBackToFree?: () => void;
  price?: number;
  ripNumber?: string;
  title?: string;
  preview?: string;
}

export function Paywall({ onUnlock, onBackToFree, price = 500, ripNumber = BANK.ripNumber, title, preview }: PaywallProps) {
  const { lang, unlock, setDevUnlocked, playSound } = useApp();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [copied, setCopied] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed || trimmed.length < 4) {
      setError(t("paywall.wrongCode", lang));
      return;
    }
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
      setUnlocking(true);
      playSound("success");
      // Flip the global unlock state AFTER the animation so the "Content
      // Unlocked" screen is visible and locks disappear without a reload.
      setTimeout(() => {
        setDevUnlocked(true);
        unlock();
        onUnlock();
      }, 600);
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
        setUnlocking(true);
        playSound("success");
        setTimeout(() => {
          unlock();
          onUnlock();
        }, 1000);
      } else {
        setError(data.error || t("paywall.wrongCode", lang));
        playSound("error");
      }
    } catch {
      setError(t("paywall.verifyError", lang));
    }
    setChecking(false);
  };

  const copyText = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(""), 2500);
  };

  const openEmail = () => {
    const subject = encodeURIComponent(t("paywall.emailSubject", lang));
    window.location.href = `mailto:${AUTHOR.email}?subject=${subject}`;
  };

  /* ── Unlock complete animation ────────────────────── */
  if (unlocking) {
    return (
      <div className="w-full max-w-lg sm:max-w-xl flex flex-col items-center justify-center gap-4 p-10 rounded-[2.5rem] bg-white/95 dark:bg-onyx-900/95 border border-gold-500/40 shadow-[0_20px_60px_rgba(212,175,55,0.3)] animate-in zoom-in-50 fade-in duration-700">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-gold-500/30 rounded-full animate-ping" />
          <div className="absolute inset-0 bg-gold-500/20 rounded-full animate-pulse" />
          <ShieldCheck className="w-10 h-10 text-gold-500 relative z-10" />
        </div>
        <p className={`text-lg font-black text-gold-600 dark:text-gold-400 ${fontClass}`}>
          {lang === "ar" ? "تم فتح المحتوى" : "Content Unlocked"}
        </p>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-gold-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl lg:max-w-3xl max-h-[92vh] flex flex-col rounded-[2.5rem] bg-white/95 dark:bg-onyx-900/95 border border-parchment-200 dark:border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.35)] overflow-hidden animate-in fade-in zoom-in-95 duration-500" dir={dir}>
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-7 space-y-5 scrollbar-none">
          {/* ── Header ─────────────────────────────── */}
          {title && (
            <div className="text-center space-y-2">
              <h2 className={`text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight ${fontClass}`}>
                {title}
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-gold-500 mx-auto rounded-full" />
              {preview && (
                <p className={`text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed italic line-clamp-2 opacity-80 ${fontClass}`}>
                  &quot;{preview}&quot;
                </p>
              )}
            </div>
          )}

          {/* ── Lock icon ──────────────────────────── */}
          <div className="flex justify-center relative py-2">
            <div className="absolute inset-0 bg-gold-500/15 blur-3xl rounded-full animate-pulse" style={{ animationDuration: "3s" }} />
            <div className="relative w-20 h-20 rounded-[2rem] bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-500/40 flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <Lock className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* ── Title + subtitle ───────────────────── */}
          <div className="text-center space-y-1">
            <h3 className={`text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 ${fontClass}`}>
              {t("paywall.title", lang)}
            </h3>
            <p className={`text-[11px] sm:text-xs leading-relaxed text-gray-500 dark:text-gray-400 ${fontClass}`}>
              {t("paywall.limit", lang)}
            </p>
          </div>

          {/* ── Price ──────────────────────────────── */}
          <div className="flex justify-center">
            <div className="inline-flex flex-col items-center gap-2 bg-parchment-50 dark:bg-white/5 px-6 py-4 rounded-2xl border-2 border-gold-500/20">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">{price}</span>
                <span className={`text-sm font-bold text-gray-500 dark:text-gray-400 ${fontClass}`}>{t("paywall.price", lang)}</span>
              </div>
              <span className={`text-xs font-medium text-gold-600 dark:text-gold-400 ${fontClass}`}>
                ≈ ${USD_PRICE} USD
              </span>
            </div>
          </div>

          {!showPayment ? (
            /* ── Main actions ─────────────────────── */
            <div className="flex flex-col items-center gap-3 w-full">
              <button
                onClick={() => setShowPayment(true)}
                className={`w-full flex items-center justify-center gap-3 py-3.5 sm:py-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 active:scale-[0.98] text-white rounded-[1.25rem] font-bold text-sm sm:text-base transition-all duration-300 shadow-[0_10px_20px_rgba(212,175,55,0.3)] ${fontClass}`}
              >
                <Wallet className="w-5 h-5" />
                {t("paywall.subscribe", lang)}
              </button>

              {onBackToFree && (
                <button
                  onClick={onBackToFree}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-[1.25rem] text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-parchment-100 dark:hover:bg-white/5 transition-all duration-150 ${fontClass}`}
                >
                  <ArrowLeft className={`w-4 h-4 ${dir === "ltr" ? "rotate-180" : ""}`} />
                  {t("paywall.backToFree", lang)}
                </button>
              )}

              <div className="flex items-center gap-2 w-full">
                <div className="h-px flex-1 bg-parchment-200 dark:bg-white/10" />
                <p className={`text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold ${fontClass}`}>
                  {t("paywall.hasCode", lang)}
                </p>
                <div className="h-px flex-1 bg-parchment-200 dark:bg-white/10" />
              </div>

              <form onSubmit={handleCodeSubmit} className="flex gap-2 w-full">
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
                  {checking ? <RefreshCw className="w-4 h-4 animate-spin" /> : t("paywall.enter", lang)}
                </button>
              </form>
              {error && (
                <p className="flex items-center gap-1 text-xs text-red-500 justify-center">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </p>
              )}
              <p className={`text-[11px] leading-relaxed text-gray-400 dark:text-gray-500 text-center px-2 ${fontClass}`}>
                {t("paywall.noteManual", lang)}
              </p>
            </div>
          ) : (
            /* ── Payment steps ────────────────────── */
            <div className="w-full space-y-4">
              <h3 className={`text-center font-bold text-gray-900 dark:text-gray-100 mb-1 ${fontClass}`}>
                {t("paywall.steps", lang)}
              </h3>

              {/* ── Step 1: Local payment ────────── */}
              <div className="rounded-2xl bg-gold-500/5 border border-gold-500/20 p-4 space-y-3">
                <h4 className={`text-sm font-black text-gold-700 dark:text-gold-400 flex items-center gap-2 ${fontClass}`}>
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold-500 text-white text-xs font-bold">1</span>
                  {t("paywall.step1Title", lang)}
                </h4>

                {/* RIP */}
                <div className="rounded-xl bg-white dark:bg-white/5 border border-parchment-200 dark:border-white/10 p-3">
                  <p className={`text-[10px] text-gray-400 mb-1.5 ${fontClass}`}>{t("paywall.ripLabel", lang)}</p>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => copyText(ripNumber, "rip")}
                      className={`flex items-center gap-1 text-xs text-gold-500 hover:text-gold-600 transition-colors flex-shrink-0 ${fontClass}`}
                    >
                      {copied === "rip"
                        ? <><CheckCircle2 className="w-3.5 h-3.5" />{t("paywall.copied", lang)}</>
                        : <><Copy className="w-3.5 h-3.5" />{t("paywall.copy", lang)}</>}
                    </button>
                    <span dir="ltr" className="font-mono text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 tracking-wider select-all truncate max-w-[150px] sm:max-w-[220px]">
                      {ripNumber}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-center justify-between rounded-xl bg-white dark:bg-white/5 border border-parchment-200 dark:border-white/10 p-2.5">
                  <span className={`text-xs text-gray-500 ${fontClass}`}>{t("paywall.amount", lang)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gold-500 font-medium">≈ ${USD_PRICE}</span>
                    <span className={`font-bold text-gold-500 text-sm ${fontClass}`}>{price} {t("paywall.amountCurrency", lang)}</span>
                  </div>
                </div>
              </div>

              {/* ── Step 1b: International (Redot Pay) ─ */}
              <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-700/30 p-4 space-y-3">
                <h4 className={`text-sm font-black text-blue-700 dark:text-blue-400 flex items-center gap-2 ${fontClass}`}>
                  <QrCode className="w-4 h-4" />
                  {lang === "ar" ? "الدفع الدولي — Redot Pay" : "International Payment — Redot Pay"}
                </h4>

                <div className="rounded-xl bg-white dark:bg-white/5 border border-parchment-200 dark:border-white/10 p-3">
                  <p className={`text-[10px] text-gray-400 mb-1.5 ${fontClass}`}>
                    {lang === "ar" ? "رقم حساب Redot Pay" : "Redot Pay Account ID"}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => copyText(RDOTPAY_ID, "rdot")}
                      className={`flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors flex-shrink-0 ${fontClass}`}
                    >
                      {copied === "rdot"
                        ? <><CheckCircle2 className="w-3.5 h-3.5" />{t("paywall.copied", lang)}</>
                        : <><Copy className="w-3.5 h-3.5" />{t("paywall.copy", lang)}</>}
                    </button>
                    <span dir="ltr" className="font-mono text-sm font-bold text-gray-900 dark:text-gray-100 tracking-wider select-all">
                      {RDOTPAY_ID}
                    </span>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="rounded-2xl bg-white p-3 border border-parchment-200 dark:border-white/10 shadow-sm">
                    <Image
                      src="/qr-payment.jpg"
                      alt={lang === "ar" ? "رمز QR للدفع" : "Payment QR Code"}
                      width={320}
                      height={320}
                      className="w-64 h-64 sm:w-80 sm:h-80 object-contain rounded-lg"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* BNB note */}
                <div className="rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-700/30 p-3">
                  <AlertCircle className="w-4 h-4 text-red-500 mb-1.5" />
                  <p className={`text-[11px] leading-relaxed text-red-700 dark:text-red-400 font-semibold ${fontClass}`}>
                    {lang === "ar"
                      ? "⚠️ تنبيه مهم: عند الدفع عبر Redot Pay أو المحفظة، يجب اختيار شبكة BNB Smart Chain (BEP-20). لا تستخدم شبكة أخرى وإلا سيتعذر استلام المبلغ!"
                      : "⚠️ Important: When paying via Redot Pay or wallet, you MUST select the BNB Smart Chain (BEP-20) network. Do not use any other network or the payment will be lost!"}
                  </p>
                </div>
              </div>

              {/* ── Step 2: Send receipt ──────────── */}
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 p-4 space-y-2">
                <h4 className={`text-sm font-black text-amber-700 dark:text-amber-400 flex items-center gap-2 ${fontClass}`}>
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold">2</span>
                  {t("paywall.step2Title", lang)}
                </h4>
                <p className={`text-xs text-amber-700/80 dark:text-amber-400/80 leading-relaxed ${fontClass}`}>
                  {t("paywall.step2Desc", lang)}
                </p>
                <button
                  onClick={openEmail}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-100 dark:bg-amber-800/30 border border-amber-200 dark:border-amber-700/30 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-medium hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors truncate px-3"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{AUTHOR.email}</span>
                </button>
              </div>

              {/* ── Step 3: Activation ────────────── */}
              <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/30 p-4 space-y-2">
                <h4 className={`text-sm font-black text-green-700 dark:text-green-400 flex items-center gap-2 ${fontClass}`}>
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold">3</span>
                  {t("paywall.step3Title", lang)}
                </h4>
                <p className={`text-xs text-green-700/80 dark:text-green-400/80 leading-relaxed ${fontClass}`}>
                  {t("paywall.step3Desc", lang)}
                </p>
              </div>

              {/* ── Back ──────────────────────────── */}
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
