"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const sb = supabaseBrowser();
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      setErr(e.message || "Could not send link.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-900">
        Check <strong>{email}</strong> for your sign-in link.
      </div>
    );
  }

  return (
    <form onSubmit={send} className="space-y-4">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@yourdomain.com"
        className="w-full border border-hunch-ink/15 rounded-lg px-3 py-2"
      />
      {err && <div className="text-sm text-red-700">{err}</div>}
      <button
        disabled={loading}
        className="w-full bg-hunch-accent text-white font-medium rounded-lg py-2 disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send magic link"}
      </button>
    </form>
  );
}
