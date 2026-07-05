import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, createSession, verifySession } from "@/lib/session";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count++;
  if (entry.count > max) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* ── Server-issued session identity (foundation for signed asset
   * URLs / watermarking in later phases). Every visitor — guest or not —
   * gets an HttpOnly, HMAC-signed session id the client can never read or
   * forge, minted on first contact and refreshed only when missing/invalid. */
  const existingPayload = await verifySession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const minted = existingPayload ? null : await createSession();
  const sid = existingPayload?.sid ?? minted!.payload.sid;

  const withSession = (response: NextResponse): NextResponse => {
    if (minted) {
      response.cookies.set(SESSION_COOKIE_NAME, minted.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
      });
    }
    response.headers.set("x-rw-sid", sid);
    return response;
  };

  /* ── Rate limiting for API routes ──────────────────── */
  if (pathname.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (rateLimit(ip + pathname, 30, 60000)) {
      return withSession(NextResponse.json({ error: "Too many requests" }, { status: 429 }));
    }

    const response = NextResponse.next();
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
    return withSession(response);
  }

  /* ── Block common attack patterns ──────────────────── */
  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  if (/sqlmap|nikto|acunetix|nmap|nessus|burpsuite|wpscan|hydra|dirbuster|gobuster/i.test(ua)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  /* ── Security headers for all routes ────────────────── */
  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Download-Options", "noopen");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set(
    "Cross-Origin-Opener-Policy",
    "same-origin"
  );
  response.headers.set(
    "Cross-Origin-Resource-Policy",
    "same-origin"
  );
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), display-capture=()"
  );
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  let supabaseHttpOrigin = "";
  let supabaseWsOrigin = "";
  try {
    if (supabaseUrl) {
      const u = new URL(supabaseUrl);
      supabaseHttpOrigin = u.origin;
      supabaseWsOrigin = `wss://${u.host}`;
    }
  } catch {}
  const connectSrc = [
    "'self'",
    "https://*.vercel-insights.com",
    supabaseHttpOrigin,
    supabaseWsOrigin,
  ].filter(Boolean).join(" ");

  response.headers.set(
    "Content-Security-Policy",
    `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-insights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src ${connectSrc}; worker-src 'self' blob:; media-src 'self'; base-uri 'self'; form-action 'self';`
  );

  return withSession(response);
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon\\.svg|logo\\.svg|manifest\\.json|sitemap\\.xml|robots\\.txt|apple-touch-icon\\.png|icon-192\\.png|icon-512\\.png|author\\.jpg|sw\\.js|pdf\\.worker\\.min\\.js).*)",
};