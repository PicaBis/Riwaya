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
      content: "يا خويا الفصل الأول حماسي بزاف! ما كنتش نتوقع هاذا التطور فالأحداث.",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
      likes: ["قارئ مجهول", "عاشق الروايات"],
    },
    {
      id: "seed-2",
      novelId,
      author: "عاشق الروايات",
      content: "مستني الفصل الرابع بفارغ الصبر! الأسلوب الأدبي رائع جداً.",
      createdAt: Date.now() - 1000 * 60 * 60 * 12,
      likes: ["محب القراءة", "فارس الكلمة"],
    },
    {
      id: "seed-3",
      novelId,
      author: "فارس الكلمة",
      content: "الوصف فالفصل الثالث جعلني نحس روحي هناك. mbarek 3likom!",
      createdAt: Date.now() - 1000 * 60 * 60 * 4,
      likes: ["عاشق الروايات"],
    },
    {
      id: "seed-4",
      novelId,
      author: "قارئ مجهول",
      content: "هاذي الرواية تستحق أكثر من 5 نجوم. شكراً للأستاذ بيكا.",
      createdAt: Date.now() - 1000 * 60 * 30,
      likes: ["محب القراءة"],
    },
    {
      id: "seed-5",
      novelId,
      author: "ناقد أدبي",
      content: "اللغة العربية الفصحى المستخدمة هنا تدل على عمق التأمل والتحليل. عمل أدبي مميز.",
      createdAt: Date.now() - 1000 * 60 * 10,
      likes: ["فارس الكلمة", "عاشق الروايات"],
    },
    {
      id: "seed-6",
      novelId,
      author: "بngana dz",
      content: "والله هاك رواية ماشاء الله. bravo أستاذ بيكا!",
      createdAt: Date.now() - 1000 * 60 * 5,
      likes: ["محب القراءة"],
    },
  ];

  store.comments = [...seedComments, ...store.comments];
  writeStore(store);
  memoryStore = store;
  seedLoaded = true;
}
