import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Public (anon) client — safe for the browser. Used for reads and realtime
 * subscriptions. All row access is governed by Row Level Security policies
 * (public SELECT on comments only).
 */
export const supabase = supabaseUrl
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: { params: { eventsPerSecond: 10 } },
    })
  : null;

export function getSupabase() {
  return supabase;
}

/**
 * Server-only service client — bypasses RLS. NEVER import this into a client
 * component; it relies on SUPABASE_SERVICE_ROLE_KEY which must stay secret.
 * Used by API routes to insert / delete / update after the request has been
 * authorised in code (rate-limit, moderation, admin check, owner token).
 * Falls back to the anon client if the service key is not configured.
 */
let serviceClient: SupabaseClient | null = null;
export function getServiceSupabase(): SupabaseClient | null {
  if (!supabaseUrl) return null;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!serviceKey) return supabase; // graceful fallback (works if RLS permits)
  if (!serviceClient) {
    serviceClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return serviceClient;
}
