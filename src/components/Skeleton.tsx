"use client";

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-onyx-800 rounded-2xl overflow-hidden border border-parchment-200 dark:border-white/8 animate-pulse" dir="rtl">
      <div className="aspect-[3/4] bg-parchment-200 dark:bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-20 bg-parchment-200 dark:bg-white/5 rounded-full" />
          <div className="h-5 w-12 bg-parchment-200 dark:bg-white/5 rounded-full" />
        </div>
        <div className="h-6 w-3/4 bg-parchment-200 dark:bg-white/5 rounded" />
        <div className="h-4 w-1/2 bg-parchment-200 dark:bg-white/5 rounded" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-parchment-200 dark:bg-white/5 rounded" />
          <div className="h-3 w-5/6 bg-parchment-200 dark:bg-white/5 rounded" />
          <div className="h-3 w-2/3 bg-parchment-200 dark:bg-white/5 rounded" />
        </div>
        <div className="h-4 w-24 bg-parchment-200 dark:bg-white/5 rounded" />
        <div className="h-10 w-full bg-parchment-200 dark:bg-white/5 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonReader() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 rounded-full border-[3px] border-gold-500/20 border-t-gold-500 animate-spin" />
      <span className="text-sm text-gray-400 dark:text-gray-500 font-arabic font-medium">
        جاري تحميل الرواية…
      </span>
      <div className="w-full max-w-md aspect-[1/1.4] bg-parchment-200 dark:bg-white/5 rounded-lg animate-pulse mt-2" />
    </div>
  );
}
