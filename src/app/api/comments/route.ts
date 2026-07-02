import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { moderateComment } from "@/lib/profanity";

function sanitize(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;").substring(0, 2000);
}

function isValidNovelId(id: string): boolean {
  return /^[a-z0-9-]+$/.test(id) && id.length <= 100;
}

export async function GET(request: NextRequest) {
  const novelId = request.nextUrl.searchParams.get("novelId");
  if (!novelId || !isValidNovelId(novelId)) {
    return NextResponse.json({ error: "novelId required" }, { status: 400 });
  }

  const supabase = getSupabase();

  if (supabase) {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false });

    if (!error) return NextResponse.json(data || []);
  }

  // Fallback to localStorage
  const { getStore, getBlockedUsers, ensureSeedData } = await import("@/lib/comments-store");
  const store = getStore();
  ensureSeedData(novelId);
  const blocked = getBlockedUsers();
  return NextResponse.json(store.comments.filter((c) => c.novelId === novelId && !blocked.includes(c.author)).sort((a, b) => b.createdAt - a.createdAt));
}

export async function POST(request: NextRequest) {
  try {
    // Anti-spam: 1 comment / 20s and max 8 / 5min per IP.
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
    const { novelId, author, content } = body;

    if (!novelId || !author || !content || !isValidNovelId(novelId)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Profanity / spam moderation on the raw content.
    const moderation = moderateComment(String(content));
    if (!moderation.ok) {
      return NextResponse.json({ error: moderation.reason }, { status: 422 });
    }

    const sanitizedAuthor = sanitize(String(author).substring(0, 50));
    const sanitizedContent = sanitize(String(content));

    if (!sanitizedAuthor || !sanitizedContent) {
      return NextResponse.json({ error: "Empty input" }, { status: 400 });
    }

    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          novel_id: novelId,
          username: sanitizedAuthor,
          content: sanitizedContent,
        })
        .select()
        .single();

      if (!error && data) return NextResponse.json(data, { status: 201 });
    }

    // Fallback to localStorage
    const { getStore, persistStore, getBlockedUsers } = await import("@/lib/comments-store");
    const blocked = getBlockedUsers();
    if (blocked.includes(sanitizedAuthor)) return NextResponse.json({ error: "محظور" }, { status: 403 });

    const store = getStore();
    const newComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      novelId,
      author: sanitizedAuthor,
      content: sanitizedContent,
      createdAt: Date.now(),
      likes: [] as string[],
      replies: [] as any[],
    };
    store.comments.push(newComment);
    persistStore();
    return NextResponse.json(newComment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { commentId, author, liked } = body as { commentId: string; author: string; liked?: boolean };
    if (!commentId || !author) return NextResponse.json({ error: "Required" }, { status: 400 });

    const sanitizedAuthor = sanitize(String(author));
    if (!sanitizedAuthor) return NextResponse.json({ error: "Invalid" }, { status: 400 });

    const supabase = getSupabase();

    if (supabase) {
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
    }

    // Fallback
    const { getStore, persistStore, getBlockedUsers } = await import("@/lib/comments-store");
    const blocked = getBlockedUsers();
    if (blocked.includes(sanitizedAuthor)) return NextResponse.json({ error: "ممنوع" }, { status: 403 });
    const store = getStore();
    const comment = store.comments.find((c) => c.id === commentId);
    if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const has = comment.likes.includes(sanitizedAuthor);
    if (liked === true && !has) comment.likes.push(sanitizedAuthor);
    else if (liked === false && has) comment.likes = comment.likes.filter((n) => n !== sanitizedAuthor);
    else comment.likes = has ? comment.likes.filter((n) => n !== sanitizedAuthor) : [...comment.likes, sanitizedAuthor];
    persistStore();
    return NextResponse.json(comment);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}