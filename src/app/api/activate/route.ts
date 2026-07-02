import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
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

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "الخدمة غير متوفرة حالياً" }, { status: 503 });
    }

    const { data: row, error } = await supabase
      .from("activation_codes")
      .select("*")
      .eq("code", code)
      .single();

    if (error || !row) {
      return NextResponse.json({ error: "الرمز غير صحيح" }, { status: 404 });
    }

    if (row.used) {
      return NextResponse.json(
        { error: "هذا الرمز مستخدم بالفعل" },
        { status: 409 }
      );
    }

    await supabase
      .from("activation_codes")
      .update({ used: true, used_by: userKey, used_at: new Date().toISOString() })
      .eq("code", code);

    return NextResponse.json({ ok: true, message: "تم التفعيل بنجاح" });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
