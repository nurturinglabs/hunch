import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env } from "./env";
import { isAdminEmail } from "./auth";

// Server-side admin gate. Reads the Supabase auth cookie and returns the
// user's email if it matches ADMIN_EMAIL, else null.

export async function getAdminEmailOrNull(): Promise<string | null> {
  const cookieStore = cookies();
  const sb = createServerClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set() {},
      remove() {},
    },
  });
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user?.email) return null;
  return isAdminEmail(user.email) ? user.email : null;
}
