import Image from "next/image";
import { Pen, BookOpen, Star, Quote } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "من نحن — روايتي",
  description: "تعرف على المؤلف Medjahed Abdelhadi — Pica",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16" dir="rtl">
      {/* ── Hero ──────────────────────────────────────── */}
      <div className="text-center mb-16 animate-fade-up">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6">
          <Pen className="w-3.5 h-3.5 text-gold-500" />
          <span className="text-xs font-arabic text-gold-600 dark:text-gold-400">المؤلف</span>
        </span>
        <h1 className="font-arabic text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          من نحن
        </h1>
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-gold-500/40" />
          <BookOpen className="w-4 h-4 text-gold-500/60" />
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-gold-500/40" />
        </div>
      </div>

      {/* ── Author Card ────────────────────────────────── */}
      <div className="bg-white dark:bg-onyx-800 rounded-3xl border border-parchment-200 dark:border-white/8 overflow-hidden shadow-book mb-12 animate-fade-up" style={{ animationDelay: "100ms" }}>
        <div className="flex flex-col md:flex-row">
          {/* Photo */}
          <div className="relative md:w-72 h-72 md:h-auto flex-shrink-0">
            <Image
              src="/author.jpg"
              alt="Medjahed Abdelhadi — Pica"
              fill
              className="object-cover object-top"
              priority
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-transparent to-white/60 dark:to-onyx-800/80" />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center p-8 md:p-10">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1.5 h-8 rounded-full bg-gold-500" />
              <div>
                <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Medjahed Abdelhadi
                </h2>
                <p className="text-gold-500 font-medium tracking-widest text-sm mt-0.5">
                  Pica
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-5 mb-6">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-gold-500 text-gold-500" />
                ))}
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-arabic">
                كاتب وروائي جزائري
              </span>
            </div>

            <p className="font-arabic text-gray-600 dark:text-gray-300 leading-loose text-base">
              كاتب جزائري شاب، يؤمن بأن الكلمة قادرة على تغيير العالم. يكتب
              روايات تجمع بين العمق الفلسفي والسرد الشاعري، بأسلوب يلامس القلب
              ويحرك العقل.
            </p>

            <div className="mt-6 flex items-center gap-2 flex-wrap">
              {["رواية", "أدب عربي", "الجزائر", "قصص"].map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full bg-parchment-100 dark:bg-white/5 border border-parchment-200 dark:border-white/10 text-gray-500 dark:text-gray-400 font-arabic"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quote ──────────────────────────────────────── */}
      <div className="relative bg-parchment-100 dark:bg-onyx-900 rounded-2xl border border-parchment-200 dark:border-white/8 p-8 mb-12 animate-fade-up" style={{ animationDelay: "200ms" }}>
        <Quote className="absolute top-6 right-6 w-8 h-8 text-gold-500/20" />
        <p className="font-arabic text-xl text-gray-700 dark:text-gray-300 leading-loose text-center italic">
          &rdquo;أكتب لأنني لو لم أفعل، لابتلعني الصمت&ldquo;
        </p>
        <p className="text-center text-sm text-gold-500 mt-4 font-medium">— Pica</p>
      </div>

      {/* ── About the site ─────────────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-6 animate-fade-up" style={{ animationDelay: "300ms" }}>
        <div className="bg-white dark:bg-onyx-800 rounded-2xl border border-parchment-200 dark:border-white/8 p-6">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4">
            <BookOpen className="w-5 h-5 text-gold-500" />
          </div>
          <h3 className="font-arabic font-bold text-gray-900 dark:text-gray-100 mb-2 text-lg">
            روايتي
          </h3>
          <p className="font-arabic text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            منصة شخصية لنشر وقراءة الروايات بشكل أنيق وهادئ. كل رواية مصممة
            لتجربة قراءة مريحة، سواء في الضوء أو العتمة.
          </p>
        </div>

        <div className="bg-white dark:bg-onyx-800 rounded-2xl border border-parchment-200 dark:border-white/8 p-6">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4">
            <Pen className="w-5 h-5 text-gold-500" />
          </div>
          <h3 className="font-arabic font-bold text-gray-900 dark:text-gray-100 mb-2 text-lg">
            للتواصل
          </h3>
          <p className="font-arabic text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            للاشتراك أو الدعم أو التواصل مع المؤلف — تفضل بزيارة صفحة كل رواية
            والنقر على زر الدعم.
          </p>
        </div>
      </div>
    </div>
  );
}
