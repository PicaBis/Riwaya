"use client";

import { useState, useEffect } from "react";
import { Maximize2 } from "lucide-react";

export function AutoFullscreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("riwayati_fs");
    if (!dismissed) setShow(true);
  }, []);

  const triggerFullscreen = async () => {
    try {
      if (document.fullscreenEnabled) {
        await document.documentElement.requestFullscreen();
      }
    } catch {}
    sessionStorage.setItem("riwayati_fs", "1");
    setShow(false);
  };

  const dismiss = () => {
    sessionStorage.setItem("riwayati_fs", "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in cursor-pointer"
      onClick={triggerFullscreen}
    >
      <div className="text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-20 h-20 rounded-3xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center mx-auto mb-5 animate-float">
          <Maximize2 className="w-10 h-10 text-gold-500" />
        </div>
        <h2 className="font-arabic text-2xl font-bold text-white mb-2">مرحباً بك في روايتي</h2>
        <p className="text-white/60 font-arabic text-sm mb-6">
          اضغط في أي مكان للدخول بوضع ملء الشاشة
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={triggerFullscreen}
            className="px-6 py-3 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white rounded-xl font-arabic font-medium text-sm transition-all shadow-lg"
          >
            دخول
          </button>
          <button
            onClick={dismiss}
            className="px-6 py-3 border border-white/20 hover:border-white/40 text-white/60 hover:text-white/90 rounded-xl font-arabic text-sm transition-all"
          >
            تخطي
          </button>
        </div>
      </div>
    </div>
  );
}