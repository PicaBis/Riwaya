import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center" dir="rtl">
      <BookOpen className="w-24 h-24 text-gold-500/15 mb-6" />
      <h1 className="font-arabic text-8xl font-bold mb-4 text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #b8860b 0%, #d4af37 50%, #b8860b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>404</h1>
      <h2 className="font-arabic text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
        الصفحة غير موجودة
      </h2>
      <p className="text-gray-500 dark:text-gray-400 font-arabic text-sm mb-8 max-w-md">
        يبدو أن الصفحة التي تبحث عنها غير موجودة. ربما تم نقلها أو حذفها.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white rounded-xl font-arabic font-medium transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </Link>
        <Link
          href="/library"
          className="px-6 py-3 border border-parchment-300 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-xl font-arabic text-sm hover:bg-parchment-100 dark:hover:bg-white/5 active:scale-95 transition-all"
        >
          المكتبة
        </Link>
      </div>
    </div>
  );
}