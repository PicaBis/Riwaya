import { NextRequest, NextResponse } from "next/server";
import { getStore, persistStore, getBlockedUsers, addBlockedUser, ensureSeedData } from "@/lib/comments-store";
import type { Comment } from "@/lib/comments-store";

function sanitize(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .substring(0, 2000);
}

function isValidNovelId(id: string): boolean {
  return /^[a-z0-9-]+$/.test(id) && id.length <= 100;
}

export async function GET(request: NextRequest) {
  const novelId = request.nextUrl.searchParams.get("novelId");
  if (!novelId || !isValidNovelId(novelId)) {
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

    if (!isValidNovelId(novelId)) {
      return NextResponse.json({ error: "Invalid novelId" }, { status: 400 });
    }

    const sanitizedAuthor = sanitize(String(author).substring(0, 50));
    const sanitizedContent = sanitize(String(content));

    if (!sanitizedAuthor || !sanitizedContent) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const blocked = getBlockedUsers();
    if (blocked.includes(sanitizedAuthor)) {
      return NextResponse.json(
        { error: "هذا المستخدم محظور" },
        { status: 403 }
      );
    }

    const store = getStore();
    const newComment: Comment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      novelId,
      author: sanitizedAuthor,
      content: sanitizedContent,
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

    if (typeof commentId !== "string" || commentId.length > 100) {
      return NextResponse.json({ error: "Invalid commentId" }, { status: 400 });
    }

    const sanitizedAuthor = sanitize(String(author));
    if (!sanitizedAuthor) {
      return NextResponse.json({ error: "Invalid author" }, { status: 400 });
    }

    const store = getStore();
    const comment = store.comments.find((c) => c.id === commentId);
    if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const blocked = getBlockedUsers();
    if (blocked.includes(sanitizedAuthor)) {
      return NextResponse.json({ error: "ممنوع" }, { status: 403 });
    }

    const has = comment.likes.includes(sanitizedAuthor);
    if (liked === true && !has) {
      comment.likes.push(sanitizedAuthor);
    } else if (liked === false && has) {
      comment.likes = comment.likes.filter((n) => n !== sanitizedAuthor);
    } else {
      comment.likes = comment.likes.includes(sanitizedAuthor)
        ? comment.likes.filter((n) => n !== sanitizedAuthor)
        : [...comment.likes, sanitizedAuthor];
    }

    persistStore();
    return NextResponse.json(comment);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
