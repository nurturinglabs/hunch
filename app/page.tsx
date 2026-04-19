import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-canvas min-h-screen relative overflow-hidden">
      <div className="grain absolute inset-0" aria-hidden />
      <Nav />
      <Hero />
      <NotPositioning />
      <HowItWorks />
      <WhatYouGet />
      <PricingCTA />
      <FAQ />
      <Footer />
    </div>
  );
}

/* ---------- Nav ---------- */

function Nav() {
  return (
    <nav className="relative z-10 mx-auto max-w-6xl px-6 pt-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <Logo />
        <span className="font-medium tracking-tight text-[17px]">Hunch</span>
      </Link>
      <div className="hidden md:flex items-center gap-1 text-sm text-hunch-ink/70">
        <a href="#how" className="px-3 py-2 hover:text-hunch-ink">How it works</a>
        <a href="#what" className="px-3 py-2 hover:text-hunch-ink">What you get</a>
        <a href="#faq" className="px-3 py-2 hover:text-hunch-ink">FAQ</a>
      </div>
      <Link href="/signup" className="text-sm rounded-full border border-hunch-ink/15 bg-hunch-card px-4 py-2 hover:border-hunch-ink/30 transition">
        Book →
      </Link>
    </nav>
  );
}

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="14" cy="14" r="13" stroke="#15140F" strokeWidth="1.5" />
      <path d="M9 18V10M19 18V10M9 14H19" stroke="#1B3A2F" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32 grid md:grid-cols-12 gap-10 items-start">
      <div className="md:col-span-7 animate-fade-up">
        <div className="inline-flex items-center gap-2 rounded-full border border-hunch-ink/10 bg-hunch-card px-3 py-1 text-xs text-hunch-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-hunch-warm" />
          For Indian parents · Class 5 & 6
        </div>
        <h1 className="headline text-[44px] md:text-[68px] mt-6 max-w-[18ch]">
          A learning checkup<br />
          for your child&apos;s <span className="serif-i text-hunch-accent">math.</span>
        </h1>
        <p className="mt-7 text-lg md:text-xl text-hunch-ink/75 max-w-[55ch] leading-relaxed">
          Forty minutes of an honest, adaptive diagnostic. A written report you can
          actually use. A real conversation with an educator.{" "}
          <span className="text-hunch-ink">Like a pediatrician visit — but for how they think.</span>
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link href="/signup" className="btn-primary">
            Book an assessment
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10m0 0L7 2m5 5L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <a href="#how" className="btn-ghost">See how it works</a>
        </div>

        <div className="mt-10 flex items-center gap-6 text-xs text-hunch-muted">
          <Stat n="40 min" l="At-home, on a tablet" />
          <span className="w-px h-8 bg-hunch-ink/10" />
          <Stat n="1–2 days" l="Written report turnaround" />
          <span className="w-px h-8 bg-hunch-ink/10" />
          <Stat n="₹1,999" l="One-time. No subscription." />
        </div>
      </div>

      <div className="md:col-span-5 md:pl-6 animate-fade-up" style={{ animationDelay: "120ms" }}>
        <ReportPreview />
      </div>
    </section>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-medium text-hunch-ink text-sm">{n}</div>
      <div className="mt-0.5">{l}</div>
    </div>
  );
}

