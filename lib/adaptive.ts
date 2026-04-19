// Adaptive logic per PRD §5.3 — deterministic, no LLM calls mid-test.
//   - Start each topic at MEDIUM difficulty.
//   - 2 correct in a row → escalate to HARD.
//   - 2 wrong in a row → de-escalate to EASY.
//   - Min 4, max 7 questions per topic.

import type { Topic } from "./topics";

export type Difficulty = "easy" | "medium" | "hard";

export type QuestionRow = {
  id: string;
  topic: Topic;
  sub_topic: string | null;
  grade_level: "5" | "6" | "both";
  difficulty: Difficulty;
  cognitive_skill: "recall" | "application" | "reasoning";
  question_text: string;
  question_image_url: string | null;
  options: string[];
  correct_answer: "A" | "B" | "C" | "D";
  wrong_answer_diagnostics: Record<string, string>;
  requires_explanation: boolean;
  expected_time_seconds: number;
};

export type TopicState = {
  topic: Topic;
  asked: string[]; // question ids
  correct: boolean[]; // per question, aligned with `asked`
  currentDifficulty: Difficulty;
  streakCorrect: number;
  streakWrong: number;
};

export const MIN_PER_TOPIC = 4;
export const MAX_PER_TOPIC = 7;

export function initTopicState(topic: Topic): TopicState {
  return {
    topic,
    asked: [],
    correct: [],
    currentDifficulty: "medium",
    streakCorrect: 0,
    streakWrong: 0,
  };
}

export function recordAnswer(state: TopicState, isCorrect: boolean): TopicState {
  const next = { ...state, correct: [...state.correct, isCorrect] };
  if (isCorrect) {
    next.streakCorrect = state.streakCorrect + 1;
    next.streakWrong = 0;
  } else {
    next.streakWrong = state.streakWrong + 1;
    next.streakCorrect = 0;
  }

  // Shift difficulty based on streaks.
  if (next.streakCorrect >= 2 && next.currentDifficulty !== "hard") {
    next.currentDifficulty = next.currentDifficulty === "easy" ? "medium" : "hard";
    next.streakCorrect = 0;
  } else if (next.streakWrong >= 2 && next.currentDifficulty !== "easy") {
    next.currentDifficulty = next.currentDifficulty === "hard" ? "medium" : "easy";
    next.streakWrong = 0;
  }
  return next;
}

// Decide whether to continue in this topic.
export function shouldContinue(state: TopicState, targetCount: number): boolean {
  const n = state.asked.length;
  if (n >= MAX_PER_TOPIC) return false;
  if (n < MIN_PER_TOPIC) return true;
  return n < targetCount;
}

// Pick the next question from the pool, preferring current difficulty,
// then any unasked question at an adjacent difficulty.
export function pickNextQuestion(
  state: TopicState,
  pool: QuestionRow[]
): QuestionRow | null {
  const asked = new Set(state.asked);
  const available = pool.filter((q) => !asked.has(q.id));
  if (available.length === 0) return null;

  const order: Difficulty[] =
    state.currentDifficulty === "medium"
      ? ["medium", "easy", "hard"]
      : state.currentDifficulty === "hard"
      ? ["hard", "medium", "easy"]
      : ["easy", "medium", "hard"];

  for (const d of order) {
    const match = available.filter((q) => q.difficulty === d);
    if (match.length > 0) {
      // Deterministic pick to keep tests reproducible.
      return match[0];
    }
  }
  return available[0];
}
