import { NextRequest, NextResponse } from "next/server";
import { getComments, setComments } from "@/lib/comments-store";

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
