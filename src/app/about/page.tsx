import Image from "next/image";
import { PenTool, Code2, BookOpen, ImageIcon, Quote } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "عن المنصة — روايتي",
  description: "منصة الأستاذ بيكا (@ProfPica) الرسمية والحصرية للروايات والأعمال الأدبية.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16" dir="rtl">
      {/* ── Hero ──────────────────────────────────────── */}
      <div className="text-center mb-16 animate-fade-up">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6">
          <BookOpen className="w-3.5 h-3.5 text-gold-500" />
          <span className="text-xs font-arabic text-gold-600 dark:text-gold-400">
            منصة الأستاذ بيكا الرسمية
          </span>
        </span>
        <h1 className="font-arabic text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          عن المنصة
        </h1>
        <p className="font-arabic text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          منصة الأستاذ بيكا (@ProfPica) الرسمية والحصرية للروايات والأعمال الأدبية.
        </p>
      </div>

      {/* ── Identity Card ─────────────────────────────── */}
      <div className="bg-white dark:bg-onyx-800 rounded-3xl border border-parchment-200 dark:border-white/8 overflow-hidden shadow-book mb-12 animate-fade-up" style={{ animationDelay: "100ms" }}>
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-72 h-72 md:h-auto flex-shrink-0">
            <Image
              src="/author.jpg"
              alt="الأستاذ بيكا — Medjahed Abdelhadi"
              fill
              className="object-cover object-top"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-transparent to-white/60 dark:to-onyx-800/80" />
          </div>
          <div className="flex flex-col justify-center p-8 md:p-10">
            <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-gray-100">
              Medjahed Abdelhadi — Pica
            </h2>
            <p className="text-gold-500 font-medium tracking-widest text-sm mt-1">
              أستاذ علوم فيزيائية — École Normale Supérieure de Laghouat
            </p>
            <p className="font-arabic text-gray-600 dark:text-gray-300 leading-loose text-base mt-4">
              خريج المدرسة العليا للأساتذة بالأغواط، يدمج بين الرصيد الأكاديمي والتعبير الإبداعي
              عبر الفنون الرقمية وتطوير المواقع وصناعة المحتوى الرقمي.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-parchment-100 dark:bg-white/5 border border-parchment-200 dark:border-white/10 text-gray-500 dark:text-gray-400 font-arabic">
                علوم فيزيائية
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-parchment-100 dark:bg-white/5 border border-parchment-200 dark:border-white/10 text-gray-500 dark:text-gray-400 font-arabic">
                تعليم
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-parchment-100 dark:bg-white/5 border border-parchment-200 dark:border-white/10 text-gray-500 dark:text-gray-400 font-arabic">
                أدب
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Skills ────────────────────────────────────── */}
      <div className="grid sm:grid-cols-3 gap-6 mb-12 animate-fade-up" style={{ animationDelay: "200ms" }}>
        <SkillCard
          icon={<PenTool className="w-6 h-6 text-gold-500" />}
          title="صناعة وتطوير المواقع"
          desc="build and deploy modern Arabic-first reading experiences on the web."
        />
        <SkillCard
          icon={<Code2 className="w-6 h-6 text-gold-500" />}
          title="الرسم والفنون الرقمية"
          desc="صناعة محتوى بصري متميز يدعم الهوية البصرية للمنصة."
        />
        <SkillCard
          icon={<ImageIcon className="w-6 h-6 text-gold-500" />}
          title="صناعة المحتوى الرقمي Digital Creator"
          desc="إنشاء محتوى رقمي تفاعلي وجذاب للجمهور العربي."
        />
      </div>

      {/* ── Mission ───────────────────────────────────── */}
      <div className="relative bg-parchment-100 dark:bg-onyx-900 rounded-2xl border border-parchment-200 dark:border-white/8 p-8 mb-12 animate-fade-up" style={{ animationDelay: "300ms" }}>
        <Quote className="absolute top-6 right-6 w-8 h-8 text-gold-500/20" />
        <h3 className="font-arabic text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          الهدف من الموقع
        </h3>
        <p className="font-arabic text-gray-700 dark:text-gray-300 leading-loose text-center">
          هذا الموقع هو المستودع الرسمي والحصري لجميع أعمال وكتب وروايات الأستاذ بيكا،
          حيث يتم تضمين كافة المؤلفات وهي حالياً قيد التوثيق والنشر المستمر عبر صفحات
          الموقع المتتالية لضمان حقوق الملكية الفكرية.
        </p>
      </div>

      {/* ── Copyright ─────────────────────────────────── */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 font-arabic">
        جميع الحقوق محفوظة © {new Date().getFullYear()} — ProfPica / Medjahed Abdelhadi
      </p>
    </div>
  );
}

function SkillCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white dark:bg-onyx-800 rounded-2xl border border-parchment-200 dark:border-white/8 p-6">
      <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-arabic font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="font-arabic text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}
