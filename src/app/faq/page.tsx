import type { Metadata } from "next";
import { FaqContent } from "@/components/FaqContent";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة — روايتي",
  description: "إجابات عن أكثر الأسئلة شيوعاً حول القراءة والاشتراك وطرق الدفع في منصة روايتي.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return <FaqContent />;
}
