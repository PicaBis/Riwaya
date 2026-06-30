"use client";

import { X, BookOpen, PenTool, Code2, Image as ImageIcon, Quote } from "lucide-react";

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
            <span className="text-xs font-arabic text-gold-600 dark:text-gold-400">منصة الأستاذ بيكا الرسمية</span>
          </span>
          <h2 className="font-arabic text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            منصة الأستاذ بيكا (@ProfPica)
          </h2>
          <p className="font-arabic text-sm text-gray-500 dark:text-gray-400 mt-2">
            الرسمية والحصرية للروايات والأعمال الأدبية
          </p>
        </div>

        {/* Identity */}
        <div className="mb-6 p-4 rounded-2xl bg-parchment-50 dark:bg-white/5 border border-parchment-200 dark:border-white/10">
          <p className="font-arabic text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            أستاذ علوم فيزيائية — خريج المدرسة العليا للأساتذة بالأغواط
            <br />
            <span className="text-gold-500 font-medium">École Normale Supérieure de Laghouat</span>
          </p>
        </div>

        {/* Skills */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-white dark:bg-onyx-700/40 border border-parchment-200 dark:border-white/10 text-center">
            <PenTool className="w-5 h-5 text-gold-500 mx-auto mb-1" />
            <p className="text-xs font-arabic text-gray-600 dark:text-gray-300">الرسم والفنون الرقمية</p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-onyx-700/40 border border-parchment-200 dark:border-white/10 text-center">
            <Code2 className="w-5 h-5 text-gold-500 mx-auto mb-1" />
            <p className="text-xs font-arabic text-gray-600 dark:text-gray-300">صناعة وتطوير المواقع</p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-onyx-700/40 border border-parchment-200 dark:border-white/10 text-center">
            <ImageIcon className="w-5 h-5 text-gold-500 mx-auto mb-1" />
            <p className="text-xs font-arabic text-gray-600 dark:text-gray-300">صناعة المحتوى الرقمي Digital Creator</p>
          </div>
        </div>

        {/* Mission */}
        <div className="relative bg-parchment-100 dark:bg-white/5 rounded-2xl border border-parchment-200 dark:border-white/8 p-5">
          <Quote className="absolute top-4 right-4 w-6 h-6 text-gold-500/20" />
          <p className="font-arabic text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-center">
            هذا الموقع هو المستودع الرسمي والحصري لجميع أعمال وكتب وروايات الأستاذ بيكا،
            حيث يتم تضمين كافة المؤلفات وهي حالياً قيد التوثيق والنشر المستمر عبر صفحات الموقع المتتالية
            لضمان حقوق الملكية الفكرية.
          </p>
        </div>
      </div>
    </div>
  );
}
