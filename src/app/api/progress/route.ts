import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

function isValidNovelId(id: string): boolean {
  return /^[a-z0-9-]+$/.test(id) && id.length <= 100;
}

// GET /api/progress?userKey=... — all reading progress for a user/device
export async function GET(request: NextRequest) {
  const userKey = request.nextUrl.searchParams.get("userKey");
  if (!userKey) return NextResponse.json([], { status: 200 });

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json([], { status: 200 });

  const { data, error } = await supabase
    .from("reading_progress")
    .select("novel_id,last_page,updated_at")
    .eq("user_key", userKey.slice(0, 80));

  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data || []);
}

// POST /api/progress  { userKey, novelId, page } — upsert progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const userKey = String(body.userKey || "").slice(0, 80);
    const novelId = String(body.novelId || "");
    const page = parseInt(body.page, 10);

    if (!userKey || !isValidNovelId(novelId) || !Number.isFinite(page) || page < 1) {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ ok: false }, { status: 200 });

    await supabase
      .from("reading_progress")
      .upsert(
        { user_key: userKey, novel_id: novelId, last_page: page, updated_at: new Date().toISOString() },
        { onConflict: "user_key,novel_id" }
      );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
