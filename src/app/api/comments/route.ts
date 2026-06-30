import { NextRequest, NextResponse } from "next/server";
import { getStore, persistStore, getBlockedUsers, addBlockedUser, ensureSeedData } from "@/lib/comments-store";
import type { Comment } from "@/lib/comments-store";

export async function GET(request: NextRequest) {
  const novelId = request.nextUrl.searchParams.get("novelId");
  if (!novelId) {
    return NextResponse.json({ error: "novelId required" }, { status: 400 });
  }

  const store = getStore();
  ensureSeedData(novelId);

  const blocked = getBlockedUsers();
  const comments = store.comments
    .filter((c) => c.novelId === novelId && !blocked.includes(c.author))
    .sort((a, b) => b.createdAt - a.createdAt);

  return NextResponse.json(comments);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { novelId, author, content } = body as Partial<Comment>;

    if (!novelId || !author || !content) {
      return NextResponse.json(
        { error: "novelId, author and content are required" },
        { status: 400 }
      );
    }

    const blocked = getBlockedUsers();
    if (blocked.includes(author)) {
      return NextResponse.json(
        { error: "هذا المستخدم محظور" },
        { status: 403 }
      );
    }

    const store = getStore();
    const newComment: Comment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      novelId,
      author,
      content: content.trim(),
      createdAt: Date.now(),
      likes: [],
      replies: [],
    };

    store.comments.push(newComment);
    persistStore();

    return NextResponse.json(newComment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { commentId, author, liked } = body as { commentId: string; author: string; liked?: boolean };

    if (!commentId || !author) {
      return NextResponse.json({ error: "commentId and author required" }, { status: 400 });
    }

    const store = getStore();
    const comment = store.comments.find((c) => c.id === commentId);
    if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const blocked = getBlockedUsers();
    if (blocked.includes(author)) {
      return NextResponse.json({ error: "ممنوع" }, { status: 403 });
    }

    const has = comment.likes.includes(author);
    if (liked === true && !has) {
      comment.likes.push(author);
    } else if (liked === false && has) {
      comment.likes = comment.likes.filter((n) => n !== author);
    } else {
      comment.likes = comment.likes.includes(author)
        ? comment.likes.filter((n) => n !== author)
        : [...comment.likes, author];
    }

    persistStore();
    return NextResponse.json(comment);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
