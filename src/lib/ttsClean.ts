/**
 * cleanForTTS — strip dialogue speaker labels before sending text to TTS.
 *
 * WHY: listening transcripts store speaker labels ("A:", "M:", "Molly:") so the
 * displayed "查看原文" shows who speaks. But the TTS engine reads those labels
 * aloud as letters ("A", "em", "Molly colon"), which sounds wrong. We strip them
 * ONLY on the way into TTS; the stored transcript keeps its labels for display.
 *
 * DESIGN (方案B：去标签 + 留停顿):
 *   - Remove a speaker label = a short Capitalized token (1–6 letters) directly
 *     after a TURN BOUNDARY, immediately followed by ":" + space(s) + an
 *     utterance that starts with a capital/quote.
 *   - Turn boundary = string start | newline(s) | sentence end (. ? !) + space |
 *     a question-number marker (e.g. "6. " / "1. ").
 *   - The boundary itself is PRESERVED (so the sentence-ending punctuation /
 *     number stays → the voice still pauses between turns, and question numbers
 *     like "Number 1." remain for exam realism).
 *
 * SAFETY (must not touch normal prose):
 *   - Token must be Capitalized → "He said: hello" / "one rule: be quiet" never
 *     match (verb/noun is lowercase).
 *   - Token must sit right after a boundary AND the label token is the single
 *     token immediately before the colon → "The Bible: A book" doesn't match
 *     ("The" has no colon; "Bible" isn't at a boundary).
 *   - Utterance must start Capital/quote → "Note: bring a pen" (lowercase) is
 *     left intact.
 *   - For label-free text the regex never matches → returns the SAME string →
 *     identical TTS hash → existing audio cache is fully preserved (no-op).
 *   - Idempotent: cleanForTTS(cleanForTTS(x)) === cleanForTTS(x).
 *
 * Known minor edge (rare, acceptable): a real sentence like "Note: Bring a pen."
 * at a boundary with a Capitalized first word would drop "Note:". Listening
 * transcripts don't use that construction; reviewed case-by-case.
 */
const SPEAKER_LABEL =
  /(^|[\r\n]+|[.?!]["'’)\]]?[ \t]+|\b\d{1,2}\.[ \t]+)([A-Z][a-zA-Z]{0,5}):[ \t]+(?=["'“‘A-Z])/g;

export function cleanForTTS(text: string): string {
  if (!text) return text;
  // Replace label with just its preserved boundary; run twice for back-to-back
  // turns that share a boundary char (idempotent, so a 2nd pass is safe/no-op).
  const once = text.replace(SPEAKER_LABEL, "$1");
  const twice = once.replace(SPEAKER_LABEL, "$1");
  return twice;
}
