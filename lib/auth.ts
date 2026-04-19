// Minimal magic-link auth for parent dashboard + admin.
// We piggy-back on Supabase auth's email OTP ("magic link") flow.

import { supabaseAnon, supabaseService } from "./supabase/server";
import { env } from "./env";

export async function sendParentMagicLink(email: string) {
  const sb = supabaseAnon();
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${env.appUrl()}/auth/callback` },
  });
  if (error) throw error;
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return email.toLowerCase() === env.adminEmail().toLowerCase();
}

// Server-side: resolve a user by their Supabase auth id.
export async function getUserByAuthId(authUserId: string) {
  const sb = supabaseService();
  const { data, error } = await sb
    .from("users")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
