import { ResearchQuestionCandidate } from "./types.js";

const whitespacePattern = /\s+/g;

export const normalizeQuestion = (value: string): string => value.trim().toLowerCase().replace(whitespacePattern, " ");

export const deduplicateQuestions = (
  candidates: readonly ResearchQuestionCandidate[],
  existing: ReadonlySet<string>,
): ResearchQuestionCandidate[] => {
  const seen = new Set(existing);
  const unique: ResearchQuestionCandidate[] = [];

  candidates.forEach((candidate) => {
    const normalized = normalizeQuestion(candidate.question);
    if (seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    unique.push(candidate);
  });

  return unique;
};
