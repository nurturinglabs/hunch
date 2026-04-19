import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

// Supabase OTP magic-link callback: exchanges the ?code=... for a session
// cookie and redirects to ?next=…

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/admin";

  if (!code) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const cookieStore = cookies();
  const sb = createServerClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    cookies: {
      get: (n: string) => cookieStore.get(n)?.value,
      set: (n: string, v: string, o: any) => cookieStore.set({ name: n, value: v, ...o }),
      remove: (n: string, o: any) => cookieStore.set({ name: n, value: "", ...o, maxAge: 0 }),
    },
  });

  await sb.auth.exchangeCodeForSession(code);

  return NextResponse.redirect(new URL(next, req.url));
}
