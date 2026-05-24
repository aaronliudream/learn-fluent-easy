import { hubSpeak } from "@/lib/primaryHub/speech";

let current: HTMLAudioElement | null = null;

/** Play bundled MP3 under public/; falls back to kid CDN voice (not browser TTS). */
export function playPhonicsAudio(
  url: string,
  fallbackText: string,
  grade: number,
): void {
  if (current) {
    current.pause();
    current = null;
  }
  const audio = new Audio(url);
  current = audio;
  audio.play().catch(() => {
    current = null;
    hubSpeak(fallbackText, 0.85, grade);
  });
}

export function stopPhonicsAudio(): void {
  if (current) {
    current.pause();
    current = null;
  }
}

export function phonicsAudioUrl(base: string, file: string): string {
  return `${base.replace(/\/$/, "")}/${file}`;
}
