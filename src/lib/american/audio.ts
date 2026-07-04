/**
 * 美语课程 · 音频 helper —— 统一美音 accent:"US" + iOS 铁律。
 * iOS:所有播放入口的 onClick 必须【同步】先调 unlockAmericanAudio(),再异步 speakUS。
 * speak() 内部首步已同步 unlockAudioSync(),故手势内直接 speakUS 也安全;
 * 但涉及延迟/序列播放时,务必在手势栈顶先显式 unlock。
 */
import { speak, stopSpeaking, unlockAudioSync, prefetchTTS } from "@/lib/speak";

/** 在用户手势回调里【同步】调用,解锁 iOS 音频。 */
export function unlockAmericanAudio(): void {
  unlockAudioSync();
}

/**
 * 进关时批量预热一批美音音频到缓存(纯网络:CDN 命中即缓存;未生成则触发 edge 现合成回填)。
 * 不碰 <audio>、不需用户手势 —— 目的是让后续"点喇叭"永远命中缓存直接播,
 * 避免冷词首播的 pendingColdKey 去抖吞掉点击、以及 iOS 无手势自动播放静音。
 * key 必须与 speakUS 完全一致(accent:"US" + speed 1.0)才能被 speak() 命中复用。
 */
export function prewarmUS(texts: Array<string | null | undefined>): void {
  const seen = new Set<string>();
  for (const t of texts) {
    const s = (t ?? "").trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    prefetchTTS(s, { accent: "US", speed: 1.0 });
  }
}

/** 美音朗读一句/一词。speed:正常 1.0 / 慢速 0.7。 */
export function speakUS(text: string, speed = 1.0): Promise<void> {
  return speak(text, { accent: "US", speed });
}

export { stopSpeaking };
