import { hubSpeak } from "@/lib/primaryHub/speech";
import { unlockAudioSync } from "@/lib/speak";
import { HUB_FIXED_SPEAK_SPEED } from "@/lib/primaryHub/hubSpeakSpeed";

let current: HTMLAudioElement | null = null;

/**
 * Play a bundled MP3 under `public/`; falls back to kid CDN voice (not browser TTS).
 *
 * `url` is null when the unit declares no recorded asset for the word — then we go
 * straight to TTS inside the same user-gesture stack (no wasted request, no decode
 * failure). See `PhonicsListenItem.audio`.
 */
export function playPhonicsAudio(
  url: string | null,
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
  if (!url) {
    hubSpeak(fallbackText, HUB_FIXED_SPEAK_SPEED, grade);
    return;
  }
  const audio = new Audio(url);
  current = audio;
  audio.play().catch((err) => {
    current = null;
    // 有声明却播不出 = 资源真的坏了/丢了,必须留痕,否则线上只会表现为"音色不对".
    console.warn(`[phonics] bundled audio failed (${url}), falling back to TTS:`, err);
    hubSpeak(fallbackText, HUB_FIXED_SPEAK_SPEED, grade);
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
