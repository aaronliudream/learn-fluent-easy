import { speak, speakFromUrl } from "@/lib/speak";

/**
 * 听力专区（初中 + 高中共用 JuniorListeningPlay）的播放：**预生成 MP3 优先，播不出来就回落 TTS**。
 *
 * 为什么单独抽出来：原来页面里写的是
 *   `if (e.audio_url) speakFromUrl(e.audio_url); else speak(e.transcript);`
 * 而 `speakFromUrl` 当时恒 resolve、永不 reject —— URL 死了就是**彻底没声、且不报错**
 * （审计时实测：`playUrl` → `playUrlDirect` 两条路都返回 false 后直接 return）。
 * 初中 473 条 + 高中 636 条听力全靠这个 URL，没有任何兜底。
 *
 * 现在 `speakFromUrl` 返回 boolean，这里据此回落到 `speak(transcript)`。
 * 抽成纯函数是为了能单测——页面内联的分支没法在不渲染整页的情况下验证。
 *
 * @returns 实际用了哪条路：`"url"` | `"tts"` | `"none"`（两条都没得播）
 */
export async function playListeningAudio(
  e: { audio_url?: string | null; transcript?: string | null } | null | undefined,
): Promise<"url" | "tts" | "none"> {
  if (!e) return "none";
  if (e.audio_url) {
    const played = await speakFromUrl(e.audio_url);
    if (played) return "url";
    // 预生成文件播不出来（404 / 网络失败）→ 回落实时 TTS，别让用户面对"点了没反应"
    if (e.transcript) {
      console.warn("[listening] audio_url 播放失败，回落 TTS：", e.audio_url);
      await speak(e.transcript);
      return "tts";
    }
    console.warn("[listening] audio_url 播放失败，且该条没有 transcript 可回落：", e.audio_url);
    return "none";
  }
  if (e.transcript) {
    await speak(e.transcript);
    return "tts";
  }
  return "none";
}
