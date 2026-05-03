// src/question/QuestionEngine.ts
/**
 * Core question engine for Grisu Arena.
 * Provides type definitions and a lightweight runtime for handling
 * different question types (multiple‑choice, fill‑in, matching, etc.).
 */

export type QuestionBase = {
  id: string;
  type: string; // e.g. 'mcq' | 'fill' | 'match'
  prompt: string;
  tags?: string[];
};

export type MCQOption = {
  label: string;
  value: string;
  correct: boolean;
};

export type MCQQuestion = QuestionBase & {
  type: 'mcq';
  options: MCQOption[];
};

export type FillQuestion = QuestionBase & {
  type: 'fill';
  answer: string; // exact answer (case‑insensitive)
};

export type MatchPair = { left: string; right: string };
export type MatchQuestion = QuestionBase & {
  type: 'match';
  pairs: MatchPair[]; // left/right items to be matched
};

export type Question = MCQQuestion | FillQuestion | MatchQuestion;

export type Answer = {
  questionId: string;
  // raw answer format depends on question type
  // for MCQ: string (option value)
  // for Fill: string
  // for Match: { left: string; right: string }[]
  payload: any;
};

export type QuestionResult = {
  questionId: string;
  correct: boolean;
  score: number; // 0 or 1 (expandable later)
};

/**
 * Simple engine that evaluates a list of answers against a list of questions.
 * Returns an array of QuestionResult objects.
 */
export function evaluateAnswers(
  questions: Question[],
  answers: Answer[],
): QuestionResult[] {
  const results: QuestionResult[] = [];
  const qMap = new Map(questions.map(q => [q.id, q] as [string, Question]));

  for (const ans of answers) {
    const q = qMap.get(ans.questionId);
    if (!q) continue;
    let correct = false;
    switch (q.type) {
      case 'mcq': {
        const opt = (q as MCQQuestion).options.find(o => o.value === ans.payload);
        correct = !!opt?.correct;
        break;
      }
      case 'fill': {
        const expected = (q as FillQuestion).answer.trim().toLowerCase();
        const provided = String(ans.payload).trim().toLowerCase();
        correct = expected === provided;
        break;
      }
      case 'match': {
        const pairs = (q as MatchQuestion).pairs;
        const provided = ans.payload as { left: string; right: string }[];
        // Simple strict match: every pair must exist
        correct = pairs.every(p =>
          provided.some(pr => pr.left === p.left && pr.right === p.right),
        );
        break;
      }
    }
    results.push({ questionId: ans.questionId, correct, score: correct ? 1 : 0 });
  }
  return results;
}

export default {
  evaluateAnswers,
};
