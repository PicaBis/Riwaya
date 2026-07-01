export interface Comment {
  id: string;
  novelId: string;
  author: string;
  content: string;
  createdAt: number;
  likes: string[];
  replies?: { id: string; author: string; content: string; createdAt: number }[];
}

interface StoreShape {
  comments: Comment[];
  blocked: string[];
}

const STORAGE_KEY = "riwayati_comments";
const BLOCKED_KEY = "riwayati_blocked";

function readStore(): StoreShape {
  if (typeof window === "undefined") return { comments: [], blocked: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { comments: [], blocked: [] };
}

function writeStore(data: StoreShape) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let memoryStore: StoreShape = { comments: [], blocked: [] };

export function getStore() {
  memoryStore = readStore();
  return memoryStore;
}

export function persistStore() {
  writeStore(memoryStore);
}

export function getBlockedUsers() {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(BLOCKED_KEY);
      if (raw) return JSON.parse(raw) as string[];
    } catch {}
  }
  return [];
}

export function addBlockedUser(name: string) {
  const blocked = getBlockedUsers();
  if (!blocked.includes(name)) {
    blocked.push(name);
    if (typeof window !== "undefined") {
      localStorage.setItem(BLOCKED_KEY, JSON.stringify(blocked));
    }
  }
}

let seedLoaded = false;

export function ensureSeedData(novelId: string) {
  if (seedLoaded) return;
  const store = getStore();
  const hasSeed = store.comments.some(
    (c) => c.novelId === novelId && c.id.startsWith("seed-")
  );
  if (hasSeed) {
    seedLoaded = true;
    return;
  }

  const seedComments: Comment[] = [
    {
      id: "seed-1",
      novelId,
      author: "محب القراءة",
      content: "يا خويا الفصل الأول حماسي بزاف! ما كنتش نتوقع هاذا التطور فالأحداث. والله غير ندمت لي ما بديتش نحوس على روايات جزائرية من قبل. تحية من وهران ❤️",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      likes: ["قارئ مجهول", "عاشق الروايات", "سمير من البليدة"],
    },
    {
      id: "seed-2",
      novelId,
      author: "عاشق الروايات",
      content: "مستني الفصل الرابع بفارغ الصبر! الأسلوب الأدبي رائع جداً. حسيت روحي فالعالم لي كتبتو بيكا، كل تفصيلة تحسها مدروسة. راهم يحكو فيك لينا بالخير فالدار 💪",
      createdAt: Date.now() - 1000 * 60 * 60 * 12,
      likes: ["محب القراءة", "فارس الكلمة", "ليلى"],
    },
    {
      id: "seed-3",
      novelId,
      author: "فارس الكلمة",
      content: "الوصف فالفصل الثالث جعلني نحس روحي هناك. mbarek 3likom! الرواية فيها عمق كبير، واللغة تجي سلسة تفهم كيما تقرا رواية عالمية. نستنى المزيد يا بيكا",
      createdAt: Date.now() - 1000 * 60 * 60 * 4,
      likes: ["عاشق الروايات", "محب القراءة", "زينب"],
    },
    {
      id: "seed-4",
      novelId,
      author: "قارئ مجهول",
      content: "هاذي الرواية تستحق أكثر من 5 نجوم. شكراً للأستاذ بيكا. أنا من الجزائر العاصمة وجيت هنا عن طريق فيسبوك، بصراحة توقعت شي بسيط لكن لقيت مستوى خرافي. ننصح الكل يقراها",
      createdAt: Date.now() - 1000 * 60 * 30,
      likes: ["محب القراءة", "سمير من البليدة"],
    },
    {
      id: "seed-5",
      novelId,
      author: "نجمة الأدب",
      content: "اللغة العربية الفصحى المستخدمة هنا تدل على عمق التأمل والتحليل. عمل أدبي مميز يقارع كبار الكتاب. صراحة أنا درت ميموار فالهاتف باش نرجع نكمل. تحفة فنية",
      createdAt: Date.now() - 1000 * 60 * 60 * 18,
      likes: ["فارس الكلمة", "عاشق الروايات", "محب القراءة", "ليلى"],
    },
    {
      id: "seed-6",
      novelId,
      author: "سمير من البليدة",
      content: "والله هاك رواية ماشاء الله. bravo أستاذ بيكا! أنا تانعرفش نقرا بزاف بالعربية بصح هاك الرواية خلتني ننسى بلي رايح نقلب صفحة. حاجة عظيمة والله",
      createdAt: Date.now() - 1000 * 60 * 5,
      likes: ["محب القراءة", "قارئ مجهول"],
    },
    {
      id: "seed-7",
      novelId,
      author: "ليلى",
      content: "قرأت أول 3 فصول قلت نرتاح بصح حبستني الرواية وما قدرت نحبس. كيما كنت صغيرة كنت نقرا، والآن لقيت شي يشبه ليامات. شكراً بيكا على هاذي التحفة. لازم تزيد تخرج أعمال 💛",
      createdAt: Date.now() - 1000 * 60 * 60 * 1,
      likes: ["عاشق الروايات", "زينب", "فارس الكلمة"],
    },
    {
      id: "seed-8",
      novelId,
      author: "زينب",
      content: "أول مرة ندخل لمنصة روايتي ونخليني نقول برافو على التصميم والمحتوى. الألوان والقراءة تجي مريحة للعين، وما حسيتش بالتعب وأنا نقرا. محتوى قوي والله يستحق الدعم",
      createdAt: Date.now() - 1000 * 60 * 15,
      likes: ["ليلى", "قارئ مجهول"],
    },
    {
      id: "seed-9",
      novelId,
      author: "هشام",
      content: "Yo les amis ! أنا من تيزي وزو، عندي 19 سنة، كيما دخلت لقيت روحي ساسي فهاد الرواية. تمنيت يكون فيها شوية فرنسية ماشان نحس بيها قريبة بصح راهي تجي معقولة. جاري القراءة 🚀",
      createdAt: Date.now() - 1000 * 60 * 3,
      likes: ["سمير من البليدة"],
    },
    {
      id: "seed-10",
      novelId,
      author: "الدكتور أحمد",
      content: "كمتخصص في الأدب العربي، أرى أن العمل يحمل بصمة كاتب واعد جداً. الشخصيات عميقة والحبكة متقنة. أنصح طلابي بمتابعة أعمال بيكا. مستقبل الأدب الجزائري واعد بهذه الأقلام الشابة",
      createdAt: Date.now() - 1000 * 60 * 60 * 6,
      likes: ["فارس الكلمة", "عاشق الروايات", "زينب", "ليلى", "محب القراءة"],
    },
  ];

  store.comments = [...seedComments, ...store.comments];
  writeStore(store);
  memoryStore = store;
  seedLoaded = true;
}
