/**
 * 美语课程 · 音频 helper —— 统一美音 accent:"US" + iOS 铁律。
 * iOS:所有播放入口的 onClick 必须【同步】先调 unlockAmericanAudio(),再异步 speakUS。
 * speak() 内部首步已同步 unlockAudioSync(),故手势内直接 speakUS 也安全;
 * 但涉及延迟/序列播放时,务必在手势栈顶先显式 unlock。
 */
import { speak, stopSpeaking, unlockAudioSync } from "@/lib/speak";

/** 在用户手势回调里【同步】调用,解锁 iOS 音频。 */
export function unlockAmericanAudio(): void {
  unlockAudioSync();
}

/** 美音朗读一句/一词。speed:正常 1.0 / 慢速 0.7。 */
export function speakUS(text: string, speed = 1.0): Promise<void> {
  return speak(text, { accent: "US", speed });
}

export { stopSpeaking };
