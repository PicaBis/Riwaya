import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminRequest } from "@/lib/admin-auth";

function genCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  const part = () =>
    Array.from({ length: 4 }, () =>
      alphabet[Math.floor(Math.random() * alphabet.length)]
    ).join("");
  return `RWY-${part()}-${part()}`;
}

// GET /api/admin/codes — list all codes
export async function GET(request: NextRequest) {
  if (!(await verifyAdminRequest(request.headers))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "الخدمة غير متوفرة" }, { status: 503 });

  const { data, error } = await supabase
    .from("activation_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

// POST /api/admin/codes  { count, label } — generate new codes
export async function POST(request: NextRequest) {
  if (!(await verifyAdminRequest(request.headers))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "الخدمة غير متوفرة" }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const count = Math.min(Math.max(parseInt(body.count, 10) || 1, 1), 50);
  const label = String(body.label || "").slice(0, 80) || null;

  const rows = Array.from({ length: count }, () => ({ code: genCode(), label }));
  const { data, error } = await supabase
    .from("activation_codes")
    .insert(rows)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || [], { status: 201 });
}

// DELETE /api/admin/codes  { code } — remove a code
export async function DELETE(request: NextRequest) {
  if (!(await verifyAdminRequest(request.headers))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "الخدمة غير متوفرة" }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const code = String(body.code || "").trim();
  if (!code) return NextResponse.json({ error: "الرمز مطلوب" }, { status: 400 });

  const { error } = await supabase.from("activation_codes").delete().eq("code", code);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
