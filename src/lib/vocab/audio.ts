/**
 * 词汇板块音频播放 —— 直连 vocab_words.audio_url / vocab_examples.audio_url。
 *
 * 这些 URL 是**预生成好的 CDN 直链**(内容寻址 <hash前2位>/<hash>.mp3),
 * 所以点播就是换 src 再 play(),不用调 tts edge 现合成、不用等。
 *
 * ⚠️ 全局单例:同一时刻只允许一条音频在放。
 *    不加这个的话,用户连点三条例句会三条一起响,谁也听不清。
 *
 * ── ⚠️ 只用**一个**长期存活的 <audio> 元素(2026-08-17 改)────────────
 * 原来每次播放都 `new Audio(url)`。后果是自动播放解锁**永远不生效**:
 * 浏览器的解锁是**按元素**记的 —— 在用户手势里解锁过的那个元素,
 * 和下一道题 new 出来的元素是两个对象,新元素没被解锁过,play() 照样被拒。
 * 表现就是「今日学习进去第一题不出声,第二题起正常」(第二题时用户已经点过答案了)。
 * 现在全局只有一个元素,换题只换 `.src` —— 解锁一次,后面都算数。
 * ⚠️ 别再改回 new Audio():那等于把 unlockAudio() 变成空操作,而且不会报错。
 */

/** 极短的静音 WAV。解锁时先播它 —— 用户听不见,但元素从此被标记为"用户放过". */
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

let el: HTMLAudioElement | null = null;
/** 播放代次:换一条就 +1。共用同一个元素,靠它把上一条的回调作废。 */
let gen = 0;
let unlocked = false;

function media(): HTMLAudioElement {
  if (el) return el;
  el = new Audio();
  el.preload = "auto";
  return el;
}

/**
 * 在**用户手势里同步调用**,解锁自动播放。可重复调用,已解锁则直接返回。
 *
 * ⚠️ 必须在手势的调用栈里直接调 —— 策略看的是"这次调用是不是源于用户手势",
 *    包一层 setTimeout / 等一个 await 再调,一样被拒。
 * ⚠️ 这解决的是"页面上已经发生过手势、但第一题仍不出声"。
 *    **完全没有任何交互的冷启动是解不了的** —— 无手势播放有声音频本来就被浏览器禁止,
 *    没有代码能绕过去。那种情况下靠 playUrl 返回 "blocked",由 UI 给出可点的提示。
 */
