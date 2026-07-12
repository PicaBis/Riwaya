// Client-side counterpart to the token-gated /api/novel-asset route.
// Every place that opens a novel's PDF (the full reader and the cover-page
// thumbnail renderer) goes through this so both the short-lived asset token
// and the server-issued entitlement token are fetched and attached the same
// way everywhere.

import { getUserKey } from "@/lib/device";

interface AssetTokenResponse {
  token: string;
  fileId: string;
  expiresAt: number;
}

interface EntitlementResponse {
  token: string;
  entitled: boolean;
  expiresAt: number;
}

function getUserKeyFromStorage(): string | null {
  try {
    const guest = localStorage.getItem("riwayati_guest");
    if (!guest) return null;
    const name = (JSON.parse(guest).name as string) || null;
    return getUserKey(name);
  } catch {
    return null;
  }
}

async function fetchAssetToken(novelId: string): Promise<AssetTokenResponse | null> {
  try {
    const res = await fetch(`/api/asset-token?novelId=${encodeURIComponent(novelId)}`, {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.token || !data?.fileId) return null;
    return data as AssetTokenResponse;
  } catch {
    return null;
  }
}

async function fetchEntitlementToken(novelId: string): Promise<EntitlementResponse | null> {
  try {
    let devToken: string | null = null;
    try {
      devToken = sessionStorage.getItem("riwayati_dev_token");
    } catch {}
    const res = await fetch(`/api/entitlement`, {
      method: "POST",
      cache: "no-store",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ novelId, userKey: getUserKeyFromStorage(), devToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.token) return null;
    return data as EntitlementResponse;
  } catch {
    return null;
  }
}

/**
 * Resolves the actual PDF URL + headers to use for a given novel. Falls back
 * to the plain (now-unauthenticated-and-therefore-rejected) URL if a token
 * couldn't be obtained, so callers still get a normal load-error instead of
 * a thrown exception.
 */
export async function resolveProtectedPdfSource(
  novelId: string,
  fallbackUrl: string
): Promise<{ url: string; httpHeaders?: Record<string, string> }> {
  const [asset, entitlement] = await Promise.all([
    fetchAssetToken(novelId),
    fetchEntitlementToken(novelId),
  ]);
  if (!asset) return { url: fallbackUrl };
  const headers: Record<string, string> = { "X-Asset-Token": asset.token };
  if (entitlement) headers["X-Entitlement"] = entitlement.token;
  return {
    url: `/api/novel-asset/${asset.fileId}`,
    httpHeaders: headers,
  };
}

/** Warms the browser's HTTP cache for a novel's PDF ahead of the user opening it. */
export async function prefetchProtectedPdf(novelId: string, fallbackUrl: string): Promise<void> {
  try {
    const { url, httpHeaders } = await resolveProtectedPdfSource(novelId, fallbackUrl);
    await fetch(url, { headers: httpHeaders, credentials: "same-origin" });
  } catch {
    /* best-effort prefetch only */
  }
}
