import type { Metadata } from "next";
import { QuotesContent } from "@/components/QuotesContent";

export const metadata: Metadata = {
  title: "اقتباسات شجرة سينا — روايتي",
  description: "مقتطفات مختارة تنبض بالحكمة والجمال من رواية شجرة سينا للكاتب Pica.",
  alternates: { canonical: "/quotes" },
};

export default function QuotesPage() {
  return <QuotesContent />;
}
