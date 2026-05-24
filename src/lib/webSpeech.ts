/**
 * Browser-native TTS (Web Speech API) — primary path for Primary Hub.
 * Handles apostrophe words (o'clock, John's) correctly on Chrome/Edge/Safari.
 */

let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

export function isWebSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Warm voice list; safe to call repeatedly. */
export function ensureWebSpeechVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!isWebSpeechSupported()) return Promise.resolve([]);
  if (!voicesPromise) {
    voicesPromise = waitForVoices();
  }
  return voicesPromise;
}

function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  const synth = window.speechSynthesis;
  const existing = synth.getVoices();
  if (existing.length > 0) return Promise.resolve(existing);

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve(synth.getVoices());
    };
    synth.onvoiceschanged = finish;
    window.setTimeout(finish, 800);
  });
}

const FEMALE_HINT_RE =
  /female|samantha|zira|jenny|aria|susan|karen|moira|victoria|google us english|google uk english female/i;

/** Kid-friendly US English voice when available. */
export function pickHubEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  if (en.length === 0) return undefined;

  const us = en.filter((v) => v.lang.toLowerCase().startsWith("en-us"));
  const pool = us.length > 0 ? us : en;

  const scored = pool
    .map((v) => {
      const name = v.name;
      let score = 0;
      if (FEMALE_HINT_RE.test(name)) score += 100;
      if (v.lang.toLowerCase().startsWith("en-us")) score += 30;
      if (v.localService) score += 15;
      if (/(natural|neural|premium|enhanced)/i.test(name)) score += 10;
      return { v, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.v ?? pool[0];
}

export function cancelWebSpeech(): void {
  if (!isWebSpeechSupported()) return;
  window.speechSynthesis.cancel();
}

/**
 * Speak via Web Speech API. Returns true if synthesis started, false if unsupported.
 * `rate` is passed through (e.g. hub 0.7 / 0.85 / 1.0).
 */
export function speakWebSpeech(text: string, rate: number): Promise<boolean> {
  if (!isWebSpeechSupported()) return Promise.resolve(false);
  const trimmed = text.trim();
  if (!trimmed) return Promise.resolve(false);

  const clampedRate = Math.min(1.2, Math.max(0.5, Number(rate) || 0.85));

  return ensureWebSpeechVoices().then((voices) => {
    const synth = window.speechSynthesis;
    synth.cancel();

    return new Promise<boolean>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.lang = "en-US";
      utterance.rate = clampedRate;
      utterance.pitch = 1;

      const voice = pickHubEnglishVoice(voices);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || "en-US";
      }

      let settled = false;
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        resolve(ok);
      };

      utterance.onend = () => finish(true);
      utterance.onerror = () => finish(false);
      synth.speak(utterance);
    });
  });
}

if (isWebSpeechSupported()) {
  void ensureWebSpeechVoices();
}
