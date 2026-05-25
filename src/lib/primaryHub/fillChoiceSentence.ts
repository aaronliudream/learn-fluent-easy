import { warnRegistryDev } from "./registryDiscovery";

/** Canonical blank token in readWrite JSON (docs). Legacy content may use `___`. */
export const FILL_CHOICE_BLANK = "____" as const;

/** Greedy: 3+ consecutive underscores count as one blank. */
export const FILL_CHOICE_BLANK_RE = /_{3,}/;

export type SplitFillChoiceSentence = {
  before: string;
  after: string;
  token: string;
  missingBlank: boolean;
};

export function countFillChoiceBlanks(sentence: string): number {
  const re = new RegExp(FILL_CHOICE_BLANK_RE.source, "g");
  return sentence.match(re)?.length ?? 0;
}

export function splitFillChoiceSentence(sentence: string): SplitFillChoiceSentence {
  const m = sentence.match(FILL_CHOICE_BLANK_RE);
  if (!m || m.index === undefined) {
    return {
      before: sentence,
      after: "",
      token: FILL_CHOICE_BLANK,
      missingBlank: true,
    };
  }
  return {
    before: sentence.slice(0, m.index),
    after: sentence.slice(m.index + m[0].length),
    token: m[0],
    missingBlank: false,
  };
}

export function warnFillChoiceQuestion(sentence: string, context: string): void {
  const count = countFillChoiceBlanks(sentence);
  if (count === 0) {
    warnRegistryDev(
      `readWrite: ${context} fill_choice sentence has no blank placeholder (expected ${FILL_CHOICE_BLANK_RE}).`,
    );
    return;
  }
  if (count > 1) {
    warnRegistryDev(
      `readWrite: ${context} fill_choice sentence has ${count} blank placeholders; only the first is rendered.`,
    );
  }
}
