import Image from "next/image";
import { Pen, BookOpen, Star, Quote, Code, GraduationCap, Camera } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "عن الأستاضع بيكا — روايتي",
  description: "منصة الأستاضع بيكا (@ProfPica) الرسمية والحصرية للروايات والأعمال الأدبية",
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
          عــن الأستاضع بيكا
        </h1>
        <p className="font-arabic text-lg text-gold-500 max-w-2xl mx-auto">
          منصة الأستاضع بيكا (@ProfPica) الرسمية والحصرية للروايات والأعمال الأدبية
        </p>
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
              alt="Pica — Professor"
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
                  الأستاضع بيكا
                </h2>
                <p className="text-gold-500 font-medium tracking-widest text-sm mt-0.5">
                  @ProfPica
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
                أستاضع علوم فيزيائية - École Normale Supérieure de Laghouat
              </span>
            </div>

            <p className="font-arabic text-gray-600 dark:text-gray-300 leading-loose text-base mb-6">
              هذا الموقع هو المستودع الرسمي والحصري لجميع أعمال وكتب وروايات الأستاضع بيكا، حيث يتم تضمين كافة المؤلفات وهي حالياً قيد التوثيق والنشر المستمر عبر صفحات الموقع المتتالية لضمان حقوق الملكية الفكرية.
            </p>

            {/* Skills */}
            <div className="grid grid-cols-1 gap-3 mt-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-parchment-50 dark:bg-white/5 border border-parchment-200 dark:border-white/10">
                <GraduationCap className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <span className="font-arabic text-sm text-gray-700 dark:text-gray-300">أستاضع علوم فيزيائية - École Normale Supérieure de Laghouat</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-parchment-50 dark:bg-white/5 border border-parchment-200 dark:border-white/10">
                <Code className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <span className="font-arabic text-sm text-gray-700 dark:text-gray-300">صناعة وتطوير المواقع</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-parchment-50 dark:bg-white/5 border border-parchment-200 dark:border-white/10">
                <Pen className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <span className="font-arabic text-sm text-gray-700 dark:text-gray-300">الرسم والفنون الرقمية</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-parchment-50 dark:bg-white/5 border border-parchment-200 dark:border-white/10">
                <Camera className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <span className="font-arabic text-sm text-gray-700 dark:text-gray-300">صناعة المحتوى الرقمي - Digital Creator</span>
              </div>
            </div>

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
          &ldquo;أكتب لأنني لو لم أفعل، لابتلعني الصمت&rdquo;
        </p>
        <p className="text-center text-sm text-gold-500 mt-4 font-medium">— الأستاضع بيكا</p>
      </div>

      {/* ── About the Platform ─────────────────────────────── */}
      <div className="bg-white dark:bg-onyx-800 rounded-2xl border border-parchment-200 dark:border-white/8 p-6 mb-8 animate-fade-up" style={{ animationDelay: "300ms" }}>
        <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4">
          <BookOpen className="w-5 h-5 text-gold-500" />
        </div>
        <h3 className="font-arabic font-bold text-gray-900 dark:text-gray-100 mb-2 text-lg">
          عن المنصة
        </h3>
        <p className="font-arabic text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          منصة الأستاضع بيكا (@ProfPica) الرسمية والحصرية للروايات والأعمال الأدبية.
          هذا الموقع هو المستودع الرسمي والحصري لجميع أعمال وكتب وروايات الأستاضع بيكا، حيث يتم تضمين كافة المؤلفات وهي حالياً قيد التوثيق والنشر المستمر عبر صفحات الموقع المتتالية لضمان حقوق الملكية الفكرية.
        </p>
      </div>
    </div>
  );
}
