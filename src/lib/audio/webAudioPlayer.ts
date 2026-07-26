/**
 * 纯 Web Audio 播放器 —— 朗读层专用,全程不碰 HTMLAudioElement。
 *
 * 为什么存在:只要用 <audio> / new Audio() 出声,iOS 就强制注册 MediaSession,
 * 锁屏与灵动岛必然弹出"正在播放"卡片,且**无法关闭**(navigator.mediaSession
 * 只能改内容不能取消注册)。走 AudioContext + AudioBufferSourceNode 的路径
 * 不注册 Now Playing 会话,这是目前唯一的根治办法。
 *
 * 已知代价(有意接受,见 docs/reading/DECISIONS.md):
 *   熄屏/切后台会暂停(iOS 挂起 AudioContext)、受硬件静音开关影响、锁屏与耳机线控失效。
 *
 * 关于变速:AudioBufferSourceNode.playbackRate 会连带改变音高(慢速 → 低沉怪音),
 * 故本播放器**不暴露 rate 参数**。朗读的慢速档走 TTS 服务端合成(speed=0.7 传给
 * tts edge function),音高天然正确 —— 前端一行变速代码都不需要。
 */
import { getAudioContext, resumeAudioContext } from "./audioContext";

/** 与 speak.ts 的 LOUDNESS_GAIN 保持一致:两条播放路径响度必须听起来一样。 */
const LOUDNESS_GAIN = 1.7;

/** 已解码 AudioBuffer 的 LRU 上限。解码结果占内存(约 1MB/分钟),不能无限存。 */
const MAX_BUFFERS = 20;

/** url -> 已解码 buffer。Map 保持插入序,命中时 delete+set 移到末尾即 LRU。 */
const buffers = new Map<string, AudioBuffer>();
/** 同一 url 的并发解码去重:后到的复用同一个 Promise,不重复下载/解码。 */
const inflight = new Map<string, Promise<AudioBuffer | null>>();

let currentSource: AudioBufferSourceNode | null = null;
let currentGain: GainNode | null = null;
/**
 * 当前 play() 的 resolve。停止时必须显式 resolve(false):
 * stop() 会把 onended 摘掉,不主动收尾的话调用方的 `await playSentence()` 会永远挂着,
 * 连播循环就卡死在那一句、连带把 AudioBuffer 一起吊在内存里。
 */
let currentResolve: ((played: boolean) => void) | null = null;
/** 每次 play/stop 自增;异步链路靠它判断"自己是否已被更新的播放顶掉"。 */
let playToken = 0;
let playing = false;

const absoluteUrl = (url: string): string =>
  url.startsWith("/") && typeof window !== "undefined" ? `${window.location.origin}${url}` : url;

const cacheGet = (url: string): AudioBuffer | undefined => {
  const hit = buffers.get(url);
  if (!hit) return undefined;
  buffers.delete(url); // 移到末尾 = 最近使用
  buffers.set(url, hit);
  return hit;
};

const cacheSet = (url: string, buf: AudioBuffer) => {
  buffers.set(url, buf);
  while (buffers.size > MAX_BUFFERS) {
    const oldest = buffers.keys().next().value;
    if (!oldest) break;
    buffers.delete(oldest);
  }
};

/** decodeAudioData 的 Promise 形态老 Safari 不支持,回退到 callback 形态。 */
const decode = (ctx: AudioContext, bytes: ArrayBuffer): Promise<AudioBuffer> =>
  new Promise((resolve, reject) => {
    let settled = false;
    const ok = (b: AudioBuffer) => {
      if (!settled) {
        settled = true;
        resolve(b);
      }
    };
    const fail = (e: unknown) => {
      if (!settled) {
        settled = true;
        reject(e);
      }
    };
    try {
      const p = ctx.decodeAudioData(bytes, ok, fail);
      if (p && typeof p.then === "function") p.then(ok, fail);
    } catch (e) {
      fail(e);
    }
  });

