"use client";

import { useRef } from "react";
import { Download, Upload, DatabaseBackup } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

/**
 * Export / import the reader's own local data (progress, ratings, favorites,
 * preferences, history). Only keys under the "riwayati_" namespace are touched,
 * never anything belonging to another site. Import reloads so AppContext
 * re-hydrates cleanly from the restored values.
 */
export function DataBackup() {
  const { lang, showToast, playSound } = useApp();
  const ar = lang === "ar";
  const fontClass = ar ? "font-arabic" : "font-sans";
  const fileRef = useRef<HTMLInputElement>(null);

  const collect = (): Record<string, string> => {
    const data: Record<string, string> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("riwayati_")) {
          const val = localStorage.getItem(key);
          if (val !== null) data[key] = val;
        }
      }
    } catch {}
    return data;
  };

  const exportData = () => {
    const payload = {
      _app: "riwayati",
      _version: 1,
      exportedAt: new Date().toISOString(),
      data: collect(),
    };
    try {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `riwayati-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      playSound?.("success");
      showToast(t("backup.exported", lang), "success");
    } catch {
      showToast(t("backup.importError", lang), "error");
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const data = parsed?.data;
      if (parsed?._app !== "riwayati" || typeof data !== "object" || data === null) {
        throw new Error("invalid");
      }
      for (const [key, val] of Object.entries(data)) {
        if (key.startsWith("riwayati_") && typeof val === "string") {
          localStorage.setItem(key, val);
        }
      }
      playSound?.("success");
      showToast(t("backup.imported", lang), "success");
      setTimeout(() => window.location.reload(), 900);
    } catch {
      showToast(t("backup.importError", lang), "error");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div
      className={`rounded-2xl border border-parchment-200 dark:border-white/10 bg-white/70 dark:bg-onyx-800/60 p-5 ${fontClass}`}
      dir={ar ? "rtl" : "ltr"}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold-500/10 text-gold-500 flex-shrink-0">
          <DatabaseBackup className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{t("backup.title", lang)}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{t("backup.desc", lang)}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={exportData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-600 active:scale-95 text-white text-sm font-medium transition-all"
        >
          <Download className="w-4 h-4" />
          {t("backup.export", lang)}
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-parchment-300 dark:border-white/10 text-gray-600 dark:text-gray-300 text-sm font-medium hover:border-gold-500/40 hover:text-gold-600 dark:hover:text-gold-400 active:scale-95 transition-all"
        >
          <Upload className="w-4 h-4" />
          {t("backup.import", lang)}
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} className="hidden" />
      </div>
    </div>
  );
}
