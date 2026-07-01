import { Sparkles, BookOpen, Feather } from "lucide-react";
import { novels } from "@/data/novels";
import { NovelCard } from "@/components/NovelCard";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <section className="relative mb-8 sm:mb-10 animate-fade-up overflow-hidden rounded-3xl bg-gradient-to-br from-parchment-100 via-white to-parchment-50 dark:from-onyx-900 dark:via-onyx-800 dark:to-onyx-900 border border-parchment-200 dark:border-white/8 shadow-book px-6 sm:px-10 py-8 sm:py-10">
        {/* Decorative glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-500/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
        </div>

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6" dir="rtl">
          {/* Left: text */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 mb-4">
              <Sparkles className="w-3 h-3 text-gold-500" />
              <span className="text-xs font-arabic text-gold-600 dark:text-gold-400 font-medium">
                مكتبة الروايات الشخصية
              </span>
            </div>
            <h1 className="font-arabic text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3 leading-tight">
              روايتي
            </h1>
            <p className="font-arabic text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
              مساحة هادئة لقراءة الروايات الشخصية — اختر روايتك وانغمس في عالمها بتجربة قراءة أنيقة ومريحة.
            </p>
          </div>

          {/* Right: stats/badge */}
          <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-3 flex-shrink-0" dir="ltr">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-onyx-700/60 border border-parchment-200 dark:border-white/10 shadow-sm">
              <BookOpen className="w-5 h-5 text-gold-500" />
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-none">{novels.length}</p>
                <p className="text-xs text-gray-400 font-arabic mt-0.5">{novels.length === 1 ? "رواية" : "روايات"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-onyx-700/60 border border-parchment-200 dark:border-white/10 shadow-sm">
              <Feather className="w-5 h-5 text-gold-500" />
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-none">بيكا</p>
                <p className="text-xs text-gray-400 font-arabic mt-0.5">الكاتب</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section header ────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6" dir="rtl">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gold-500 rounded-full" />
          <h2 className="font-arabic text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            الروايات المتاحة
          </h2>
        </div>
        <span className="text-sm text-gray-400 font-arabic bg-parchment-100 dark:bg-white/5 px-2.5 py-0.5 rounded-full border border-parchment-200 dark:border-white/8">
          {novels.length} {novels.length === 1 ? "رواية" : "روايات"}
        </span>
      </div>

      {/* ── Novel Grid ────────────────────────────────── */}
      {novels.length > 0 ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          dir="rtl"
        >
          {novels.map((novel, i) => (
            <div
              key={novel.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
            >
              <NovelCard novel={novel} index={i} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <BookOpen className="w-16 h-16 mb-4 opacity-30" />
          <p className="font-arabic text-lg">لا توجد روايات بعد</p>
          <p className="font-arabic text-sm mt-1 text-gray-300 dark:text-gray-600">
            أضف رواياتك في ملف{" "}
            <code className="text-xs bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">
              src/data/novels.ts
            </code>
          </p>
        </div>
      )}
    </div>
  );
}
