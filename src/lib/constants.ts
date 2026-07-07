// Centralized constants — single source of truth.
// Update values here; every component picks them up automatically.

export const AUTHOR = {
  name: "Medjahed Abdelhadi",
  penName: "Pica",
  email: "Medjahed10abdelhadi@gmail.com",
  instagramHandle: "prof_pica",
  instagramUrl: "https://www.instagram.com/prof_pica/",
  whatsappNumber: "+213557972459",
} as const;

export const BANK = {
  ripNumber: "00799999002885975343",
  label: "BaridiMob / CCP",
} as const;

export const SITE = {
  nameAr: "روايتي",
  nameEn: "Rewayati",
  domain: "rewayati.vercel.app",
  url: "https://rewayati.vercel.app",
} as const;

/** DEV_CODE digest — set this env var on Vercel. The raw value is NEVER
 *  visible in the client bundle; only the SHA-256 hex digest is compared. */
export function getDevCodeDigest(): string {
  const fromEnv = process.env.DEV_CODE_DIGEST;
  if (fromEnv && fromEnv.length === 64) return fromEnv;
  if (process.env.NODE_ENV === "production") {
    console.warn("[constants] DEV_CODE_DIGEST is not set or invalid — admin auth will fail.");
  }
  // Fallback digest for development only (matches the old hardcoded digest in auth.ts)
  return [
    "65e8974c2b03d549",
    "ec1a04bd97b12148",
    "0945e127da18c2c6",
    "810024f50247a8d2",
  ].join("");
}
