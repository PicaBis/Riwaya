"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText, RotateCcw } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { AUTHOR } from "@/lib/constants";

type LegalType = "privacy" | "terms" | "refund";

const ICONS = { privacy: ShieldCheck, terms: FileText, refund: RotateCcw };

/** Bilingual legal documents. Plain, honest boilerplate — not legal advice. */
export function LegalDoc({ type }: { type: LegalType }) {
  const { lang } = useApp();
  const ar = lang === "ar";
  const dir = ar ? "rtl" : "ltr";
  const fontClass = ar ? "font-arabic" : "font-sans";
  const Icon = ICONS[type];

  const title = ar
    ? { privacy: "سياسة الخصوصية", terms: "شروط الاستخدام", refund: "سياسة الاسترداد" }[type]
    : { privacy: "Privacy Policy", terms: "Terms of Use", refund: "Refund Policy" }[type];

  const sections = CONTENT[type][ar ? "ar" : "en"];

  return (
    <div className={`max-w-3xl mx-auto px-4 sm:px-6 py-10 ${fontClass}`} dir={dir}>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gold-500 transition-colors mb-6"
      >
        <ArrowLeft className={`w-4 h-4 ${!ar ? "rotate-180" : ""}`} />
        {ar ? "العودة للرئيسية" : "Back home"}
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-2xl bg-gold-500/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-gold-500" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-8">
        {ar ? "آخر تحديث: يوليو 2026" : "Last updated: July 2026"} · rewayati.vercel.app
      </p>

      <div className="space-y-7">
        {sections.map((s, i) => (
          <section key={i}>
            {s.h && <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{s.h}</h2>}
            <p className="text-sm sm:text-[15px] text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {s.p}
            </p>
          </section>
        ))}

        <section className="pt-4 border-t border-parchment-200 dark:border-white/8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {ar ? "للاستفسار أو الطلبات، تواصل معنا عبر البريد: " : "For questions or requests, contact us at: "}
            <a href={`mailto:${AUTHOR.email}`} className="text-gold-500 hover:underline" dir="ltr">
              {AUTHOR.email}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

/* ── Document text ───────────────────────────────────────────────────────── */
type Sec = { h?: string; p: string };
const CONTENT: Record<LegalType, { ar: Sec[]; en: Sec[] }> = {
  privacy: {
    ar: [
      { p: "نحترم خصوصيتك ونجمع الحد الأدنى من البيانات اللازمة لتشغيل المنصة وتحسين تجربة القراءة." },
      { h: "البيانات التي نخزّنها", p: "• تفضيلاتك (الوضع الليلي، اللغة، إعدادات القارئ) — تُحفظ محلياً في متصفحك.\n• تقدّم القراءة والتقييمات — قد تُزامَن بمعرّف مجهول لعرضها عبر أجهزتك.\n• التعليقات التي تكتبها (الاسم الذي تختاره + النص) — تُحفظ في قاعدة بياناتنا (Supabase) وتكون مرئية للجميع.\n• بيانات تقنية محدودة (عنوان IP مؤقتاً) لأغراض الحماية من الإساءة." },
      { h: "ملفات تعريف الارتباط", p: "نستخدم التخزين المحلي وملفات تعريف الارتباط الضرورية لحفظ تفضيلاتك وجلستك فقط. لا نبيع بياناتك لأي طرف ثالث." },
      { h: "حقوقك", p: "يمكنك حذف تعليقاتك الخاصة في أي وقت، ومسح بياناتك المحلية من إعدادات متصفحك. للاستفسار عن بياناتك راسلنا عبر البريد." },
    ],
    en: [
      { p: "We respect your privacy and collect the minimum data needed to run the platform and improve your reading experience." },
      { h: "What we store", p: "• Your preferences (dark mode, language, reader settings) — stored locally in your browser.\n• Reading progress and ratings — may sync under an anonymous identifier across your devices.\n• Comments you write (your chosen name + text) — stored in our database (Supabase) and visible to everyone.\n• Limited technical data (IP, temporarily) for abuse protection." },
      { h: "Cookies", p: "We use local storage and only the cookies necessary to keep your preferences and session. We never sell your data to third parties." },
      { h: "Your rights", p: "You can delete your own comments at any time and clear your local data from your browser settings. For data inquiries, email us." },
    ],
  },
  terms: {
    ar: [
      { p: "باستخدامك منصة روايتي فإنك توافق على هذه الشروط. يُرجى قراءتها بعناية." },
      { h: "المحتوى والملكية الفكرية", p: "جميع الروايات والنصوص محمية بحقوق الملكية الفكرية للكاتب. لا يجوز نسخها أو إعادة نشرها أو توزيعها أو تصويرها دون إذن كتابي مسبق." },
      { h: "الاشتراك والوصول", p: "بعض الفصول مجانية والبعض يتطلب اشتراكاً أو رمز تفعيل. يُمنح الوصول للمشترك شخصياً ولا يجوز مشاركته. نحتفظ بحق إيقاف الوصول عند إساءة الاستخدام." },
      { h: "سلوك المستخدم", p: "يُمنع نشر تعليقات مسيئة أو مخالفة للآداب أو القوانين. نحتفظ بحق حذف أي تعليق أو حظر أي مستخدم يخالف ذلك." },
      { h: "إخلاء المسؤولية", p: "تُقدَّم الخدمة «كما هي». نبذل جهدنا لضمان الاستقرار لكننا لا نضمن خلوّها التام من الأعطال." },
    ],
    en: [
      { p: "By using Rewayati you agree to these terms. Please read them carefully." },
      { h: "Content & intellectual property", p: "All novels and texts are the author's intellectual property. They may not be copied, republished, distributed, or captured without prior written permission." },
      { h: "Subscription & access", p: "Some chapters are free; others require a subscription or activation code. Access is granted to the subscriber personally and may not be shared. We may suspend access on misuse." },
      { h: "User conduct", p: "Abusive, offensive, or unlawful comments are prohibited. We reserve the right to remove any comment or ban any user who violates this." },
      { h: "Disclaimer", p: "The service is provided \"as is\". We strive for stability but do not guarantee it will be entirely error-free." },
    ],
  },
  refund: {
    ar: [
      { p: "نريد أن تكون راضياً عن تجربتك. توضّح هذه السياسة كيفية التعامل مع المدفوعات والاسترداد." },
      { h: "طريقة الدفع والتفعيل", p: "تتم المدفوعات عبر Redot Pay أو تحويل CCP. بعد التحويل يتم تفعيل اشتراكك يدوياً بعد التحقق من الإيصال، وعادةً خلال وقت قصير." },
      { h: "الاسترداد", p: "إذا واجهت مشكلة تقنية منعتك من الوصول للمحتوى المدفوع ولم نتمكن من حلّها، يحق لك طلب استرداد خلال 7 أيام من الدفع. المحتوى الرقمي الذي تم الوصول إليه بالكامل قد لا يكون قابلاً للاسترداد." },
      { h: "كيفية طلب الاسترداد", p: "راسلنا عبر البريد مرفقاً إيصال الدفع ووصف المشكلة، وسنردّ عليك في أقرب وقت." },
    ],
    en: [
      { p: "We want you to be satisfied. This policy explains how payments and refunds are handled." },
      { h: "Payment & activation", p: "Payments are made via Redot Pay or CCP transfer. After transfer, your subscription is activated manually once the receipt is verified — usually within a short time." },
      { h: "Refunds", p: "If a technical issue prevented you from accessing paid content and we could not resolve it, you may request a refund within 7 days of payment. Fully-accessed digital content may not be refundable." },
      { h: "How to request a refund", p: "Email us with your payment receipt and a description of the issue, and we will respond promptly." },
    ],
  },
};
