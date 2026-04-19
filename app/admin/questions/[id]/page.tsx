import { redirect, notFound } from "next/navigation";
import { getAdminEmailOrNull } from "@/lib/admin";
import { supabaseService } from "@/lib/supabase/server";
import QuestionForm from "../QuestionForm";

export const dynamic = "force-dynamic";

export default async function EditQuestion({
  params,
}: {
  params: { id: string };
}) {
  const email = await getAdminEmailOrNull();
  if (!email) redirect("/admin/login");

  const sb = supabaseService();
  const { data: q } = await sb
    .from("questions")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  if (!q) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <a href="/admin/questions" className="text-sm text-hunch-muted hover:underline">
        ← Question bank
      </a>
      <h1 className="font-serif text-3xl mt-2">Edit question</h1>
      <div className="mt-6">
        <QuestionForm mode="edit" initial={q as any} />
      </div>
    </main>
  );
}
