import type { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "عن المنصة — روايتي",
  description: "المنصة الرسمية والحصرية لجميع أعمال بيكا الأدبية والفنية.",
};

export default function AboutPage() {
  return <AboutContent />;
}
