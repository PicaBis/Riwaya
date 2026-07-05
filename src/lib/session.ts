// Server-issued, tamper-evident session identity.
//
// This is NOT a login system. It gives every visitor — guest or not — an
// unguessable session id that only the server can mint and verify, using
// HMAC-signed cookies (HttpOnly, so client JS/localStorage can never read
// or forge it). Everything the site previously called "the user" (guest
// name, admin flag, device id) lived entirely in localStorage and could be
// edited by anyone via devtools. This module is the trust anchor that later
// features (short-lived signed asset URLs, dynamic per-session watermarks,
// per-session rate limiting) build on instead.

import { sign, verify } from "./crypto-sign";

export const SESSION_COOKIE_NAME = "rw_sid";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days, sliding

export interface SessionPayload {
  /** Random, unguessable, server-generated identifier. Never derived from anything client-supplied. */
  sid: string;
  /** Issued-at, ms epoch. */
  iat: number;
}

/** Shared server secret. Also used (with domain-separated payloads) by asset-token.ts. */
export function getSessionSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  const fallback = "riwayati-dev-fallback-secret-change-me-please-32chars";
  if (process.env.NODE_ENV === "production") {
    console.error(
      "[session] ⚠️  SESSION_SECRET is not set or too short. Using a weak built-in fallback. " +
        "Set a long random SESSION_SECRET in your Vercel environment variables for real protection."
    );
  } else {
    console.warn("[session] SESSION_SECRET not set — using dev fallback.");
  }
  return fallback;
}

/** Signs a session payload into an opaque `<body>.<signature>` token, safe to store in a cookie. */
export async function signSession(payload: SessionPayload): Promise<string> {
  return sign(getSessionSecret(), payload);
}

/** Verifies a session token's signature and expiry. Returns null if missing/tampered/expired. */
export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  const payload = await verify<SessionPayload>(getSessionSecret(), token);
  if (!payload || typeof payload.sid !== "string" || typeof payload.iat !== "number") return null;
  if (Date.now() - payload.iat > SESSION_MAX_AGE_SECONDS * 1000) return null;
  return payload;
}

/** Mints a brand-new session (random sid, current timestamp) and its signed token. */
export async function createSession(): Promise<{ token: string; payload: SessionPayload }> {
  const payload: SessionPayload = { sid: crypto.randomUUID(), iat: Date.now() };
  const token = await signSession(payload);
  return { token, payload };
}