function ReportPreview() {
  return (
    <div className="relative">
      <div className="absolute -top-3 -right-3 rounded-full bg-hunch-warm text-white text-[10px] tracking-widest uppercase px-3 py-1 rotate-3 shadow-sm">
        Sample report
      </div>
      <div className="preview-card rounded-2xl bg-hunch-card border border-hunch-line p-6 md:p-7">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-hunch-muted">
          <span>Hunch Report</span>
          <span>Class 6 · Diagnostic</span>
        </div>
        <h3 className="headline text-2xl mt-3">Rohan, 11</h3>
        <p className="text-[13px] text-hunch-muted mt-1">
          Prepared for Mr. & Mrs. Sharma · Reviewed by founder
        </p>

        <div className="mt-5 space-y-3 text-[13px]">
          <Row label="Number sense" v="Strong" tone="good" />
          <Row label="Operations & arithmetic" v="On track" tone="ok" />
          <Row label="Fractions & decimals" v="Developing" tone="warn" />
          <Row label="Ratio & percentages" v="Needs attention" tone="alert" />
          <Row label="Geometry & measurement" v="On track" tone="ok" />
          <Row label="Word problems" v="Developing" tone="warn" />
        </div>

        <div className="mt-6 rounded-lg bg-hunch-accent/[0.06] border border-hunch-accent/20 p-4">
          <div className="text-[11px] uppercase tracking-widest text-hunch-accent font-medium">
            Diagnostic insight
          </div>
          <p className="mt-2 text-[14px] leading-relaxed text-hunch-ink/85">
            Rohan got 4/6 fractions right, but his explanations show he&apos;s
            treating fractions as <span className="serif-i">two separate numbers</span>{" "}
            rather than parts of a whole. This will surface again in algebra
            next year.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, v, tone }: { label: string; v: string; tone: "good" | "ok" | "warn" | "alert" }) {
  const dot = {
    good: "bg-emerald-600",
    ok: "bg-hunch-accent",
    warn: "bg-amber-500",
    alert: "bg-hunch-warm",
  }[tone];
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <span className="text-hunch-ink/80">{label}</span>
      </div>
      <span className="text-hunch-ink font-medium">{v}</span>
    </div>
  );
}

/* ---------- "What this is not" ---------- */

function NotPositioning() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-28 border-t border-hunch-line">
      <div className="grid md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <div className="text-xs uppercase tracking-widest text-hunch-muted">
            What this isn&apos;t
          </div>
          <h2 className="headline text-3xl md:text-5xl mt-3">
            Not an app.<br />
            Not a tutor.<br />
            <span className="serif-i text-hunch-accent">A consultation.</span>
          </h2>
        </div>
        <div className="md:col-span-7 grid sm:grid-cols-2 gap-4">
          <Card title="Not a graded test" body="No marks, no rank, no parent-teacher report card. We&apos;re looking at how your child thinks, not what they scored." />
          <Card title="Not gamified practice" body="No streaks, no badges, no daily push notifications. Your child takes this once. The work happens after." />
          <Card title="Not generic advice" body="Every report is specific to your child&apos;s actual responses, including the explanations they wrote in their own words." />
          <Card title="Not algorithm-only" body="An AI drafts the analysis. A real educator reviews and signs off — and walks you through it on a 30-minute call." />
        </div>
      </div>
    </section>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-hunch-line bg-hunch-card p-5">
      <div className="font-medium tracking-tight">{title}</div>
      <p className="mt-2 text-sm text-hunch-ink/70 leading-relaxed">{body}</p>
    </div>
  );
}

/* ---------- How it works ---------- */

