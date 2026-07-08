import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "سياسة الاسترداد — روايتي",
  description: "سياسة الاسترداد والدفع في منصة روايتي.",
  alternates: { canonical: "/refund" },
};

export default function RefundPage() {
  return <LegalDoc type="refund" />;
}
