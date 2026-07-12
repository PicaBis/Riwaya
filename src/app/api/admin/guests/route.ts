import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function DELETE(request: NextRequest) {
  if (!(await verifyAdminRequest(request.headers))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "الخدمة غير متوفرة" }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const nameKey = String(body.nameKey || "").trim().toLowerCase().replace(/\s+/g, " ");

  if (!nameKey) {
    return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
  }

  const { error } = await supabase
    .from("guest_names")
    .delete()
    .eq("name_key", nameKey);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
