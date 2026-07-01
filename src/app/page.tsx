import { Sparkles, BookOpen, Feather, ChevronDown } from "lucide-react";
import { novels } from "@/data/novels";
import { NovelCard } from "@/components/NovelCard";
import { ContinueReading } from "@/components/ContinueReading";
import { PopularSection } from "@/components/PopularSection";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">

      {/* ── Immersive Full-Screen Hero ──────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center -mt-16 pt-16 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/[0.03] rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-500/[0.04] rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-parchment-100/20 via-transparent to-parchment-100/10 dark:from-white/[0.02] dark:via-transparent dark:to-white/[0.01] rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 text-center px-4 animate-fade-up" dir="rtl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6 animate-float">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span className="text-xs font-arabic text-gold-600 dark:text-gold-400 font-medium">
              مكتبة الروايات الشخصية
            </span>
          </div>

          {/* Main Title */}
          <h1 className="font-arabic text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-gray-100 mb-5 leading-tight tracking-tight">
            روايتي
          </h1>

          {/* Gold accent divider */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 sm:w-12 h-px bg-gold-500/40" />
            <Feather className="w-4 h-4 text-gold-500" />
            <div className="w-8 sm:w-12 h-px bg-gold-500/40" />
          </div>

          {/* Description */}
          <p className="font-arabic text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg mx-auto mb-8">
            مساحة هادئة لقراءة الروايات الشخصية — اختر روايتك وانغمس في عالمها بتجربة قراءة أنيقة ومريحة.
          </p>

          {/* Stats badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-parchment-200 dark:border-white/10 shadow-sm hover-lift">
              <BookOpen className="w-4 h-4 text-gold-500" />
              <div>
                <p className="text-base font-bold text-gray-900 dark:text-gray-100 leading-none">{novels.length}</p>
                <p className="text-xs text-gray-400 font-arabic mt-0.5">{novels.length === 1 ? "رواية" : "روايات"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-parchment-200 dark:border-white/10 shadow-sm hover-lift">
              <Feather className="w-4 h-4 text-gold-500" />
              <div>
                <p className="text-base font-bold text-gray-900 dark:text-gray-100 leading-none">بيكا</p>
                <p className="text-xs text-gray-400 font-arabic mt-0.5">الكاتب</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-gentle-pulse">
          <ChevronDown className="w-5 h-5 text-gray-300 dark:text-gray-600" />
        </div>
      </section>

      {/* ── Continue Reading ───────────────────────────── */}
      <ContinueReading />

      {/* ── Popular Section ────────────────────────────── */}
      <PopularSection />

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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pb-10"
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
