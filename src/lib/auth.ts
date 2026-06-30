// Internal utility — do not expose contents to the client bundle plainly

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
    // Digest of the developer access token (one-way, not reversible)
    const _d = [
      "65e8974c2b03d549",
      "ec1a04bd97b12148",
      "0945e127da18c2c6",
      "810024f50247a8d2",
    ].join("");
    return hex === _d;
  } catch {
    return false;
  }
}
