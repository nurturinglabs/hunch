import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const sb = supabaseService();
  const { data: a } = await sb
    .from("assessments")
    .select("id, status")
    .eq("magic_link_token", params.token)
    .maybeSingle();
  if (!a) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (a.status === "pending") {
    await sb
      .from("assessments")
      .update({ status: "in_progress", started_at: new Date().toISOString() })
      .eq("id", a.id);
  }
  return NextResponse.json({ ok: true });
}
