import Link from "next/link";
import { Nav, Footer } from "@/components/SiteChrome";

export default function AboutPage() {
  return (
    <div className="bg-canvas min-h-screen relative overflow-hidden">
      <div className="grain absolute inset-0" aria-hidden />
      <Nav />
      <Hero />
      <FineAtWhat />
      <WhyNowMatters />
      <WhatHonestLooksLike />
      <WhoWeAre />
      <ClosingCTA />
      <Footer />
    </div>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="relative z-10 mx-auto max-w-5xl px-6 pt-20 pb-16 md:pt-28 md:pb-20">
      <div className="inline-flex items-center gap-2 rounded-full border border-hunch-ink/10 bg-hunch-card px-3 py-1 text-xs text-hunch-muted">
        <span className="w-1.5 h-1.5 rounded-full bg-hunch-warm" />
        Why Hunch exists
      </div>
      <h1 className="headline text-[44px] md:text-[72px] mt-6 leading-[1.02] max-w-[20ch]">
        Your child is doing fine.
        <br />
        <span className="serif-i text-hunch-accent">Fine at what, exactly?</span>
      </h1>
      <p className="mt-8 text-lg md:text-xl text-hunch-ink/75 leading-relaxed max-w-[60ch]">
        School reports summarise. Tuition fees reward. Neither of them tells
        you what your child actually understands — or where the quiet gaps
        are that will start to matter in two years.
      </p>
      <p className="mt-4 text-lg md:text-xl text-hunch-ink/75 leading-relaxed max-w-[60ch]">
        Hunch is a one-time, independent checkup that fills that gap.
      </p>
    </section>
  );
}

/* ---------- The problem: Fine at what? ---------- */

function FineAtWhat() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 py-16 md:py-24 border-t border-hunch-line">
      <div className="grid md:grid-cols-12 gap-10">
        <div className="md:col-span-4">
          <div className="text-xs uppercase tracking-widest text-hunch-muted">
            The gap parents don&apos;t see
          </div>
          <h2 className="headline text-3xl md:text-5xl mt-3 leading-[1.05]">
            A grade isn&apos;t <span className="serif-i text-hunch-accent">a diagnosis.</span>
          </h2>
          <p className="mt-6 text-hunch-ink/70 leading-relaxed max-w-sm">
            Three patterns we see over and over. If any of these feel
            familiar, you&apos;re the reason we built this.
          </p>
        </div>

        <div className="md:col-span-8 space-y-5">
          <Vignette
            score="18/20"
            title="Rohan aced his fractions test."
            body="When asked to explain, he says: &ldquo;I just add the top numbers and keep the bottom the same.&rdquo; He&apos;s been rewarded for a procedure he doesn&apos;t understand. This will not survive Class 7."
          />
          <Vignette
            score="Top of class"
            title="Anika flies through arithmetic."
            body="She freezes on any word problem longer than two sentences. Her tuition teacher says: &ldquo;she just needs more practice.&rdquo; That&apos;s a symptom, not a diagnosis."
          />
          <Vignette
            score="Was the smart one"
            title="Ishaan is suddenly falling behind."
            body="He was the strong one in Class 6. Then Class 8 algebra hit and nothing makes sense to him. The gap was there in Class 5 — decimals, ratios, something small. Nobody looked, because nobody had a reason to."
          />
        </div>
      </div>
    </section>
  );
}

function Vignette({
  score,
  title,
  body,
}: {
  score: string;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-2xl border border-hunch-line bg-hunch-card p-6 md:p-7 flex flex-col md:flex-row gap-6">
      <div className="md:w-40 shrink-0">
        <div className="text-[10px] uppercase tracking-widest text-hunch-muted">
          On paper
        </div>
        <div className="headline text-2xl md:text-3xl mt-2 text-hunch-accent">
          {score}
        </div>
      </div>
      <div className="flex-1">
        <div className="font-medium tracking-tight text-[17px]">{title}</div>
        <p
          className="mt-2 text-[15px] text-hunch-ink/75 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </div>
    </article>
  );
}

/* ---------- Why Class 5–6 specifically ---------- */

