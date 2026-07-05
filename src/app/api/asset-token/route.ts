import { NextRequest, NextResponse } from "next/server";
import { novels } from "@/data/novels";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/session";
import { createAssetToken } from "@/lib/asset-token";
import { refererMatchesHost } from "@/lib/origin-check";

export async function GET(request: NextRequest) {
  if (!refererMatchesHost(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const novelId = request.nextUrl.searchParams.get("novelId") || "";
  const novel = novels.find((n) => n.id === novelId && n.pdfFile);
  if (!novel || !novel.pdfFile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Every request should already carry the session cookie the middleware
  // mints — fail closed rather than issuing a token with no session to bind to.
  const session = await verifySession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!session) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const { token, expiresAt } = await createAssetToken(novel.pdfFile, session.sid);
  return NextResponse.json(
    { token, expiresAt, fileId: novel.pdfFile },
    { headers: { "Cache-Control": "no-store" } }
  );
}
