import { loadSettings } from "@/lib/voice";

let lastSpoken = "";

export const clearAudioCache = () => {
  /* no-op: browser TTS has no cache to clear */
};

export const getLastSpoken = () => lastSpoken;

// Quality scoring: prefer high-naturalness voices (Siri / Neural / Enhanced / Premium).
// On iOS these names map to the downloadable "Enhanced" / "Siri" voices that sound near-human.
const qualityScore = (v: SpeechSynthesisVoice): number => {
  const n = v.name.toLowerCase();
  let s = 0;
  if (/siri/.test(n)) s += 100;                 // iOS Siri voices (best)
  if (/\(premium\)|premium/.test(n)) s += 60;   // iOS / macOS Premium
  if (/\(enhanced\)|enhanced/.test(n)) s += 50; // iOS / macOS Enhanced
  if (/neural|natural|online/.test(n)) s += 40; // Edge / Chrome cloud voices
  if (/google/.test(n)) s += 20;                // Android Google voices (decent)
  if (v.localService) s += 5;                   // Slight bonus for offline
  // Known top-tier iOS voice names
  if (/(ava|zoe|evan|nathan|samantha|allison|susan|joelle|noelle|aaron)/.test(n)) s += 15;
  return s;
};

// Pick a matching English voice based on user preference (male / female / accent).
const pickVoice = (voiceId: string): SpeechSynthesisVoice | null => {
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
  if (voices.length === 0) return null;

  const id = voiceId.toLowerCase();
  const wantUK = id.includes("uk") || id.includes("british") || id === "fable";
  const wantMale = ["onyx", "echo", "fable"].includes(id);

  const matchLang = (v: SpeechSynthesisVoice) =>
    wantUK ? v.lang.toLowerCase().includes("en-gb") : v.lang.toLowerCase().includes("en-us");
  const isMaleName = (v: SpeechSynthesisVoice) =>
    /(male|david|alex|daniel|fred|tom|onyx|echo|aaron|nathan|evan|arthur|oliver|reed|rocko)/.test(
      v.name.toLowerCase(),
    ) && !/female/.test(v.name.toLowerCase());
  const isFemaleName = (v: SpeechSynthesisVoice) =>
    /(female|samantha|victoria|karen|moira|tessa|nova|shimmer|alloy|ava|zoe|allison|susan|joelle|noelle|kate|serena|martha)/.test(
      v.name.toLowerCase(),
    );
  const matchGender = (v: SpeechSynthesisVoice) => (wantMale ? isMaleName(v) : isFemaleName(v));

  // Rank candidates: language + gender match first, then quality score.
  const ranked = [...voices].sort((a, b) => {
    const score = (v: SpeechSynthesisVoice) =>
      (matchLang(v) ? 1000 : 0) + (matchGender(v) ? 300 : 0) + qualityScore(v);
    return score(b) - score(a);
  });
  return ranked[0] ?? null;
};

export const speak = async (text: string) => {
  if (!text) return;
  lastSpoken = text;
  const { voiceId, speed } = loadSettings();
  try {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      console.warn("SpeechSynthesis is not available in this browser.");
      return;
    }
    speechSynthesis.cancel();

    // On some browsers (Chrome) voices load asynchronously.
    if (speechSynthesis.getVoices().length === 0) {
      await new Promise<void>((resolve) => {
        const t = setTimeout(resolve, 400);
        speechSynthesis.onvoiceschanged = () => {
          clearTimeout(t);
          resolve();
        };
      });
    }

    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice(voiceId);
    if (v) {
      u.voice = v;
      u.lang = v.lang;
    } else {
      u.lang = "en-US";
    }
    u.rate = Math.min(1.5, Math.max(0.6, Number(speed) || 1.0));
    u.pitch = 1;
    speechSynthesis.speak(u);
  } catch (e) {
    console.warn("Browser TTS failed:", e);
  }
};