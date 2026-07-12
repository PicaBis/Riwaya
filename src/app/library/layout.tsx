import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مكتبتي — روايتي",
  description: "تابع تقدّمك في القراءة، تقييماتك، ونسخك الاحتياطية في منصة روايتي.",
  alternates: { canonical: "/library" },
};

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
