import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/guest-name  { name, deviceId }
 *
 * Reserves a guest display name so no two visitors share one. Returns:
 *   { ok: true }                 → name reserved for this device (or already theirs)
 *   409 { ok: false, taken:true} → someone else already uses this name
 *   { ok: true, enforced:false } → backend not configured; uniqueness not enforced
 *
 * Uniqueness is best-effort: if Supabase isn't connected we let the login
 * proceed rather than lock users out.
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

  const nameKey = name.toLowerCase().replace(/\s+/g, " ");

  const supabase = getServiceSupabase();
  // Backend not connected → cannot enforce, but don't block the visitor.
  if (!supabase) {
    return NextResponse.json({ ok: true, enforced: false });
  }

  try {
    // Is the name already reserved?
    const { data: existing } = await supabase
      .from("guest_names")
      .select("name_key, device_id")
      .eq("name_key", nameKey)
      .maybeSingle();

    if (existing) {
      // Same device reclaiming its own name is fine.
      if (existing.device_id && deviceId && existing.device_id === deviceId) {
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json(
        { ok: false, taken: true, error: "هذا الاسم مستخدم بالفعل، اختر اسماً آخر" },
        { status: 409 }
      );
    }

    // Reserve it. If a race just inserted the same key, the unique primary key
    // makes this fail → treat as taken (unless it's this same device).
    const { error: insertError } = await supabase
      .from("guest_names")
      .insert({ name_key: nameKey, name, device_id: deviceId || null });

    if (insertError) {
      const { data: raced } = await supabase
        .from("guest_names")
        .select("device_id")
        .eq("name_key", nameKey)
        .maybeSingle();
      if (raced && raced.device_id === deviceId && deviceId) {
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json(
        { ok: false, taken: true, error: "هذا الاسم مستخدم بالفعل، اختر اسماً آخر" },
        { status: 409 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    // On any backend hiccup, fall back to allowing the login.
    return NextResponse.json({ ok: true, enforced: false });
  }
}
