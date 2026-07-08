import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getServiceSupabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { moderateComment } from "@/lib/profanity";

function sanitize(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;").substring(0, 2000);
}

/** Hash a browser-held owner token so it can be stored without exposing it. */
function hashToken(token: string): string {
  return createHash("sha256").update(String(token)).digest("hex");
}

/** Columns returned to clients — never expose owner_hash. */
const PUBLIC_COLUMNS = "id, novel_id, username, content, likes, created_at";

function isValidNovelId(id: string): boolean {
  return /^[a-z0-9-]+$/.test(id) && id.length <= 100;
}

export async function GET(request: NextRequest) {
  const novelId = request.nextUrl.searchParams.get("novelId");
  if (!novelId || !isValidNovelId(novelId)) {
    return NextResponse.json({ error: "novelId required" }, { status: 400 });
  }

  // Read via the service client so comments load even if only the server-side
  // key is configured (the public anon key is optional, used for realtime).
  const supabase = getServiceSupabase();

  if (!supabase) {
    return NextResponse.json({ error: "التعليقات غير متاحة حالياً" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("comments")
    .select(PUBLIC_COLUMNS)
    .eq("novel_id", novelId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "تعذّر تحميل التعليقات" }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const short = rateLimit(`comment:short:${ip}`, { windowMs: 20_000, max: 1 });
    if (!short.allowed) {
      return NextResponse.json(
        { error: `الرجاء الانتظار ${short.retryAfter} ثانية قبل التعليق مجدداً` },
        { status: 429, headers: { "Retry-After": String(short.retryAfter) } }
      );
    }
    const long = rateLimit(`comment:long:${ip}`, { windowMs: 5 * 60_000, max: 8 });
    if (!long.allowed) {
      return NextResponse.json(
        { error: "لقد أرسلت تعليقات كثيرة، حاول لاحقاً" },
        { status: 429, headers: { "Retry-After": String(long.retryAfter) } }
      );
    }

    const body = await request.json();
    const { novelId, author, content, ownerToken } = body;

    if (!novelId || !author || !content || !isValidNovelId(novelId)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const moderation = moderateComment(String(content));
    if (!moderation.ok) {
      return NextResponse.json({ error: moderation.reason }, { status: 422 });
    }

    const sanitizedAuthor = sanitize(String(author).substring(0, 50));
    const sanitizedContent = sanitize(String(content));

    if (!sanitizedAuthor || !sanitizedContent) {
      return NextResponse.json({ error: "Empty input" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    if (!supabase) {
      return NextResponse.json({ error: "التعليقات غير متاحة حالياً" }, { status: 503 });
    }

    const insertRow: Record<string, unknown> = {
      novel_id: novelId,
      username: sanitizedAuthor,
      content: sanitizedContent,
    };
    // Store a hash of the poster's private token so they can delete their own
    // comment later without an account (raw token stays only in their browser).
    if (ownerToken && typeof ownerToken === "string") {
      insertRow.owner_hash = hashToken(ownerToken);
    }

    const { data, error } = await supabase
      .from("comments")
      .insert(insertRow)
      .select(PUBLIC_COLUMNS)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "تعذّر حفظ التعليق" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "التعليقات غير متاحة حالياً" }, { status: 503 });
    }

    const body = await request.json();
    const { commentId, author, liked } = body as { commentId: string; author: string; liked?: boolean };
    if (!commentId || !author) return NextResponse.json({ error: "Required" }, { status: 400 });

    const sanitizedAuthor = sanitize(String(author));
    if (!sanitizedAuthor) return NextResponse.json({ error: "Invalid" }, { status: 400 });

    const { data: comment, error: fetchErr } = await supabase.from("comments").select("likes").eq("id", commentId).single();
    if (fetchErr || !comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let likes: string[] = comment.likes || [];
    if (likes.includes(sanitizedAuthor)) {
      likes = likes.filter((n: string) => n !== sanitizedAuthor);
    } else {
      likes = [...likes, sanitizedAuthor];
    }
    const { error } = await supabase.from("comments").update({ likes }).eq("id", commentId);
    if (!error) return NextResponse.json({ ok: true });

    return NextResponse.json({ error: "تعذّر تحديث الإعجاب" }, { status: 500 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
