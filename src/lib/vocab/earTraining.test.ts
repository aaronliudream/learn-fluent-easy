/**
 * 慢速跟读档的时间拉伸测试。
 *
 * 这一档的全部价值在于「变慢但**不变调**」—— 如果音高跟着掉,
 * 它就退化成 AudioBufferSourceNode.playbackRate 那种低音怪,
 * 和被弃用的拆读音频是同一类毛病。所以这里把"保音高"当硬断言测,
 * 判据 = 过零率(每秒过零次数 ≈ 2×基频),拉伸前后必须基本一致。
 */
import { describe, expect, it } from "vitest";
import { timeStretch } from "./earTraining";

const SR = 24000;   // OpenAI TTS 出的 mp3 就是这个采样率量级

function sine(freq: number, seconds: number, sr = SR): Float32Array {
  const out = new Float32Array(Math.round(seconds * sr));
  for (let i = 0; i < out.length; i++) out[i] = Math.sin((2 * Math.PI * freq * i) / sr);
  return out;
}

/** 过零次数 / 秒。纯音下 ≈ 2×频率,是最省事的"音高有没有变"探针。 */
function zeroCrossRate(x: Float32Array, sr = SR): number {
  let n = 0;
  for (let i = 1; i < x.length; i++) if ((x[i - 1] < 0) !== (x[i] < 0)) n++;
  return n / (x.length / sr);
}

describe("timeStretch", () => {
  it("rate=1 原样返回,不做无谓的复制运算", () => {
    const x = sine(200, 0.2);
    expect(timeStretch(x, SR, 1)).toBe(x);
  });

  it("空输入不炸", () => {
    expect(timeStretch(new Float32Array(0), SR, 0.7).length).toBe(0);
  });

  it("0.7 倍:时长拉长到约 1/0.7 倍", () => {
    const x = sine(200, 0.5);
    const y = timeStretch(x, SR, 0.7);
    const ratio = y.length / x.length;
    expect(ratio).toBeGreaterThan(1.35);
    expect(ratio).toBeLessThan(1.50);      // 理论值 1.4286
  });

  it("0.7 倍:音高不变(过零率偏差 < 3%)——本档的立身之本", () => {
    for (const f of [120, 200, 440]) {
      const x = sine(f, 0.5);
      const y = timeStretch(x, SR, 0.7);
      const drift = Math.abs(zeroCrossRate(y) - zeroCrossRate(x)) / zeroCrossRate(x);
      expect(drift, `${f}Hz 音高漂了 ${(drift * 100).toFixed(1)}%`).toBeLessThan(0.03);
    }
  });

  it("对照:若按改采样率的做法(重采样),音高必然掉 —— 说明这个测试确实测得出问题", () => {
    /* 反向哨兵。没有它,上面那条"偏差<3%"可能只是因为探针根本测不出差异。
       重采样 0.7 倍 = 音高降到 0.7 倍,过零率应当明显偏离。 */
    const x = sine(200, 0.5);
    const resampled = new Float32Array(Math.round(x.length / 0.7));
    for (let i = 0; i < resampled.length; i++) resampled[i] = x[Math.floor(i * 0.7)];
    const drift = Math.abs(zeroCrossRate(resampled) - zeroCrossRate(x)) / zeroCrossRate(x);
    expect(drift).toBeGreaterThan(0.25);   // 实际约 30%
  });

  it("输出幅度不爆(归一化生效)", () => {
    const y = timeStretch(sine(200, 0.4), SR, 0.7);
    let peak = 0;
    for (const v of y) peak = Math.max(peak, Math.abs(v));
    expect(peak).toBeLessThan(1.2);
  });
});
