import type { NextRequest } from "next/server";

/**
 * Rejects requests whose Origin/Referer clearly points at a different host.
 * Deliberately permissive when both headers are absent (some legitimate same-
 * origin requests strip Referer under strict referrer policies) — this is a
 * defense-in-depth signal, not the primary gate. The primary gate for
 * protected assets is the short-lived signed token (see asset-token.ts).
 */
export function refererMatchesHost(request: NextRequest): boolean {
  const host = request.headers.get("host") || "";
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }
  return true;
}
