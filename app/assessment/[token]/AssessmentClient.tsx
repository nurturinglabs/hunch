"use client";

import { useEffect, useMemo, useState } from "react";
import { TOPICS, TOPIC_LABELS, TOPIC_TARGET_COUNT, Topic } from "@/lib/topics";
import {
  initTopicState,
  pickNextQuestion,
  QuestionRow,
  recordAnswer,
  shouldContinue,
  TopicState,
} from "@/lib/adaptive";

type Stage =
  | "welcome"
  | "warmup"
  | "topic"
  | "between_topics"
  | "confidence"
  | "closing"
  | "submitting"
  | "done";

type ConfidenceMap = Partial<Record<Topic, "not_sure" | "kinda_sure" | "very_sure">>;

type AnswerRecord = {
  assessmentId: string;
  questionId: string;
  ordinal: number;
  selected: "A" | "B" | "C" | "D" | null;
  isCorrect: boolean;
  timeTakenSeconds: number;
  explanationText?: string;
};

export default function AssessmentClient(props: {
  token: string;
  assessmentId: string;
  childName: string;
  grade: "5" | "6";
}) {
  const { token, assessmentId, childName, grade } = props;

  const [stage, setStage] = useState<Stage>("welcome");
  const [nameConfirm, setNameConfirm] = useState(childName);

  const [pool, setPool] = useState<Record<Topic, QuestionRow[]>>({} as any);
  const [warmup, setWarmup] = useState<QuestionRow[]>([]);
  const [loadingPool, setLoadingPool] = useState(false);
  const [poolError, setPoolError] = useState<string | null>(null);

  const [topicIndex, setTopicIndex] = useState(0);
  const [topicStates, setTopicStates] = useState<Record<Topic, TopicState>>(
    TOPICS.reduce((acc, t) => {
      acc[t] = initTopicState(t);
      return acc;
    }, {} as Record<Topic, TopicState>)
  );

  const [currentQ, setCurrentQ] = useState<QuestionRow | null>(null);
  const [questionStartedAt, setQuestionStartedAt] = useState<number>(Date.now());
  const [selected, setSelected] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [showExplanationPrompt, setShowExplanationPrompt] = useState(false);
  const [pendingRecord, setPendingRecord] = useState<AnswerRecord | null>(null);

  const [ordinal, setOrdinal] = useState(1);
  const [confidence, setConfidence] = useState<ConfidenceMap>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch the question pool when the child starts the test.
  async function loadPool() {
    setLoadingPool(true);
    setPoolError(null);
    try {
      const r = await fetch(`/api/assessment/${token}/pool`);
      if (!r.ok) throw new Error("Could not load questions.");
      const body = await r.json();
      setPool(body.pool);
      setWarmup(body.warmup);
    } catch (e: any) {
      setPoolError(e.message);
    } finally {
      setLoadingPool(false);
    }
  }

  async function startAssessment() {
    await loadPool();
    await fetch(`/api/assessment/${token}/start`, { method: "POST" });
    setStage("warmup");
  }

  // ===== Warm-up (3 questions, non-scoring UX-wise, but we still record) =====
  const [warmupIdx, setWarmupIdx] = useState(0);
  const warmupQ = warmup[warmupIdx];

  useEffect(() => {
    if (stage === "warmup" && warmupQ) {
      setCurrentQ(warmupQ);
      setSelected(null);
      setExplanation("");
      setQuestionStartedAt(Date.now());
    }
  }, [stage, warmupIdx, warmupQ]);

  // ===== Main topic loop =====
  const topic = TOPICS[topicIndex];
  useEffect(() => {
    if (stage !== "topic") return;
    const pl = pool[topic] || [];
    const next = pickNextQuestion(topicStates[topic], pl);
    if (!next) {
      advanceTopic();
      return;
    }
    setCurrentQ(next);
    setSelected(null);
    setExplanation("");
    setQuestionStartedAt(Date.now());
  }, [stage, topicIndex, topicStates, pool]);

  function advanceTopic() {
    if (topicIndex + 1 < TOPICS.length) {
      setTopicIndex((i) => i + 1);
      setStage("between_topics");
    } else {
      setStage("confidence");
    }
  }

  async function postAnswer(rec: AnswerRecord) {
    try {
      await fetch(`/api/assessment/${token}/answer`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(rec),
      });
    } catch (e) {
      // Swallow; the child shouldn't see infra errors. Retry could be added later.
      console.error("answer post failed", e);
    }
  }

  async function onSubmitAnswer() {
    if (!currentQ || !selected) return;
    const timeTakenSeconds = Math.max(
      1,
      Math.round((Date.now() - questionStartedAt) / 1000)
    );
    const isCorrect = selected === currentQ.correct_answer;
    const rec: AnswerRecord = {
      assessmentId,
      questionId: currentQ.id,
      ordinal,
      selected,
      isCorrect,
      timeTakenSeconds,
    };

    // Warm-up: record and advance directly.
    if (stage === "warmup") {
      await postAnswer(rec);
      setOrdinal((o) => o + 1);
      if (warmupIdx + 1 < warmup.length) {
        setWarmupIdx((i) => i + 1);
      } else {
        setStage("topic");
      }
      return;
    }

    // Main topic: maybe prompt for explanation first.
    if (currentQ.requires_explanation) {
      setPendingRecord(rec);
      setShowExplanationPrompt(true);
      return;
    }

    await finalizeMainAnswer(rec);
  }

  async function finalizeMainAnswer(rec: AnswerRecord) {
    await postAnswer(rec);
    setOrdinal((o) => o + 1);
    const t = currentQ!.topic;
    setTopicStates((prev) => {
      const next = { ...prev, [t]: recordAnswer(prev[t], rec.isCorrect) };
      // Decide if topic continues.
      const continues = shouldContinue(next[t], TOPIC_TARGET_COUNT[t]);
      // Mark asked.
      next[t] = { ...next[t], asked: [...next[t].asked, rec.questionId] };
      if (!continues) {
        queueMicrotask(() => advanceTopic());
      }
      return next;
    });
    setShowExplanationPrompt(false);
    setPendingRecord(null);
  }

  async function onExplanationSubmit() {
    if (!pendingRecord) return;
    const withText: AnswerRecord = { ...pendingRecord, explanationText: explanation.trim() || undefined };
    await finalizeMainAnswer(withText);
  }

  async function onExplanationSkip() {
    if (!pendingRecord) return;
    await finalizeMainAnswer(pendingRecord);
  }

  // ===== Confidence ratings =====
  async function onSubmitConfidence() {
    setSubmitError(null);
    try {
      setStage("submitting");
      await fetch(`/api/assessment/${token}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ assessmentId, confidence }),
      });
      setStage("done");
    } catch (e: any) {
      setSubmitError(e.message || "Could not submit. Please try again.");
      setStage("confidence");
    }
  }

  // ============ UI ============

  if (stage === "welcome") {
    return (
      <Shell>
        <h1 className="font-serif text-3xl md:text-4xl">Hi{nameConfirm ? `, ${nameConfirm}` : ""}! 👋</h1>
        <p className="mt-4 text-lg leading-relaxed text-hunch-ink">
          This isn't a test that counts for school. We just want to understand
          what you know well and what we can help you with. Take your time —
          it should take about 40 minutes.
        </p>
        <div className="mt-8 bg-white border border-hunch-ink/10 rounded-xl p-5">
          <label className="block text-sm font-medium mb-1">
            Is this your name?
          </label>
          <input
            className="w-full border border-hunch-ink/15 rounded-lg px-3 py-2"
            value={nameConfirm}
            onChange={(e) => setNameConfirm(e.target.value)}
          />
        </div>
        {poolError && (
          <div className="mt-4 text-sm text-red-700">{poolError}</div>
        )}
        <button
          onClick={startAssessment}
          disabled={loadingPool || !nameConfirm.trim()}
          className="mt-8 bg-hunch-accent text-white font-medium rounded-lg px-6 py-3 disabled:opacity-60"
        >
          {loadingPool ? "Loading…" : "Ready — let's start"}
        </button>
      </Shell>
    );
  }

  if (stage === "warmup" && currentQ) {
    return (
      <Shell>
        <Stepper label={`Warm-up ${warmupIdx + 1} of ${warmup.length}`} />
        <QuestionCard
          q={currentQ}
          selected={selected}
          onSelect={setSelected}
        />
        <button
          onClick={onSubmitAnswer}
          disabled={!selected}
          className="mt-6 bg-hunch-accent text-white font-medium rounded-lg px-6 py-3 disabled:opacity-60"
        >
          Next →
        </button>
      </Shell>
    );
  }

  if (stage === "between_topics") {
    const prev = TOPICS[topicIndex - 1];
    return (
      <Shell>
        <div className="text-sm uppercase tracking-widest text-hunch-muted">
          Nice work
        </div>
        <h2 className="font-serif text-3xl mt-2">
          Done with {TOPIC_LABELS[prev]}.
        </h2>
        <p className="mt-4 text-hunch-muted">
          Next up: <strong>{TOPIC_LABELS[TOPICS[topicIndex]]}</strong>
        </p>
        <button
          onClick={() => setStage("topic")}
          className="mt-8 bg-hunch-accent text-white font-medium rounded-lg px-6 py-3"
        >
          Continue →
        </button>
      </Shell>
    );
  }

  if (stage === "topic" && currentQ) {
    const state = topicStates[topic];
    const totalSoFar = state.asked.length + 1;
    return (
      <Shell>
        <Stepper label={`${TOPIC_LABELS[topic]} — question ${totalSoFar}`} />
        {showExplanationPrompt ? (
          <div>
            <h2 className="font-serif text-2xl">
              Quick question before we move on.
            </h2>
            <p className="mt-2 text-hunch-muted">
              In one or two sentences, tell us how you solved this. (You can
              skip.)
            </p>
            <textarea
              className="mt-4 w-full border border-hunch-ink/15 rounded-lg px-3 py-2 min-h-[120px] bg-white"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Example: I added the numerators and kept the denominator the same…"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={onExplanationSubmit}
                className="bg-hunch-accent text-white font-medium rounded-lg px-6 py-3"
              >
                Continue →
              </button>
              <button
                onClick={onExplanationSkip}
                className="text-hunch-muted rounded-lg px-6 py-3"
              >
                Skip
              </button>
            </div>
          </div>
        ) : (
          <>
            <QuestionCard
              q={currentQ}
              selected={selected}
              onSelect={setSelected}
            />
            <button
              onClick={onSubmitAnswer}
              disabled={!selected}
              className="mt-6 bg-hunch-accent text-white font-medium rounded-lg px-6 py-3 disabled:opacity-60"
            >
              Submit →
            </button>
          </>
        )}
      </Shell>
    );
  }

  if (stage === "confidence") {
    return (
      <Shell>
        <h2 className="font-serif text-3xl">How did that feel?</h2>
        <p className="mt-2 text-hunch-muted">
          For each section, how confident did you feel?
        </p>
        <div className="mt-6 space-y-5">
          {TOPICS.map((t) => (
            <div key={t} className="border border-hunch-ink/10 rounded-xl p-4 bg-white">
              <div className="font-medium">{TOPIC_LABELS[t]}</div>
              <div className="mt-3 flex gap-2">
                {(
                  [
                    ["not_sure", "Not sure"],
                    ["kinda_sure", "Kinda sure"],
                    ["very_sure", "Very sure"],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() =>
                      setConfidence((c) => ({ ...c, [t]: val }))
                    }
                    className={`px-3 py-2 rounded-lg border text-sm ${
                      confidence[t] === val
                        ? "bg-hunch-accent text-white border-hunch-accent"
                        : "bg-white border-hunch-ink/15"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {submitError && <div className="mt-4 text-sm text-red-700">{submitError}</div>}
        <button
          onClick={onSubmitConfidence}
          disabled={Object.keys(confidence).length < TOPICS.length}
          className="mt-8 bg-hunch-accent text-white font-medium rounded-lg px-6 py-3 disabled:opacity-60"
        >
          Submit my test →
        </button>
      </Shell>
    );
  }

  if (stage === "submitting") {
    return (
      <Shell>
        <h2 className="font-serif text-3xl">Submitting…</h2>
      </Shell>
    );
  }

  if (stage === "done") {
    return (
      <Shell>
        <h1 className="font-serif text-4xl">All done! 🎉</h1>
        <p className="mt-4 text-lg">
          Thanks for taking this seriously. Your parent will get your report in
          1–2 days.
        </p>
        <p className="mt-2 text-hunch-muted">You can close this window now.</p>
      </Shell>
    );
  }

  // Fallback loading state
  return (
    <Shell>
      <div className="text-hunch-muted">Loading…</div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10 md:py-16">{children}</main>
  );
}

function Stepper({ label }: { label: string }) {
  return (
    <div className="text-xs uppercase tracking-widest text-hunch-muted mb-4">
      {label}
    </div>
  );
}

function QuestionCard(props: {
  q: QuestionRow;
  selected: "A" | "B" | "C" | "D" | null;
  onSelect: (a: "A" | "B" | "C" | "D") => void;
}) {
  const { q, selected, onSelect } = props;
  const labels: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];
  return (
    <div>
      <div className="bg-white border border-hunch-ink/10 rounded-xl p-5 md:p-6">
        <p className="text-lg leading-relaxed">{q.question_text}</p>
      </div>
      <div className="mt-4 space-y-2">
        {q.options.map((opt, i) => {
          const letter = labels[i];
          const isSel = selected === letter;
          return (
            <button
              key={letter}
              onClick={() => onSelect(letter)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                isSel
                  ? "border-hunch-accent bg-hunch-accent/5"
                  : "border-hunch-ink/15 bg-white hover:border-hunch-ink/30"
              }`}
            >
              <span className="inline-block w-6 font-medium text-hunch-muted">
                {letter}.
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
