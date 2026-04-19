import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hunch: {
          ink: "#15140F",
          paper: "#F4F1EA",
          card: "#FBF9F4",
          accent: "#1B3A2F",      // deep forest — trust, warmth, "pediatrician notes"
          accentSoft: "#E7DFD0",  // warm sand for chips/cards
          warm: "#C45A3A",        // terracotta — used very sparingly
          muted: "#6B6657",
          line: "rgba(21, 20, 15, 0.08)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
} satisfies Config;
