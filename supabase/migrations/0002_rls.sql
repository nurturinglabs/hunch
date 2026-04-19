-- Row-level security. v1 keeps this simple:
--   * Reads/writes from the server (service role) bypass RLS.
--   * Parent-facing pages use the service role via Next.js API routes after
--     verifying a magic-link token server-side, so we DON'T rely on the client
--     JWT for authorization in v1.
--   * RLS is still enabled to block accidental direct anon access.

alter table public.users               enable row level security;
alter table public.children            enable row level security;
alter table public.assessments         enable row level security;
alter table public.questions           enable row level security;
alter table public.responses           enable row level security;
alter table public.confidence_ratings  enable row level security;
alter table public.reports             enable row level security;
alter table public.consultation_bookings enable row level security;
alter table public.ai_call_log         enable row level security;

-- Default-deny. Service role bypasses RLS automatically.
-- (No policies granted to anon/authenticated in v1.)
