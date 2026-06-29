export interface Novel {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  author: string;
  genre: string;
  year: number;
  pdfFile: string;   // filename inside /public/novels/
  language: "ar" | "fr" | "en";
  tags?: string[];
}

export const novels: Novel[] = [
  {
    id: "shajarat-sina",
    title: "شجرة سينا",
    subtitle: "رواية أدبية",
    description:
      "رواية تأخذك في رحلة عميقة إلى عالم مليء بالأسرار والمشاعر الإنسانية الدافئة. قصة تنبض بالحياة وتلامس أوتار الروح، بأسلوب أدبي رفيع يجمع بين الشعر والسرد.",
    author: "روايتي",
    genre: "رواية أدبية",
    year: 2024,
    pdfFile: "shajarat-sina.pdf",
    language: "ar",
    tags: ["أدب", "رواية", "عربي"],
  },
  // ➕ أضف رواياتك الجديدة هنا بنفس البنية
];

export function getNovelById(id: string): Novel | undefined {
  return novels.find((n) => n.id === id);
}
