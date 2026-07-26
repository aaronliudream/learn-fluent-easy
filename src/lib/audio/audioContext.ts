/**
 * 全站唯一的 AudioContext 单例。
 *
 * 两个消费方共用它,绝不能各建一个:
 *   ① lib/speak.ts —— 把共享 <audio> 路由过 GainNode 做响度提升(1.7×);
 *   ② lib/audio/webAudioPlayer.ts —— 朗读层的纯 Web Audio 播放(不碰 <audio>)。
 * iOS 上每个 AudioContext 都要各自在用户手势里 resume(),多开会出现
 * "解锁了 A、出声的却是 B" 的哑火;且 Safari 对同时存在的 context 数量有硬上限。
 */

let ctx: AudioContext | null = null;

/** 取(必要时创建)共享 AudioContext;环境不支持时返回 null,调用方各自回退。 */
export const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  try {
    const Ctx: typeof AudioContext | undefined =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
  } catch {
    return null;
  }
  return ctx;
};

/**
 * 在用户手势里调用:把 context 从 suspended 拉回 running。
 * iOS 只认"手势同步栈里发起的 resume",所以必须由 onClick 直接调,
 * 不能塞进 await 之后。resume() 本身是异步的没关系——发起时机才是关键。
 */
export const resumeAudioContext = (): AudioContext | null => {
  const c = getAudioContext();
  if (!c) return null;
  if (c.state === "suspended") {
    try {
      void c.resume();
    } catch {
      /* 忽略:某些浏览器在无手势时会 reject,下一次真手势会再试 */
    }
  }
  return c;
};

/** 当前 context 是否处于可出声状态(供调试/诊断用)。 */
export const isAudioContextRunning = (): boolean => ctx?.state === "running";
