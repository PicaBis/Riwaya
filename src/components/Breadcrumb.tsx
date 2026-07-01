"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-4 flex-wrap" dir="rtl">
      <Link href="/" className="hover:text-gold-500 font-arabic transition-colors">
        الرئيسية
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronLeft className="w-3 h-3" />
          {item.href ? (
            <Link href={item.href} className="hover:text-gold-500 font-arabic transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-600 dark:text-gray-300 font-arabic font-medium">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}