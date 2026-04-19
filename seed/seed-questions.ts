// Run with: pnpm seed:questions  (or npm run seed:questions)
// Reads questions from ./questions.ts and upserts into the Supabase DB.
//
// Requires: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env.

import { createClient } from "@supabase/supabase-js";
import { QUESTIONS } from "./questions";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing env: set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const sb = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log(`Seeding ${QUESTIONS.length} questions…`);
  const rows = QUESTIONS.map((q) => ({
    id: q.id,
    topic: q.topic,
    sub_topic: q.sub_topic,
    grade_level: q.grade_level,
    difficulty: q.difficulty,
    cognitive_skill: q.cognitive_skill,
    question_text: q.question_text,
    question_image_url: null,
    options: q.options,
    correct_answer: q.correct_answer,
    wrong_answer_diagnostics: q.wrong_answer_diagnostics,
    requires_explanation: q.requires_explanation ?? false,
    expected_time_seconds: q.expected_time_seconds ?? 60,
    active: true,
  }));

  const { error } = await sb.from("questions").upsert(rows, { onConflict: "id" });
  if (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
  console.log("Done.");
}

main();
