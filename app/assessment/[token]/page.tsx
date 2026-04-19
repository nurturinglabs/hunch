import { supabaseService } from "@/lib/supabase/server";
import AssessmentClient from "./AssessmentClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AssessmentPage({
  params,
}: {
  params: { token: string };
}) {
  const sb = supabaseService();
  const { data: a } = await sb
    .from("assessments")
    .select(
      "id, status, razorpay_payment_id, submitted_at, children(first_name, grade)"
    )
    .eq("magic_link_token", params.token)
    .maybeSingle();

  if (!a) notFound();

  if (!a.razorpay_payment_id) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="font-serif text-2xl">Payment not confirmed yet.</h1>
        <p className="mt-2 text-hunch-muted">
          If you've just paid, please wait a minute and refresh this page.
        </p>
      </main>
    );
  }

  if (a.status === "submitted" || a.status === "report_drafted" ||
      a.status === "report_finalized" || a.status === "consultation_booked" ||
      a.status === "consultation_completed") {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="font-serif text-2xl">All done! 🎉</h1>
        <p className="mt-4 text-hunch-muted">
          You've already submitted this assessment. Your parent will receive the
          report in 1–2 days.
        </p>
      </main>
    );
  }

  // @ts-ignore nested relation typing
  const childName = a.children?.first_name ?? "";
  // @ts-ignore
  const grade = a.children?.grade ?? "5";

  return (
    <AssessmentClient
      token={params.token}
      assessmentId={a.id}
      childName={childName}
      grade={grade}
    />
  );
}
