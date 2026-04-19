import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminEmailOrNull } from "@/lib/admin";
import { supabaseService } from "@/lib/supabase/server";
import { sendEmail, reportReadyEmail } from "@/lib/email";
import { env } from "@/lib/env";

const schema = z.object({
  markdown: z.string().min(1),
  action: z.enum(["save", "finalize"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminEmail = await getAdminEmailOrNull();
  if (!adminEmail) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let input: z.infer<typeof schema>;
  try {
    input = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad input" }, { status: 400 });
  }

  const sb = supabaseService();

  // Ensure report row exists.
  const { data: existing } = await sb
    .from("reports")
    .select("id")
    .eq("assessment_id", params.id)
    .maybeSingle();
  if (!existing) {
    await sb.from("reports").insert({ assessment_id: params.id });
  }

  const update: any = { final_markdown: input.markdown };
  if (input.action === "finalize") {
    update.finalized_at = new Date().toISOString();
    update.finalized_by = adminEmail;
  }
  await sb.from("reports").update(update).eq("assessment_id", params.id);

  if (input.action === "finalize") {
    // Mark assessment, generate parent magic-link path, email.
    const { data: a } = await sb
      .from("assessments")
      .select(
        "magic_link_token, children(first_name, users:user_id(name, email))"
      )
      .eq("id", params.id)
      .single();

    await sb
      .from("assessments")
      .update({ status: "report_finalized" })
      .eq("id", params.id);

    // @ts-ignore
    const parent = a?.children?.users;
    // @ts-ignore
    const childFirstName = a?.children?.first_name ?? "your child";
    if (parent?.email) {
      const reportUrl = `${env.appUrl()}/report/${a!.magic_link_token}`;
      const tpl = reportReadyEmail({
        parentName: parent.name,
        childFirstName,
        reportUrl,
        calComLink: env.calComLink()
          ? `https://cal.com/${env.calComLink()}`
          : undefined,
      });
      try {
        await sendEmail({ to: parent.email, ...tpl });
      } catch (e) {
        console.error("[finalize] email failed", e);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
