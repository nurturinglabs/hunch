import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "./env";

let _rzp: Razorpay | null = null;
export function razorpay() {
  if (_rzp) return _rzp;
  _rzp = new Razorpay({
    key_id: env.razorpayKeyId(),
    key_secret: env.razorpayKeySecret(),
  });
  return _rzp;
}

export async function createOrder(params: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const order = await razorpay().orders.create({
    amount: params.amountPaise,
    currency: "INR",
    receipt: params.receipt,
    notes: params.notes,
  });
  return order;
}

// Verify signature returned by Razorpay Checkout after a successful payment.
export function verifyCheckoutSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const expected = crypto
    .createHmac("sha256", env.razorpayKeySecret())
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return timingSafeEqual(expected, params.signature);
}

// Verify webhook signature (X-Razorpay-Signature header).
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = env.razorpayWebhookSecret();
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}
