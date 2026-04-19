# Hunch — v1

Math assessment service for parents of Class 5–6 children in India.

This repo is the Next.js + Supabase scaffold for the v1 product. The flow is
end-to-end **clickable locally** once you wire credentials.

---

## What's in the box

- Parent signup + Razorpay checkout flow
- Magic-link based child assessment (no child account)
- Adaptive question selection (deterministic, per PRD §5.3)
- "Explain your thinking" prompts + per-topic confidence ratings
- Claude API pipeline: diagnostic JSON → parent report Markdown
- Admin panel: list assessments, view full responses, edit & finalize report
- Admin question CRUD
- Parent-facing finalized report view + Cal.com booking link
- Resend email templates

## What's intentionally not in this scaffold

- Real prompts (use `prompts/diagnostic-v1.md` + `prompts/report-v1.md` as
  starting drafts; iterate with real data)
- Real question content (30 placeholder questions in `seed/questions.ts`)
- Production-grade observability (only basic console logging + `ai_call_log`)
- Tests (PRD targets pilot validation, not unit-test coverage)

---

## Getting started

### 1. Install

```bash
cd hunch
npm install
```

### 2. Create services & get credentials

You'll need accounts for: **Supabase**, **Razorpay** (test mode), **Resend**,
**Anthropic**, and **Cal.com**. Copy `.env.example` → `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=          # optional; used by /api/payments/webhook
RESEND_API_KEY=
RESEND_FROM_EMAIL="Hunch <reports@yourdomain.com>"
ANTHROPIC_API_KEY=
CLAUDE_MODEL=claude-sonnet-4-6
NEXT_PUBLIC_CAL_COM_LINK=your-handle/hunch-consultation
ADMIN_EMAIL=founder@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
ASSESSMENT_PRICE_INR=1999
```

### 3. Apply DB schema

In your Supabase project's SQL editor (or via the CLI), run:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_rls.sql`

### 4. Seed the question bank

```bash
npm run seed:questions
```

This inserts 30 placeholder questions across the 6 topic areas. **Replace
these with real, curriculum-reviewed content before pilot launch.** Use the
admin UI at `/admin/questions` to edit or add.

### 5. Run

```bash
npm run dev
```

Open http://localhost:3000.

---

## Walkthrough (manual end-to-end test)

1. Open `/` → click **Book an Assessment**.
2. Fill the form, pay using a Razorpay test card
   (e.g. `4111 1111 1111 1111`, any future expiry, any CVV).
3. Open the assessment link emailed by Resend (or copy from server logs).
4. Take the test as the child.
5. On submission, the AI pipeline runs in the background.
6. Sign in to `/admin/login` with your `ADMIN_EMAIL`. Open the assessment.
7. Wait for `AI status: ready`, edit the draft, click **Finalize & send**.
8. The parent receives the report link → opens `/report/<token>`.

---

## Project layout

```
app/
  page.tsx                   landing
  signup/                    parent signup + Razorpay
  assessment/[token]/        child assessment (adaptive)
  report/[token]/            parent-facing finalized report
  admin/                     admin (login, list, review, question CRUD)
  api/
    payments/                order + verify + webhook
    assessment/[token]/      pool, start, answer, submit
    admin/                   reports, questions

lib/
  env.ts                     env var helpers
  supabase/                  service + browser clients
  razorpay.ts                order create, signature verify
  email.ts                   Resend wrapper + templates
  topics.ts                  topic enum + labels + counts
  adaptive.ts                deterministic adaptive logic
  ai/
    anthropic.ts             Claude API wrapper
    prompts.ts               versioned prompt loader
    pipeline.ts              diagnostic → report orchestration
  markdown.ts                tiny MD → HTML for report view

prompts/
  diagnostic-v1.md           Task A prompt (versioned)
  report-v1.md               Task B prompt (versioned)

seed/
  questions.ts               30 placeholder questions
  seed-questions.ts          upsert script

supabase/migrations/         SQL schema
```

---

## Open items before pilot launch

- Replace the 30 placeholder questions with real curriculum-reviewed content
  (PRD §12 — founder + Claude collaboration).
- Iterate on prompts in `prompts/` against 5–10 real submissions.
- Configure Razorpay webhook in dashboard pointing at
  `/api/payments/webhook`, then add `RAZORPAY_WEBHOOK_SECRET`.
- Set up Resend with a verified sending domain.
- Set up the Cal.com event (30-min Zoom).
- Smoke-test email deliverability (especially to gmail.com / outlook.com).
- End-to-end test with 2 real kids (PRD §10 Phase 7).
