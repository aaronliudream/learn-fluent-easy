import { loadSettings } from "@/lib/voice";

let lastSpoken = "";
let voicesPrimed = false;

export const clearAudioCache = () => {
  /* no-op: browser TTS has no cache to clear */
};

export const getLastSpoken = () => lastSpoken;

// Eagerly load voices so that on the first user click we can synchronously pick one.
// iOS Safari requires the speak() call to happen *inside* the user-gesture stack —
// any awaited delay after the click drops the gesture and the OS falls back to the
// previously cached voice (which is why a freshly downloaded Siri/Enhanced voice
// appears to "not take effect").
const primeVoices = () => {
  if (voicesPrimed) return;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  // Trigger the lazy voice list load.
  speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged = () => {
    voicesPrimed = true;
  };
  if (speechSynthesis.getVoices().length > 0) voicesPrimed = true;
};
primeVoices();

// Quality score — prefer high-naturalness voices.
// iOS Siri / Enhanced voice names vary across iOS versions:
//   iOS 16:  "Ava (Enhanced)" / "Samantha (Enhanced)"
//   iOS 17+: "Ava"             (Enhanced flag not in the name; only voiceURI hints at it)
//   Some builds expose:        "com.apple.voice.premium.en-US.Ava"  in voiceURI
const qualityScore = (v: SpeechSynthesisVoice): number => {
  const n = v.name.toLowerCase();
  const uri = (v.voiceURI || "").toLowerCase();
  let s = 0;
  if (/siri/.test(n) || /siri/.test(uri)) s += 120;
  if (/premium/.test(n) || /premium/.test(uri)) s += 80;
  if (/enhanced/.test(n) || /enhanced/.test(uri)) s += 70;
  if (/neural|natural|online/.test(n)) s += 40;
  if (/google/.test(n)) s += 25;
  // Apple's top-tier "personal voices" — high quality even without an Enhanced tag.
  if (/(ava|zoe|evan|nathan|samantha|allison|susan|joelle|noelle|aaron|serena|kate|arthur|oliver)/.test(n)) {
    s += 30;
  }
  if (v.localService) s += 5;
  return s;
};

const isAppleMobile = () =>
  typeof navigator !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

const isPremiumAppleVoice = (v: SpeechSynthesisVoice) => {
  const text = `${v.name} ${v.voiceURI}`.toLowerCase();
  return /enhanced|premium|siri/.test(text);
};

const pickVoice = (voiceId: string): SpeechSynthesisVoice | null => {
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
  if (voices.length === 0) return null;

  const id = voiceId.toLowerCase();
  const preferredNames: Record<string, RegExp> = {
    alloy: /allison|samantha|ava|susan|noelle/,
    shimmer: /samantha|susan|noelle|joelle|allison/,
    nova: /ava|zoe|victoria|allison|samantha/,
    echo: /evan|nathan|alex|daniel/,
    onyx: /aaron|arthur|oliver|reed|rocko|fred/,
    fable: /serena|kate|martha|arthur|oliver/,
  };
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

  const ranked = [...voices].sort((a, b) => {
    const score = (v: SpeechSynthesisVoice) =>
      (matchLang(v) ? 1000 : 0) +
      (preferredNames[id]?.test(v.name.toLowerCase()) ? 650 : 0) +
      (matchGender(v) ? 300 : 0) +
      qualityScore(v);
    return score(b) - score(a);
  });
  const best = ranked[0] ?? null;

  // On iPhone/iPad Safari, downloaded Enhanced voices often do not appear in
  // getVoices(). If we force a listed compact voice, Safari ignores the user's
  // selected Allison/Samantha Enhanced system voice. In that case leave
  // utterance.voice unset so iOS can use the selected English system voice.
  if (best && isAppleMobile() && !isPremiumAppleVoice(best)) return null;

  return best;
};

// IMPORTANT: this must be called synchronously inside a user-gesture handler
// (e.g. the onClick of a button). No awaits before speak() — otherwise iOS
// drops the user-gesture context and the new voice will not be applied.
export const speak = (text: string): void => {
  if (!text) return;
  lastSpoken = text;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("SpeechSynthesis is not available in this browser.");
    return;
  }

  const { voiceId, speed } = loadSettings();

  // Cancel any in-flight utterance so the new voice takes over immediately.
  speechSynthesis.cancel();

  // Build the utterance in the user-gesture stack (synchronous!).
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

  // Helpful one-time debug for users wondering "why didn't my Siri voice work?"
  if (v) {
    console.info(
      `[speak] using voice="${v.name}" lang=${v.lang} local=${v.localService} uri=${v.voiceURI}`,
    );
  } else {
    console.warn("[speak] using iOS/browser system default English voice");
  }

  speechSynthesis.speak(u);
};

// List all available English voices in the console — useful for debugging on iPhone.
// Type `__listVoices()` in the dev console to see what Safari is offering.
if (typeof window !== "undefined") {
  (window as unknown as { __listVoices?: () => void }).__listVoices = () => {
    const list = speechSynthesis
      .getVoices()
      .filter((v) => v.lang.startsWith("en"))
      .map((v) => `${v.name}  [${v.lang}]  local=${v.localService}  uri=${v.voiceURI}`);
    console.log(list.join("\n"));
    return list;
  };
}
