/**
 * 初中 hub：预热 key 与播放 key 的一致性守门人（对应小学的 speechSpeedParity.test.ts）。
 *
 * 重点盯 **默写关（WriteStage）**：同一批词会用**两档**播——
 *   答对 → 0.85、答错 → 0.7、词表点读 → 0.7。
 * 原实现预热时漏传 speed，落到 getKidSpeed(7/8/9)=1.0，两档全落空。
 * 修复后必须满足：预热覆盖的档位 **恰好等于** 播放用到的档位集合，且逐档 key 逐字相等。
 * 只热一档也算失败——那样另一档必然冷合成。
 *
 * key 拼法与 supabase/functions/tts/index.ts 一致；公式本身由
 * scripts/audio/tts-golden-url.mjs 用 439 条线上真实 URL 校验（439/439）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prefetchMock = vi.fn();
vi.mock('@/lib/speak', () => ({
  prefetchTTSBatchKid: (...args: unknown[]) => prefetchMock(...args),
  speakKid: vi.fn(),
  stopSpeaking: vi.fn(),
  isSynthInFlight: vi.fn(() => false),
  KID_VOICE_ID: 'el:lily',
}));

const { JUNIOR_SPEAK_SPEED, WRITE_STAGE_SPEEDS, prefetchJuniorWriteStage } = await import('./speakSpeeds');

const REPO = path.resolve(__dirname, '../../..');
const STAGE_PLAY = 'src/pages/juniorHub/JuniorHubStagePlay.tsx';
const readRepo = (rel: string) => fs.readFileSync(path.join(REPO, rel), 'utf8');

/** 与 tts edge 的 keyInput 同构：初中 hub 恒为 elevenlabs|el:lily，accent 空。 */
const cacheKey = (text: string, speed: number) =>
  `elevenlabs|el:lily|${Math.min(1.2, Math.max(0.6, Number(speed) || 0.95))}||${text}`;

const warmedSpeeds = () =>
  prefetchMock.mock.calls.map((c) => (c[1] as { speed?: number }).speed);

beforeEach(() => prefetchMock.mockClear());

describe('默写关：预热档位 === 播放档位（两档都要）', () => {
  const WORD = 'brave';

  for (const grade of [7, 8, 9]) {
    it(`g${grade}：预热恰好覆盖 0.85 与 0.7 两档，且 key 与播放逐字相等`, () => {
      prefetchJuniorWriteStage([WORD], grade);

      const warmed = warmedSpeeds();
      // 恰好两档，不多不少
      expect([...warmed].sort()).toEqual([JUNIOR_SPEAK_SPEED.slow, JUNIOR_SPEAK_SPEED.normal].sort());
      // 每档都显式带 speed（漏传就会落回 getKidSpeed，正是原缺陷）
      for (const c of prefetchMock.mock.calls) {
        expect(c[1]).toHaveProperty('speed');
        expect((c[1] as { grade: number }).grade).toBe(grade);
      }
      // 逐档 key 相等：预热算出的 key === 播放算出的 key
      const playbackSpeeds = [JUNIOR_SPEAK_SPEED.normal, JUNIOR_SPEAK_SPEED.slow]; // 答对 / 答错·点读
      for (const sp of playbackSpeeds) {
        expect(warmed.map((w) => cacheKey(WORD, w as number))).toContain(cacheKey(WORD, sp));
      }
    });
  }

  it('getKidSpeed(7/8/9)=1.0 这一档**不应该**被预热（原缺陷就是热到了这里）', () => {
    prefetchJuniorWriteStage(['brave'], 8);
    expect(warmedSpeeds()).not.toContain(1.0);
  });

  it('空列表不发预热请求', () => {
    prefetchJuniorWriteStage([], 7);
    expect(prefetchMock).not.toHaveBeenCalled();
  });
});

describe('语速常量 === 组件里实际用的档位（锚点仍在）', () => {
  it('组件已改为引用常量，不再有裸字面量语速', () => {
    const src = readRepo(STAGE_PLAY);
    expect(src).toContain('JUNIOR_SPEAK_SPEED');
    // 播放侧不允许再出现 hubSpeak(x, 0.85/0.8/0.7, grade) 这类字面量
    expect(src).not.toMatch(/hubSpeak\([^,]+,\s*0\.\d+\s*,/);
    // 预热侧不允许再出现 speed: 0.xx
    expect(src).not.toMatch(/speed:\s*0\.\d+/);
  });

  it('默写关走的是 prefetchJuniorWriteStage，不是裸 prefetchTTSBatchKid', () => {
    const src = readRepo(STAGE_PLAY);
    expect(src).toContain('prefetchJuniorWriteStage(');
    // 该关的播放两档仍在
    expect(src).toContain('hubSpeak(answer, JUNIOR_SPEAK_SPEED.normal, grade)');
    expect(src).toContain('hubSpeak(answer, JUNIOR_SPEAK_SPEED.slow, grade)');
    expect(src).toContain('hubSpeak(v.en, JUNIOR_SPEAK_SPEED.slow, grade)');
  });

  it('三个档位值与矩阵一致（改档位会红，逼人同步矩阵与映射表）', () => {
    expect(JUNIOR_SPEAK_SPEED).toEqual({ normal: 0.85, listen: 0.8, slow: 0.7 });
    expect(WRITE_STAGE_SPEEDS).toEqual([0.85, 0.7]);
  });
});
