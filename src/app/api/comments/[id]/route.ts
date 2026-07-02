import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminRequest } from "@/lib/admin-auth";

const COMMENTS_FILE = "/tmp/riwayati-comments.json";
const BLOCKED_FILE = "/tmp/riwayati-blocked.json";

function readFileStore() {
  try {
    if (typeof require !== "undefined") {
      const fs = require("fs");
      if (fs.existsSync(COMMENTS_FILE)) {
        return JSON.parse(fs.readFileSync(COMMENTS_FILE, "utf-8"));
      }
    }
  } catch {}
  return { comments: [], blocked: [] };
}

function writeFileStore(data: any) {
  try {
    if (typeof require !== "undefined") {
      const fs = require("fs");
      fs.writeFileSync(COMMENTS_FILE, JSON.stringify(data));
    }
  } catch {}
}

function readBlocked(): string[] {
  try {
    if (typeof require !== "undefined") {
      const fs = require("fs");
      if (fs.existsSync(BLOCKED_FILE)) {
        return JSON.parse(fs.readFileSync(BLOCKED_FILE, "utf-8"));
      }
    }
  } catch {}
  return [];
}

function writeBlocked(blocked: string[]) {
  try {
    if (typeof require !== "undefined") {
      const fs = require("fs");
      fs.writeFileSync(BLOCKED_FILE, JSON.stringify(blocked));
    }
  } catch {}
}

function addBlockedUser(name: string) {
  const blocked = readBlocked();
  if (!blocked.includes(name)) {
    blocked.push(name);
    writeBlocked(blocked);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const store = readFileStore();
    const comment = store.comments.find((c: any) => c.id === params.id);
    if (!comment) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    store.comments = store.comments.filter((c: any) => c.id !== params.id);
    writeFileStore(store);
    addBlockedUser(comment.author);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
