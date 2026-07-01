"use client";

import { X, BookOpen, PenTool, Code2, Smartphone, Quote, Feather } from "lucide-react";

export function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-onyx-800 rounded-3xl shadow-2xl p-6 sm:p-8 animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 mb-4">
            <BookOpen className="w-3.5 h-3.5 text-gold-500" />
            <span className="text-xs font-arabic text-gold-600 dark:text-gold-400">منصة بيكا الرسمية</span>
          </span>
          <h2 className="font-arabic text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            بيكا — Pica
          </h2>
          <p className="font-arabic text-sm text-gold-500 font-medium mt-1">@ProfPica</p>
          <p className="font-arabic text-sm text-gray-500 dark:text-gray-400 mt-2">
            المنصة الرسمية والحصرية للروايات والأعمال الأدبية
          </p>
        </div>

        {/* Identity / Bio */}
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-parchment-50 to-white dark:from-onyx-700/30 dark:to-onyx-800 border border-parchment-200 dark:border-white/10">
          <div className="flex items-start gap-3" dir="rtl">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Feather className="w-5 h-5 text-gold-500" />
            </div>
            <p className="font-arabic text-sm text-gray-700 dark:text-gray-300 leading-loose">
              مبرمج تطبيقات ويب وهواتف ذكية، كاتب روايات (فانتازيا، غموض، رعب، وثقافة)،
              ورسام يقوم برسم وتصميم مقاطع ومشاهد رواياته الخاصة.
            </p>
          </div>
        </div>

        {/* Skills — 2x2 grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-xl bg-white dark:bg-onyx-700/40 border border-parchment-200 dark:border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
              <Code2 className="w-4 h-4 text-gold-500" />
            </div>
            <div>
              <p className="text-xs font-bold font-arabic text-gray-800 dark:text-gray-200">تطوير الويب</p>
              <p className="text-[11px] text-gray-400 font-arabic">Web Development</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-onyx-700/40 border border-parchment-200 dark:border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-4 h-4 text-gold-500" />
            </div>
            <div>
              <p className="text-xs font-bold font-arabic text-gray-800 dark:text-gray-200">تطبيقات الهاتف</p>
              <p className="text-[11px] text-gray-400 font-arabic">Mobile Apps</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-onyx-700/40 border border-parchment-200 dark:border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
              <Feather className="w-4 h-4 text-gold-500" />
            </div>
            <div>
              <p className="text-xs font-bold font-arabic text-gray-800 dark:text-gray-200">كتابة الروايات</p>
              <p className="text-[11px] text-gray-400 font-arabic">Fantasy · Mystery · Horror</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-onyx-700/40 border border-parchment-200 dark:border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
              <PenTool className="w-4 h-4 text-gold-500" />
            </div>
            <div>
              <p className="text-xs font-bold font-arabic text-gray-800 dark:text-gray-200">الرسم والتصميم</p>
              <p className="text-[11px] text-gray-400 font-arabic">Illustration · Digital Art</p>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="relative bg-parchment-100 dark:bg-white/5 rounded-2xl border border-parchment-200 dark:border-white/8 p-5">
          <Quote className="absolute top-4 right-4 w-6 h-6 text-gold-500/20" />
          <p className="font-arabic text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-center">
            هذا الموقع هو المستودع الرسمي والحصري لجميع أعمال وكتب وروايات بيكا،
            حيث يتم تضمين كافة المؤلفات وهي حالياً قيد التوثيق والنشر المستمر
            لضمان حقوق الملكية الفكرية.
          </p>
        </div>
      </div>
    </div>
  );
}
