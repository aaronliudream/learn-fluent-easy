import { supabase } from "@/integrations/supabase/client";
import { loadSettings } from "@/lib/voice";

// Cache audio per (voiceId|speed|text). Cleared when settings change.
const audioCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;
let lastSpoken = "";

export const clearAudioCache = () => {
  audioCache.clear();
};

export const getLastSpoken = () => lastSpoken;

const fallbackSpeak = (text: string, rate: number) => {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = rate;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
};

export const speak = async (text: string) => {
  if (!text) return;
  lastSpoken = text;
  const { voiceId, speed } = loadSettings();
  const key = `${voiceId}|${speed}|${text}`;
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    let url = audioCache.get(key);
    if (!url) {
      const { data, error } = await supabase.functions.invoke("tts", {
        body: { text, voiceId, speed },
      });
      if (error || !data?.audioContent) throw error || new Error("no audio");
      url = `data:audio/mpeg;base64,${data.audioContent}`;
      audioCache.set(key, url);
    }
    const audio = new Audio(url);
    currentAudio = audio;
    await audio.play();
  } catch (e) {
    console.warn("ElevenLabs TTS failed, falling back:", e);
    fallbackSpeak(text, speed);
  }
};