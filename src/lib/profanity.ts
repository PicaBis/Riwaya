// Lightweight profanity / spam filter for comments (Arabic + French + English).
// Not exhaustive — a pragmatic first line of defense against abuse.

const BAD_WORDS = [
  // Arabic (common insults / slurs)
  "كلب", "حمار", "غبي", "خنزير", "قحبة", "عاهرة", "شرموط", "منيك", "زبي",
  "طيز", "كس", "نيك", "لعنة", "خرا", "زق", "متخلف", "حقير", "وسخ",
  // French
  "merde", "putain", "salope", "connard", "encule", "pute", "batard",
  // English
  "fuck", "shit", "bitch", "asshole", "bastard", "cunt", "dick", "whore", "nigger",
];

const SPAM_PATTERNS = [
  /https?:\/\/\S+/i,          // links
  /www\.\S+/i,               // bare domains
  /\b\d{9,}\b/,              // long number sequences (phone/spam)
  /(.)\1{9,}/,               // 10+ repeated same char
  /(\b\w+\b)(\s+\1){4,}/i,   // same word repeated 5+ times
];

export interface ModerationResult {
  ok: boolean;
  reason?: string;
}

export function moderateComment(text: string): ModerationResult {
  const normalized = text
    .toLowerCase()
    .replace(/[إأآا]/g, "ا")
    .replace(/ـ/g, "")
    .replace(/[ً-ْ]/g, ""); // strip Arabic diacritics

  for (const word of BAD_WORDS) {
    if (normalized.includes(word)) {
      return { ok: false, reason: "التعليق يحتوي على كلمات غير لائقة" };
    }
  }

  for (const pat of SPAM_PATTERNS) {
    if (pat.test(text)) {
      return { ok: false, reason: "التعليق يبدو كرسالة مزعجة (سبام) أو يحتوي على روابط" };
    }
  }

  if (text.trim().length < 2) {
    return { ok: false, reason: "التعليق قصير جداً" };
  }

  return { ok: true };
}
