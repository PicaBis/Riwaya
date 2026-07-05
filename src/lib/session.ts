// Server-issued, tamper-evident session identity.
//
// This is NOT a login system. It gives every visitor — guest or not — an
// unguessable session id that only the server can mint and verify, using
// HMAC-signed cookies (HttpOnly, so client JS/localStorage can never read
// or forge it). Everything the site previously called "the user" (guest
// name, admin flag, device id) lived entirely in localStorage and could be
// edited by anyone via devtools. This module is the trust anchor that later
// features (short-lived signed asset URLs, dynamic per-session watermarks,
// per-session rate limiting) can build on instead.
//
// Works unmodified in both the Edge middleware runtime and Node.js route
// handlers — it only uses Web Crypto (`crypto.subtle`, `crypto.randomUUID`)
// and `atob`/`btoa`, all of which are available as globals in both.

export const SESSION_COOKIE_NAME = "rw_sid";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days, sliding

export interface SessionPayload {
  /** Random, unguessable, server-generated identifier. Never derived from anything client-supplied. */
  sid: string;
  /** Issued-at, ms epoch. */
  iat: number;
}

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") {
    // Falling back silently in production would be a real vulnerability —
    // make sure it's loud in the server logs so it actually gets fixed.
    console.warn(
      "[session] SESSION_SECRET is not set (or too short). Using a weak built-in fallback — " +
        "set a long random SESSION_SECRET in your deployment environment before relying on this for real protection."
    );
  }
  return "riwayati-dev-fallback-secret-change-me-please-32chars";
}

function bytesToB64url(bytes: Uint8Array): string {
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlToBytes(s: string): Uint8Array {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const str = atob(padded);
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i);
  return arr;
}

async function hmacSign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return bytesToB64url(new Uint8Array(sig));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Signs a session payload into an opaque `<body>.<signature>` token, safe to store in a cookie. */
export async function signSession(payload: SessionPayload): Promise<string> {
  const body = bytesToB64url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await hmacSign(body);
  return `${body}.${sig}`;
}

/** Verifies a session token's signature and expiry. Returns null if missing/tampered/expired. */
export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await hmacSign(body);
  if (!timingSafeEqual(expected, sig)) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(body))) as SessionPayload;
    if (!payload || typeof payload.sid !== "string" || typeof payload.iat !== "number") return null;
    if (Date.now() - payload.iat > SESSION_MAX_AGE_SECONDS * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Mints a brand-new session (random sid, current timestamp) and its signed token. */
export async function createSession(): Promise<{ token: string; payload: SessionPayload }> {
  const payload: SessionPayload = { sid: crypto.randomUUID(), iat: Date.now() };
  const token = await signSession(payload);
  return { token, payload };
}
