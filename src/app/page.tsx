import { Sparkles, BookOpen } from "lucide-react";
import { novels } from "@/data/novels";
import { NovelCard } from "@/components/NovelCard";
import { HeroParticles } from "@/components/HeroParticles";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative text-center mb-16 sm:mb-20">
        {/* Animated particles background */}
        <HeroParticles />

        <div className="relative z-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-gold-500 animate-pulse" />
            <span className="text-xs font-arabic text-gold-600 dark:text-gold-400 font-medium">
              مكتبة الروايات الشخصية
            </span>
          </div>

          <h1 className="font-arabic text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-5 leading-tight">
            <span className="relative inline-block">
              روايتي
              {/* Underline accent */}
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 8"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 6 Q100 0 200 6"
                  fill="none"
                  stroke="#B8860B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="animate-draw-underline"
                />
              </svg>
            </span>
          </h1>

          <p className="font-arabic text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
            مساحة هادئة لقراءة الروايات الشخصية — اختر روايتك وانغمس في عالمها
            بتجربة قراءة أنيقة ومريحة.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <Stat value={novels.length} label="رواية" />
            <div className="h-8 w-px bg-parchment-300 dark:bg-white/10" />
            <Stat value="مجانية" label="الفصول الأولى" />
            <div className="h-8 w-px bg-parchment-300 dark:bg-white/10" />
            <Stat value="500" label="دج / اشتراك" />
          </div>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-gold-500/40" />
            <BookOpen className="w-4 h-4 text-gold-500/60" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-gold-500/40" />
          </div>
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
              style={{ animationDelay: `${i * 120}ms`, animationFillMode: "both" }}
            >
              <NovelCard novel={novel} index={i} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <BookOpen className="w-16 h-16 mb-4 opacity-30" />
          <p className="font-arabic text-lg">لا توجد روايات بعد</p>
        </div>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="text-center">
      <p className="font-arabic text-xl font-bold text-gold-500">{value}</p>
      <p className="font-arabic text-xs text-gray-400 dark:text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
