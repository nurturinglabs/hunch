import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseService } from "@/lib/supabase/server";
import { verifyCheckoutSignature } from "@/lib/razorpay";
import { sendEmail, assessmentLinkEmail } from "@/lib/email";
import { env } from "@/lib/env";

const schema = z.object({
  assessmentId: z.string().uuid(),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(req: NextRequest) {
  let input: z.infer<typeof schema>;
  try {
    input = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const ok = verifyCheckoutSignature({
    orderId: input.razorpay_order_id,
    paymentId: input.razorpay_payment_id,
    signature: input.razorpay_signature,
  });
  if (!ok) {
    return NextResponse.json(
      { error: "Payment signature did not verify." },
      { status: 400 }
    );
  }

  const sb = supabaseService();

  // Fetch assessment + child + parent for email.
  const { data: a } = await sb
    .from("assessments")
    .select(
      "id, razorpay_order_id, magic_link_token, child_id, children(first_name, user_id, users:user_id(name, email))"
    )
    .eq("id", input.assessmentId)
    .maybeSingle();

  if (!a) {
    return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
  }
  if (a.razorpay_order_id !== input.razorpay_order_id) {
    return NextResponse.json(
      { error: "Order id mismatch." },
      { status: 400 }
    );
  }

  // Mark as paid. Status remains 'pending' until the child starts.
  await sb
    .from("assessments")
    .update({ razorpay_payment_id: input.razorpay_payment_id })
    .eq("id", input.assessmentId);

  // Send the magic assessment link to the parent.
  // @ts-ignore nested relation typings
  const parent = a.children?.users;
  // @ts-ignore
  const childFirstName = a.children?.first_name ?? "your child";
  const parentName = parent?.name ?? "there";
  const parentEmail = parent?.email;

  if (parentEmail) {
    const assessmentUrl = `${env.appUrl()}/assessment/${a.magic_link_token}`;
    const tpl = assessmentLinkEmail({
      parentName,
      childFirstName,
      assessmentUrl,
    });
    try {
      await sendEmail({ to: parentEmail, ...tpl });
    } catch (e) {
      // Don't fail payment verification on email failure; log for retry later.
      console.error("[verify] email send failed:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
