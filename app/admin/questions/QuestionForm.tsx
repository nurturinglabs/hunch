"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TOPICS, TOPIC_LABELS } from "@/lib/topics";

type FormShape = {
  id: string;
  topic: (typeof TOPICS)[number];
  sub_topic: string;
  grade_level: "5" | "6" | "both";
  difficulty: "easy" | "medium" | "hard";
  cognitive_skill: "recall" | "application" | "reasoning";
  question_text: string;
  options: [string, string, string, string];
  correct_answer: "A" | "B" | "C" | "D";
  wrong_answer_diagnostics: { A: string; B: string; C: string; D: string };
  requires_explanation: boolean;
  expected_time_seconds: number;
  active: boolean;
};

const empty: FormShape = {
  id: "",
  topic: "number_sense",
  sub_topic: "",
  grade_level: "both",
  difficulty: "medium",
  cognitive_skill: "application",
  question_text: "",
  options: ["", "", "", ""],
  correct_answer: "A",
  wrong_answer_diagnostics: { A: "", B: "", C: "", D: "" },
  requires_explanation: false,
  expected_time_seconds: 60,
  active: true,
};

export default function QuestionForm(props: {
  mode: "create" | "edit";
  initial?: any;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormShape>(
    props.initial
      ? {
          ...empty,
          ...props.initial,
          options: (props.initial.options as string[]).slice(0, 4) as any,
          wrong_answer_diagnostics: {
            ...empty.wrong_answer_diagnostics,
            ...(props.initial.wrong_answer_diagnostics || {}),
          },
        }
      : empty
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function set<K extends keyof FormShape>(k: K, v: FormShape[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: props.mode, question: form }),
      });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error || "Save failed.");
      router.push("/admin/questions");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">ID (unique)</label>
          <input
            disabled={props.mode === "edit"}
            value={form.id}
            onChange={(e) => set("id", e.target.value)}
            className="w-full border border-hunch-ink/15 rounded-lg px-3 py-2 disabled:bg-gray-50"
            placeholder="e.g. frac-eq-001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sub-topic</label>
          <input
            value={form.sub_topic}
            onChange={(e) => set("sub_topic", e.target.value)}
            className="w-full border border-hunch-ink/15 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Topic</label>
          <select
            value={form.topic}
            onChange={(e) => set("topic", e.target.value as any)}
            className="w-full border border-hunch-ink/15 rounded-lg px-3 py-2 bg-white"
          >
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {TOPIC_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Grade</label>
          <select
            value={form.grade_level}
            onChange={(e) => set("grade_level", e.target.value as any)}
            className="w-full border border-hunch-ink/15 rounded-lg px-3 py-2 bg-white"
          >
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="both">both</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <select
            value={form.difficulty}
            onChange={(e) => set("difficulty", e.target.value as any)}
            className="w-full border border-hunch-ink/15 rounded-lg px-3 py-2 bg-white"
          >
            <option>easy</option>
            <option>medium</option>
            <option>hard</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Skill</label>
          <select
            value={form.cognitive_skill}
            onChange={(e) => set("cognitive_skill", e.target.value as any)}
            className="w-full border border-hunch-ink/15 rounded-lg px-3 py-2 bg-white"
          >
            <option>recall</option>
            <option>application</option>
            <option>reasoning</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Question text</label>
        <textarea
          value={form.question_text}
          onChange={(e) => set("question_text", e.target.value)}
          className="w-full border border-hunch-ink/15 rounded-lg px-3 py-2 min-h-[80px]"
        />
      </div>

      {(["A", "B", "C", "D"] as const).map((letter, i) => (
        <div key={letter} className="grid grid-cols-12 gap-3 items-start">
          <div className="col-span-1 text-center pt-2">
            <input
              type="radio"
              checked={form.correct_answer === letter}
              onChange={() => set("correct_answer", letter)}
              title="Correct answer"
            />
            <div className="text-xs text-hunch-muted mt-1">{letter}</div>
          </div>
          <div className="col-span-5">
            <label className="block text-xs text-hunch-muted mb-1">Option {letter}</label>
            <input
              value={form.options[i]}
              onChange={(e) => {
                const next = [...form.options] as FormShape["options"];
                next[i] = e.target.value;
                set("options", next);
              }}
              className="w-full border border-hunch-ink/15 rounded-lg px-3 py-2"
            />
          </div>
          <div className="col-span-6">
            <label className="block text-xs text-hunch-muted mb-1">
              Diagnostic if chosen
            </label>
            <input
              value={form.wrong_answer_diagnostics[letter]}
              onChange={(e) =>
                set("wrong_answer_diagnostics", {
                  ...form.wrong_answer_diagnostics,
                  [letter]: e.target.value,
                })
              }
              className="w-full border border-hunch-ink/15 rounded-lg px-3 py-2"
              placeholder="e.g. Confuses adding numerators with adding denominators."
            />
          </div>
        </div>
      ))}

      <div className="grid grid-cols-3 gap-4">
        <label className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            checked={form.requires_explanation}
            onChange={(e) => set("requires_explanation", e.target.checked)}
          />
          Requires explanation
        </label>
        <div>
          <label className="block text-sm font-medium mb-1">Expected time (s)</label>
          <input
            type="number"
            value={form.expected_time_seconds}
            onChange={(e) =>
              set("expected_time_seconds", parseInt(e.target.value || "60"))
            }
            className="w-full border border-hunch-ink/15 rounded-lg px-3 py-2"
          />
        </div>
        <label className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => set("active", e.target.checked)}
          />
          Active
        </label>
      </div>

      {err && <div className="text-sm text-red-700">{err}</div>}

      <button
        onClick={save}
        disabled={busy || !form.id || !form.question_text || form.options.some((o) => !o)}
        className="bg-hunch-accent text-white rounded-lg px-5 py-2 disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save question"}
      </button>
    </div>
  );
}
