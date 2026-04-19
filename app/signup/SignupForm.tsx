"use client";

import { useState } from "react";

type FormState = {
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  childFirstName: string;
  childGrade: "5" | "6" | "";
  childSchool: string;
  childBoard: string;
  parentConcerns: string;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SignupForm() {
  const [form, setForm] = useState<FormState>({
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    childFirstName: "",
    childGrade: "",
    childSchool: "",
    childBoard: "",
    parentConcerns: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function loadRazorpay(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    if (window.Razorpay) return true;
    return new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.childGrade) {
      setError("Please pick a class.");
      return;
    }
    setLoading(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Could not load payment system. Try again.");

      const r = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error || "Could not start payment.");

      const { orderId, amountPaise, keyId, assessmentId } = body;

      const rzp = new window.Razorpay({
        key: keyId,
        amount: amountPaise,
        currency: "INR",
        name: "Hunch",
        description: "Math assessment — Class " + form.childGrade,
        order_id: orderId,
        prefill: {
          name: form.parentName,
          email: form.parentEmail,
          contact: form.parentPhone,
        },
        theme: { color: "#2F5FEB" },
        handler: async (resp: any) => {
          const verify = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              assessmentId,
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            }),
          });
          if (verify.ok) {
            setSuccess(true);
          } else {
            const vb = await verify.json().catch(() => ({}));
            setError(vb.error || "Payment verification failed.");
          }
          setLoading(false);
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6">
        <h2 className="font-serif text-2xl text-green-900">You're booked.</h2>
        <p className="mt-2 text-green-900">
          We've sent the assessment link to{" "}
          <strong>{form.parentEmail}</strong>. Check your inbox (and spam). Have
          your child take the test on a laptop or tablet within the next week.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field
        label="Your name"
        value={form.parentName}
        onChange={(v) => update("parentName", v)}
        required
      />
      <Field
        label="Your email"
        type="email"
        value={form.parentEmail}
        onChange={(v) => update("parentEmail", v)}
        required
      />
      <Field
        label="WhatsApp number"
        type="tel"
        value={form.parentPhone}
        onChange={(v) => update("parentPhone", v)}
        placeholder="+91 …"
        required
      />

      <hr className="border-hunch-ink/10" />

      <Field
        label="Child's first name"
        value={form.childFirstName}
        onChange={(v) => update("childFirstName", v)}
        required
      />

      <div>
        <label className="block text-sm font-medium mb-1">Child's class</label>
        <div className="flex gap-3">
          {(["5", "6"] as const).map((g) => (
            <button
              type="button"
              key={g}
              onClick={() => update("childGrade", g)}
              className={`px-4 py-2 rounded-lg border ${
                form.childGrade === g
                  ? "border-hunch-accent bg-hunch-accent text-white"
                  : "border-hunch-ink/15 bg-white"
              }`}
            >
              Class {g}
            </button>
          ))}
        </div>
      </div>

      <Field
        label="School (optional)"
        value={form.childSchool}
        onChange={(v) => update("childSchool", v)}
      />
      <div>
        <label className="block text-sm font-medium mb-1">Board (optional)</label>
        <select
          className="w-full border border-hunch-ink/15 rounded-lg px-3 py-2 bg-white"
          value={form.childBoard}
          onChange={(e) => update("childBoard", e.target.value)}
        >
          <option value="">—</option>
          <option>CBSE</option>
          <option>ICSE</option>
          <option>State</option>
          <option>IB</option>
          <option>Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Anything specific you'd like us to look at? (optional)
        </label>
        <textarea
          className="w-full border border-hunch-ink/15 rounded-lg px-3 py-2 min-h-[80px] bg-white"
          value={form.parentConcerns}
          onChange={(e) => update("parentConcerns", e.target.value)}
          placeholder="e.g. struggles with fractions, strong in mental math, slow with word problems…"
        />
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-hunch-accent text-white font-medium rounded-lg py-3 disabled:opacity-60"
      >
        {loading ? "Processing…" : "Pay ₹1,999 & get the link"}
      </button>

      <p className="text-xs text-hunch-muted text-center">
        Secure payment via Razorpay. One-time charge.
      </p>
    </form>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{props.label}</label>
      <input
        type={props.type || "text"}
        required={props.required}
        placeholder={props.placeholder}
        className="w-full border border-hunch-ink/15 rounded-lg px-3 py-2 bg-white"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
}
