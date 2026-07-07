// Client-side error reporting helper. Fails silently — reporting must never
// interfere with the user's session or throw into the caller.
export type LogLevel = "error" | "warn" | "info";

export function reportError(error: unknown, extra?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    void fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: "error",
        message,
        stack,
        url: window.location.href,
        extra,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function reportEvent(message: string, extra?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    void fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level: "info", message, url: window.location.href, extra }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}
