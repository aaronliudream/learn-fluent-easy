import { supabase } from "@/integrations/supabase/client";
import { loadSettings } from "@/lib/voice";

let lastSpoken = "";
let speakToken = 0;
let sequenceId = 0;
let currentAudio: HTMLAudioElement | null = null;
let sharedAudio: HTMLAudioElement | null = null;

const SILENT_WAV =
  "data:audio/wav;base64,UklGRmQGAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YUAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

// Cache: key = `${voiceId}|${speed}|${text}` -> data URI
const audioCache = new Map<string, string>();
const MAX_CACHE = 80;

export const clearAudioCache = () => audioCache.clear();
export const getLastSpoken = () => lastSpoken;

const stopCurrent = () => {
  speakToken += 1;
  if (currentAudio) {
    try {
      currentAudio.pause();
    } catch {}
    currentAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    speechSynthesis.cancel();
  }
};

export const stopSpeaking = () => {
  // Also abort any running speakSequence loop.
  sequenceId += 1;
  stopCurrent();
};

const getSharedAudio = () => {
  if (typeof window === "undefined") return null;
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = "auto";
    sharedAudio.setAttribute("playsinline", "true");
    sharedAudio.setAttribute("webkit-playsinline", "true");
  }
  return sharedAudio;
};

// Synchronously start playback inside the user-gesture click handler so
// mobile browsers (especially iOS Safari) don't block the eventual audio.
// We immediately call play() on a real <audio> with a short silent clip;
// once the network fetch resolves we just swap the src on the SAME element
// and call play() again — the gesture has already been "consumed" by the
// first play(), so the second call works without a fresh user tap.
const unlockAudioSync = (): HTMLAudioElement | null => {
  const audio = getSharedAudio();
  if (!audio) return null;
  try {
    audio.muted = false;
    audio.volume = 1;
    audio.src = SILENT_WAV;
    audio.load();
    const p = audio.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch {}
  return audio;
};

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
const fetchTTS = async (text: string, voiceId: string, speed: number, accent?: string): Promise<string | null> => {
  const cacheKey = `${voiceId}|${speed}|${accent || ''}|${text}`;
  const cached = audioCache.get(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase.functions.invoke("tts", {
      body: { text, voiceId, speed, accent },
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

const playUrlOn = (
  audio: HTMLAudioElement,
  url: string,
  token: number,
): Promise<boolean> =>
  new Promise((resolve) => {
    if (token !== speakToken) return resolve(false);
    try {
      audio.pause();
      audio.muted = false;
      audio.volume = 1;
      audio.src = url;
      audio.load();
    } catch {
      return resolve(false);
    }
    currentAudio = audio;
    audio.onended = () => resolve(true);
    audio.onerror = () => resolve(false);
    const p = audio.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => resolve(false));
    }
  });

// IMPORTANT: `speak()` must be called *synchronously* inside the click
// handler. We do the audio-element creation + first `.play()` BEFORE any
// `await`, so mobile browsers see this as a valid user-initiated playback.
// The async work continues afterwards and just updates the src.
export const speak = (text: string, opts?: { accent?: "UK" | "US" | "BOTH" }): Promise<void> => {
  if (!text) return Promise.resolve();
  const trimmed = text.trim();
  if (!trimmed) return Promise.resolve();
  lastSpoken = trimmed;
  stopCurrent();

  // 1) SYNC: grab/create the <audio> and start play() immediately. This
  //    keeps us inside the user-gesture window.
  const audio = unlockAudioSync();
  const myToken = speakToken;
  const { voiceId, speed } = loadSettings();
  const accent = opts?.accent;

  // 2) Cache hit → swap src right away, no network wait.
  const cacheKey = `${voiceId}|${speed}|${accent || ''}|${trimmed}`;
  const cached = audioCache.get(cacheKey);
  if (audio && cached) {
    return playUrlOn(audio, cached, myToken).then(() => undefined);
  }

  // 3) Cache miss → fetch then swap src on the same already-unlocked element.
  return (async () => {
    const url = await fetchTTS(trimmed, voiceId, speed, accent);
    if (myToken !== speakToken) return;

    if (audio && url) {
      const played = await playUrlOn(audio, url, myToken);
      if (played) return;
    }

    // Fallback to browser TTS so users still hear something if remote TTS fails.
    await speakBrowserFallback(trimmed, voiceId, speed, myToken);
  })();
};

// Speak a list of sentences one-by-one with a small pause between them.
// This sounds far more natural than concatenating an entire paragraph and
// sending it to TTS as one long string (which OpenAI tends to read very
// fast and without breath pauses).
export const speakSequence = async (
  sentences: string[],
  opts: { gapMs?: number; onIndex?: (i: number) => void } = {},
): Promise<void> => {
  const gapMs = opts.gapMs ?? 80;
  const list = sentences.map((s) => (s || "").trim()).filter(Boolean);
  if (list.length === 0) return;
  const mySeq = ++sequenceId;
  // Prefetch the first item's audio so playback starts with no dead air.
  const { voiceId, speed } = loadSettings();
  const prefetch = (text: string) => {
    const key = `${voiceId}|${speed}|${text}`;
    if (!audioCache.has(key)) {
      // fire-and-forget; result is stored in cache by fetchTTS
      void fetchTTS(text, voiceId, speed);
    }
  };
  prefetch(list[0]);
  for (let i = 0; i < list.length; i++) {
    if (mySeq !== sequenceId) return; // a new sequence (or stop) started
    opts.onIndex?.(i);
    // Kick off prefetch of the NEXT sentence while we play the current one,
    // so the gap between sentences is just the configured gapMs (not network).
    if (i + 1 < list.length) prefetch(list[i + 1]);
    await speak(list[i]);
    if (mySeq !== sequenceId) return;
    if (i < list.length - 1) {
      await new Promise((r) => setTimeout(r, gapMs));
    }
  }
  opts.onIndex?.(-1);
};

// (cancelSequence defined near top.)
