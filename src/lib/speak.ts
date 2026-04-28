import { loadSettings } from "@/lib/voice";

let lastSpoken = "";

export const clearAudioCache = () => {
  /* no-op: browser TTS has no cache to clear */
};

export const getLastSpoken = () => lastSpoken;

// Pick a matching English voice based on user preference (male / female / accent).
const pickVoice = (voiceId: string): SpeechSynthesisVoice | null => {
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
  if (voices.length === 0) return null;

  const id = voiceId.toLowerCase();
  const wantUK = id.includes("uk") || id.includes("british") || id === "fable";
  const wantMale = ["onyx", "echo", "fable"].includes(id);

  const matchLang = (v: SpeechSynthesisVoice) =>
    wantUK ? v.lang.toLowerCase().includes("en-gb") : v.lang.toLowerCase().includes("en-us");
  const matchGender = (v: SpeechSynthesisVoice) => {
    const n = v.name.toLowerCase();
    return wantMale
      ? /(male|david|alex|daniel|fred|tom|onyx|echo)/.test(n) && !/female/.test(n)
      : /(female|samantha|victoria|karen|moira|tessa|nova|shimmer|alloy)/.test(n);
  };

  return (
    voices.find((v) => matchLang(v) && matchGender(v)) ||
    voices.find(matchLang) ||
    voices.find(matchGender) ||
    voices[0]
  );
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