import { NextRequest, NextResponse } from "next/server";
import { verifyDevCode } from "@/lib/auth";
import { sign } from "@/lib/crypto-sign";
import { getSessionSecret } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "Code required" }, { status: 400 });
    }
    const ok = await verifyDevCode(code.trim());
    if (!ok) {
      return NextResponse.json({ error: "Invalid code" }, { status: 403 });
    }
    const token = await sign(getSessionSecret(), { dev: true, iat: Date.now() });
    return NextResponse.json({ ok: true, token });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
