import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

/**
 * Merge a guest/device identity into the signed-in account.
 *
 * Re-points every server-side row (activation codes / entitlement, ratings,
 * reading progress) from the caller's previous guest key onto their account
 * key, so a reader who bought/redeemed as a guest keeps everything after
 * creating an account.
 *
 * Security:
 *  - The account (toKey) is proven by validating the Supabase access token —
 *    the caller can only migrate INTO their own account.
 *  - fromKey may only be a guest identity (device:* / user:*), never another
 *    account, so one account can't absorb another.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    if (!supabase) return NextResponse.json({ error: "unavailable" }, { status: 503 });

    const auth = request.headers.get("authorization") || "";
    const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : "";
    if (!token) return NextResponse.json({ error: "no token" }, { status: 401 });

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "invalid token" }, { status: 401 });
    }
    const accountKey = `account:${userData.user.id}`;

    const body = await request.json().catch(() => ({}));
    const fromKey = String(body.fromKey || "").slice(0, 80);

    if (!fromKey || (!fromKey.startsWith("device:") && !fromKey.startsWith("user:"))) {
      return NextResponse.json({ error: "invalid fromKey" }, { status: 400 });
    }
    if (fromKey === accountKey) {
      return NextResponse.json({ ok: true, note: "same key" });
    }

    // Re-point each table independently; ignore per-table failures so one
    // missing table never blocks the rest of the merge.
    const results: Record<string, string> = {};

    const move = async (table: string, column: string) => {
      try {
        const { error } = await supabase.from(table).update({ [column]: accountKey }).eq(column, fromKey);
        results[table] = error ? "skip" : "ok";
      } catch {
        results[table] = "skip";
      }
    };

    await move("activation_codes", "used_by");
    await move("ratings", "user_key");
    await move("reading_progress", "user_key");

    return NextResponse.json({ ok: true, accountKey, results });
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
