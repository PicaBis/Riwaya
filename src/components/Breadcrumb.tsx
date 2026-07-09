"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  const { lang } = useApp();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";
  const Chevron = dir === "ltr" ? ChevronRight : ChevronLeft;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-4 flex-wrap me-4 sm:me-6" dir={dir}>
      <Link href="/" className={`hover:text-gold-500 transition-colors ${fontClass}`}>
        {t("nav.home", lang)}
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <Chevron className="w-3 h-3" />
          {item.href ? (
            <Link href={item.href} className={`hover:text-gold-500 transition-colors ${fontClass}`}>
              {item.label}
            </Link>
          ) : (
            <span className={`text-gray-600 dark:text-gray-300 font-medium ${fontClass}`}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
