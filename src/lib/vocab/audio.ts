/**
 * 词汇板块音频播放 —— 直连 vocab_words.audio_url / vocab_examples.audio_url。
 *
 * 这些 URL 是**预生成好的 CDN 直链**(内容寻址 <hash前2位>/<hash>.mp3),
 * 所以点播就是 new Audio(url).play(),不用调 tts edge 现合成、不用等。
 *
 * ⚠️ 全局单例:同一时刻只允许一条音频在放。
 *    不加这个的话,用户连点三条例句会三条一起响,谁也听不清。
 */

let current: HTMLAudioElement | null = null;
let currentKey: string | null = null;
const listeners = new Set<(key: string | null) => void>();

function emit(key: string | null) {
  currentKey = key;
  listeners.forEach(fn => { try { fn(key); } catch { /* 单个订阅者出错不该拖垮播放 */ } });
}

/** 订阅"当前在放哪条",用于给行内播放键上高亮。返回退订函数。 */
export function subscribePlaying(fn: (key: string | null) => void): () => void {
  listeners.add(fn);
  fn(currentKey);
  return () => listeners.delete(fn);
}

export function stopAudio() {
  if (current) {
    try { current.pause(); current.currentTime = 0; } catch { /* 已被浏览器回收 */ }
    current = null;
  }
  emit(null);
}

/**
 * 播一条。key 用来标识是哪一条在放(通常是 word.id 或 example.id)。
 * 再点同一条 = 停止(用户当作暂停用)。
 */
export async function playUrl(url: string | null | undefined, key: string): Promise<void> {
  if (!url) return;
  if (currentKey === key) { stopAudio(); return; }
  stopAudio();
  const a = new Audio(url);
  current = a;
  emit(key);
  a.addEventListener("ended", () => { if (current === a) { current = null; emit(null); } });
  a.addEventListener("error", () => { if (current === a) { current = null; emit(null); } });
  try {
    await a.play();
  } catch {
    // 自动播放被拦(用户还没交互过)/ 文件 404 —— 静默复位,不弹错给用户
    if (current === a) { current = null; emit(null); }
  }
}
