// Client-side counterpart to the token-gated /api/novel-asset route.
// Every place that opens a novel's PDF (the full reader and the cover-page
// thumbnail renderer) goes through this so the short-lived token is fetched
// and attached the same way everywhere.

interface AssetTokenResponse {
  token: string;
  fileId: string;
  expiresAt: number;
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
  const asset = await fetchAssetToken(novelId);
  if (!asset) return { url: fallbackUrl };
  return {
    url: `/api/novel-asset/${asset.fileId}`,
    httpHeaders: { "X-Asset-Token": asset.token },
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
