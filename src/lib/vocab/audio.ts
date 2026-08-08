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

/* 连播令牌:每次开始新连播 +1。在飞的连播每播完一条都回来对一次令牌,
 * 对不上就自己收摊 —— 这是"用户中途点了别的"唯一可靠的中断信号。
 * ⚠️ stopAudio 也要 +1,否则单点一条例句停不掉正在连播的链。 */
let chainToken = 0;
let chainActive = false;

/* 打断在等的那条 playToEnd。
 * ⚠️ 不能只靠 pause() —— pause 不触发 ended,而对一个**本来就没在放**的
 *    元素调 pause() 连 pause 事件都不发。少了这个显式钩子,
 *    用户中途一停,那个 await 就永远悬着,chainActive 卡在 true,
 *    「连读整链」的按钮从此再也变不回来。 */
let abortCurrent: (() => void) | null = null;

/** 只停当前这条,不动令牌 —— 连播内部换下一条时用。 */
function stopCurrent() {
  if (current) {
    try { current.pause(); current.currentTime = 0; } catch { /* 已被浏览器回收 */ }
    current = null;
  }
  const abort = abortCurrent;
  abortCurrent = null;
  abort?.();
  emit(null);
}

export function stopAudio() {
  chainToken++;   // 顺带掐断在飞的连播
  chainActive = false;
  stopCurrent();
}

/** 是否有连播在进行(UI 拿它把「连读整链」切成「停止」)。 */
export function isChaining(): boolean {
  return chainActive;
}

/** 播一条并**等它放完**。连播专用;单点走 playUrl(那个不等,契约不能改)。 */
function playToEnd(url: string, key: string): Promise<void> {
  return new Promise<void>(resolve => {
    stopCurrent();
    const a = new Audio(url);
    current = a;
    emit(key);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      if (abortCurrent === finish) abortCurrent = null;
      if (current === a) { current = null; emit(null); }
      resolve();
    };
    abortCurrent = finish;
    a.addEventListener("ended", finish);
    a.addEventListener("error", finish);   // 404 的那条跳过去,别把整条链卡死
    a.play().catch(finish);                // 自动播放被拦也照样往下走
  });
}

/**
 * 按顺序连播一串(场景串记的「连读整链」)。
 * 中途调 stopAudio() 或再开一次连播即中断。没有 url 的条目直接跳过。
 * onKey 用来给 UI 报"现在读到哪一环了"。
 */
export async function playChain(
  list: { url: string | null | undefined; key: string }[],
  onKey?: (key: string | null) => void,
): Promise<void> {
  const token = ++chainToken;   // 先占令牌:掐掉上一条链,再开始自己这条
  stopCurrent();
  chainActive = true;
  try {
    for (const it of list) {
      if (token !== chainToken) return;   // 被中断
      if (!it.url) continue;
      onKey?.(it.key);
      await playToEnd(it.url, it.key);
    }
  } finally {
    if (token === chainToken) {
      chainActive = false;
      onKey?.(null);
    }
  }
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
