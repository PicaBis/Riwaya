"use client";

import { useState } from "react";
import { Lock, Wallet, Eye, EyeOff, CheckCircle2, AlertCircle, Copy, Mail } from "lucide-react";
import { verifyDevCode } from "@/lib/auth";

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

    const ok = await verifyDevCode(code.trim());
    if (ok) {
      sessionStorage.setItem("riwayati_unlocked", "1");
      onUnlock();
    } else {
      setError("الرمز غير صحيح. يرجى الاشتراك للمتابعة.");
    }
    setChecking(false);
  };

  const copyRIP = async () => {
    await navigator.clipboard.writeText(ripNumber).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const openEmail = () => {
    window.open(`mailto:${AUTHOR_EMAIL}?subject=إثبات دفع - روايتي`, "_blank");
  };

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-parchment-50/95 dark:bg-onyx-950/97 backdrop-blur-md p-4"
      dir="rtl"
    >
      <div className="w-full max-w-sm">
        {title && (
          <div className="text-center mb-6">
            <h2 className="font-arabic text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {title}
            </h2>
            {preview && (
              <p className="font-arabic text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
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

        <h3 className="font-arabic text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
          هذا المحتوى مقفول
        </h3>
        <p className="font-arabic text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs leading-relaxed mb-2">
          لقد وصلت إلى نهاية الفصل الثالث (الحرب الكبرى) — اشترك لمتابعة القراءة
        </p>
        <p className="font-arabic text-xl font-bold text-gold-500 mb-8 text-center">
          {price} دج
        </p>

        {!showPayment ? (
          <div className="flex flex-col items-center gap-3 w-full">
            <button
              onClick={() => setShowPayment(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white rounded-xl font-arabic font-medium transition-all duration-150 shadow-md"
            >
              <Wallet className="w-4 h-4" />
              اشترك الآن
            </button>

            <div className="text-center">
              <p className="text-xs text-gray-400 dark:text-gray-600 font-arabic mb-2">
                لديك رمز وصول؟
              </p>
              <form onSubmit={handleCodeSubmit} className="flex gap-2">
                <div className="relative">
                  <input
                    type={showCode ? "text" : "password"}
                    value={code}
                    onChange={(e) => { setCode(e.target.value); setError(""); }}
                    placeholder="أدخل رمز الوصول"
                    className="ps-10 pe-4 py-2 rounded-lg border border-parchment-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 placeholder-gray-400 text-sm font-arabic focus:outline-none focus:ring-2 focus:ring-gold-500/40 w-44"
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
                  className="px-4 py-2 bg-gray-900 dark:bg-white hover:bg-gold-500 dark:hover:bg-gold-500 text-white dark:text-gray-900 hover:text-white text-sm font-arabic rounded-lg transition-all duration-150 disabled:opacity-40"
                >
                  {checking ? "…" : "دخول"}
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
            <h3 className="font-arabic font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
              خطوات الاشتراك
            </h3>

            <div className="space-y-3 mb-4">
              {/* Step 1: Payment info */}
              <div className="rounded-xl bg-gold-500/5 border border-gold-500/20 p-3">
                <p className="text-xs text-gold-600 dark:text-gold-400 font-arabic font-bold mb-2">
                  📱 الخطوة 1: الدفع عبر BaridiMob أو CCP
                </p>
                <div className="rounded-lg bg-white dark:bg-white/5 border border-parchment-200 dark:border-white/10 p-3 mb-2">
                  <p className="text-[10px] text-gray-400 mb-1 font-sans">رقم RIP / BaridiMob</p>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={copyRIP}
                      className="flex items-center gap-1 text-xs text-gold-500 hover:text-gold-600 transition-colors flex-shrink-0"
                    >
                      {copied
                        ? <><CheckCircle2 className="w-3.5 h-3.5" />تم النسخ</>
                        : <><Copy className="w-3.5 h-3.5" />نسخ</>}
                    </button>
                    <span dir="ltr" className="font-mono text-sm font-bold text-gray-900 dark:text-gray-100 tracking-wider select-all">
                      {ripNumber}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white dark:bg-white/5 border border-parchment-200 dark:border-white/10 p-2.5">
                  <span className="text-xs text-gray-400">المبلغ</span>
                  <span className="font-bold text-gold-500 text-sm">{price} دينار جزائري</span>
                </div>
              </div>

              {/* Step 2: Send receipt */}
              <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 p-3">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-arabic font-bold mb-2">
                  📧 الخطوة 2: إرسال الإيصال
                </p>
                <p className="text-xs text-amber-700/80 dark:text-amber-400/80 font-arabic leading-relaxed mb-2">
                  خذ سكرين شوت (صورة) للإيصال أو تأكيد الدفع من تطبيق BaridiMob أو CCP،
                  وأرسله إلى بريدي الإلكتروني ليتم تفعيل حسابك يدوياً:
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
                <p className="text-xs text-green-700 dark:text-green-400 font-arabic font-bold mb-1">
                  ✅ الخطوة 3: التفعيل
                </p>
                <p className="text-xs text-green-700/80 dark:text-green-400/80 font-arabic leading-relaxed">
                  بعد التأكد من الدفع، سيتم إرسال رمز التفعيل الخاص بك. يمكنك إدخاله
                  هنا لفتح جميع الروايات.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPayment(false)}
              className="w-full py-2.5 rounded-xl border border-parchment-300 dark:border-white/10 text-sm font-arabic text-gray-600 dark:text-gray-400 hover:bg-parchment-100 dark:hover:bg-white/5 transition-colors"
            >
              رجوع
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
