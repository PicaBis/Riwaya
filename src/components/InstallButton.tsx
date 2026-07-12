"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Header "Install app" button. Renders nothing until the browser fires
 * `beforeinstallprompt` (Chromium), and hides itself once installed or
 * dismissed. Purely additive — degrades to nothing where unsupported.
 */
export function InstallButton({ compact = false }: { compact?: boolean }) {
  const { lang, playSound } = useApp();
  const ar = lang === "ar";
  const fontClass = ar ? "font-arabic" : "font-sans";
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!deferred) return null;

  const install = async () => {
    playSound?.("click");
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {}
    setDeferred(null);
  };

  if (compact) {
    return (
      <button
        onClick={install}
        title={t("install.button", lang)}
        aria-label={t("install.button", lang)}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gold-500 hover:bg-gold-500/10 transition-all duration-200"
      >
        <Download className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={install}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500/10 border border-gold-500/25 text-gold-600 dark:text-gold-400 text-sm font-medium hover:bg-gold-500/20 active:scale-95 transition-all duration-150 ${fontClass}`}
    >
      <Download className="w-4 h-4" />
      <span className="hidden lg:inline">{t("install.button", lang)}</span>
    </button>
  );
}
