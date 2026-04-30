import { loadSettings } from "@/lib/voice";

let lastSpoken = "";
// Incremented every time we stop. Any in-flight speak() whose token < this must abort.
let speakToken = 0;

export const clearAudioCache = () => undefined;

export const getLastSpoken = () => lastSpoken;

const stopCurrent = () => {
  speakToken += 1;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    speechSynthesis.cancel();
  }
};

export const stopSpeaking = () => stopCurrent();

const VOICE_PREFS: Record<string, string[]> = {
  alloy: ["Samantha", "Google US English", "Microsoft Aria", "Microsoft Jenny", "Ava"],
  shimmer: ["Allison", "Ava", "Samantha", "Google US English", "Microsoft Aria"],
  nova: ["Ava", "Jenny", "Aria", "Google US English", "Samantha"],
  echo: ["Alex", "Daniel", "Microsoft Guy", "Google UK English Male", "Google US English Male"],
  onyx: ["Daniel", "Alex", "Microsoft David", "Microsoft Guy", "Google US English Male"],
  fable: ["Oliver", "Daniel", "Google UK English", "Microsoft Ryan", "Microsoft Libby"],
};

const NATURAL_MARKERS = ["enhanced", "premium", "neural", "natural", "google", "microsoft"];

const waitForVoices = (): Promise<SpeechSynthesisVoice[]> => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return Promise.resolve([]);
  const ready = speechSynthesis.getVoices();
  if (ready.length > 0) return Promise.resolve(ready);
  return new Promise((resolve) => {
    const done = () => resolve(speechSynthesis.getVoices());
    speechSynthesis.onvoiceschanged = done;
    window.setTimeout(done, 600);
  });
};

const pickVoice = (voices: SpeechSynthesisVoice[], voiceId: string) => {
  const prefs = VOICE_PREFS[voiceId] ?? VOICE_PREFS.alloy;
  return voices
    .filter((voice) => voice.lang.toLowerCase().startsWith("en"))
    .map((voice) => {
      const name = voice.name.toLowerCase();
      let score = 50;
      const prefIdx = prefs.findIndex((pref) => name.includes(pref.toLowerCase()));
      if (prefIdx >= 0) score += 120 - prefIdx * 12;
      if (NATURAL_MARKERS.some((marker) => name.includes(marker))) score += 25;
      if (voice.localService) score += 8;
      if (voiceId === "fable" && voice.lang.toLowerCase().startsWith("en-gb")) score += 18;
      if (voiceId !== "fable" && voice.lang.toLowerCase().startsWith("en-us")) score += 14;
      if (/compact|default|siri/i.test(voice.name)) score -= 20;
      return { voice, score };
    })
    .sort((a, b) => b.score - a.score)[0]?.voice ?? null;
};

const splitForSpeech = (text: string) => {
  const sentences = text.replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]?/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    const next = `${current} ${sentence}`.trim();
    if (next.length > 220 && current) {
      chunks.push(current);
      current = sentence.trim();
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks;
};

const speakBrowser = async (text: string, voiceId: string, speed: number, token: number): Promise<void> => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const voices = await waitForVoices();
  const voice = pickVoice(voices, voiceId);
  // Browser TTS tends to sound rushed; clamp to a slower, more natural range.
  const raw = Number(speed) || 0.85;
  const rate = Math.min(1.0, Math.max(0.65, raw * 0.9));
  for (const chunk of splitForSpeech(text)) {
    if (token !== speakToken) return;
    await new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.voice = voice;
      utterance.lang = voice?.lang || "en-US";
      utterance.rate = rate;
      utterance.pitch = voiceId === "onyx" || voiceId === "echo" ? 0.88 : 0.96;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      speechSynthesis.speak(utterance);
    });
  }
};

export const speak = async (text: string): Promise<void> => {
  if (!text) return;
  lastSpoken = text;
  stopCurrent();
  const myToken = speakToken;
  const { voiceId, speed } = loadSettings();
  await speakBrowser(text, voiceId, speed, myToken);
};
