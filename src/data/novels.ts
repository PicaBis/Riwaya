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
  pdfFile: string;
  language: "ar" | "fr" | "en";
  tags?: string[];
  freeUntilPage: number;
  chapters?: NovelChapter[];
  lastUpdated?: string;
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
    lastUpdated: "2024-12-15",
    chapters: [
      { title: "الفصل الأول: بداية الرحلة", startPage: 1 },
      { title: "الفصل الثاني: أسرار الصحراء", startPage: 44 },
      { title: "الفصل الثالث: الحرب الكبرى 🔒", startPage: 129 },
      { title: "الفصل الرابع: ما بعد العاصفة 🔒", startPage: 175 },
      { title: "الفصل الخامس: النهاية 🔒", startPage: 220 },
    ],
  },
];

export function getNovelById(id: string): Novel | undefined {
  return novels.find((n) => n.id === id);
}
