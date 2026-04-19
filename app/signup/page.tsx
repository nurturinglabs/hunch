import SignupForm from "./SignupForm";

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <a href="/" className="text-sm text-hunch-muted hover:underline">
        ← Back
      </a>
      <h1 className="mt-6 font-serif text-3xl">Book an assessment</h1>
      <p className="mt-2 text-hunch-muted">
        One-time ₹{process.env.ASSESSMENT_PRICE_INR || "1,999"}. Includes test +
        written report + 30-min video consultation.
      </p>
      <div className="mt-8">
        <SignupForm />
      </div>
    </main>
  );
}
