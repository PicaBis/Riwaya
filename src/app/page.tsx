import { Sparkles, BookOpen, Feather } from "lucide-react";
import { novels } from "@/data/novels";
import { NovelCard } from "@/components/NovelCard";
import { ContinueReading } from "@/components/ContinueReading";
import { PopularSection } from "@/components/PopularSection";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">

      {/* ── Hero Banner ────────────────────────────── */}
      <section className="relative overflow-hidden mb-8 sm:mb-10 -mt-8 sm:-mt-10 pt-16 sm:pt-20 pb-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold-500/[0.04] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-gold-500/[0.03] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gold-500/[0.03] rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center px-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 mb-5 animate-float" dir="rtl">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span className="text-xs font-arabic text-gold-600 dark:text-gold-400 font-medium">
              مكتبة الروايات الشخصية
            </span>
          </div>

          {/* Main Title - Perfectly Centered */}
          <div className="mb-5 w-full flex flex-col items-center">
            {/* Decorative ornament - top */}
            <div className="flex items-center justify-center gap-3 mb-3 w-full">
              <div className="w-10 sm:w-16 h-px bg-gradient-to-l from-transparent to-gold-500/60" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold-500/40" />
              <div className="w-6 sm:w-10 h-px bg-gradient-to-r from-gold-500/60 to-transparent" />
              <Feather className="w-4 h-4 sm:w-5 sm:h-5 text-gold-500" />
              <div className="w-6 sm:w-10 h-px bg-gradient-to-l from-gold-500/60 to-transparent" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold-500/40" />
              <div className="w-10 sm:w-16 h-px bg-gradient-to-r from-transparent to-gold-500/60" />
            </div>

            {/* Title */}
            <h1 className="font-arabic text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight text-center">
              <span
                style={{
                  backgroundImage: "linear-gradient(135deg, #b8860b 0%, #d4af37 30%, #f5d26b 50%, #d4af37 70%, #b8860b 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 2px 4px rgba(184,134,11,0.15))",
                }}
              >
                روايتي
              </span>
            </h1>

            {/* Decorative ornament - bottom */}
            <div className="flex items-center justify-center gap-2 mt-4 w-full">
              <div className="w-4 h-px bg-gold-500/30" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold-500/50" />
              <div className="w-8 sm:w-12 h-px bg-gold-500/40" />
              <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-500/50" />
              <div className="w-8 sm:w-12 h-px bg-gold-500/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold-500/50" />
              <div className="w-4 h-px bg-gold-500/30" />
            </div>
          </div>

          {/* Description */}
          <p className="font-arabic text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg text-center mb-6">
            مساحة هادئة لقراءة الروايات الشخصية — اختر روايتك وانغمس في عالمها بتجربة قراءة أنيقة ومريحة.
          </p>

          {/* Stats badges */}
          <div className="flex flex-wrap items-center justify-center gap-3" dir="rtl">
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-parchment-200 dark:border-white/10 shadow-sm hover-lift">
              <BookOpen className="w-4 h-4 text-gold-500" />
              <div>
                <p className="text-base font-bold text-gray-900 dark:text-gray-100 leading-none">{novels.length}</p>
                <p className="text-xs text-gray-400 font-arabic mt-0.5">{novels.length === 1 ? "رواية" : "روايات"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-parchment-200 dark:border-white/10 shadow-sm hover-lift">
              <Feather className="w-4 h-4 text-gold-500" />
              <div>
                <p className="text-base font-bold text-gray-900 dark:text-gray-100 leading-none">بيكا</p>
                <p className="text-xs text-gray-400 font-arabic mt-0.5">الكاتب</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
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
