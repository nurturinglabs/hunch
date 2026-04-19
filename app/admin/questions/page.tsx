import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminEmailOrNull } from "@/lib/admin";
import { supabaseService } from "@/lib/supabase/server";
import { TOPIC_LABELS } from "@/lib/topics";

export const dynamic = "force-dynamic";

export default async function QuestionsAdmin() {
  const email = await getAdminEmailOrNull();
  if (!email) redirect("/admin/login");

  const sb = supabaseService();
  const { data: questions } = await sb
    .from("questions")
    .select("id, topic, sub_topic, grade_level, difficulty, question_text, active")
    .order("topic")
    .order("difficulty");

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/admin" className="text-sm text-hunch-muted hover:underline">
        ← Admin
      </Link>
      <div className="flex items-center justify-between mt-2">
        <h1 className="font-serif text-3xl">Question bank</h1>
        <Link
          href="/admin/questions/new"
          className="bg-hunch-accent text-white rounded-lg px-4 py-2"
        >
          + New question
        </Link>
      </div>

      <table className="w-full mt-6 text-sm border border-hunch-ink/10 rounded-lg overflow-hidden">
        <thead className="bg-white">
          <tr className="text-left">
            <th className="px-3 py-2">ID</th>
            <th className="px-3 py-2">Topic</th>
            <th className="px-3 py-2">Sub-topic</th>
            <th className="px-3 py-2">Grade</th>
            <th className="px-3 py-2">Difficulty</th>
            <th className="px-3 py-2">Question</th>
            <th className="px-3 py-2">Active</th>
          </tr>
        </thead>
        <tbody>
          {(questions || []).map((q: any) => (
            <tr key={q.id} className="border-t border-hunch-ink/10 bg-white align-top">
              <td className="px-3 py-2 font-mono text-xs">
                <Link
                  href={`/admin/questions/${encodeURIComponent(q.id)}`}
                  className="text-hunch-accent underline"
                >
                  {q.id}
                </Link>
              </td>
              <td className="px-3 py-2">
                {TOPIC_LABELS[q.topic as keyof typeof TOPIC_LABELS]}
              </td>
              <td className="px-3 py-2">{q.sub_topic}</td>
              <td className="px-3 py-2">{q.grade_level}</td>
              <td className="px-3 py-2">{q.difficulty}</td>
              <td className="px-3 py-2 max-w-md">{q.question_text}</td>
              <td className="px-3 py-2">{q.active ? "✓" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
