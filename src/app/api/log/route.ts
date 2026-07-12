import { NextRequest, NextResponse } from "next/server";

// Lightweight client-side error ingestion. In serverless (Vercel) these land
// in the platform's log drain; locally they print to stdout. Kept dependency-
// free and permissive so a logging failure never breaks the app.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const level = String(body.level || "error").slice(0, 16);
    const message = String(body.message || "").slice(0, 2000);
    const url = String(body.url || "").slice(0, 500);
    const stack = body.stack ? String(body.stack).slice(0, 2000) : undefined;
    const meta = { level, url, ts: new Date().toISOString() };
    if (level === "error") {
      console.error("[client-error]", message, meta, stack || "");
    } else {
      console.info("[client-log]", message, meta);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
