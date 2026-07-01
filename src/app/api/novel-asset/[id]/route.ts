import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const ALLOWED = ["shajarat-sina.pdf"];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const filename = params.id;
  if (!ALLOWED.includes(filename)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const referer = request.headers.get("referer") || "";
  const host = request.headers.get("host") || "";

  if (!referer.includes(host) && referer !== "") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const filePath = path.join(process.cwd(), "private", "novels", filename);
    const buffer = await readFile(filePath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=\"" + filename + "\"",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}