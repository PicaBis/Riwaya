import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { novels } from "@/data/novels";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/session";
import { verifyAssetToken } from "@/lib/asset-token";
import { verifyEntitlementToken } from "@/lib/entitlement";
import { refererMatchesHost } from "@/lib/origin-check";

// Single source of truth for which files may ever be served — derived from
// the real novel registry instead of a hand-maintained list that drifts.
const ALLOWED = new Set(novels.map((n) => n.pdfFile).filter((f): f is string => !!f));

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const filename = params.id;
  if (!ALLOWED.has(filename)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const novel = novels.find((n) => n.pdfFile === filename);
  if (!novel) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Primary gate: a short-lived token, minted server-side via /api/asset-token,
  // scoped to this exact file and bound to the caller's own session id. This
  // replaces the old "empty Referer = allowed through" logic, which let anyone
  // who knew the static URL download the file directly.
  const session = await verifySession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const token = request.headers.get("x-asset-token");
  const tokenValid = session ? await verifyAssetToken(token, filename, session.sid) : false;
  if (!tokenValid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Entitlement gate: a server-issued token scoped to THIS novel + the caller's
  // session. The server is the source of truth for `entitled`; today the file
  // is still served for free preview regardless, but requiring this token
  // (1) binds every fetch to a fresh, novel+session-scoped credential and
  // (2) lays the groundwork to refuse non-entitled requests outright.
  const entitlementToken = request.headers.get("x-entitlement");
  const entitlement = session
    ? await verifyEntitlementToken(entitlementToken, novel.id, session.sid)
    : { valid: false, entitled: false };
  if (!entitlement.valid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Secondary, defense-in-depth signal — reject if Origin/Referer clearly
  // points elsewhere (still permissive when both are absent; the tokens above
  // are what actually carry the security weight).
  if (!refererMatchesHost(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const filePath = path.join(process.cwd(), "private", "novels", filename);
    const buffer = await readFile(filePath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=\"" + filename + "\"",
        // `private` (not `public`): only this browser's own cache may keep a
        // copy — shared/CDN caches won't serve one user's fetch to another.
        // Custom headers (the token) aren't part of the cache key, so a warm
        // cache still answers instantly without needing a fresh token.
        "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
