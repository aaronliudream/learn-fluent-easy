import { hubSpeak } from "@/lib/primaryHub/speech";
import { unlockAudioSync } from "@/lib/speak";

let current: HTMLAudioElement | null = null;

/** Play bundled MP3 under public/; falls back to kid CDN voice (not browser TTS). */
export function playPhonicsAudio(
  url: string,
  fallbackText: string,
  grade: number,
): void {
  // iOS 音频解锁 (backlog #2 follow-up audit): 在 user-gesture 同步栈里先给
  // speak.ts 的 sharedAudio 一个 play() 解锁. 这样即使下面 CDN 加载失败,
  // .catch 异步走 hubSpeak fallback 时 sharedAudio 已经就绪, iOS 不会拦截.
  unlockAudioSync();
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