function HowItWorks() {
  const steps = [
    {
      n: "01",
      t: "Book online",
      b: "Quick form, one payment of ₹1,999. We email a unique assessment link to you.",
    },
    {
      n: "02",
      t: "Your child takes the test",
      b: "About 40 minutes on a laptop or tablet. Adaptive difficulty across six topic areas. They&apos;ll be asked to explain their thinking on a few questions.",
    },
    {
      n: "03",
      t: "AI drafts. Educator reviews.",
      b: "Within a day, our system drafts a detailed analysis. Our founder — an experienced educator — reviews, edits, and signs every report before it reaches you.",
    },
    {
      n: "04",
      t: "Read the report, then talk to us",
      b: "You get the full written report and book a 30-minute video call. We walk through what we found and what to do next.",
    },
  ];
  return (
    <section id="how" className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-28 border-t border-hunch-line">
      <div className="text-xs uppercase tracking-widest text-hunch-muted">
        How it works
      </div>
      <h2 className="headline text-3xl md:text-5xl mt-3 max-w-3xl">
        Four steps. About a week, end to end.
      </h2>
      <div className="mt-14 grid md:grid-cols-2 gap-x-12 gap-y-12">
        {steps.map((s) => (
          <div key={s.n} className="flex gap-5">
            <div className="numeral w-12 shrink-0">{s.n}</div>
            <div>
              <div className="font-medium tracking-tight text-lg">{s.t}</div>
              <p
                className="mt-2 text-[15px] text-hunch-ink/70 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: s.b }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- What you get ---------- */

function WhatYouGet() {
  return (
    <section id="what" className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-28 border-t border-hunch-line">
      <div className="grid md:grid-cols-12 gap-10 items-start">
        <div className="md:col-span-5">
          <div className="text-xs uppercase tracking-widest text-hunch-muted">
            What you get
          </div>
          <h2 className="headline text-3xl md:text-5xl mt-3">
            Specific. Honest. <span className="serif-i text-hunch-accent">Useful.</span>
          </h2>
          <p className="mt-6 text-hunch-ink/70 leading-relaxed">
            Most school feedback is too vague to act on. Most online tests just
            tell you a percentile. This is different — it tells you{" "}
            <em className="serif-i">why</em> your child got something wrong, and
            what to do about it.
          </p>
        </div>
        <div className="md:col-span-7 space-y-4">
          <Receipt
            title="A written report"
            items={[
              "Top 3 strengths and top 3 areas to work on",
              "Topic-by-topic breakdown across 6 math areas",
              "Specific misconceptions, in plain English",
              "Where your child stands vs Class 5/6 expectations",
              "A prioritised list of what to work on (and what not to)",
            ]}
          />
          <Receipt
            title="A 30-minute video call"
            items={[
              "Walk through the report with our educator",
              "Ask the questions you don't get to ask at school",
              "Get a clear, prioritised plan for the next 2–3 months",
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function Receipt({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-hunch-line bg-hunch-card p-6">
      <div className="font-medium tracking-tight">{title}</div>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li key={it} className="flex gap-3 text-[15px] text-hunch-ink/80">
            <span className="mt-2 w-1 h-1 rounded-full bg-hunch-accent shrink-0" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Pricing CTA ---------- */

function PricingCTA() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-28 border-t border-hunch-line">
      <div className="rounded-3xl bg-hunch-ink text-hunch-paper p-8 md:p-14 grid md:grid-cols-12 gap-8 items-center overflow-hidden relative">
        <div
          aria-hidden
          className="absolute -right-20 -top-20 w-[420px] h-[420px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(196,90,58,0.25), transparent 60%)",
          }}
        />
        <div className="md:col-span-7 relative">
          <div className="text-xs uppercase tracking-widest text-hunch-paper/60">
            One-time
          </div>
          <div className="headline text-5xl md:text-7xl mt-3">
            ₹1,999<span className="text-2xl text-hunch-paper/60 align-top ml-2">incl. all</span>
          </div>
          <p className="mt-5 text-hunch-paper/75 max-w-md leading-relaxed">
            Includes the assessment, written report reviewed by an educator,
            and a 30-minute video consultation. No subscription, no add-ons.
          </p>
        </div>
        <div className="md:col-span-5 relative">
          <Link
            href="/signup"
            className="block rounded-2xl bg-hunch-paper text-hunch-ink px-6 py-5 text-center text-base font-medium hover:bg-white transition"
          >
            Book your child&apos;s assessment →
          </Link>
          <p className="mt-3 text-xs text-hunch-paper/50 text-center">
            Secure payment via Razorpay · Refund if not useful
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */

function FAQ() {
  const items = [
    {
      tag: "Service",
      q: "Is this a tuition or coaching service?",
      a: "No. We give you one detailed diagnostic and a single consultation. We don't run ongoing classes. If we think your child needs a tutor, we'll say so — and we won't try to sell you one.",
    },
    {
      tag: "For your child",
      q: "Will the test stress my child out?",
      a: "We've designed it not to. There's no pass/fail, no time pressure, and the framing is explicit from the first screen: this is to understand how they think, not to grade them.",
    },
    {
      tag: "For your child",
      q: "Can my child take it on a phone?",
      a: "Technically yes, but we strongly recommend a laptop or tablet. The diagnostic is ~40 minutes of focused thinking — a small screen makes that harder than it needs to be.",
    },
    {
      tag: "Curriculum",
      q: "What boards does this work for?",
      a: "All of them. The questions test underlying math concepts (place value, fractions, ratio, geometry, word problems), not curriculum-specific facts. Works for CBSE, ICSE, State boards, and IB.",
    },
    {
      tag: "The report",
      q: "Who reviews the report?",
      a: "Our founder — an experienced math educator. Every report is read, edited, and signed off by a person before it reaches you. The AI drafts; the human decides.",
    },
    {
      tag: "The report",
      q: "When do I get the report?",
      a: "Within 1–2 days of your child completing the test. We'll email you the moment it's ready, along with a Cal.com link to book your 30-minute call.",
    },
  ];

  return (
    <section
      id="faq"
      className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-28 border-t border-hunch-line"
    >
      <div className="grid md:grid-cols-12 gap-10 md:gap-14">
        {/* LEFT: sticky heading + contact card */}
        <div className="md:col-span-4">
          <div className="md:sticky md:top-12">
            <div className="text-xs uppercase tracking-widest text-hunch-muted">
              FAQ
            </div>
            <h2 className="headline text-4xl md:text-5xl mt-3">
              Things parents{" "}
              <span className="serif-i text-hunch-accent">often ask.</span>
            </h2>
            <p className="mt-5 text-[15px] text-hunch-ink/70 leading-relaxed max-w-sm">
              The short version: this is one diagnostic, one report, one
              conversation. No ongoing commitments.
            </p>

            <div className="mt-8 rounded-2xl border border-hunch-line bg-hunch-card p-5 relative overflow-hidden">
              <div
                aria-hidden
                className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(27, 58, 47, 0.10), transparent 70%)",
                }}
              />
              <div className="relative">
                <div className="flex items-center gap-2 text-xs text-hunch-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-hunch-accent" />
                  Still wondering
                </div>
                <div className="font-medium tracking-tight mt-2 text-[17px]">
                  Ask us directly.
                </div>
                <p className="mt-1 text-sm text-hunch-ink/70 leading-relaxed">
                  We&apos;re a small team. Real reply, usually within a day.
                </p>
                <a
                  href="mailto:hello@hunch.in"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-hunch-accent group/email"
                >
                  hello@hunch.in
                  <span className="transition-transform group-hover/email:translate-x-0.5">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: questions as numbered cards */}
        <ul className="md:col-span-8 space-y-3">
          {items.map((it, i) => (
            <li key={it.q}>
              <details className="group rounded-2xl border border-hunch-line bg-hunch-card hover:border-hunch-ink/20 transition-colors open:border-hunch-ink/25 open:bg-white">
                <summary className="flex items-start gap-4 md:gap-6 p-5 md:p-6 list-none cursor-pointer select-none">
                  <span
                    className="font-serif text-2xl leading-none w-8 shrink-0 text-hunch-accent/50 group-open:text-hunch-accent transition-colors pt-0.5"
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-widest text-hunch-muted">
                      {it.tag}
                    </div>
                    <div className="mt-1 font-medium tracking-tight text-[17px] md:text-[18px] text-hunch-ink">
                      {it.q}
                    </div>
                  </div>
                  <span
                    className="shrink-0 mt-1 w-8 h-8 rounded-full border border-hunch-line flex items-center justify-center text-hunch-muted group-open:bg-hunch-ink group-open:text-hunch-paper group-open:border-hunch-ink transition-colors"
                    aria-hidden
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 11 11"
                      fill="none"
                      className="transition-transform duration-300 group-open:rotate-45"
                    >
                      <path
                        d="M5.5 1v9M1 5.5h9"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 md:px-6 pb-5 md:pb-6 pl-[60px] md:pl-[80px] -mt-1">
                  <p className="text-[15px] text-hunch-ink/75 leading-relaxed max-w-prose">
                    {it.a}
                  </p>
                </div>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

function Footer() {
  return (
    <footer className="relative z-10 border-t border-hunch-line">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm text-hunch-muted">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-hunch-ink font-medium">Hunch</span>
          <span>· Math assessments for Class 5 & 6</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/signup" className="hover:text-hunch-ink">Book</Link>
          <a href="mailto:hello@hunch.in" className="hover:text-hunch-ink">hello@hunch.in</a>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
