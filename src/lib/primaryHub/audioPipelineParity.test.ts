/**
 * 音频预生成管线 ↔ 组件真实行为 的一致性守门人。
 *
 * 管线里有两类"抄来的东西"，抄来的都会漂：
 *   ① 档位常量：映射表里的 0.85 / 0.75… 抄自代码常量
 *   ② 取数规则：picker 里的"每单元前 4 组对话""只有看图选词读 options[answer]"等，抄自组件行为
 * 组件改了而这里没跟，缺口就从此不可见（管线照常报"零缺口"）。
 * 所以这里对每一处抄来的东西都下断言；组件一改，测试红，逼人同步。
 *
 * 另含反向哨兵（strayUnderContentParents）的自测：造一个游离目录，断言它能被识破。
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { beforeAll, describe, expect, it, vi } from 'vitest';

// speak.ts 会 import supabase client（需要 env），测试里替掉，保证 CI 无 .env 也能跑
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
}));

const REPO = path.resolve(__dirname, '../../..');
const readRepo = (rel: string) => fs.readFileSync(path.join(REPO, rel), 'utf8');
const cfg = JSON.parse(readRepo('scripts/audio/audio-sources/primary.json'));

let pickersMod: any;
let coverageMod: any;
let speeds: any;
let spelling: any;
let listenWord: any;
let speak: any;

beforeAll(async () => {
  pickersMod = await import('../../../scripts/audio/pickers.mjs');
  coverageMod = await import('../../../scripts/audio/coverage.mjs');
  speeds = await import('./hubSpeakSpeed');
  spelling = await import('./spellingStageConfig');
  listenWord = await import('./listenWordStageConfig');
  speak = await import('@/lib/speak');
});

const GRADES = [3, 4, 5, 6] as const;

describe('映射表档位 === 代码常量', () => {
  it('fixed 档 === HUB_FIXED_SPEAK_SPEED', () => {
    expect(cfg.tiers.fixed.speeds).toEqual([speeds.HUB_FIXED_SPEAK_SPEED]);
  });

  it('switchable 档 === HUB_SPEAK_SPEED_LEVELS', () => {
    expect(cfg.tiers.switchable.speeds).toEqual(speeds.HUB_SPEAK_SPEED_LEVELS.map((l: any) => l.value));
  });

  for (const g of GRADES) {
    it(`perGrade g${g} === 拼写关与听音辨词关的 speechRate（两者必须一致）`, () => {
      const fromSpelling = spelling.getGradeConfig(`g${g}`).speechRate;
      const fromListen = listenWord.getListenWordConfig(`g${g}`).speechRate;
      expect(fromSpelling).toBe(fromListen);
      expect(cfg.tiers.perGrade.byGrade[String(g)]).toBe(fromSpelling);
    });

    it(`kidSpeed g${g} === getKidSpeed(${g})`, () => {
      expect(cfg.tiers.kidSpeed.byGrade[String(g)]).toBe(speak.getKidSpeed(g));
    });
  }
});

describe('picker 取数规则 === 组件真实行为（锚点仍在）', () => {
  it('每个 picker 都登记了锚点（新增 picker 不许漏登记）', () => {
    const pickerNames = Object.keys(pickersMod.pickers);
    const anchored = Object.keys(pickersMod.PICKER_ANCHORS);
    expect(anchored.sort()).toEqual(pickerNames.sort());
  });

  it('映射表里用到的 picker 全部已实现', () => {
    for (const s of cfg.sources) {
      expect(Object.keys(pickersMod.pickers)).toContain(s.picker);
    }
  });

  it('所有锚点都还在组件源码里', () => {
    const missing: string[] = [];
    for (const [picker, list] of Object.entries(pickersMod.PICKER_ANCHORS) as any) {
      for (const a of list) {
        const src = readRepo(a.file);
        if (!src.includes(a.anchor)) missing.push(`${picker} → ${a.file} 找不到锚点 ${JSON.stringify(a.anchor)}（${a.why}）`);
      }
    }
    expect(missing, `组件行为可能已改，picker 需要同步：\n${missing.join('\n')}`).toEqual([]);
  });
});

describe('从组件抄来的具体常量', () => {
  it('DIALOGUE_PAIRS_PER_UNIT === 组件里的 out.length < N', () => {
    const src = readRepo('src/pages/primaryHub/PrimaryHubStagePlay.tsx');
    const m = /out\.length < (\d+)/.exec(src);
    expect(m, '组件里的 SentenceStage 取数上限写法变了，picker 需同步').not.toBeNull();
    expect(Number(m![1])).toBe(pickersMod.DIALOGUE_PAIRS_PER_UNIT);
  });

  it('FC_OPTIONS_ANSWER_TYPE === 只有该题型的关卡朗读 options[answer]', () => {
    const picMatch = readRepo('src/components/primaryHub/finalChallenge/levels/PicMatchWordLevel.tsx');
    expect(picMatch).toContain(`getQuestionsByType("${pickersMod.FC_OPTIONS_ANSWER_TYPE}"`);
    expect(picMatch).toContain('speakKid(q.options[q.answer]');

    // 反面：其他关卡不应该朗读 options[answer]，否则 picker 漏抽
    const others = [
      'OddOneOutLevel', 'PicMatchSentenceLevel', 'ReadingJudgeLevel', 'SentenceTransformLevel',
      'FillInChooseLevel', 'SentenceOrderingLevel', 'ListenChooseWordLevel',
      'ListenChooseAnswerLevel', 'ListenJudgePictureLevel', 'DialogueResponseLevel',
    ];
    const leaking = others.filter((f) =>
      readRepo(`src/components/primaryHub/finalChallenge/levels/${f}.tsx`).includes('speakKid(q.options[q.answer]'));
    expect(leaking, `这些关卡也朗读了 options[answer]，fcSeed picker 需要扩展：${leaking.join(', ')}`).toEqual([]);
  });

  it("o'clock 跳过规则只发生在预热侧（管线仍要生成该对象，因为播放有云端兜底）", () => {
    const speech = readRepo('src/lib/primaryHub/speech.ts');
    // 预热跳过
    expect(speech).toContain('isOClockVocabToken(t) && isWebSpeechSupported()');
    // 播放侧仍有云端兜底：Web Speech 不可用或失败时走 hubSpeakCloud
    expect(speech).toContain('if (!isWebSpeechSupported()) {');
    expect(speech).toContain('if (!ok) hubSpeakCloud(spoken, rate, grade);');
  });
});

describe('反向哨兵 strayUnderContentParents', () => {
  it('缺 contentParents 时必须抛错（不许"没声明就等于通过"）', () => {
    expect(() => coverageMod.strayUnderContentParents({ dataRoots: ['a'] }, REPO)).toThrow();
  });

  it('当前 primary 配置无游离条目', () => {
    expect(coverageMod.strayUnderContentParents(cfg, REPO)).toEqual([]);
  });

  it('造一个游离目录 → 必须被识破', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sentinel-'));
    try {
      fs.mkdirSync(path.join(tmp, 'data', 'mineHub'), { recursive: true });
      fs.mkdirSync(path.join(tmp, 'data', 'strayNewModule'), { recursive: true });
      const fake = {
        contentParents: ['data'],
        dataRoots: ['data/mineHub'],
        outOfScope: [],
      };
      expect(coverageMod.strayUnderContentParents(fake, tmp)).toEqual(['data/strayNewModule']);

      // 声明之后就不再报
      const declared = { ...fake, outOfScope: [{ paths: ['data/strayNewModule'], why: '测试用' }] };
      expect(coverageMod.strayUnderContentParents(declared, tmp)).toEqual([]);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
