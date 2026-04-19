import { notFound } from "next/navigation";
import { supabaseService } from "@/lib/supabase/server";
import { renderMarkdown } from "@/lib/markdown";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  params,
}: {
  params: { token: string };
}) {
  const sb = supabaseService();
  const { data: aRaw } = await sb
    .from("assessments")
    .select(
      "id, status, children(first_name, grade, users:user_id(name)), reports(final_markdown, finalized_at)"
    )
    .eq("magic_link_token", params.token)
    .maybeSingle();

  if (!aRaw) notFound();
  const a: any = aRaw;

  const child = Array.isArray(a.children) ? a.children[0] : a.children;
  const report = Array.isArray(a.reports) ? a.reports[0] : a.reports;

  if (!report?.finalized_at) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="font-serif text-3xl">Report not ready yet</h1>
        <p className="mt-3 text-hunch-muted">
          We're still preparing {child?.first_name ?? "your child"}'s report. We'll email you
          when it's ready.
        </p>
      </main>
    );
  }

  const html = renderMarkdown(report.final_markdown || "");
  const cal = env.calComLink();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8">
        <div className="text-sm uppercase tracking-widest text-hunch-muted">
          Hunch Report
        </div>
        <h1 className="font-serif text-3xl mt-2">
          {child?.first_name} · Class {child?.grade}
        </h1>
        <div className="text-sm text-hunch-muted mt-1">
          Prepared for {child?.users?.name} · Finalized{" "}
          {new Date(report.finalized_at).toLocaleDateString()}
        </div>
      </header>

      <article
        className="prose-report bg-white border border-hunch-ink/10 rounded-xl p-6 md:p-10"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {cal && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl">Book your 30-minute consultation</h2>
          <p className="text-hunch-muted mt-1">
            We'll walk through the report together and answer your questions.
          </p>
          <div className="mt-4">
            <a
              href={`https://cal.com/${cal}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-hunch-accent text-white rounded-lg px-5 py-3 font-medium"
            >
              Book on Cal.com →
            </a>
          </div>
        </section>
      )}
    </main>
  );
}
