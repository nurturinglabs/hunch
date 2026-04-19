import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseService } from "@/lib/supabase/server";

const schema = z.object({
  assessmentId: z.string().uuid(),
  questionId: z.string().min(1),
  ordinal: z.number().int().nonnegative(),
  selected: z.enum(["A", "B", "C", "D"]).nullable(),
  isCorrect: z.boolean(),
  timeTakenSeconds: z.number().int().nonnegative(),
  explanationText: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  let input: z.infer<typeof schema>;
  try {
    input = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad input" }, { status: 400 });
  }

  const sb = supabaseService();

  // Verify token belongs to this assessment.
  const { data: a } = await sb
    .from("assessments")
    .select("id")
    .eq("id", input.assessmentId)
    .eq("magic_link_token", params.token)
    .maybeSingle();
  if (!a) {
    return NextResponse.json({ error: "token mismatch" }, { status: 403 });
  }

  await sb.from("responses").upsert(
    {
      assessment_id: input.assessmentId,
      question_id: input.questionId,
      ordinal: input.ordinal,
      selected_answer: input.selected,
      is_correct: input.isCorrect,
      time_taken_seconds: input.timeTakenSeconds,
      explanation_text: input.explanationText || null,
    },
    { onConflict: "assessment_id,question_id" }
  );

  return NextResponse.json({ ok: true });
}
