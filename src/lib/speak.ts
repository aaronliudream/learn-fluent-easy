import { supabase } from "@/integrations/supabase/client";
import { loadSettings } from "@/lib/voice";

let lastSpoken = "";
let currentAudio: HTMLAudioElement | null = null;
const audioCache = new Map<string, string>(); // key -> object URL
let aiDisabled = false; // becomes true if AI quota/credits exhausted; falls back to browser TTS

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

// ---- Browser TTS fallback (used if AI fails or quota exhausted) ----
const speakBrowser = (text: string, speed: number) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = Math.min(1.5, Math.max(0.6, Number(speed) || 1.0));
  u.pitch = 1;
  speechSynthesis.speak(u);
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

  const { voiceId, speed } = loadSettings();
  const key = cacheKey(text, voiceId, speed);

  // 1. Cached AI audio?
  const cached = audioCache.get(key);
  if (cached) {
    await playUrl(cached);
    return;
  }

  // 2. AI disabled -> browser fallback
  if (aiDisabled) {
    speakBrowser(text, speed);
    return;
  }

  // 3. Call AI TTS edge function
  try {
    const { data, error } = await supabase.functions.invoke("tts", {
      body: { text, voiceId, speed },
    });

    if (error) {
      const status = (error as { context?: { status?: number } }).context?.status;
      if (status === 402 || status === 429) {
        console.warn("[speak] AI TTS unavailable (quota/rate). Falling back to browser voice.");
        aiDisabled = true;
      } else {
        console.warn("[speak] AI TTS error, falling back:", error);
      }
      speakBrowser(text, speed);
      return;
    }

    const audioContent = (data as { audioContent?: string })?.audioContent;
    if (!audioContent) {
      console.warn("[speak] No audio returned, falling back to browser voice.");
      speakBrowser(text, speed);
      return;
    }

    const url = base64ToBlobUrl(audioContent);
    audioCache.set(key, url);
    await playUrl(url);
  } catch (e) {
    console.warn("[speak] AI TTS failed, falling back to browser voice:", e);
    speakBrowser(text, speed);
  }
};
