import { redirect } from "next/navigation";
import { getAdminEmailOrNull } from "@/lib/admin";
import QuestionForm from "../QuestionForm";

export default async function NewQuestionPage() {
  const email = await getAdminEmailOrNull();
  if (!email) redirect("/admin/login");
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <a href="/admin/questions" className="text-sm text-hunch-muted hover:underline">
        ← Question bank
      </a>
      <h1 className="font-serif text-3xl mt-2">New question</h1>
      <div className="mt-6">
        <QuestionForm mode="create" />
      </div>
    </main>
  );
}
