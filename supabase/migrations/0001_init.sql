-- Hunch v1 schema — mirrors PRD §8
-- Enable UUIDs
create extension if not exists "pgcrypto";

-- ========= Enums =========
do $$ begin
  create type grade_level as enum ('5','6');
exception when duplicate_object then null; end $$;

do $$ begin
  create type question_grade as enum ('5','6','both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type difficulty as enum ('easy','medium','hard');
exception when duplicate_object then null; end $$;

do $$ begin
  create type cognitive_skill as enum ('recall','application','reasoning');
exception when duplicate_object then null; end $$;

do $$ begin
  create type topic as enum (
    'number_sense',
    'operations',
    'fractions_decimals',
    'ratio_percent',
    'geometry_measurement',
    'word_problems_data'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type assessment_status as enum (
    'pending',
    'in_progress',
    'submitted',
    'report_drafted',
    'report_finalized',
    'consultation_booked',
    'consultation_completed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type confidence_level as enum ('not_sure','kinda_sure','very_sure');
exception when duplicate_object then null; end $$;

-- ========= Users (parent accounts) =========
-- In production: tied to auth.users via email. For v1 we store a lightweight mirror.
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,            -- nullable until magic-link verified
  email text not null unique,
  name text not null,
  phone text,
  created_at timestamptz not null default now()
);

-- ========= Children =========
create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  first_name text not null,
  grade grade_level not null,
  school text,
  board text,
  parent_concerns text,
  created_at timestamptz not null default now()
);
create index if not exists children_user_idx on public.children(user_id);

-- ========= Assessments =========
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  status assessment_status not null default 'pending',
  magic_link_token text not null unique,
  razorpay_order_id text,
  razorpay_payment_id text,
  price_paid_inr integer,
  started_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists assessments_child_idx on public.assessments(child_id);
create index if not exists assessments_status_idx on public.assessments(status);

-- ========= Questions (question bank) =========
create table if not exists public.questions (
  id text primary key,                    -- human-readable like 'frac-eq-001'
  topic topic not null,
  sub_topic text,
  grade_level question_grade not null,
  difficulty difficulty not null,
  cognitive_skill cognitive_skill not null,
  question_text text not null,
  question_image_url text,
  options jsonb not null,                 -- array of 4 strings
  correct_answer text not null,           -- 'A'|'B'|'C'|'D'
  wrong_answer_diagnostics jsonb not null,-- {A:"...", B:"...", ...}
  requires_explanation boolean not null default false,
  expected_time_seconds integer not null default 60,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists questions_topic_idx on public.questions(topic, difficulty);

-- ========= Responses (child answers) =========
create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  question_id text not null references public.questions(id),
  ordinal integer not null,                 -- order shown to child
  selected_answer text,                     -- 'A'|'B'|'C'|'D' or null if skipped
  is_correct boolean,
  time_taken_seconds integer,
  explanation_text text,
  answered_at timestamptz not null default now()
);
create index if not exists responses_assessment_idx on public.responses(assessment_id);
create unique index if not exists responses_assessment_q_uniq on public.responses(assessment_id, question_id);

-- ========= Confidence ratings =========
create table if not exists public.confidence_ratings (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  topic topic not null,
  rating confidence_level not null,
  created_at timestamptz not null default now()
);
create unique index if not exists confidence_assessment_topic_uniq
  on public.confidence_ratings(assessment_id, topic);

-- ========= Reports =========
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references public.assessments(id) on delete cascade,
  ai_diagnostic_json jsonb,
  ai_draft_markdown text,
  final_markdown text,
  ai_prompt_versions jsonb,                 -- {diagnostic: 'v1', report: 'v1'}
  ai_generation_status text default 'pending', -- pending|running|ready|failed
  ai_error text,
  finalized_at timestamptz,
  finalized_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========= Consultation bookings =========
create table if not exists public.consultation_bookings (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  cal_com_event_id text,
  scheduled_at timestamptz,
  completed_at timestamptz,
  consultation_notes text,
  created_at timestamptz not null default now()
);
create index if not exists bookings_assessment_idx on public.consultation_bookings(assessment_id);

-- ========= Claude API call log (for debugging + prompt iteration) =========
create table if not exists public.ai_call_log (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references public.assessments(id) on delete set null,
  task text not null,                       -- 'diagnostic' | 'report'
  prompt_version text not null,
  model text not null,
  input_tokens integer,
  output_tokens integer,
  duration_ms integer,
  success boolean not null,
  error text,
  raw_input jsonb,
  raw_output jsonb,
  created_at timestamptz not null default now()
);
create index if not exists ai_call_log_assessment_idx on public.ai_call_log(assessment_id);

-- ========= Updated_at triggers =========
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists questions_set_updated on public.questions;
create trigger questions_set_updated before update on public.questions
  for each row execute function public.set_updated_at();

drop trigger if exists reports_set_updated on public.reports;
create trigger reports_set_updated before update on public.reports
  for each row execute function public.set_updated_at();
