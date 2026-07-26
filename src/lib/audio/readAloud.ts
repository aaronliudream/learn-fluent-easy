/**
 * 朗读层的对外门面 —— 把"文本/URL"接到纯 Web Audio 播放器上。
 *
 * 存在的理由:朗读必须绕开 HTMLAudioElement(否则 iOS 灵动岛必弹"正在播放"),
 * 但 TTS 的 URL 解析(缓存/CDN/edge 合成)那一整套没必要重写 —— 复用 speak.ts
 * 导出的 resolveTtsUrl(),只把最后一步"怎么出声"换掉。
 *
 * 边界:本模块只服务朗读。全站其它发音(点词、单词卡、闯关题)仍走 speak(),
 * 那条路继续用 <audio>,行为一行未改。
 */
import { resolveTtsUrl } from "@/lib/speak";
import {
  playAudioUrl,
  preloadAudioUrl,
  stopWebAudio,
  unlockWebAudio,
  isWebAudioPlaying,
} from "./webAudioPlayer";

export type ReadAloudOpts = { accent?: "UK" | "US" | "BOTH"; voiceId?: string; speed?: number };

/** 在用户手势里同步调用(替代 unlockAudioSync)。只 resume AudioContext,不造媒体元素。 */
export const unlockReadAloud = (): void => unlockWebAudio();

/** 立即中断朗读。 */
export const stopReadAloud = (): void => stopWebAudio();

/** 朗读是否正在出声。 */
export const isReadAloudPlaying = (): boolean => isWebAudioPlaying();

/** 播预生成音频文件(sentence.audio_url)。播完 resolve(true)。 */
export const readAloudUrl = (url: string): Promise<boolean> => playAudioUrl(url);

/**
 * 播实时合成的一句。解析不出 URL(edge 挂了/离线)则 resolve(false),调用方继续下一句。
 *
 * 【第一行必须是同步 resume】本函数在 onClick 里被直接调用,函数体会**同步**执行到第一个
 * await 为止 —— 这一行因此仍在用户手势栈内。若把 resume 留给下面 playAudioUrl 里那次
 * (在 await 之后),iOS 会认为不在手势中而拒绝解锁:用户开章后先点词(没按过播放)时,
 * AudioContext 一直 suspended,点词一声不响。
 */
export const readAloudText = async (text: string, opts?: ReadAloudOpts): Promise<boolean> => {
  unlockWebAudio();
  const url = await resolveTtsUrl(text, opts);
  if (!url) return false;
  return playAudioUrl(url);
};

/**
 * 深度预热:解析 URL + 下载 + 解码进 LRU,下一句开播零等待。
 * 比 prefetchTTS 多做了"解码"这一步,成本也更高 —— 只对**即将要播的下一句**用,
 * 视口滚动那种大面积预热继续用 prefetchTTS(纯网络,不解码)。
 */
export const warmReadAloudText = (text: string, opts?: ReadAloudOpts): void => {
  void (async () => {
    const url = await resolveTtsUrl(text, opts);
    if (url) preloadAudioUrl(url);
  })();
};

/** 预生成文件的深度预热(URL 已知,直接下载 + 解码)。 */
export const warmReadAloudUrl = (url: string): void => preloadAudioUrl(url);