export function unlockAudio(): void {
  if (unlocked) return;
  const a = media();
  try {
    a.src = SILENT_WAV;
    const p = a.play();
    if (p && typeof p.then === "function") {
      p.then(() => { try { a.pause(); a.currentTime = 0; } catch { /* 已被回收 */ } unlocked = true; })
        .catch(() => { /* 这次手势没解开就算了,下次手势再试 */ });
    } else {
      try { a.pause(); } catch { /* 老浏览器无 Promise 返回 */ }
      unlocked = true;
    }
  } catch { /* 连 src 都设不上:直接放弃,播放时会走 blocked 分支 */ }
}

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
  gen++;                       // 作废上一条的 ended/error 回调
  if (el) {
    try { el.pause(); el.currentTime = 0; } catch { /* 已被浏览器回收 */ }
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

export type PlayResult = "played" | "blocked" | "error" | "skipped";

/**
 * 换源并播。共用同一个元素。
 *
 * ⚠️ 用 `addEventListener` + 显式 `removeEventListener`,**不要改成 `a.onended = …`**。
 *    属性赋值看起来更省事(下一条自然覆盖上一条),但它把"怎么监听"这件事换了口径:
 *    2026-08-17 我改成属性赋值,`playChain` 的 6 条既有测试全部超时 ——
 *    链根本推不动。线上症状会是"答对后音频停在第一条",
 *    而那正是 2026-08-09 报过、这组测试专门守的那个 bug。
 * ⚠️ 共用元素意味着监听器会累积,所以结束时必须摘掉;
 *    `myGen` 只保证过期回调不生效,不负责回收。
 */
function start(url: string, key: string, onDone: (r: PlayResult) => void): Promise<void> {
  const a = media();
  gen++;
  const myGen = gen;
  try { a.pause(); } catch { /* 忽略 */ }
  a.src = url;
  try { a.currentTime = 0; } catch { /* 新 src 尚未 load,忽略 */ }
  emit(key);

  let settled = false;
  const finish = (r: PlayResult) => {
    if (settled || myGen !== gen) return;   // 已结束,或已被下一条顶掉
    settled = true;
    a.removeEventListener("ended", onEnded);
    a.removeEventListener("error", onError);
    if (currentKey === key) emit(null);
    onDone(r);
  };
  const onEnded = () => finish("played");
  const onError = () => finish("error");    // 404 的那条跳过去,别把整条链卡死
  a.addEventListener("ended", onEnded);
  a.addEventListener("error", onError);

  const p = a.play();
  const started = p && typeof p.then === "function" ? p : Promise.resolve();
  started.then(() => { unlocked = true; }, () => finish("blocked"));
  return started;
}

/** 播一条并**等它放完**。连播专用;单点走 playUrl(那个不等,契约不能改)。 */
function playToEnd(url: string, key: string): Promise<PlayResult> {
  return new Promise<PlayResult>(resolve => {
    stopCurrent();
    let done = false;
    const settle = (r: PlayResult) => {
      if (done) return;
      done = true;
      if (abortCurrent === abort) abortCurrent = null;
      resolve(r);
    };
    const abort = () => settle("skipped");
    abortCurrent = abort;
    start(url, key, settle);
  });
}

/**
 * 按顺序连播一串(场景串记的「连读整链」、答题反馈层的「先单词后例句」)。
 * 中途调 stopAudio() 或再开一次连播即中断。没有 url 的条目直接跳过。
 * onKey 用来给 UI 报"现在读到哪一环了"。
 *
 * @param list 每条可带 `gapAfterMs`:读完这条后停多久再读下一条。
 *   ⚠️ 停顿必须**长在链里**、并且受同一个 token 管辖 —— 写成外面套 setTimeout
 *      的话,用户在停顿期间点了别的,这条链会在停顿结束后诈尸再读一句。
 *   ⚠️ 最后一条的 gapAfterMs 无意义(后面没有东西了),这里也不会去等。
 */
export async function playChain(
  list: { url: string | null | undefined; key: string; gapAfterMs?: number }[],
  onKey?: (key: string | null) => void,
): Promise<void> {
  const token = ++chainToken;   // 先占令牌:掐掉上一条链,再开始自己这条
  stopCurrent();
  chainActive = true;
  try {
    for (let i = 0; i < list.length; i++) {
      const it = list[i];
      if (token !== chainToken) return;   // 被中断
      if (!it.url) continue;
      onKey?.(it.key);
      await playToEnd(it.url, it.key);
      const gap = it.gapAfterMs ?? 0;
      if (gap > 0 && i < list.length - 1) {
        await new Promise(r => setTimeout(r, gap));
        if (token !== chainToken) return;  // 停顿期间被打断
      }
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
 *
 * 返回值告诉调用方**为什么没响**:
 *   · "blocked" —— 被自动播放策略拦了。听音辨义那种题**必须**据此给用户一个可点的提示,
 *     否则题面只有一个播放键、没有词干,静默失败 = 这道题根本没法答。
 *   · "error"   —— 文件 404 之类。
 * ⚠️ 老调用方 `void playUrl(...)` 不受影响。
 */
export async function playUrl(url: string | null | undefined, key: string): Promise<PlayResult> {
  if (!url) return "skipped";
  if (currentKey === key) { stopAudio(); return "skipped"; }
  stopAudio();
  let early: PlayResult | null = null;          // error 事件可能比 play() 先落地
  /* ⚠️ 直接 await play() 返回的那个 promise —— 它 reject 就是被自动播放策略拦了。
     不要用 queueMicrotask 之类去"等一下再看有没有 reject":
     rejection 什么时候到没有保证,猜几个微任务必然漏报,
     而漏报 blocked 对听音辨义题是致命的(题面只有播放键,静默失败=没法答)。 */
  const started = start(url, key, r => { early ??= r; });
  try {
    await started;
    return early === "error" ? "error" : "played";
  } catch {
    return "blocked";
  }
}
