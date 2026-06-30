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
const BANNED_KEY = "__riwayati_banned";

export function getComments(): CommentData[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const store = (globalThis as any)[GLOBAL_KEY];
  return Array.isArray(store) ? store : [];
}

export function setComments(arr: CommentData[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any)[GLOBAL_KEY] = arr;
}

export function getBannedUsers(): string[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const store = (globalThis as any)[BANNED_KEY];
  return Array.isArray(store) ? store : [];
}

export function banUser(name: string): void {
  const banned = getBannedUsers();
  if (!banned.includes(name)) {
    banned.push(name);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any)[BANNED_KEY] = banned;
  }
}

export function isUserBanned(name: string): boolean {
  return getBannedUsers().includes(name);
}

let seeded = false;

export function seedComments() {
  if (seeded) return;
  const now = Date.now();
  const HOUR = 3600000;
  const MIN = 60000;

  const seedData: CommentData[] = [
    /* ── Chapter 1 Comments ───────────────────────────── */
    {
      id: "s1", novelId: "shajarat-sina", chapterId: 1,
      author: "فارس الكلمة",
      content: "بداية رائعة! أسلوب السرد شدني من أول سطر. متشوق لمعرفة المزيد عن هذه الشخصيات.",
      likes: 18, likedBy: ["g1", "g3", "g5", "g7", "g12"],
      createdAt: now - 72 * HOUR, pinned: true,
    },
    {
      id: "s2", novelId: "shajarat-sina", chapterId: 1,
      author: "نور الهدى",
      content: "الوصف كان جميلاً جداً، أحسست أنني أعيش في المكان. خصوصاً مشهد غروب الشمس في البداية.",
      likes: 12, likedBy: ["g2", "g4", "g8"],
      createdAt: now - 60 * HOUR,
    },
    {
      id: "s9", novelId: "shajarat-sina", chapterId: 1,
      author: "مسافر",
      content: "لغة الكاتب سلسة وعذبة. قرأت الكثير من الروايات لكن أسلوب Pica مختلف ومميز. أنصح به بشدة.",
      likes: 9, likedBy: ["g4", "g6"],
      createdAt: now - 80 * HOUR,
    },
    {
      id: "s11", novelId: "shajarat-sina", chapterId: 1,
      author: "طالبة أدب",
      content: "أدرس الأدب العربي وهذه الرواية تثبت أن الأدب الجزائري حيّ يُرزق! أسلوب راقي وشخصيات مركّبة.",
      likes: 7, likedBy: ["g3", "g10"],
      createdAt: now - 65 * HOUR,
    },
    {
      id: "s12", novelId: "shajarat-sina", chapterId: 1,
      author: "عاشق القراءة",
      content: "أول مرة أقرأ رواية جزائرية بهذا المستوى. الكاتب يستحق كل الدعم. شكراً لهذه المنصة الرائعة!",
      likes: 15, likedBy: ["g1", "g2", "g5", "g9"],
      createdAt: now - 55 * HOUR,
    },
    {
      id: "s13", novelId: "shajarat-sina", chapterId: 1,
      author: "ريم",
      content: "البداية ساحقة! كيف يوصف الكاتب المشاهد بتفاصيل كهذه؟ أشعر أنني في عالم آخر.",
      likes: 6, likedBy: ["g11", "g13"],
      createdAt: now - 40 * HOUR,
    },

    /* ── Chapter 2 Comments ───────────────────────────── */
    {
      id: "s3", novelId: "shajarat-sina", chapterId: 2,
      author: "قارئ مجهول",
      content: "يا إلهي! الفصل الثاني كان مذهلاً. تلك المفاجأة في المنتصف جعلت قلبي يتوقف.",
      likes: 22, likedBy: ["g1", "g6", "g7", "g8", "g12", "g14"],
      createdAt: now - 48 * HOUR, pinned: true,
    },
    {
      id: "s4", novelId: "shajarat-sina", chapterId: 2,
      author: "عاشقة الكتب",
      content: "أحببت الحوار بين البطل وصديقه. عميق جداً ويحمل فلسفة جميلة. الكاتب مبدع.",
      likes: 10, likedBy: ["g3", "g9", "g15"],
      createdAt: now - 36 * HOUR,
    },
    {
      id: "s5", novelId: "shajarat-sina", chapterId: 2,
      author: "زهرة",
      content: "لا أستطيع التوقف عن القراءة! كلما أنتهي من فصل أريد المزيد. أنصح الجميع بهذه الرواية.",
      likes: 14, likedBy: ["g2", "g5", "g9", "g11"],
      createdAt: now - 24 * HOUR,
    },
    {
      id: "s14", novelId: "shajarat-sina", chapterId: 2,
      author: "أحمد",
      content: "الفصل الثاني أعمق بكثير من الأول. التفاصيل النفسية للبطل رائعة. أتوقع أحداثاً مذهلة في القادم.",
      likes: 8, likedBy: ["g4", "g7"],
      createdAt: now - 30 * HOUR,
    },
    {
      id: "s15", novelId: "shajarat-sina", chapterId: 2,
      author: "سارة",
      content: "الجزء الذي يتحدث عن البحر... سبحان الله! كأنني أشم رائحة الملح وأسمع الأمواج. وصف خرافي!",
      likes: 11, likedBy: ["g1", "g3", "g8", "g10"],
      createdAt: now - 28 * HOUR,
    },
    {
      id: "s16", novelId: "shajarat-sina", chapterId: 2,
      author: "ناقد أدبي",
      content: "من الناحية الأدبية، هذا الفصل يُظهر نضجاً في الأسلوب. بنية الجمل متوازنة والصور البلاغية متقنة.",
      likes: 5, likedBy: ["g6"],
      createdAt: now - 20 * HOUR,
    },

    /* ── Chapter 3 Comments ───────────────────────────── */
    {
      id: "s6", novelId: "shajarat-sina", chapterId: 3,
      author: "فارس الكلمة",
      content: "الفصل الثالث حماسي جداً! الأحداث تتسارع بشكل جميل. مستني الفصل الرابع بفارغ الصبر 🔥",
      likes: 28, likedBy: ["g1", "g3", "g4", "g6", "g7", "g12", "g15", "g16"],
      createdAt: now - 12 * HOUR, pinned: true,
    },
    {
      id: "s7", novelId: "shajarat-sina", chapterId: 3,
      author: "نور الهدى",
      content: "الصراع بدأ يشتعل! توقعت أن البطل سيكتشف الحقيقة لكن ليس بهذه الطريقة. الكاتب أذهلني.",
      likes: 19, likedBy: ["g2", "g8", "g9", "g11", "g14"],
      createdAt: now - 6 * HOUR,
    },
    {
      id: "s8", novelId: "shajarat-sina", chapterId: 3,
      author: "باحث عن المعنى",
      content: "هناك رمزية عميقة في اسم الرواية (شجرة سينا). هل هي إشارة إلى شجرة الحياة؟ أفكار كثيرة تتبادر للذهن.",
      likes: 13, likedBy: ["g5", "g10", "g16"],
      createdAt: now - 3 * HOUR,
    },
    {
      id: "s10", novelId: "shajarat-sina", chapterId: 3,
      author: "قارئ مجهول",
      content: "هل هناك موعد لإصدار الفصل الرابع؟ حماسي يقتلني 😅",
      likes: 8, likedBy: ["g2", "g7"],
      createdAt: now - 1 * HOUR,
    },
    {
      id: "s17", novelId: "shajarat-sina", chapterId: 3,
      author: "ليلى",
      content: "أنا متابعة جديدة للرواية من الجزائر العاصمة. قرأت الفصول الثلاثة في جلسة واحدة! لا أستطيع الانتظار.",
      likes: 16, likedBy: ["g1", "g3", "g5", "g9", "g12"],
      createdAt: now - 4 * HOUR,
    },
    {
      id: "s18", novelId: "shajarat-sina", chapterId: 3,
      author: "عمر",
      content: "المشهد الأخير في الفصل الثالث... لا أريد أن أحرق الأحداث، لكن قلبي توقف حرفياً. كاتب عبقري!",
      likes: 21, likedBy: ["g2", "g4", "g6", "g8", "g10", "g13"],
      createdAt: now - 2 * HOUR,
    },
    {
      id: "s19", novelId: "shajarat-sina", chapterId: 3,
      author: "مريم",
      content: "أنصح الجميع بالاشتراك! تستحق كل فلس. الأستاذ بيكا كاتب موهوب ومحتواه لا يُقدّر بثمن.",
      likes: 11, likedBy: ["g7", "g11", "g15"],
      createdAt: now - 5 * HOUR,
    },
    {
      id: "s20", novelId: "shajarat-sina", chapterId: 3,
      author: "خالد",
      content: "منصة روايتي أفضل منصة قراءة عربية رأيتها. التصميم أنيق والتجربة مريحة. شكراً للمطور! 👏",
      likes: 9, likedBy: ["g1", "g14"],
      createdAt: now - 8 * HOUR,
    },
  ];

  setComments(seedData);
  seeded = true;
}
