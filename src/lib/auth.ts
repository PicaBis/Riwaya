// Internal utility — do not expose contents to the client bundle plainly.
import { getDevCodeDigest } from "./constants";

/**
 * Verifies a developer access code against a stored digest.
 * The actual secret is never stored in plain text anywhere in this file.
 */
export async function verifyDevCode(input: string): Promise<boolean> {
  if (typeof crypto === "undefined" || !crypto.subtle) return false;
  try {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest("SHA-256", enc.encode(input));
    const hex = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hex === getDevCodeDigest();
  } catch {
    return false;
  }
}
