// Server-issued, short-lived entitlement tokens.
//
// These make the SERVER the source of truth for "may this session read this
// novel's file", instead of the client's localStorage `riwayati_unlocked`
// flag. After a successful redeem/subscribe/dev-activation the client asks
// /api/entitlement for a token scoped to exactly one novel + the caller's
// session id; the asset route then requires BOTH the existing single-use
// asset token AND this entitlement token. The `entitled` flag is computed
// server-side (from Supabase activation codes / a valid dev token) so future
// tightening — e.g. refusing the file unless `entitled` is true — is a
// one-line change without touching clients.

import { sign, verify } from "./crypto-sign";
import { getSessionSecret } from "./session";

const ENTITLEMENT_TTL_MS = 5 * 60_000; // 5 min — re-minted whenever a novel opens

interface EntitlementPayload {
  purpose: "entitlement";
  novelId: string;
  sid: string;
  entitled: boolean;
  iat: number;
}

export async function createEntitlementToken(
  novelId: string,
  sid: string,
  entitled: boolean
): Promise<{ token: string; expiresAt: number }> {
  const payload: EntitlementPayload = {
    purpose: "entitlement",
    novelId,
    sid,
    entitled,
    iat: Date.now(),
  };
  const token = await sign(getSessionSecret(), payload);
  return { token, expiresAt: payload.iat + ENTITLEMENT_TTL_MS };
}

export async function verifyEntitlementToken(
  token: string | undefined | null,
  novelId: string,
  sid: string
): Promise<{ valid: boolean; entitled: boolean }> {
  const payload = await verify<EntitlementPayload>(getSessionSecret(), token);
  if (!payload || payload.purpose !== "entitlement") return { valid: false, entitled: false };
  if (payload.novelId !== novelId) return { valid: false, entitled: false };
  if (payload.sid !== sid) return { valid: false, entitled: false };
  if (Date.now() - payload.iat > ENTITLEMENT_TTL_MS) return { valid: false, entitled: false };
  return { valid: true, entitled: !!payload.entitled };
}
