import { NextRequest, NextResponse } from "next/server";
import {
  CommentData,
  getComments,
  setComments,
  seedComments,
  banUser,
  isUserBanned,
  getBannedUsers,
} from "@/lib/comments-store";

function generateId(): string {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

/* ─── GET /api/comments?novelId=xxx&chapterId=xxx &admin=xxx ── */
export async function GET(req: NextRequest) {
  seedComments();
  const { searchParams } = new URL(req.url);
  const novelId   = searchParams.get("novelId");
  const chapterId = searchParams.get("chapterId");
  const adminCode = searchParams.get("admin");

  let result = getComments();

  if (novelId) {
    result = result.filter((c) => c.novelId === novelId);
  }
  if (chapterId) {
    result = result.filter((c) => c.chapterId === parseInt(chapterId, 10));
  }

  result.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.createdAt - a.createdAt;
  });

  return NextResponse.json({
    comments: result,
    admin: adminCode === "Blazixz",
    banned: adminCode === "Blazixz" ? getBannedUsers() : undefined,
  });
}

/* ─── POST /api/comments ──────────────────────────────── */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { novelId, chapterId, author, content, parentId, adminCode } = body;

  if (!novelId || !author || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Check if user is banned
  if (isUserBanned(author.trim())) {
    return NextResponse.json({ error: "هذا المستخدم محظور" }, { status: 403 });
  }

  const comment: CommentData = {
    id: generateId(),
    novelId,
    chapterId: chapterId || undefined,
    author: author.trim(),
    content: content.trim(),
    likes: 0,
    likedBy: [],
    parentId: parentId || undefined,
    createdAt: Date.now(),
  };

  const store = getComments();
  store.push(comment);
  setComments(store);

  return NextResponse.json({
    comment,
    admin: adminCode === "Blazixz",
  }, { status: 201 });
}

/* ─── PUT /api/comments?action=like ──────────────────── */
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, guestId, adminCode } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const store = getComments();
  const idx = store.findIndex((c) => c.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const c = { ...store[idx] };

  if (guestId) {
    if (c.likedBy.includes(guestId)) {
      c.likes = Math.max(0, c.likes - 1);
      c.likedBy = c.likedBy.filter((g) => g !== guestId);
    } else {
      c.likes += 1;
      c.likedBy.push(guestId);
    }
  }

  store[idx] = c;
  setComments(store);

  return NextResponse.json({ comment: c, admin: adminCode === "Blazixz" });
}
