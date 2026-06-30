/* ─── In-memory comment store shared across API routes ── */
export interface CommentData {
  id: string;
  novelId: string;
  chapterId?: number;
  author: string;
  content: string;
  likes: number;
  likedBy: string[];
  parentId?: string;
  createdAt: number;
  pinned?: boolean;
}

const GLOBAL_KEY = "__riwayati_comments";

export function getComments(): CommentData[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const store = (globalThis as any)[GLOBAL_KEY];
  return Array.isArray(store) ? store : [];
}

export function setComments(arr: CommentData[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any)[GLOBAL_KEY] = arr;
}

let seeded = false;

export function seedComments() {
  if (seeded) return;
  const now = Date.now();
  const HOUR = 3600000;

  const seedData: CommentData[] = [
    {
      id: "s1", novelId: "shajarat-sina", chapterId: 1,
      author: "فارس الكلمة", content: "بداية رائعة! أسلوب السرد شدني من أول سطر. متشوق لمعرفة المزيد عن هذه الشخصيات.",
      likes: 12, likedBy: ["g1", "g3", "g5"],
      createdAt: now - 72 * HOUR, pinned: true,
    },
    {
      id: "s2", novelId: "shajarat-sina", chapterId: 1,
      author: "نور الهدى", content: "الوصف كان جميلاً جداً، أحسست أنني أعيش في المكان. خصوصاً مشهد غروب الشمس في البداية.",
      likes: 8, likedBy: ["g2", "g4"],
      createdAt: now - 60 * HOUR,
    },
    {
      id: "s3", novelId: "shajarat-sina", chapterId: 2,
      author: "قارئ مجهول", content: "يا إلهي! الفصل الثاني كان مذهلاً. تلك المفاجأة في المنتصف جعلت قلبي يتوقف.",
      likes: 15, likedBy: ["g1", "g6", "g7", "g8"],
      createdAt: now - 48 * HOUR, pinned: true,
    },
    {
      id: "s4", novelId: "shajarat-sina", chapterId: 2,
      author: "عاشقة الكتب", content: "أحببت الحوار بين البطل وصديقه. عميق جداً ويحمل فلسفة جميلة. الكاتب مبدع.",
      likes: 6, likedBy: ["g3"],
      createdAt: now - 36 * HOUR,
    },
    {
      id: "s5", novelId: "shajarat-sina", chapterId: 2,
      author: "زهرة", content: "لا أستطيع التوقف عن القراءة! كلما أنتهي من فصل أريد المزيد. أنصح الجميع بهذه الرواية.",
      likes: 10, likedBy: ["g2", "g5", "g9"],
      createdAt: now - 24 * HOUR,
    },
    {
      id: "s6", novelId: "shajarat-sina", chapterId: 3,
      author: "فارس الكلمة", content: "الفصل الثالث حماسي جداً! الأحداث تتسارع بشكل جميل. مستني الفصل الرابع بفارغ الصبر 🔥",
      likes: 20, likedBy: ["g1", "g3", "g4", "g6", "g7"],
      createdAt: now - 12 * HOUR, pinned: true,
    },
    {
      id: "s7", novelId: "shajarat-sina", chapterId: 3,
      author: "نور الهدى", content: "الصراع بدأ يشتعل! توقعت أن البطل سيكتشف الحقيقة لكن ليس بهذه الطريقة. الكاتب أذهلني.",
      likes: 14, likedBy: ["g2", "g8", "g9"],
      createdAt: now - 6 * HOUR,
    },
    {
      id: "s8", novelId: "shajarat-sina", chapterId: 3,
      author: "باحث عن المعنى", content: "هناك رمزية عميقة في اسم الرواية (شجرة سينا). هل هي إشارة إلى شجرة الحياة؟ أفكار كثيرة تتبادر للذهن.",
      likes: 7, likedBy: ["g5", "g10"],
      createdAt: now - 3 * HOUR,
    },
    {
      id: "s9", novelId: "shajarat-sina", chapterId: 1,
      author: "مسافر", content: "لغة الكاتب سلسة وعذبة. قرأت الكثير من الروايات لكن أسلوب Pica مختلف ومميز. أنصح به بشدة.",
      likes: 5, likedBy: ["g4"],
      createdAt: now - 80 * HOUR,
    },
    {
      id: "s10", novelId: "shajarat-sina", chapterId: 3,
      author: "قارئ مجهول", content: "هل هناك موعد لإصدار الفصل الرابع؟ حماسي يقتلني 😅",
      likes: 3, likedBy: [],
      createdAt: now - 1 * HOUR,
    },
  ];

  setComments(seedData);
  seeded = true;
}
