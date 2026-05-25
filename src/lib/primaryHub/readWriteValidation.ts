import {
  countFillChoiceBlanks,
  FILL_CHOICE_BLANK_RE,
} from "./fillChoiceSentence";

export type LookWriteResult = "correct" | "punctuation" | "wrong";

export type FillChoiceSentenceValidation = {
  ok: boolean;
  blankCount: number;
  reason?: "missing_blank" | "multiple_blanks";
};

/** fill_choice must contain exactly one greedy blank token (3+ underscores). */
export function validateFillChoiceSentence(sentence: string): FillChoiceSentenceValidation {
  const blankCount = countFillChoiceBlanks(sentence);
  if (blankCount === 0) {
    return { ok: false, blankCount, reason: "missing_blank" };
  }
  if (blankCount > 1) {
    return { ok: false, blankCount, reason: "multiple_blanks" };
  }
  return { ok: true, blankCount };
}

export { FILL_CHOICE_BLANK_RE };

export function tokenizeWords(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function normalizeSpaces(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

/** Compare word tokens only (ignores punctuation and case). */
export function wordsMatch(user: string, answer: string): boolean {
  return tokenizeWords(user).join(" ") === tokenizeWords(answer).join(" ");
}

export function checkLookAndWrite(user: string, answer: string): LookWriteResult {
  if (!user.trim()) return "wrong";
  if (!wordsMatch(user, answer)) return "wrong";
  if (normalizeSpaces(user) === normalizeSpaces(answer)) return "correct";
  return "punctuation";
}

export function checkWordOrder(user: string, answer: string): boolean {
  return user === answer;
}

export function checkKeywords(user: string, keywords: string[]): boolean {
  const lower = user.toLowerCase();
  return keywords.every((k) => lower.includes(k.toLowerCase()));
}
