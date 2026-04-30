import { supabase } from "@/integrations/supabase/client";
import { loadSettings } from "@/lib/voice";

let lastSpoken = "";
let speakToken = 0;
let currentAudio: HTMLAudioElement | null = null;

// Cache: key = `${voiceId}|${speed}|${text}` -> data URI
const audioCache = new Map<string, string>();
const MAX_CACHE = 80;

export const clearAudioCache = () => audioCache.clear();
export const getLastSpoken = () => lastSpoken;

const stopCurrent = () => {
  speakToken += 1;
  if (currentAudio) {
    try { currentAudio.pause(); } catch {}
    currentAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    speechSynthesis.cancel();
  }
};

export const stopSpeaking = () => stopCurrent();

// ---------- Browser TTS fallback ----------
const VOICE_PREFS: Record<string, string[]> = {
  alloy: ["Samantha", "Google US English", "Microsoft Aria", "Ava"],
  shimmer: ["Allison", "Ava", "Samantha", "Microsoft Aria"],
  nova: ["Ava", "Jenny", "Aria", "Samantha"],
  echo: ["Alex", "Daniel", "Microsoft Guy", "Google UK English Male"],
  onyx: ["Daniel", "Alex", "Microsoft David", "Google US English Male"],
  fable: ["Oliver", "Daniel", "Google UK English", "Microsoft Ryan"],
};

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

const pickBrowserVoice = (voices: SpeechSynthesisVoice[], voiceId: string) => {
  const prefs = VOICE_PREFS[voiceId] ?? VOICE_PREFS.alloy;
  return voices
    .filter((v) => v.lang.toLowerCase().startsWith("en"))
    .map((v) => {
      const name = v.name.toLowerCase();
      let score = 50;
      const idx = prefs.findIndex((p) => name.includes(p.toLowerCase()));
      if (idx >= 0) score += 120 - idx * 12;
      if (/(enhanced|premium|neural|natural)/.test(name)) score += 40;
      if (v.localService) score += 10;
      return { v, score };
    })
    .sort((a, b) => b.score - a.score)[0]?.v;
};

const speakBrowserFallback = async (text: string, voiceId: string, speed: number, token: number) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const voices = await waitForVoices();
  const voice = pickBrowserVoice(voices, voiceId);
  const rate = Math.min(1.0, Math.max(0.65, (Number(speed) || 0.85) * 0.9));
  await new Promise<void>((resolve) => {
    if (token !== speakToken) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.lang = voice?.lang || "en-US";
    u.rate = rate;
    u.pitch = voiceId === "onyx" || voiceId === "echo" ? 0.9 : 0.98;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    speechSynthesis.speak(u);
  });
};

// ---------- ElevenLabs via edge function ----------
const fetchTTS = async (text: string, voiceId: string, speed: number): Promise<string | null> => {
  const cacheKey = `${voiceId}|${speed}|${text}`;
  const cached = audioCache.get(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase.functions.invoke("tts", {
      body: { text, voiceId, speed },
    });
    if (error) {
      console.warn("[tts] edge function error:", error.message);
      return null;
    }
    if (!data?.audioContent) {
      console.warn("[tts] no audio content returned");
      return null;
    }
    const url = `data:${data.mimeType || "audio/mpeg"};base64,${data.audioContent}`;
    if (audioCache.size >= MAX_CACHE) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey) audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, url);
    return url;
  } catch (e) {
    console.warn("[tts] fetch failed:", e);
    return null;
  }
};

const playUrl = (url: string, token: number): Promise<void> =>
  new Promise((resolve) => {
    if (token !== speakToken) return resolve();
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    audio.play().catch(() => resolve());
  });

export const speak = async (text: string): Promise<void> => {
  if (!text) return;
  const trimmed = text.trim();
  if (!trimmed) return;
  lastSpoken = trimmed;
  stopCurrent();
  const myToken = speakToken;
  const { voiceId, speed } = loadSettings();

  const url = await fetchTTS(trimmed, voiceId, speed);
  if (myToken !== speakToken) return;

  if (url) {
    await playUrl(url, myToken);
    return;
  }

  // Fallback to browser TTS so users still hear something if ElevenLabs fails.
  await speakBrowserFallback(trimmed, voiceId, speed, myToken);
};
