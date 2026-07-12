// Short-lived, single-purpose access tokens for protected novel files.
//
// Replaces the old model where `/api/novel-asset/<file>.pdf` was a static,
// guessable, unauthenticated URL. Now a client must first ask
// `/api/asset-token` (which requires a valid server session) for a token
// scoped to exactly one file, bound to that session's id, expiring in ~60s.
// The asset route then only serves the file if the token verifies AND its
// embedded session id matches the caller's own session cookie — so a copied
// link is useless outside the browser session that requested it, and even
// inside it, only for a very short window.

import { sign, verify } from "./crypto-sign";
import { getSessionSecret } from "./session";

const ASSET_TOKEN_TTL_MS = 60_000; // 60s — minted immediately before use, not stockpiled

interface AssetTokenPayload {
  purpose: "asset-access";
  fileId: string;
  sid: string;
  iat: number;
}

export async function createAssetToken(fileId: string, sid: string): Promise<{ token: string; expiresAt: number }> {
  const payload: AssetTokenPayload = { purpose: "asset-access", fileId, sid, iat: Date.now() };
  const token = await sign(getSessionSecret(), payload);
  return { token, expiresAt: payload.iat + ASSET_TOKEN_TTL_MS };
}

export async function verifyAssetToken(
  token: string | undefined | null,
  fileId: string,
  sid: string
): Promise<boolean> {
  const payload = await verify<AssetTokenPayload>(getSessionSecret(), token);
  if (!payload || payload.purpose !== "asset-access") return false;
  if (payload.fileId !== fileId) return false;
  if (payload.sid !== sid) return false;
  if (Date.now() - payload.iat > ASSET_TOKEN_TTL_MS) return false;
  return true;
}
