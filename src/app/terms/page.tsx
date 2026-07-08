import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "شروط الاستخدام — روايتي",
  description: "شروط استخدام منصة روايتي: المحتوى، الاشتراك، وسلوك المستخدم.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <LegalDoc type="terms" />;
}
