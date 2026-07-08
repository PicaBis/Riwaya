import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "سياسة الخصوصية — روايتي",
  description: "سياسة الخصوصية لمنصة روايتي: ما البيانات التي نجمعها وكيف نحميها.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <LegalDoc type="privacy" />;
}
