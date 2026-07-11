export interface NovelChapter {
  title: string;
  startPage: number;
}

export interface Novel {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  author: string;
  genre: string;
  year: number;
  pdfFile?: string;
  language: "ar" | "fr" | "en";
  tags?: string[];
  freeUntilPage: number;
  /** Total number of pages in the complete novel. Shown in the reader's page
   *  counter even while only the free portion of the PDF is served, so readers
   *  see the true length and the locked chapters that require a subscription. */
  pageCount?: number;
  chapters?: NovelChapter[];
  lastUpdated?: string;
  status?: "published" | "coming-soon";
  /** Anonymous teaser card — hidden title/details, "revealed in the future". */
  mystery?: boolean;
}

export const novels: Novel[] = [
  {
    id: "shajarat-sina",
    title: "شجرة سينا",
    subtitle: "رواية أدبية",
    description:
      "رواية تأخذك في رحلة عميقة إلى عالم مليء بالأسرار والمشاعر الإنسانية الدافئة. قصة تنبض بالحياة وتلامس أوتار الروح، بأسلوب أدبي رفيع يجمع بين الشعر والسرد.",
    author: "Medjahed Abdelhadi — Pica",
    genre: "رواية أدبية",
    year: 2024,
    pdfFile: "shajarat-sina.pdf",
    language: "ar",
    tags: ["أدب", "رواية", "عربي"],
    freeUntilPage: 129,
    pageCount: 255,
    lastUpdated: "2024-12-15",
    chapters: [
      { title: "البداية", startPage: 1 },
      { title: "الفصل الأول: قلادة القمر", startPage: 7 },
      { title: "الفصل الثاني: تجربة الحب السوداء", startPage: 47 },
      { title: "الفصل الثالث: الحرب الكبرى", startPage: 129 },
      { title: "الفصل الرابع: أسرار العالم", startPage: 162 },
      { title: "الفصل الأخير: شجرة سينا", startPage: 203 },
    ],
  },
  {
    id: "zilal-allahib",
    title: "ظلال اللهب",
    subtitle: "رواية حماسية",
    description:
      "حين تشتعل نيران الحرب وتتلاقى المصائر في ساحةٍ واحدة، ينهض بطلٌ من الرمال ليقلب موازين القدر. رحلةٌ ملحمية تشحذ الهمم وتُشعل نبض الإثارة في كل صفحة — حيث الشجاعة تُختبر، والولاء يُحفَر بالنار، والبطولة تُكتب بدماء الأبطال.",
    author: "Medjahed Abdelhadi — Pica",
    genre: "رواية حماسية",
    year: 2025,
    language: "ar",
    tags: ["حماس", "إثارة", "مغامرة", "ملحمية"],
    freeUntilPage: 0,
    status: "coming-soon",
    lastUpdated: "2025-07-02",
  },
  {
    id: "mystery-1",
    title: "؟؟؟",
    subtitle: "قريباً",
    description: "عملٌ جديد قيد الكتابة… ستُكشف تفاصيله في وقتٍ قادم.",
    author: "Medjahed Abdelhadi — Pica",
    genre: "غير معلوم",
    year: 2026,
    language: "ar",
    freeUntilPage: 0,
    status: "coming-soon",
    mystery: true,
  },
];

export function getNovelById(id: string): Novel | undefined {
  return novels.find((n) => n.id === id);
}
