// Orchestrates the two Claude tasks after assessment submission:
//   A. Diagnostic analysis → structured JSON
//   B. Parent report drafting → Markdown
//
// Both calls are logged into public.ai_call_log for debugging and prompt
// iteration. On failure, the report row stores the error and admin sees a
// "Retry Analysis" button (see app/admin/*).

import { supabaseService } from "../supabase/server";
import { callClaude } from "./anthropic";
import { fillSlots, loadPrompt } from "./prompts";
import { env } from "../env";

const DIAG_PROMPT = "diagnostic-v1" as const;
const REPORT_PROMPT = "report-v1" as const;

export async function runDiagnosticAndReport(assessmentId: string): Promise<void> {
  const sb = supabaseService();

  // Ensure a report row exists and mark as running.
  const { data: existing } = await sb
    .from("reports")
    .select("id")
    .eq("assessment_id", assessmentId)
    .maybeSingle();

  if (!existing) {
    await sb.from("reports").insert({
      assessment_id: assessmentId,
      ai_generation_status: "running",
      ai_prompt_versions: { diagnostic: DIAG_PROMPT, report: REPORT_PROMPT },
    });
  } else {
    await sb
      .from("reports")
      .update({
        ai_generation_status: "running",
        ai_error: null,
        ai_prompt_versions: { diagnostic: DIAG_PROMPT, report: REPORT_PROMPT },
      })
      .eq("assessment_id", assessmentId);
  }

  try {
    const ctx = await loadContext(assessmentId);

    // ----- Task A: diagnostic -----
    const diagPrompt = fillSlots(loadPrompt(DIAG_PROMPT), {
      GRADE: ctx.grade,
      CHILD_NAME: ctx.childName,
      PARENT_CONCERNS: ctx.parentConcerns || "(none)",
      RESPONSE_DATA_JSON: JSON.stringify(ctx.responses, null, 2),
      CONFIDENCE_JSON: JSON.stringify(ctx.confidence, null, 2),
    });

    const diagResult = await callClaude({ prompt: diagPrompt, maxTokens: 4000 });
    const diagJson = safeParseJson(diagResult.text);

    await logCall({
      assessmentId,
      task: "diagnostic",
      promptVersion: DIAG_PROMPT,
      result: diagResult,
      input: { prompt_slots: "see prompt; omitted for brevity" },
      output: diagJson ?? { raw: diagResult.text },
      success: !!diagJson,
      error: diagJson ? null : "Could not parse JSON from diagnostic output.",
    });

    if (!diagJson) throw new Error("Diagnostic did not return valid JSON.");

    // ----- Task B: report draft -----
    const reportPrompt = fillSlots(loadPrompt(REPORT_PROMPT), {
      GRADE: ctx.grade,
      CHILD_NAME: ctx.childName,
      PARENT_NAME: ctx.parentName,
      PARENT_CONCERNS: ctx.parentConcerns || "(none)",
      DIAGNOSTIC_JSON: JSON.stringify(diagJson, null, 2),
    });

    const reportResult = await callClaude({
      prompt: reportPrompt,
      maxTokens: 4000,
      temperature: 0.5,
    });

    await logCall({
      assessmentId,
      task: "report",
      promptVersion: REPORT_PROMPT,
      result: reportResult,
      input: { prompt_slots: "see prompt; omitted for brevity" },
      output: { markdown: reportResult.text },
      success: true,
      error: null,
    });

    await sb
      .from("reports")
      .update({
        ai_diagnostic_json: diagJson,
        ai_draft_markdown: reportResult.text,
        ai_generation_status: "ready",
        ai_error: null,
      })
      .eq("assessment_id", assessmentId);

    await sb
      .from("assessments")
      .update({ status: "report_drafted" })
      .eq("id", assessmentId);
  } catch (e: any) {
    console.error("[ai] pipeline failed", e);
    await sb
      .from("reports")
      .update({
        ai_generation_status: "failed",
        ai_error: e?.message || String(e),
      })
      .eq("assessment_id", assessmentId);
  }
}

async function loadContext(assessmentId: string) {
  const sb = supabaseService();
  const { data: a } = await sb
    .from("assessments")
    .select(
      "id, children(first_name, grade, parent_concerns, users:user_id(name))"
    )
    .eq("id", assessmentId)
    .single();

  // @ts-ignore
  const grade = a?.children?.grade ?? "5";
  // @ts-ignore
  const childName = a?.children?.first_name ?? "the student";
  // @ts-ignore
  const parentConcerns = a?.children?.parent_concerns ?? "";
  // @ts-ignore
  const parentName = a?.children?.users?.name ?? "";

  const { data: responses } = await sb
    .from("responses")
    .select(
      "ordinal, question_id, selected_answer, is_correct, time_taken_seconds, explanation_text, " +
        "questions(topic, sub_topic, difficulty, question_text, correct_answer, wrong_answer_diagnostics)"
    )
    .eq("assessment_id", assessmentId)
    .order("ordinal");

  const { data: confidence } = await sb
    .from("confidence_ratings")
    .select("topic, rating")
    .eq("assessment_id", assessmentId);

  return {
    grade: String(grade),
    childName,
    parentName,
    parentConcerns,
    responses: responses ?? [],
    confidence: confidence ?? [],
  };
}

function safeParseJson(text: string): any | null {
  // Tolerate ```json fences.
  const stripped = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "");
  try {
    return JSON.parse(stripped);
  } catch {
    // Fallback: try to find the outermost { ... }.
    const m = stripped.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function logCall(args: {
  assessmentId: string;
  task: "diagnostic" | "report";
  promptVersion: string;
  result: { durationMs: number; inputTokens?: number; outputTokens?: number };
  input: any;
  output: any;
  success: boolean;
  error: string | null;
}) {
  const sb = supabaseService();
  await sb.from("ai_call_log").insert({
    assessment_id: args.assessmentId,
    task: args.task,
    prompt_version: args.promptVersion,
    model: env.claudeModel(),
    input_tokens: args.result.inputTokens ?? null,
    output_tokens: args.result.outputTokens ?? null,
    duration_ms: args.result.durationMs,
    success: args.success,
    error: args.error,
    raw_input: args.input,
    raw_output: args.output,
  });
}
