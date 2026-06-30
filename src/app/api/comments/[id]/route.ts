import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const { admin } = body as { admin?: boolean };

    if (!admin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { getStore, persistStore, addBlockedUser } = await import("@/lib/comments-store");
    const store = getStore();
    const comment = store.comments.find((c) => c.id === params.id);

    if (!comment) {
      return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    }

    store.comments = store.comments.filter((c) => c.id !== params.id);
    persistStore();

    addBlockedUser(comment.author);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
