import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/session";
import { createEntitlementToken } from "@/lib/entitlement";
import { verify } from "@/lib/crypto-sign";
import { getSessionSecret } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { refererMatchesHost } from "@/lib/origin-check";

// COMPUTE whether this caller is entitled to the novel's full content.
// `true` only when a redeemed activation code is tied to their userKey, or a
// valid developer token is presented. Anything else (incl. Supabase being
// unavailable) resolves to `false` — the file still serves for free preview,
// but the token simply won't carry the `entitled` flag.
async function computeEntitled(userKey: string | null, devToken: string | null): Promise<boolean> {
  if (devToken) {
    const payload = await verify<{ dev?: boolean }>(getSessionSecret(), devToken).catch(() => null);
    if (payload?.dev) return true;
  }
  if (userKey) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data } = await supabase
          .from("activation_codes")
          .select("used")
          .eq("used_by", userKey)
          .eq("used", true)
          .limit(1);
        if (data && data.length > 0) return true;
      } catch {
        /* fall through to false */
      }
    }
  }
  return false;
}

export async function POST(request: NextRequest) {
  if (!refererMatchesHost(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await verifySession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!session) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  let body: { novelId?: string; userKey?: string; devToken?: string } = {};
  try {
    body = await request.json();
  } catch {
    /* empty body is fine */
  }

  const novelId = String(body.novelId || "");
  if (!novelId) {
    return NextResponse.json({ error: "novelId required" }, { status: 400 });
  }

  const userKey = body.userKey ? String(body.userKey).slice(0, 80) : null;
  const devToken = body.devToken ? String(body.devToken).slice(0, 512) : null;

  const entitled = await computeEntitled(userKey, devToken);
  const { token, expiresAt } = await createEntitlementToken(novelId, session.sid, entitled);

  return NextResponse.json(
    { token, expiresAt, entitled, novelId },
    { headers: { "Cache-Control": "no-store" } }
  );
}
