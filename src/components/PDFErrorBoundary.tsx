"use client";

import { Component, ReactNode } from "react";
import { BookOpen } from "lucide-react";
import { t } from "@/lib/i18n";
import { useApp } from "@/context/AppContext";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PDFErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    try {
      const { reportError } = require("@/lib/error-report");
      reportError(error, { component: "PDFErrorBoundary", stack: info.componentStack });
    } catch {}
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return <PDFFallback onReset={this.handleReset} error={this.state.error} />;
    }
    return this.props.children;
  }
}

function PDFFallback({ onReset, error }: { onReset: () => void; error: Error | null }) {
  const { lang } = useApp();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";

  return (
    <div className="flex flex-col items-center justify-center gap-4 text-gray-400 py-20" dir={dir}>
      <BookOpen className="w-16 h-16 text-gold-500/30" />
      <p className={`text-center ${fontClass}`}>{t("pdf.loadError", lang)}</p>
      <div className="flex gap-3">
        <button
          onClick={onReset}
          className={`px-5 py-2.5 rounded-xl bg-gold-500 text-white text-sm hover:bg-gold-600 transition-colors active:scale-95 ${fontClass}`}
        >
          {t("pdf.retry", lang)}
        </button>
        <button
          onClick={() => {
            try { window.location.href = "/"; } catch {}
          }}
          className={`px-5 py-2.5 rounded-xl border border-parchment-300 dark:border-white/10 text-gray-600 dark:text-gray-400 text-sm hover:bg-parchment-100 dark:hover:bg-white/5 transition-colors ${fontClass}`}
        >
          {lang === "ar" ? "العودة للرئيسية" : "Go home"}
        </button>
      </div>
      {error && process.env.NODE_ENV === "development" && (
        <pre className="text-xs text-red-500 mt-4 max-w-lg text-start bg-red-50 dark:bg-red-900/10 p-3 rounded-xl overflow-auto">
          {error.message}
        </pre>
      )}
    </div>
  );
}
