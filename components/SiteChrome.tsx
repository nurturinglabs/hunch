import Link from "next/link";

export function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="14" cy="14" r="13" stroke="#15140F" strokeWidth="1.5" />
      <path
        d="M9 18V10M19 18V10M9 14H19"
        stroke="#1B3A2F"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Nav() {
  return (
    <nav className="relative z-10 mx-auto max-w-6xl px-6 pt-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <Logo />
        <span className="font-medium tracking-tight text-[17px]">Hunch</span>
      </Link>
      <div className="hidden md:flex items-center gap-1 text-sm text-hunch-ink/70">
        <Link href="/about" className="px-3 py-2 hover:text-hunch-ink">
          About
        </Link>
        <Link href="/#how" className="px-3 py-2 hover:text-hunch-ink">
          How it works
        </Link>
        <Link href="/#what" className="px-3 py-2 hover:text-hunch-ink">
          What you get
        </Link>
        <Link href="/#faq" className="px-3 py-2 hover:text-hunch-ink">
          FAQ
        </Link>
      </div>
      <Link
        href="/signup"
        className="text-sm rounded-full border border-hunch-ink/15 bg-hunch-card px-4 py-2 hover:border-hunch-ink/30 transition"
      >
        Book →
      </Link>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-hunch-line">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm text-hunch-muted">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-hunch-ink font-medium">Hunch</span>
          <span>· Math assessments for Class 5 & 6</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/about" className="hover:text-hunch-ink">
            About
          </Link>
          <Link href="/signup" className="hover:text-hunch-ink">
            Book
          </Link>
          <a href="mailto:hello@hunch.in" className="hover:text-hunch-ink">
            hello@hunch.in
          </a>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
