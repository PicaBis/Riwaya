import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getServiceSupabase } from "@/lib/supabase";
import { verifyAdminRequest } from "@/lib/admin-auth";

function hashToken(token: string): string {
  return createHash("sha256").update(String(token)).digest("hex");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServiceSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "غير متاح بدون قاعدة بيانات" }, { status: 503 });
    }

    // Read the target row (need owner_hash to authorise a self-delete).
    const { data: comment, error: fetchErr } = await supabase
      .from("comments")
      .select("id, owner_hash")
      .eq("id", params.id)
      .single();

    if (fetchErr || !comment) {
      return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    }

    // Path 1 — admin / developer may delete any comment.
    const isAdmin = await verifyAdminRequest(request.headers);

    // Path 2 — the original poster may delete their own comment by proving
    // ownership with the private token stored in their browser.
    let isOwner = false;
    if (!isAdmin) {
      const ownerToken = request.headers.get("x-owner-token") || "";
      if (ownerToken && comment.owner_hash) {
        isOwner = hashToken(ownerToken) === comment.owner_hash;
      }
    }

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    await supabase.from("comments").delete().eq("id", params.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
