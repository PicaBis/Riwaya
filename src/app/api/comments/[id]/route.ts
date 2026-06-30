import { NextRequest, NextResponse } from "next/server";
import { getComments, setComments, banUser, isUserBanned } from "@/lib/comments-store";

/* ─── DELETE /api/comments/:id?admin=Blazixz ─────────── */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const adminCode = searchParams.get("admin");

  if (adminCode !== "Blazixz") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const store = getComments();
  const idx = store.findIndex((c) => c.id === params.id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  store.splice(idx, 1);
  setComments(store);

  return NextResponse.json({ success: true });
}

/* ─── PATCH /api/comments/:id?action=ban ─────────────── */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const adminCode = searchParams.get("admin");

  if (adminCode !== "Blazixz") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (action === "ban") {
    const store = getComments();
    const comment = store.find((c) => c.id === params.id);
    if (!comment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Ban the user
    banUser(comment.author);

    // Remove all comments by this user
    const filtered = store.filter((c) => c.author !== comment.author);
    setComments(filtered);

    return NextResponse.json({
      success: true,
      banned: comment.author,
      removedCount: store.length - filtered.length,
    });
  }

  if (action === "pin") {
    const store = getComments();
    const comment = store.find((c) => c.id === params.id);
    if (!comment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    comment.pinned = !comment.pinned;
    setComments(store);
    return NextResponse.json({ success: true, pinned: comment.pinned });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
