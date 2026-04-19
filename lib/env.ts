function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

export const env = {
  supabaseUrl: () => required("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRole: () => required("SUPABASE_SERVICE_ROLE_KEY"),
  razorpayKeyId: () => required("NEXT_PUBLIC_RAZORPAY_KEY_ID"),
  razorpayKeySecret: () => required("RAZORPAY_KEY_SECRET"),
  razorpayWebhookSecret: () => optional("RAZORPAY_WEBHOOK_SECRET"),
  resendApiKey: () => required("RESEND_API_KEY"),
  resendFromEmail: () => required("RESEND_FROM_EMAIL"),
  anthropicApiKey: () => required("ANTHROPIC_API_KEY"),
  claudeModel: () => process.env.CLAUDE_MODEL || "claude-sonnet-4-6",
  calComLink: () => optional("NEXT_PUBLIC_CAL_COM_LINK"),
  adminEmail: () => required("ADMIN_EMAIL"),
  appUrl: () => process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  priceInr: () => parseInt(process.env.ASSESSMENT_PRICE_INR || "1999", 10),
};
