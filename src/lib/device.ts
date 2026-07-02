// Stable anonymous device identifier for server-side reading-progress sync.
// If the visitor sets a guest name, we key by that (enables cross-device sync
// when the same name is reused); otherwise we fall back to a per-device UUID.

const DEVICE_KEY = "riwayati_device_id";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function getUserKey(guestName?: string | null): string {
  if (guestName && guestName.trim()) {
    return `user:${guestName.trim().toLowerCase()}`;
  }
  return `device:${getDeviceId()}`;
}
