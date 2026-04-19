import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/server";
import { TOPICS, Topic } from "@/lib/topics";
import type { QuestionRow } from "@/lib/adaptive";

// Return the full question pool (grouped by topic) + a small warm-up set.
// The adaptive logic runs client-side from this pool.

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const sb = supabaseService();
  const { data: assessment } = await sb
    .from("assessments")
    .select("id, razorpay_payment_id, children(grade)")
    .eq("magic_link_token", params.token)
    .maybeSingle();

  if (!assessment || !assessment.razorpay_payment_id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // @ts-ignore
  const grade: "5" | "6" = assessment.children?.grade ?? "5";

  const { data: questions, error } = await sb
    .from("questions")
    .select("*")
    .eq("active", true)
    .in("grade_level", [grade, "both"]);

  if (error) {
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }

  const pool: Record<Topic, QuestionRow[]> = TOPICS.reduce((acc, t) => {
    acc[t] = [];
    return acc;
  }, {} as Record<Topic, QuestionRow[]>);

  (questions || []).forEach((q: any) => {
    if (TOPICS.includes(q.topic)) pool[q.topic as Topic].push(q as QuestionRow);
  });

  // Simple warm-up: 3 easy questions drawn from across topics.
  const warmup: QuestionRow[] = [];
  for (const t of TOPICS) {
    const easy = pool[t].find((q) => q.difficulty === "easy");
    if (easy && warmup.length < 3) warmup.push(easy);
  }

  return NextResponse.json({ pool, warmup });
}
