import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminRequest } from "@/lib/admin-auth";

// GET /api/admin/stats — dashboard aggregates + recent comments (all novels)
export async function GET(request: NextRequest) {
  if (!(await verifyAdminRequest(request.headers))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "الخدمة غير متوفرة" }, { status: 503 });

  const [comments, codes, progress] = await Promise.all([
    supabase.from("comments").select("*").order("created_at", { ascending: false }),
    supabase.from("activation_codes").select("code,used"),
    supabase.from("reading_progress").select("user_key,novel_id,last_page,updated_at"),
  ]);

  const allComments = comments.data || [];
  const allCodes = codes.data || [];
  const allProgress = progress.data || [];

  const uniqueReaders = new Set(allProgress.map((p: { user_key: string }) => p.user_key)).size;

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
  });
}
