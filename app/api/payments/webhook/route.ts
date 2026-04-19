import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { supabaseService } from "@/lib/supabase/server";

// Razorpay webhook — safety net in case the client-side verify callback is missed.
// Configure in Razorpay dashboard: events = payment.captured, payment.failed.

export async function POST(req: NextRequest) {
  const sig = req.headers.get("x-razorpay-signature") || "";
  const body = await req.text();

  if (!verifyWebhookSignature(body, sig)) {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  const evt = JSON.parse(body);
  const sb = supabaseService();

  if (evt.event === "payment.captured") {
    const orderId: string | undefined = evt.payload?.payment?.entity?.order_id;
    const paymentId: string | undefined = evt.payload?.payment?.entity?.id;
    if (orderId && paymentId) {
      await sb
        .from("assessments")
        .update({ razorpay_payment_id: paymentId })
        .eq("razorpay_order_id", orderId);
    }
  }

  return NextResponse.json({ ok: true });
}
