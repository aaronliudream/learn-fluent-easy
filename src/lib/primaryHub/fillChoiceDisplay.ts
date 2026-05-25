export type FillChoiceGlueOptions = {
  wordsBefore?: number;
  wordsAfter?: number;
};

export type FillChoiceGlueParts = {
  outerBefore: string;
  glueBefore: string;
  glueAfter: string;
  outerAfter: string;
  blankToken: string;
};

/** Pull last N whitespace-delimited tokens from text (lead keeps trailing space). */
export function peelTrailingWordTokens(text: string, count: number): { lead: string; tail: string } {
  if (count <= 0 || !text.trim()) return { lead: text, tail: "" };
  const re = new RegExp(`^(.*?)(?:\\s+(${Array(count).fill("\\S+").join("\\s+")}))\\s*$`);
  const match = text.trimEnd().match(re);
  if (!match) return { lead: "", tail: text.trimEnd() };
  const lead = match[1] ?? "";
  const tail = match[2] ?? "";
  return { lead: lead.length > 0 ? `${lead} ` : "", tail: `${tail} ` };
}

/** Pull first N tokens from after-blank segment (after may start with spaces). */
export function peelLeadingWordTokens(text: string, count: number): { head: string; rest: string } {
  if (count <= 0) return { head: "", rest: text };
  const trimmed = text.trimStart();
  const tokens = trimmed.match(/\S+/g) ?? [];
  if (tokens.length === 0) return { head: "", rest: text };
  const take = Math.min(count, tokens.length);
  const headStr = tokens.slice(0, take).join(" ");
  const rest = trimmed.slice(trimmed.indexOf(headStr) + headStr.length);
  return {
    head: ` ${headStr}`,
    rest: rest.length > 0 ? (rest.startsWith(" ") ? rest : ` ${rest}`) : "",
  };
}

/** After sentence-ending punctuation, do not pull the last word into the nowrap group. */
export function resolveGlueWordsBefore(before: string, requested: number): number {
  if (requested <= 0) return 0;
  if (/\.\s*$/.test(before) || /\?\s*$/.test(before) || /!\s*$/.test(before)) return 0;
  if (/:\s*$/.test(before)) return Math.max(requested, 2);
  return requested;
}

export function buildFillChoiceGlueParts(
  before: string,
  after: string,
  token: string,
  opts: FillChoiceGlueOptions = {},
): FillChoiceGlueParts {
  const requestedBefore = opts.wordsBefore ?? 1;
  const wordsBefore = resolveGlueWordsBefore(before, requestedBefore);
  const wordsAfter = opts.wordsAfter ?? 2;
  const { lead, tail: glueBefore } = peelTrailingWordTokens(before, wordsBefore);
  const { head: glueAfter, rest: outerAfter } = peelLeadingWordTokens(after, wordsAfter);
  return {
    outerBefore: lead,
    glueBefore,
    glueAfter,
    outerAfter,
    blankToken: token,
  };
}
