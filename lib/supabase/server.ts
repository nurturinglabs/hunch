import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "../env";

// Service-role client: used from Next.js API routes / server components only.
// Never expose this key to the browser.
let _service: SupabaseClient | null = null;
export function supabaseService(): SupabaseClient {
  if (_service) return _service;
  _service = createClient(env.supabaseUrl(), env.supabaseServiceRole(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _service;
}

// Anon client (server-side) for auth flows where service role isn't appropriate.
export function supabaseAnon(): SupabaseClient {
  return createClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
