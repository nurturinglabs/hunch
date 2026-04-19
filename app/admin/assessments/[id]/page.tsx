import { redirect, notFound } from "next/navigation";
import { getAdminEmailOrNull } from "@/lib/admin";
import { supabaseService } from "@/lib/supabase/server";
import { TOPIC_LABELS } from "@/lib/topics";
import ReportEditor from "./ReportEditor";

export const dynamic = "force-dynamic";

export default async function AdminAssessmentPage({
  params,
}: {
  params: { id: string };
}) {
  const email = await getAdminEmailOrNull();
  if (!email) redirect("/admin/login");

  const sb = supabaseService();
  const { data: aRaw } = await sb
    .from("assessments")
    .select(
      "id, status, submitted_at, magic_link_token, " +
        "children(first_name, grade, school, board, parent_concerns, users:user_id(name, email))"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!aRaw) notFound();
  const a: any = aRaw;

  const { data: responses } = await sb
    .from("responses")
    .select(
      "ordinal, selected_answer, is_correct, time_taken_seconds, explanation_text, " +
        "questions(topic, sub_topic, difficulty, question_text, correct_answer, options, wrong_answer_diagnostics)"
    )
    .eq("assessment_id", params.id)
    .order("ordinal");

  const { data: confidence } = await sb
    .from("confidence_ratings")
    .select("topic, rating")
    .eq("assessment_id", params.id);

  const { data: report } = await sb
    .from("reports")
    .select("*")
    .eq("assessment_id", params.id)
    .maybeSingle();

  // @ts-ignore
  const child = a.children;

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <a href="/admin" className="text-sm text-hunch-muted hover:underline">
        ← All assessments
      </a>
      <h1 className="font-serif text-3xl mt-4">
        {child?.first_name} · Class {child?.grade}
      </h1>
      <div className="text-sm text-hunch-muted mt-1">
        Parent: {child?.users?.name} · {child?.users?.email}
        {child?.school ? ` · ${child.school}` : ""}
        {child?.board ? ` · ${child.board}` : ""}
      </div>
      {child?.parent_concerns && (
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-3 text-sm">
          <strong>Parent's concerns:</strong> {child.parent_concerns}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        {/* LEFT: Responses + confidence */}
        <section>
          <h2 className="font-serif text-xl mb-3">Responses</h2>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {(responses || []).map((r: any, i: number) => (
              <div
                key={i}
                className="border border-hunch-ink/10 rounded-lg p-3 bg-white text-sm"
              >
                <div className="flex justify-between text-xs text-hunch-muted">
                  <span>
                    #{r.ordinal} · {TOPIC_LABELS[r.questions.topic as keyof typeof TOPIC_LABELS]} ·{" "}
                    {r.questions.difficulty}
                  </span>
                  <span>{r.time_taken_seconds}s</span>
                </div>
                <div className="mt-1">{r.questions.question_text}</div>
                <div className="mt-2">
                  Picked <strong>{r.selected_answer ?? "—"}</strong> ·{" "}
                  Correct <strong>{r.questions.correct_answer}</strong> ·{" "}
                  <span
                    className={
                      r.is_correct ? "text-green-700" : "text-red-700"
                    }
                  >
                    {r.is_correct ? "✓" : "✗"}
                  </span>
                </div>
                {r.selected_answer && !r.is_correct && (
                  <div className="mt-2 text-xs text-hunch-muted italic">
                    Diagnostic: {r.questions.wrong_answer_diagnostics?.[r.selected_answer] || "—"}
                  </div>
                )}
                {r.explanation_text && (
                  <div className="mt-2 text-xs bg-hunch-paper p-2 rounded">
                    <strong>Their explanation:</strong> {r.explanation_text}
                  </div>
                )}
              </div>
            ))}
          </div>
          <h3 className="font-serif text-lg mt-6 mb-2">Confidence ratings</h3>
          <ul className="text-sm">
            {(confidence || []).map((c: any) => (
              <li key={c.topic}>
                {TOPIC_LABELS[c.topic as keyof typeof TOPIC_LABELS]}:{" "}
                <strong>{c.rating}</strong>
              </li>
            ))}
          </ul>
        </section>

        {/* RIGHT: Report editor */}
        <section>
          <ReportEditor
            assessmentId={a.id}
            initialDraft={report?.final_markdown || report?.ai_draft_markdown || ""}
            aiStatus={report?.ai_generation_status || "pending"}
            aiError={report?.ai_error}
            finalized={!!report?.finalized_at}
          />
        </section>
      </div>
    </main>
  );
}
