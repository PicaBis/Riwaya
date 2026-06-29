import { Sparkles, BookOpen } from "lucide-react";
import { novels } from "@/data/novels";
import { NovelCard } from "@/components/NovelCard";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* ── Hero ──────────────────────────────────────── */}
      <section className="text-center mb-16 sm:mb-20 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-gold-500" />
          <span className="text-xs font-arabic text-gold-600 dark:text-gold-400 font-medium">
            مكتبة الروايات الشخصية
          </span>
        </div>

        <h1 className="font-arabic text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-5 leading-tight">
          روايتي
        </h1>

        <p className="font-arabic text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
          مساحة هادئة لقراءة الروايات الشخصية — اختر روايتك وانغمس في عالمها
          بتجربة قراءة أنيقة ومريحة.
        </p>

        {/* Decorative line */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold-500/40" />
          <BookOpen className="w-4 h-4 text-gold-500/60" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold-500/40" />
        </div>
      </section>

      {/* ── Section header ────────────────────────────── */}
      <div className="flex items-center justify-between mb-8" dir="rtl">
        <div>
          <h2 className="font-arabic text-2xl font-bold text-gray-900 dark:text-gray-100">
            الروايات المتاحة
          </h2>
          <p className="font-arabic text-sm text-gray-400 dark:text-gray-500 mt-1">
            {novels.length} {novels.length === 1 ? "رواية" : "روايات"}
          </p>
        </div>
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
