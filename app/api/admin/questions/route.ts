import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminEmailOrNull } from "@/lib/admin";
import { supabaseService } from "@/lib/supabase/server";
import { TOPICS } from "@/lib/topics";

const questionSchema = z.object({
  id: z.string().min(1),
  topic: z.enum(TOPICS as any),
  sub_topic: z.string().min(1),
  grade_level: z.enum(["5", "6", "both"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  cognitive_skill: z.enum(["recall", "application", "reasoning"]),
  question_text: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  correct_answer: z.enum(["A", "B", "C", "D"]),
  wrong_answer_diagnostics: z.object({
    A: z.string(),
    B: z.string(),
    C: z.string(),
    D: z.string(),
  }),
  requires_explanation: z.boolean(),
  expected_time_seconds: z.number().int().positive(),
  active: z.boolean(),
});

const schema = z.object({
  mode: z.enum(["create", "edit"]),
  question: questionSchema,
});

export async function POST(req: NextRequest) {
  const admin = await getAdminEmailOrNull();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let input: z.infer<typeof schema>;
  try {
    input = schema.parse(await req.json());
  } catch (e: any) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const sb = supabaseService();
  const row = {
    ...input.question,
    options: input.question.options,
    wrong_answer_diagnostics: input.question.wrong_answer_diagnostics,
  };

  const { error } = await sb
    .from("questions")
    .upsert(row, { onConflict: "id" });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
