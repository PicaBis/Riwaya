export interface Chapter {
  number: number;
  title: string;
  /** Page number where this chapter starts (1-indexed) */
  startPage: number;
  teaser?: string;
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
  chapters: Chapter[];
  freeUntilChapter: number;
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
    chapters: [
      { number: 1, title: "الفصل الأول: البداية",    startPage: 1 },
      { number: 2, title: "الفصل الثاني: الرحلة",    startPage: 8 },
      { number: 3, title: "الفصل الثالث: المواجهة",  startPage: 15 },
      { number: 4, title: "الفصل الرابع: السر",       startPage: 25 },
    ],
    freeUntilChapter: 3,
  },
];

export function getNovelById(id: string): Novel | undefined {
  return novels.find((n) => n.id === id);
}

export function getLockedChapter(novel: Novel): Chapter | undefined {
  if (novel.freeUntilChapter >= novel.chapters.length) return undefined;
  return novel.chapters.find((c) => c.number > novel.freeUntilChapter);
}

export function getFreeUntilPage(novel: Novel): number {
  const locked = getLockedChapter(novel);
  if (!locked) return 9999;
  // Free includes pages up to the start of the locked chapter minus 1
  return locked.startPage - 1;
}