function WhyNowMatters() {
  return (
    <section className="relative z-10 border-t border-hunch-line">
      <div className="bg-hunch-accent/[0.04]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28 grid md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-5">
            <div className="text-xs uppercase tracking-widest text-hunch-accent">
              Why this age, why now
            </div>
            <h2 className="headline text-3xl md:text-5xl mt-3 leading-[1.05]">
              Class 5 and 6 is the <span className="serif-i">last quiet moment</span> in math.
            </h2>
          </div>
          <div className="md:col-span-7 space-y-6 text-[16px] text-hunch-ink/80 leading-relaxed">
            <p>
              This is when math starts to abstract. Whole numbers become
              fractions, fractions become decimals, decimals become ratios.
              The jump from &ldquo;how many apples&rdquo; to &ldquo;3/4 of an
              apple&rdquo; sounds small. It isn&apos;t.
            </p>
            <p>
              This is also the age where the gap first opens between{" "}
              <span className="serif-i text-hunch-accent">
                can follow the procedure
              </span>{" "}
              and{" "}
              <span className="serif-i text-hunch-accent">
                understands the concept
              </span>
              . A child who can follow procedures looks fine on tests for
              another year or two. Then algebra arrives and the scaffolding
              collapses.
            </p>
            <p>
              By Class 8, these gaps are buried under newer material and
              painful to unwind — tutors, lost confidence, sometimes a
              permanent dislike of math. Catching them in Class 5 or 6 takes
              an hour and a report. Catching them in Class 9 takes a year.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-5 pt-6 border-t border-hunch-accent/20">
              <TimelineStat when="Class 5–6" what="One hour to catch a gap" tone="good" />
              <TimelineStat when="Class 7–8" what="A term of catching up" tone="warn" />
              <TimelineStat when="Class 9+" what="A year of remediation" tone="alert" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineStat({
  when,
  what,
  tone,
}: {
  when: string;
  what: string;
  tone: "good" | "warn" | "alert";
}) {
  const color = {
    good: "text-hunch-accent",
    warn: "text-amber-700",
    alert: "text-hunch-warm",
  }[tone];
  return (
    <div>
      <div className={`text-[11px] uppercase tracking-widest font-medium ${color}`}>
        {when}
      </div>
      <div className="mt-1 text-sm text-hunch-ink/75">{what}</div>
    </div>
  );
}

/* ---------- What an honest checkup looks like ---------- */

function WhatHonestLooksLike() {
  const pillars = [
    {
      label: "Independent",
      title: "We don&apos;t sell what comes next.",
      body: "No tuition upsell. No coaching package. If your child needs a tutor, we&apos;ll tell you — and then point you at NCERT or free resources. Our only product is the diagnostic itself.",
    },
    {
      label: "Specific",
      title: "Misconceptions, not percentiles.",
      body: "&ldquo;75th percentile&rdquo; tells you nothing useful. &ldquo;Your child is treating fractions as two separate numbers&rdquo; tells you exactly what to work on. Every report is about your child&apos;s actual thinking, not a leaderboard.",
    },
    {
      label: "Human-reviewed",
      title: "An educator signs every report.",
      body: "An AI drafts the analysis — fast, thorough, unflinching. Then a real educator reads every word, edits, and signs. The AI does the homework; the human makes the call.",
    },
  ];
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-28 border-t border-hunch-line">
      <div className="text-xs uppercase tracking-widest text-hunch-muted">
        What makes this different
      </div>
      <h2 className="headline text-3xl md:text-5xl mt-3 max-w-3xl leading-[1.05]">
        What an honest checkup <span className="serif-i text-hunch-accent">looks like.</span>
      </h2>

      <div className="mt-12 grid md:grid-cols-3 gap-5">
        {pillars.map((p) => (
          <div
            key={p.label}
            className="rounded-2xl border border-hunch-line bg-hunch-card p-6 md:p-7 relative overflow-hidden"
          >
            <div className="text-[10px] uppercase tracking-widest text-hunch-muted">
              {p.label}
            </div>
            <h3
              className="font-medium tracking-tight text-[18px] mt-2"
              dangerouslySetInnerHTML={{ __html: p.title }}
            />
            <p
              className="mt-3 text-[15px] text-hunch-ink/70 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: p.body }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Who we are ---------- */

function WhoWeAre() {
  return (
    <section className="relative z-10 mx-auto max-w-4xl px-6 py-20 md:py-28 border-t border-hunch-line">
      <div className="text-xs uppercase tracking-widest text-hunch-muted">
        Who we are
      </div>
      <h2 className="headline text-3xl md:text-5xl mt-3 leading-[1.05]">
        Why we built <span className="serif-i text-hunch-accent">Hunch.</span>
      </h2>
      <div className="mt-8 space-y-5 text-[17px] text-hunch-ink/80 leading-relaxed">
        <p>
          We&apos;re a small team at Nurturing Labs. We kept meeting parents
          who knew something was slightly off with their child&apos;s math —
          a test score that looked fine, but an instinct that didn&apos;t —
          and had no way to check.
        </p>
        <p>
          There wasn&apos;t a service they could buy that gave them an
          expert, neutral read. Schools are busy. Tuition centres are
          biased. Online practice apps rank your child; they don&apos;t
          understand them. So we built the thing we wished existed: an
          independent diagnostic, priced for one-time use, reviewed by a
          real educator, with a conversation at the end.
        </p>
        <p>
          Not a subscription. Not a tutoring funnel. A checkup.
        </p>
      </div>
    </section>
  );
}

/* ---------- Closing CTA ---------- */

function ClosingCTA() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-24">
      <div className="rounded-3xl bg-hunch-ink text-hunch-paper p-8 md:p-14 grid md:grid-cols-12 gap-8 items-center overflow-hidden relative">
        <div
          aria-hidden
          className="absolute -left-20 -bottom-20 w-[420px] h-[420px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(27, 58, 47, 0.5), transparent 60%)",
          }}
        />
        <div className="md:col-span-7 relative">
          <h2 className="headline text-3xl md:text-5xl leading-[1.05]">
            Get a real read on where <span className="serif-i">your child stands.</span>
          </h2>
          <p className="mt-4 text-hunch-paper/75 max-w-md leading-relaxed">
            One hour. One report. One conversation. ₹1,999, once.
          </p>
        </div>
        <div className="md:col-span-5 relative">
          <Link
            href="/signup"
            className="block rounded-2xl bg-hunch-paper text-hunch-ink px-6 py-5 text-center text-base font-medium hover:bg-white transition"
          >
            Book the assessment →
          </Link>
          <Link
            href="/#how"
            className="mt-3 block text-center text-sm text-hunch-paper/60 hover:text-hunch-paper"
          >
            or see how it works
          </Link>
        </div>
      </div>
    </section>
  );
}
