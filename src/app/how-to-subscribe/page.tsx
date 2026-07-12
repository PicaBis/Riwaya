import type { Metadata } from "next";
import { HowToContent } from "@/components/HowToContent";

export const metadata: Metadata = {
  title: "كيف أشترك؟ — روايتي",
  description: "دليل خطوة بخطوة لفتح كل فصول الرواية: اختر، ادفع، أرسل الإيصال، وأدخل الرمز.",
  alternates: { canonical: "/how-to-subscribe" },
};

export default function HowToSubscribePage() {
  return <HowToContent />;
}
