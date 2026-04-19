import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseService } from "@/lib/supabase/server";
import { sendEmail, adminNewSubmissionEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { TOPICS } from "@/lib/topics";
import { runDiagnosticAndReport } from "@/lib/ai/pipeline";

const schema = z.object({
  assessmentId: z.string().uuid(),
  confidence: z.record(z.enum(TOPICS as any), z.enum(["not_sure", "kinda_sure", "very_sure"])),
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

  // Verify token.
  const { data: a } = await sb
    .from("assessments")
    .select("id, children(first_name, grade)")
    .eq("id", input.assessmentId)
    .eq("magic_link_token", params.token)
    .maybeSingle();
  if (!a) {
    return NextResponse.json({ error: "token mismatch" }, { status: 403 });
  }

  // Save confidence ratings (idempotent via uniq index).
  const rows = Object.entries(input.confidence).map(([topic, rating]) => ({
    assessment_id: input.assessmentId,
    topic,
    rating,
  }));
  if (rows.length) {
    await sb
      .from("confidence_ratings")
      .upsert(rows, { onConflict: "assessment_id,topic" });
  }

  // Mark as submitted.
  await sb
    .from("assessments")
    .update({ status: "submitted", submitted_at: new Date().toISOString() })
    .eq("id", input.assessmentId);

  // Notify admin (non-blocking).
  // @ts-ignore
  const childFirstName = a.children?.first_name ?? "student";
  // @ts-ignore
  const grade = a.children?.grade ?? "5";
  const adminUrl = `${env.appUrl()}/admin/assessments/${input.assessmentId}`;
  sendEmail({
    to: env.adminEmail(),
    ...adminNewSubmissionEmail({ childFirstName, grade, adminUrl }),
  }).catch((e) => console.error("admin email failed", e));

  // Kick off AI pipeline (fire-and-forget — the child's screen never waits).
  runDiagnosticAndReport(input.assessmentId).catch((e) =>
    console.error("ai pipeline failed", e)
  );

  return NextResponse.json({ ok: true });
}
