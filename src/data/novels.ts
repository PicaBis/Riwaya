export interface Novel {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  author: string;
  genre: string;
  year: number;
  pdfFile: string;          // filename inside /public/novels/
  language: "ar" | "fr" | "en";
  tags?: string[];
  /** Page number after which the paywall appears (chapter 3 gate) */
  freeUntilPage: number;
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
    // ✏️ Adjust this to the actual first page of chapter 3
    freeUntilPage: 20,
  },
  // ➕ Add new novels here — same structure
];

export function getNovelById(id: string): Novel | undefined {
  return novels.find((n) => n.id === id);
}
