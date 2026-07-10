import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { verifyAdminRequest } from "@/lib/admin-auth";

// GET /api/admin/stats — dashboard aggregates + recent comments/ratings (all novels)
export async function GET(request: NextRequest) {
  if (!(await verifyAdminRequest(request.headers))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }
  // Service-role client: bypasses RLS so the admin can read the protected
  // tables (reading_progress, guest_names) too, not just the public ones.
  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "الخدمة غير متوفرة" }, { status: 503 });

  const [comments, codes, progress, ratings, guests] = await Promise.all([
    supabase.from("comments").select("*").order("created_at", { ascending: false }),
    supabase.from("activation_codes").select("code,used"),
    supabase.from("reading_progress").select("user_key,novel_id,last_page,updated_at"),
    supabase.from("ratings").select("novel_id,stars,user_key,updated_at").order("updated_at", { ascending: false }),
    supabase.from("guest_names").select("name,created_at").order("created_at", { ascending: false }),
  ]);

  const allComments = comments.data || [];
  const allCodes = codes.data || [];
  const allProgress = progress.data || [];
  const allRatings = (ratings.data || []) as { novel_id: string; stars: number; user_key: string; updated_at: string }[];
  const allGuests = (guests.data || []) as { name: string; created_at: string }[];

  const uniqueReaders = new Set(allProgress.map((p: { user_key: string }) => p.user_key)).size;

  // Per-novel rating aggregates (average + count), most-rated first.
  const byNovel: Record<string, { sum: number; count: number }> = {};
  for (const r of allRatings) {
    const b = (byNovel[r.novel_id] ||= { sum: 0, count: 0 });
    b.sum += r.stars;
    b.count += 1;
  }
  const perNovel = Object.entries(byNovel)
    .map(([novelId, b]) => ({ novelId, avg: Math.round((b.sum / b.count) * 10) / 10, count: b.count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    comments: {
      total: allComments.length,
      recent: allComments.slice(0, 100),
    },
    codes: {
      total: allCodes.length,
      used: allCodes.filter((c: { used: boolean }) => c.used).length,
      unused: allCodes.filter((c: { used: boolean }) => !c.used).length,
    },
    readers: {
      total: uniqueReaders,
      sessions: allProgress.length,
    },
    ratings: {
      total: allRatings.length,
      perNovel,
      recent: allRatings.slice(0, 100),
    },
    guests: {
      total: allGuests.length,
      recent: allGuests.slice(0, 100),
    },
  });
}
