import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

// POST /api/activate  { code, userKey }
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    // Prevent brute-forcing activation codes: 8 tries / 5 min per IP.
    const rl = rateLimit(`activate:${ip}`, { windowMs: 5 * 60_000, max: 8 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "محاولات كثيرة، حاول لاحقاً" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const code = normalizeCode(String(body.code || ""));
    const userKey = String(body.userKey || "guest").slice(0, 80);

    if (!code || code.length < 4) {
      return NextResponse.json({ error: "رمز غير صالح" }, { status: 400 });
    }

    // Writes must go through the service-role client: activation_codes has
    // RLS enabled with no anon policies, so the site's public anon key
    // (visible in the client bundle) can never read or redeem codes directly
    // against Supabase — only this server route, after its own rate-limit
    // check above, can.
    const supabase = getServiceSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "الخدمة غير متوفرة حالياً" }, { status: 503 });
    }

    const { data: row } = await supabase
      .from("activation_codes")
      .select("used")
      .eq("code", code)
      .single();

    if (!row) {
      return NextResponse.json({ error: "الرمز غير صحيح" }, { status: 404 });
    }

    if (row.used) {
      return NextResponse.json(
        { error: "هذا الرمز مستخدم بالفعل" },
        { status: 409 }
      );
    }

    // Atomic conditional update (only succeeds if still unused) instead of a
    // separate check-then-update, so two concurrent requests for the same
    // code can never both win the race and both report success.
    const { data: updated } = await supabase
      .from("activation_codes")
      .update({ used: true, used_by: userKey, used_at: new Date().toISOString() })
      .eq("code", code)
      .eq("used", false)
      .select("code");

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: "هذا الرمز مستخدم بالفعل" },
        { status: 409 }
      );
    }

    return NextResponse.json({ ok: true, message: "تم التفعيل بنجاح" });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
