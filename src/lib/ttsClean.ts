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

/**
 * Textbook abbreviations (sb / sth / sb's / etc.) must be SPOKEN as full words —
 * TTS otherwise reads "sb" as the letters "S-B". Expansion happens ONLY on the way
 * into TTS (cleanForTTS), so on-screen vocab still shows "take sb's breath away"
 * while the audio says "take somebody's breath away".
 *
 * Order matters: possessives before bare forms. Every pattern is \b-guarded so it
 * never touches letters inside real words (USB, myths, sketch, etching …).
 * Map verified against a full scan of junior_vocab + grade7/8/9 vocab (forms found:
 * sb, sb's, sth, do sth, one's, oneself, etc.). one's/oneself read fine → left as-is.
 */
const SPEECH_ABBREV: Array<[RegExp, string]> = [
  [/\bsth['’]s\b/gi, "something's"],
  [/\bsb['’]s\b/gi, "somebody's"],
  [/\bsth\b/gi, "something"],
  [/\bsb\b/gi, "somebody"],
  [/\betc\b\.?/gi, "et cetera"],
];

export function expandSpeechAbbrev(text: string): string {
  if (!text) return text;
  let out = text;
  for (const [re, rep] of SPEECH_ABBREV) out = out.replace(re, rep);
  return out;
}

export function cleanForTTS(text: string): string {
  if (!text) return text;
  // Replace label with just its preserved boundary; run twice for back-to-back
  // turns that share a boundary char (idempotent, so a 2nd pass is safe/no-op).
  const once = text.replace(SPEAKER_LABEL, "$1");
  const twice = once.replace(SPEAKER_LABEL, "$1");
  // Expand textbook abbreviations so TTS speaks full words (display unaffected).
  return expandSpeechAbbrev(twice);
}
