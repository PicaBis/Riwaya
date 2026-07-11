import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { novels } from "@/data/novels";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/session";
import { verifyAssetToken } from "@/lib/asset-token";
import { verifyEntitlementToken } from "@/lib/entitlement";
import { refererMatchesHost } from "@/lib/origin-check";

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

  const session = await verifySession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const token = request.headers.get("x-asset-token");
  const tokenValid = session ? await verifyAssetToken(token, filename, session.sid) : false;
  if (!tokenValid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const entitlementToken = request.headers.get("x-entitlement");
  const entitlement = session
    ? await verifyEntitlementToken(entitlementToken, novel.id, session.sid)
    : { valid: false, entitled: false };
  if (!entitlement.valid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!refererMatchesHost(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const filePath = path.join(process.cwd(), "private", "novels", filename);
    const buffer = await readFile(filePath);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
        "X-Entitled": entitlement.entitled ? "true" : "false",
        "Content-Length": String(buffer.length),
        "Accept-Ranges": "none",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}