import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* ── Rate limiting for API routes ──────────────────── */
  if (pathname.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (rateLimit(ip + pathname, 30, 60000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const response = NextResponse.next();
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    return response;
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
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), display-capture=(), screen-wake-lock=(), autoplay=()"
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://cdnjs.cloudflare.com https://*.vercel-insights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; frame-src 'self' https://www.youtube.com; connect-src 'self' https://*.vercel-insights.com; media-src 'self'; base-uri 'self'; form-action 'self';"
  );

  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon\\.svg|logo\\.svg|manifest\\.json|sitemap\\.xml).*)",
};