import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Requires a valid developer passcode in the x-dev-code header.
    if (!(await verifyAdminRequest(request.headers))) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const supabase = getSupabase();

    if (supabase) {
      const { data: comment, error: fetchErr } = await supabase
        .from("comments")
        .select("username")
        .eq("id", params.id)
        .single();

      if (fetchErr || !comment) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

      await supabase.from("comments").delete().eq("id", params.id);
      return NextResponse.json({ ok: true });
    }

    // Fallback
    const { getStore, persistStore, addBlockedUser } = await import("@/lib/comments-store");
    const store = getStore();
    const comment = store.comments.find((c) => c.id === params.id);
    if (!comment) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    store.comments = store.comments.filter((c) => c.id !== params.id);
    persistStore();
    addBlockedUser(comment.author);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}