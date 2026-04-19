import { NextRequest, NextResponse } from "next/server";
import { getAdminEmailOrNull } from "@/lib/admin";
import { runDiagnosticAndReport } from "@/lib/ai/pipeline";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminEmailOrNull();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Fire-and-forget — admin polls the page status.
  runDiagnosticAndReport(params.id).catch((e) =>
    console.error("retry failed", e)
  );
  return NextResponse.json({ ok: true });
}
