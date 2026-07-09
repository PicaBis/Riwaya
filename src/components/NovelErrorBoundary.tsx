"use client";

import { Component, ReactNode } from "react";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import type { Novel } from "@/data/novels";

interface Props {
  novel: Novel;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Top-level safety net for the /novel/[id] page. A throw anywhere inside
 * NovelReadingClient (PDFCover, PDFViewer, Comments, sidebar widgets,
 * Supabase realtime, etc.) is caught here and a rich, recoverable fallback
 * is rendered INSTEAD of the generic app error screen, so the visitor can
 * keep reading the rest of the page (chapter list, description, comments)
 * even when the PDF reader / a single widget blew up.
 */
export class NovelErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    try {
      import("@/lib/error-report")
        .then((m) =>
          m.reportError(error, {
            boundary: "NovelErrorBoundary",
            novelId: this.props.novel.id,
            stack: info.componentStack,
          })
        )
        .catch(() => {});
    } catch {}
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      const novel = this.props.novel;
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-10 text-center" dir="rtl">
          <BookOpen className="w-16 h-16 text-gold-500/30 mb-5" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 font-arabic">
            {novel.title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-md font-arabic">
            تعذّر تحميل القارئ مؤقتاً. يمكنك العودة للرئيسية أو إعادة تحميل الصفحة.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white rounded-xl text-sm font-medium transition-all font-arabic"
            >
              إعادة المحاولة
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 border border-parchment-300 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-xl text-sm hover:bg-parchment-100 dark:hover:bg-white/5 transition-colors font-arabic inline-flex items-center gap-1.5"
            >
              <ArrowRight className="w-4 h-4" />
              الرئيسية
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
