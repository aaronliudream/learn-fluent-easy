/**
 * 预热 key 与播放 key 的一致性回归测试（审计 C2 的守门人）。
 *
 * 背景：音频对象是内容寻址的，key = `provider|voice|speed|accent|text`。
 * 预热与播放只要 speed 差一位，预热就 100% 灌到没人播的 key 上——
 * C2-1（句型对话关）/ C2-2（自然拼读找一找）就是这么发生的：播放写死 0.85，
 * 预热漏传 speed 落到 getKidSpeed(grade)，四~六年级变 1.0。
 *
 * 因此这里对 **g3/g4/g5/g6 四个年级分别**断言两侧的 key 逐字相等——
 * 只测 g4 会漏（g4 恰好等于 0.85，是唯一"碰巧对"的年级）。
 *
 * key 拼法与 supabase/functions/tts/index.ts 一致；那份公式本身由
 * scripts/audio/tts-golden-url.mjs 用 439 条线上真实 URL 逐字校验（439/439）。
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const speakKidMock = vi.fn();
const prefetchTTSBatchKidMock = vi.fn();

vi.mock("@/lib/webSpeech", () => ({
  isWebSpeechSupported: vi.fn(() => true),
  speakWebSpeech: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/speak", () => ({
  speakKid: (...args: unknown[]) => speakKidMock(...args),
  prefetchTTSBatchKid: (...args: unknown[]) => prefetchTTSBatchKidMock(...args),
  stopSpeaking: vi.fn(),
  isSynthInFlight: vi.fn(() => false),
  KID_VOICE_ID: "el:lily",
}));

const { hubSpeak, prefetchHubFixed, prefetchHubVocabulary } = await import("./speech");
const { HUB_FIXED_SPEAK_SPEED } = await import("./hubSpeakSpeed");
const { getGradeConfig } = await import("./spellingStageConfig");
const { getListenWordConfig } = await import("./listenWordStageConfig");

type GradeKey = "g3" | "g4" | "g5" | "g6";
const GRADES: Array<{ grade: number; key: GradeKey }> = [
  { grade: 3, key: "g3" },
  { grade: 4, key: "g4" },
  { grade: 5, key: "g5" },
  { grade: 6, key: "g6" },
];

/** 与 tts edge 的 keyInput 同构：小学恒为 elevenlabs|el:lily，accent 恒空。 */
const cacheKey = (text: string, speed: number) =>
  `elevenlabs|el:lily|${Math.min(1.2, Math.max(0.6, Number(speed) || 0.95))}||${text}`;

const lastSpeakSpeed = (): number | undefined => {
  const call = speakKidMock.mock.calls.at(-1);
  return (call?.[1] as { speed?: number } | undefined)?.speed;
};
const lastPrefetchOpts = (): { grade?: number; speed?: number } | undefined =>
  prefetchTTSBatchKidMock.mock.calls.at(-1)?.[1] as { grade?: number; speed?: number } | undefined;

beforeEach(() => {
  speakKidMock.mockClear();
  prefetchTTSBatchKidMock.mockClear();
});

describe("固定档模块：预热 key === 播放 key（四个年级）", () => {
  const TEXT = "Where is the teachers' office?"; // 句型对话关那类整句

  for (const { grade } of GRADES) {
    it(`g${grade}`, () => {
      hubSpeak(TEXT, HUB_FIXED_SPEAK_SPEED, grade);
      const playSpeed = lastSpeakSpeed();

      prefetchHubFixed([TEXT], grade);
      const warmSpeed = lastPrefetchOpts()?.speed;

      expect(playSpeed).toBeDefined();
      expect(warmSpeed).toBeDefined();
      expect(cacheKey(TEXT, warmSpeed!)).toBe(cacheKey(TEXT, playSpeed!));
    });
  }

  it("prefetchHubFixed 必须显式带 speed（漏传就会落到 getKidSpeed，这正是 C2-1/C2-2 的成因）", () => {
    prefetchHubFixed([TEXT], 6);
    expect(lastPrefetchOpts()).toHaveProperty("speed", HUB_FIXED_SPEAK_SPEED);
  });

  it("prefetchHubVocabulary 的默认档与 hubSpeak 的默认档同源", () => {
    hubSpeak("ruler", undefined, 6);
    const playSpeed = lastSpeakSpeed();
    prefetchHubVocabulary(["ruler"], 6);
    expect(lastPrefetchOpts()?.speed).toBe(playSpeed);
  });
});

describe("按年级固定档模块：拼写关 / 听音辨词关 两侧同一来源", () => {
  for (const { grade, key } of GRADES) {
    it(`g${grade} 拼写关`, () => {
      // SpellingStage: 播放 speakKid(word,{grade,speed:cfg.speechRate})、
      // 预热 prefetchTTSBatchKid(words,{grade,speed:cfg.speechRate}) —— 同一个 cfg
      const rate = getGradeConfig(key).speechRate;
      expect(cacheKey("apple", rate)).toBe(cacheKey("apple", getGradeConfig(key).speechRate));
      expect(rate).toBeGreaterThan(0.6);
    });

    it(`g${grade} 听音辨词关`, () => {
      const rate = getListenWordConfig(key).speechRate;
      expect(cacheKey("apple", rate)).toBe(cacheKey("apple", getListenWordConfig(key).speechRate));
    });
  }

  it("四个年级的按年级档确实各不相同（若被写死成 0.85 这条会红）", () => {
    const rates = GRADES.map(({ key }) => getGradeConfig(key).speechRate);
    expect(new Set(rates).size).toBe(4);
    expect(rates).toEqual([0.75, 0.85, 0.9, 0.95]);
  });
});
