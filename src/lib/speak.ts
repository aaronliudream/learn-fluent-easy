import { supabase } from "@/integrations/supabase/client";
import { loadSettings } from "@/lib/voice";

let lastSpoken = "";
let currentAudio: HTMLAudioElement | null = null;
const audioCache = new Map<string, string>(); // key -> object URL
let naturalTtsUnavailable = false;
// Incremented every time we stop. Any in-flight speak() whose token < this must abort.
let speakToken = 0;

export const clearAudioCache = () => {
  audioCache.forEach((url) => URL.revokeObjectURL(url));
  audioCache.clear();
};

export const getLastSpoken = () => lastSpoken;

const cacheKey = (text: string, voiceId: string, speed: number) =>
  `${voiceId}::${speed}::${text}`;

const base64ToBlobUrl = (b64: string): string => {
  const byteChars = atob(b64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "audio/mpeg" });
  return URL.createObjectURL(blob);
};

const stopCurrent = () => {
  speakToken += 1;
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      /* noop */
    }
    currentAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    speechSynthesis.cancel();
  }
};

export const stopSpeaking = () => stopCurrent();

const preferredVoiceNames = [
  "Samantha",
  "Google US English",
  "Microsoft Aria",
  "Microsoft Jenny",
  "Google UK English Female",
  "Microsoft Libby",
];

const speakBrowser = (text: string, speed: number) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  utterance.voice =
    preferredVoiceNames.map((name) => voices.find((voice) => voice.name.includes(name))).find(Boolean) ||
    voices.find((voice) => voice.lang.startsWith("en") && voice.localService) ||
    voices.find((voice) => voice.lang.startsWith("en")) ||
    null;
  utterance.lang = utterance.voice?.lang || "en-US";
  utterance.rate = Math.min(1.08, Math.max(0.78, Number(speed) || 0.92));
  utterance.pitch = 0.95;
  speechSynthesis.speak(utterance);
};

const playUrl = (url: string): Promise<void> =>
  new Promise((resolve) => {
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    audio.play().catch(() => resolve());
  });

export const speak = async (text: string): Promise<void> => {
  if (!text) return;
  lastSpoken = text;
  stopCurrent();
  const myToken = speakToken;

  const { voiceId, speed } = loadSettings();
  const key = cacheKey(text, voiceId, speed);

  // 1. Cached AI audio?
  const cached = audioCache.get(key);
  if (cached) {
    if (myToken !== speakToken) return;
    await playUrl(cached);
    return;
  }

  if (naturalTtsUnavailable) {
    if (myToken !== speakToken) return;
    speakBrowser(text, speed);
    return;
  }

  // 2. Call natural TTS backend. If unavailable, keep the button working with the best browser voice.
  try {
    const { data, error } = await supabase.functions.invoke("tts", {
      body: { text, voiceId, speed },
    });

    // Aborted by a stop (e.g. page navigation) while we were waiting.
    if (myToken !== speakToken) return;

    if (error) {
      const status = (error as { context?: { status?: number } }).context?.status;
      if (status === 402 || status === 429) {
        console.warn("[speak] Natural TTS unavailable (quota/rate). Using browser voice fallback.");
        naturalTtsUnavailable = true;
      } else {
        console.warn("[speak] Natural TTS error:", error);
      }
      speakBrowser(text, speed);
      return;
    }

    const audioContent = (data as { audioContent?: string })?.audioContent;
    if (!audioContent) {
      console.warn("[speak] No natural audio returned.");
      speakBrowser(text, speed);
      return;
    }

    const url = base64ToBlobUrl(audioContent);
    audioCache.set(key, url);
    if (myToken !== speakToken) return;
    await playUrl(url);
  } catch (e) {
    if (myToken !== speakToken) return;
    console.warn("[speak] Natural TTS failed:", e);
    speakBrowser(text, speed);
  }
};
