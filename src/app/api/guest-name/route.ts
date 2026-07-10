import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/guest-name  { name, deviceId }
 *
 * Returns 409 only when the name is ALREADY USED as an actual comment
 * author on the site — that is the only condition that makes a name
 * genuinely "taken".  A name registered in the guest_names table but
 * never used in a comment is freely available to anyone else.
 *
 * Result codes:
 *   { ok: true }                                → name available (reserved for this device)
 *   { ok: false, taken: true }  (409)           → name already used in a comment by someone else
 *   { ok: true, enforced: false }               → backend not configured; uniqueness not enforced
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const rl = rateLimit(`guestname:${ip}`, { windowMs: 10_000, max: 10 });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "الرجاء الانتظار قليلاً ثم المحاولة مجدداً" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const deviceId = String(body.deviceId || "").slice(0, 100);

  if (name.length < 2 || name.length > 50) {
    return NextResponse.json({ ok: false, error: "الاسم غير صالح" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  // Backend not connected → cannot enforce, but don't block the visitor.
  if (!supabase) {
    return NextResponse.json({ ok: true, enforced: false });
  }

  try {
    // The ONLY condition that makes a name genuinely "taken" is an existing
    // comment by that exact display name.  Names in guest_names that were
    // never used in a real comment are always available.
    const { data: existingComments } = await supabase
      .from("comments")
      .select("id, username")
      .ilike("username", name)
      .limit(1);

    if (existingComments && existingComments.length > 0) {
      return NextResponse.json(
        { ok: false, taken: true, error: "هذا الاسم مستخدم بالفعل في تعليق، اختر اسماً آخر" },
        { status: 409 }
      );
    }

    // Reserve the name in guest_names (best-effort informational only).
    void supabase
      .from("guest_names")
      .upsert({ name_key: name.toLowerCase().replace(/\s+/g, " "), name, device_id: deviceId || null }, { onConflict: "name_key" });

    return NextResponse.json({ ok: true });
  } catch {
    // On any backend hiccup, fall back to allowing the login.
    return NextResponse.json({ ok: true, enforced: false });
  }
}
