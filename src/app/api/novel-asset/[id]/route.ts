import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { PDFDocument } from "pdf-lib";
import { novels } from "@/data/novels";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/session";
import { verifyAssetToken } from "@/lib/asset-token";
import { verifyEntitlementToken } from "@/lib/entitlement";
import { refererMatchesHost } from "@/lib/origin-check";

const ALLOWED = new Set(novels.map((n) => n.pdfFile).filter((f): f is string => !!f));

const truncatedCache = new Map<string, Buffer>();

async function truncatePdf(fullBuffer: Buffer, maxPage: number): Promise<Buffer> {
  const src = await PDFDocument.load(fullBuffer, { ignoreEncryption: true });
  const total = src.getPageCount();
  if (maxPage >= total) return fullBuffer;
  const dst = await PDFDocument.create();
  const pages = await dst.copyPages(src, Array.from({ length: maxPage }, (_, i) => i));
  for (const p of pages) dst.addPage(p);
  const bytes = await dst.save();
  return Buffer.from(bytes);
}

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
    const fullBuffer = await readFile(filePath);

    const isEntitled = entitlement.entitled;
    const freePage = novel.freeUntilPage || 0;

    let buffer: Buffer;
    if (!isEntitled && freePage > 0) {
      const cacheKey = `${filename}:${freePage}`;
      const cached = truncatedCache.get(cacheKey);
      if (cached) {
        buffer = cached;
      } else {
        buffer = await truncatePdf(fullBuffer, freePage);
        truncatedCache.set(cacheKey, buffer);
      }
    } else {
      buffer = fullBuffer;
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
        "X-Entitled": isEntitled ? "true" : "false",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
