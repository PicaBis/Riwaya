import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await verifyAdminRequest(request.headers))) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const supabase = getSupabase();

    if (!supabase) {
      return NextResponse.json({ error: "غير متاح بدون قاعدة بيانات" }, { status: 503 });
    }

    const { data: comment, error: fetchErr } = await supabase
      .from("comments")
      .select("username")
      .eq("id", params.id)
      .single();

    if (fetchErr || !comment) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

    await supabase.from("comments").delete().eq("id", params.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