const ensureBuffer = (rawUrl: string): Promise<AudioBuffer | null> => {
  const url = absoluteUrl(rawUrl);
  const cached = cacheGet(url);
  if (cached) return Promise.resolve(cached);
  const running = inflight.get(url);
  if (running) return running;
  // 这个检查必须在 IIFE **之外**:若放进去,不支持 Web Audio 时函数体会在第一个
  // await 之前就走到 finally,那时 `job` 还处在 TDZ → 整个 Promise 变成 reject。
  const ctx = getAudioContext();
  if (!ctx) return Promise.resolve(null);

  const job = (async (): Promise<AudioBuffer | null> => {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn("[webAudio] fetch failed:", res.status, url);
        return null;
      }
      const bytes = await res.arrayBuffer();
      const buf = await decode(ctx, bytes);
      cacheSet(url, buf);
      return buf;
    } catch (e) {
      console.warn("[webAudio] decode failed:", e);
      return null;
    } finally {
      if (inflight.get(url) === job) inflight.delete(url);
    }
  })();
  inflight.set(url, job);
  return job;
};

/**
 * 在用户手势里同步调用,替代旧的 unlockAudioSync()。
 * 关键区别:旧版是在 <audio> 上播一段静音 WAV 来"消费手势"—— 那一下就足以让 iOS
 * 注册 Now Playing。这里只 resume AudioContext,不产生任何媒体元素。
 */
export const unlockWebAudio = (): void => {
  resumeAudioContext();
};

/** 朗读层是否正在出声(供学习时长心跳把"被动听朗读"算作活跃)。 */
export const isWebAudioPlaying = (): boolean => playing;

/** 立即中断当前播放。已 start 的 source 无法复用,stop 后丢弃即可。 */
export const stopWebAudio = (): void => {
  playToken += 1;
  playing = false;
  if (currentSource) {
    try {
      currentSource.onended = null;
      currentSource.stop();
    } catch {
      /* 尚未 start 或已结束 —— 忽略 */
    }
    try {
      currentSource.disconnect();
    } catch {
      /* ignore */
    }
    currentSource = null;
  }
  if (currentGain) {
    try {
      currentGain.disconnect();
    } catch {
      /* ignore */
    }
    currentGain = null;
  }
  const resolvePending = currentResolve;
  currentResolve = null;
  resolvePending?.(false); // 收尾上一次 play():没播完 → false
};

/** 预下载并解码进 LRU,让下一句开播零等待。失败静默(下次播放会自己重试)。 */
export const preloadAudioUrl = (url: string): void => {
  if (!url) return;
  void ensureBuffer(url);
};

/**
 * 播一个音频 URL,播完(自然结束)resolve(true);被 stop/顶掉/失败则 resolve(false)。
 * 即 play() 的 resolve 就是 onEnded —— 调用方 `await` 即可串起下一句,
 * 无需再单独注册回调。
 */
export const playAudioUrl = async (url: string): Promise<boolean> => {
  if (!url) return false;
  const ctx = resumeAudioContext();
  if (!ctx) return false;

  stopWebAudio(); // 播新句前先掐掉旧的(playToken 在此自增)
  const my = playToken;

  const buf = await ensureBuffer(url);
  if (!buf) return false;
  if (my !== playToken) return false; // 解码期间来了新的播放/停止 → 本次作废

  try {
    // iOS 上 resume() 是异步的,解码这段时间通常已经 running;若仍 suspended
    // 再催一次(此时多半仍在同一次手势的有效期内)。
    if (ctx.state === "suspended") {
      await ctx.resume().catch(() => {});
      if (my !== playToken) return false; // resume 这一等期间被停掉 → 别再出声
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.value = LOUDNESS_GAIN;
    src.connect(gain);
    gain.connect(ctx.destination);
    currentSource = src;
    currentGain = gain;
    playing = true;

    return await new Promise<boolean>((resolve) => {
      currentResolve = resolve;
      src.onended = () => {
        if (my !== playToken) return resolve(false); // 已被顶掉/停止
        currentResolve = null;
        playing = false;
        currentSource = null;
        currentGain = null;
        try {
          gain.disconnect();
        } catch {
          /* ignore */
        }
        resolve(true);
      };
      src.start();
    });
  } catch (e) {
    console.warn("[webAudio] play failed:", e);
    playing = false;
    return false;
  }
};
