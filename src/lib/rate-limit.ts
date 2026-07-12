// Simple in-memory sliding-window rate limiter (per key, e.g. IP).
// Note: resets on serverless cold start — a lightweight abuse deterrent,
// not a hard guarantee. Middleware provides a coarser global limit.

interface Bucket {
  hits: number[];
}

const store = new Map<string, Bucket>();

// Occasional cleanup to avoid unbounded growth.
let lastCleanup = 0;

export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export function rateLimit(
  key: string,
  { windowMs, max }: RateLimitOptions
): { allowed: boolean; retryAfter: number } {
  const now = Date.now();

  if (now - lastCleanup > 60_000) {
    Array.from(store.keys()).forEach((k) => {
      const b = store.get(k)!;
      b.hits = b.hits.filter((t: number) => now - t < windowMs);
      if (b.hits.length === 0) store.delete(k);
    });
    lastCleanup = now;
  }

  let bucket = store.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    store.set(key, bucket);
  }

  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= max) {
    const oldest = bucket.hits[0];
    const retryAfter = Math.ceil((windowMs - (now - oldest)) / 1000);
    return { allowed: false, retryAfter };
  }

  bucket.hits.push(now);
  return { allowed: true, retryAfter: 0 };
}

export function getClientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") || "unknown";
}
