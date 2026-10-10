import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Server-only database client. Uses the project's secret key, which must never
 * reach the browser. Returns null when the site hasn't been configured yet.
 */
export function getDb(): SupabaseClient | null {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export function serverSecret(): string | null {
  return process.env.SUPABASE_SECRET_KEY ?? null;
}
