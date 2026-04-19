import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminEmailOrNull } from "@/lib/admin";
import { supabaseService } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const email = await getAdminEmailOrNull();
  if (!email) redirect("/admin/login");

  const sb = supabaseService();
  const { data: assessments } = await sb
    .from("assessments")
    .select("id, status, submitted_at, created_at, children(first_name, grade, users:user_id(name, email))")
    .order("created_at", { ascending: false })
    .limit(50);

  const grouped = {
    needsReview: [] as any[],
    inProgress: [] as any[],
    finalized: [] as any[],
  };
  (assessments || []).forEach((a: any) => {
    if (a.status === "submitted" || a.status === "report_drafted") grouped.needsReview.push(a);
    else if (a.status === "report_finalized" || a.status === "consultation_booked" || a.status === "consultation_completed")
      grouped.finalized.push(a);
    else grouped.inProgress.push(a);
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Admin</h1>
        <div className="text-sm text-hunch-muted">
          Signed in as {email} ·{" "}
          <Link href="/admin/questions" className="underline">
            Question bank
          </Link>
        </div>
      </div>

      <Section title="Needs review" rows={grouped.needsReview} />
      <Section title="In progress" rows={grouped.inProgress} />
      <Section title="Finalized" rows={grouped.finalized} />
    </main>
  );
}

function Section({ title, rows }: { title: string; rows: any[] }) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-xl mb-3">
        {title}{" "}
        <span className="text-sm text-hunch-muted">({rows.length})</span>
      </h2>
      {rows.length === 0 ? (
        <div className="text-sm text-hunch-muted">None.</div>
      ) : (
        <table className="w-full text-sm border border-hunch-ink/10 rounded-lg overflow-hidden">
          <thead className="bg-white">
            <tr className="text-left">
              <th className="px-3 py-2">Child</th>
              <th className="px-3 py-2">Class</th>
              <th className="px-3 py-2">Parent</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-t border-hunch-ink/10 bg-white">
                <td className="px-3 py-2">{a.children?.first_name}</td>
                <td className="px-3 py-2">{a.children?.grade}</td>
                <td className="px-3 py-2 text-hunch-muted">
                  {a.children?.users?.name} · {a.children?.users?.email}
                </td>
                <td className="px-3 py-2">{a.status}</td>
                <td className="px-3 py-2 text-hunch-muted">
                  {new Date(a.created_at).toLocaleDateString()}
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/assessments/${a.id}`}
                    className="text-hunch-accent underline"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
