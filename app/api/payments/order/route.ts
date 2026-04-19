import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseService } from "@/lib/supabase/server";
import { createOrder } from "@/lib/razorpay";
import { newToken } from "@/lib/tokens";
import { env } from "@/lib/env";

const schema = z.object({
  parentName: z.string().trim().min(1),
  parentEmail: z.string().trim().email(),
  parentPhone: z.string().trim().min(6),
  childFirstName: z.string().trim().min(1),
  childGrade: z.enum(["5", "6"]),
  childSchool: z.string().trim().optional().default(""),
  childBoard: z.string().trim().optional().default(""),
  parentConcerns: z.string().trim().optional().default(""),
});

export async function POST(req: NextRequest) {
  let input: z.infer<typeof schema>;
  try {
    input = schema.parse(await req.json());
  } catch (e: any) {
    return NextResponse.json({ error: "Invalid form input." }, { status: 400 });
  }

  const sb = supabaseService();

  // Upsert parent user by email.
  const { data: existingUser } = await sb
    .from("users")
    .select("*")
    .eq("email", input.parentEmail)
    .maybeSingle();

  let userId: string;
  if (existingUser) {
    userId = existingUser.id;
    await sb
      .from("users")
      .update({ name: input.parentName, phone: input.parentPhone })
      .eq("id", userId);
  } else {
    const { data: created, error } = await sb
      .from("users")
      .insert({
        email: input.parentEmail,
        name: input.parentName,
        phone: input.parentPhone,
      })
      .select("id")
      .single();
    if (error || !created) {
      return NextResponse.json({ error: "Could not create user." }, { status: 500 });
    }
    userId = created.id;
  }

  // Create child.
  const { data: child, error: cErr } = await sb
    .from("children")
    .insert({
      user_id: userId,
      first_name: input.childFirstName,
      grade: input.childGrade,
      school: input.childSchool || null,
      board: input.childBoard || null,
      parent_concerns: input.parentConcerns || null,
    })
    .select("id")
    .single();
  if (cErr || !child) {
    return NextResponse.json({ error: "Could not create child." }, { status: 500 });
  }

  // Create pending assessment with a fresh magic-link token.
  const token = newToken();
  const priceInr = env.priceInr();
  const amountPaise = priceInr * 100;

  const { data: assessment, error: aErr } = await sb
    .from("assessments")
    .insert({
      child_id: child.id,
      magic_link_token: token,
      price_paid_inr: priceInr,
      status: "pending",
    })
    .select("id")
    .single();
  if (aErr || !assessment) {
    return NextResponse.json({ error: "Could not create assessment." }, { status: 500 });
  }

  // Create Razorpay order.
  try {
    const order = await createOrder({
      amountPaise,
      receipt: `hunch_${assessment.id.slice(0, 20)}`,
      notes: {
        assessment_id: assessment.id,
        child_first_name: input.childFirstName,
        grade: input.childGrade,
      },
    });

    await sb
      .from("assessments")
      .update({ razorpay_order_id: order.id })
      .eq("id", assessment.id);

    return NextResponse.json({
      orderId: order.id,
      amountPaise,
      keyId: env.razorpayKeyId(),
      assessmentId: assessment.id,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Payment provider error: " + (e.message || "unknown") },
      { status: 500 }
    );
  }
}
