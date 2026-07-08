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

const ACCOUNT_KEY = "riwayati_account_key";

/** Persisted account identity (account:<uid>) once the visitor signs in. */
export function setAccountKey(uid: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (uid) localStorage.setItem(ACCOUNT_KEY, `account:${uid}`);
    else localStorage.removeItem(ACCOUNT_KEY);
  } catch {}
}

export function getAccountKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACCOUNT_KEY);
  } catch {
    return null;
  }
}

/**
 * Durable identity used for server-side progress / ratings / entitlement.
 * Precedence: real account > chosen guest name > per-device UUID. A signed-in
 * account key takes over everywhere automatically, so a reader keeps their
 * data across devices once they log in.
 */
export function getUserKey(guestName?: string | null): string {
  const account = getAccountKey();
  if (account) return account;
  if (guestName && guestName.trim()) {
    return `user:${guestName.trim().toLowerCase()}`;
  }
  return `device:${getDeviceId()}`;
}
