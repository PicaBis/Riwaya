import { verifyDevCode } from "@/lib/auth";

// Verifies the developer passcode sent by the admin dashboard.
// The raw code is compared against a one-way digest (see auth.ts).
export async function verifyAdminRequest(headers: Headers): Promise<boolean> {
  const code = headers.get("x-dev-code");
  if (!code) return false;
  return verifyDevCode(code);
}
