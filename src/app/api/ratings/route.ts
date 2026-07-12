import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

function isValidId(id: string): boolean {
  return /^[a-z0-9-]+$/.test(id) && id.length <= 100;
}

// GET /api/ratings?userKey=...      → this user's saved ratings (to restore)
// GET /api/ratings?novelId=...&agg=1 → community { avg, count } for a novel
export async function GET(request: NextRequest) {
  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const userKey = request.nextUrl.searchParams.get("userKey");
  const novelId = request.nextUrl.searchParams.get("novelId");

  if (userKey) {
    const { data, error } = await supabase
      .from("ratings")
      .select("novel_id, stars")
      .eq("user_key", userKey.slice(0, 80));
    if (error) return NextResponse.json({ error: "failed" }, { status: 500 });
    const map: Record<string, number> = {};
    (data || []).forEach((r: { novel_id: string; stars: number }) => (map[r.novel_id] = r.stars));
    return NextResponse.json(map, { headers: { "Cache-Control": "no-store" } });
  }

  if (novelId && isValidId(novelId)) {
    const { data, error } = await supabase
      .from("ratings")
      .select("stars")
      .eq("novel_id", novelId);
    if (error) return NextResponse.json({ error: "failed" }, { status: 500 });
    const rows = data || [];
    const count = rows.length;
    const avg = count ? rows.reduce((a, r: { stars: number }) => a + r.stars, 0) / count : 0;
    return NextResponse.json({ avg: Math.round(avg * 10) / 10, count });
  }

  return NextResponse.json({ error: "userKey or novelId required" }, { status: 400 });
}

// POST /api/ratings  { novelId, userKey, stars }  → upsert this user's rating
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rl = rateLimit(`rating:${ip}`, { windowMs: 10_000, max: 5 });
    if (!rl.allowed) {
      return NextResponse.json({ error: "slow down" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
    }

    const body = await request.json().catch(() => ({}));
    const novelId = String(body.novelId || "");
    const userKey = String(body.userKey || "").slice(0, 80);
    const stars = Math.round(Number(body.stars));

    if (!isValidId(novelId) || !userKey || !(stars >= 1 && stars <= 5)) {
      return NextResponse.json({ error: "invalid input" }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    if (!supabase) return NextResponse.json({ error: "unavailable" }, { status: 503 });

    const { error } = await supabase
      .from("ratings")
      .upsert(
        { user_key: userKey, novel_id: novelId, stars, updated_at: new Date().toISOString() },
        { onConflict: "user_key,novel_id" }
      );
    if (error) return NextResponse.json({ error: "failed" }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
