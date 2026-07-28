/**
 * 单元通关听力题的取数守门人。
 *
 * 背景：这条路径出过一次**静默事故**——`select` 里多写了一个表里不存在的 `audio_url` 列，
 * PostgREST 返回 400，supabase-js 给回 `data=null`，而代码写的是 `data ?? []`，
 * 于是"查询失败"被当成"题库 0 行"，每次都悄悄回退内联题。384 道题从灌库起一道没用过，
 * 没有任何报错、没有白屏，纯靠人工对账才发现。
 *
 * 所以这里盯四件事：
 *   ① 正常情况走 DB 题库，而且是**难度 1/2/3 各 1**
 *   ② 查询报错 → 仍能回退内联（做题体验不能断），但**必须留痕**（console.error）
 *   ③ 题库不足 3 题 → 回退内联
 *   ④ 不在 7B/8A/8B 的单元 → 压根不查这张表
 */
import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Row = {
  difficulty: number; kind: string; audio_text: string;
  question: string; options: string[]; answer: string; explanation: string | null;
};

/** 当前这轮查询的返回值，由每个用例设置。 */
let queryResult: { data: Row[] | null; error: { message: string } | null } = { data: [], error: null };
const selectSpy = vi.fn();
const fromSpy = vi.fn();

vi.mock('@/integrations/supabase/client', () => {
  const chain = {
    select: (cols: string) => { selectSpy(cols); return chain; },
    eq: () => chain,
    order: () => chain,
    then: (resolve: (v: unknown) => unknown) => Promise.resolve(queryResult).then(resolve),
  };
  return { supabase: { from: (t: string) => { fromSpy(t); return chain; } } };
});
// 听力路径不碰这些，但模块顶层会 import；给最小桩避免真去查库。
vi.mock('@/lib/juniorGrammarMastery', () => ({ loadJuniorGrammarMasteryAll: async () => [] }));

const { listeningItemsForUnit } = await import('./juniorFinalQuiz');

const row = (d: number, text: string): Row => ({
  difficulty: d, kind: 'sentence', audio_text: text,
  question: `问题-${text}`, options: ['甲', '乙', '丙', '丁'], answer: 'B', explanation: `解析-${text}`,
});

/** 16 题/单元，与线上一致（难度 1/2/3 都有多条，够验"各取 1"）。 */
const dbRows: Row[] = [
  ...Array.from({ length: 6 }, (_, i) => row(1, `d1-${i}`)),
  ...Array.from({ length: 5 }, (_, i) => row(2, `d2-${i}`)),
  ...Array.from({ length: 5 }, (_, i) => row(3, `d3-${i}`)),
];

const INLINE = [
  { audio: '内联-1', opts: ['a', 'b', 'c', 'd'], answer: 0 },
  { audio: '内联-2', opts: ['a', 'b', 'c', 'd'], answer: 1 },
  { audio: '内联-3', opts: ['a', 'b', 'c', 'd'], answer: 2 },
  { audio: '内联-4', opts: ['a', 'b', 'c', 'd'], answer: 3 },
];
const unitOf = (book: string) => ({
  id: `u-${book}`, book, unitKey: 'U1', title: 'T', listeningQuestions: INLINE,
} as unknown as Parameters<typeof listeningItemsForUnit>[0]);

const diffOfText = (t: string) => Number(/^d(\d)-/.exec(t)?.[1] ?? 0);

beforeEach(() => {
  queryResult = { data: [], error: null };
  selectSpy.mockClear();
  fromSpy.mockClear();
});

describe('①正常：走 DB 题库，难度 1/2/3 各 1', () => {
  for (const book of ['7B', '8A', '8B']) {
    it(`${book}：3 题全部来自 DB，且三个难度各 1 条`, async () => {
      queryResult = { data: dbRows, error: null };
      const items = await listeningItemsForUnit(unitOf(book));

      expect(fromSpy).toHaveBeenCalledWith('junior_listening_items');
      expect(items).toHaveLength(3);
      // 全部来自 DB（内联题的 audio 是"内联-N"）
      expect(items.every((i) => i.audio?.startsWith('d'))).toBe(true);
      expect([...items.map((i) => diffOfText(i.audio!))].sort()).toEqual([1, 2, 3]);
      // DB 题带独立中文题干与解析，内联题没有——顺带钉住"用的确实是 DB 那批"
      expect(items.every((i) => i.q.startsWith('问题-'))).toBe(true);
      expect(items.every((i) => !!i.explanation)).toBe(true);
      // answer 字母 B → 下标 1（洗牌前）；洗牌后仍必须指向原正确项
      expect(items.every((i) => i.opts[i.answer] === '乙')).toBe(true);
    });
  }

  it('select 只取真实存在的列，且不含 audio_url', async () => {
    queryResult = { data: dbRows, error: null };
    await listeningItemsForUnit(unitOf('7B'));
    const cols = selectSpy.mock.calls[0][0].split(',').map((c: string) => c.trim());
    expect(cols).not.toContain('audio_url');
    expect(cols).toEqual(['difficulty', 'kind', 'audio_text', 'question', 'options', 'answer', 'explanation']);
  });

  it('这批题不带 audioUrl（没有预生成 MP3，错题本按 audio 文本走 TTS）', async () => {
    queryResult = { data: dbRows, error: null };
    const items = await listeningItemsForUnit(unitOf('8A'));
    expect(items.every((i) => i.audioUrl == null)).toBe(true);
  });
});

describe('②查询报错：回退内联，但必须留痕', () => {
  it('error → 用内联题，且 console.error 打出来（不许静默）', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    queryResult = { data: null, error: { message: 'column junior_listening_items.audio_url does not exist' } };

    const items = await listeningItemsForUnit(unitOf('7B'));

    expect(items).toHaveLength(3);
    expect(items.every((i) => i.audio?.startsWith('内联-'))).toBe(true); // 兜底仍然出题
    expect(spy).toHaveBeenCalled();
    expect(String(spy.mock.calls[0][0])).toContain('junior_listening_items');
    expect(String(spy.mock.calls[0][0])).toContain('回退内联');
    spy.mockRestore();
  });
});

describe('绊线：dialogue 类放开前，多音频朗读必须先就绪', () => {
  const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, '..', '..', rel), 'utf8');
  const junior = () => JSON.parse(read('scripts/audio/audio-sources/junior.json'));
  const itemsSource = () => (junior().sources as Array<{ files: string; filters: Record<string, string>; dialogueVoices?: unknown }>)
    .find((s) => s.files === 'table:junior_listening_items')!;

  /**
   * 现状（决策 C）：只取 kind='sentence'。dialogue 类 244 条暂缓，因为播放层是单次
   * `hubSpeak(整段文本)`——"W: … M: …" 会被一个音色读完，说话人标记还会被念出来。
   *
   * 这条测试盯的是"有人放开 dialogue"那一刻：三处必须同时到位
   * （取数过滤、映射表过滤、播放点换成 speakSequence + 声明分角色音色），
   * 少一处就红。否则 244 道题会以"一个音色读到底"的形态直接上线。
   */
  it('代码与映射表的 kind 过滤必须一致（要么都限 sentence，要么都放开）', () => {
    const codeFiltersSentence = /\.eq\("kind",\s*"sentence"\)/.test(read('src/lib/juniorFinalQuiz.ts'));
    const cfgFiltersSentence = itemsSource().filters.kind === 'eq.sentence';
    expect(
      codeFiltersSentence,
      `取数过滤(${codeFiltersSentence}) 与 junior.json 过滤(${cfgFiltersSentence}) 不一致：`
      + '一边放开 dialogue 另一边没放，会导致这批文本没人给它生成音频（或反之，生成了没人播）',
    ).toBe(cfgFiltersSentence);
  });

  it('一旦放开 dialogue：播放点必须已换成 speakSequence，且映射表声明了分角色音色', () => {
    const codeFiltersSentence = /\.eq\("kind",\s*"sentence"\)/.test(read('src/lib/juniorFinalQuiz.ts'));
    if (codeFiltersSentence) {
      // 仍是决策 C 的状态：确认"暂缓"的理由还写在映射表里，别哪天被人删成谜
      expect(itemsSource().dialogueDeferredNote, 'dialogue 暂缓的原因必须留在映射表里').toBeTruthy();
      return;
    }
    const stage = read('src/pages/juniorHub/JuniorHubStagePlay.tsx');
    expect(
      stage.includes('speakSequence'),
      'dialogue 已放开，但单元通关听力题还在用单次 hubSpeak(整段) —— 一男一女会被同一个音色读完',
    ).toBe(true);
    expect(
      itemsSource().dialogueVoices,
      'dialogue 已放开，但映射表没声明分角色音色（W/M 或 A/B → 哪个 voiceId），可达集算不出来',
    ).toBeTruthy();
  });

  it('只取 sentence 时，抽题池里不会出现带说话人标记的文本', async () => {
    // 说话人标记（"W:"/"M:"/"A:"/"B:"）是 dialogue 的形态特征；sentence 类不该有
    queryResult = { data: [row(1, 'd1-a'), row(2, 'd2-a'), row(3, 'd3-a')], error: null };
    const items = await listeningItemsForUnit(unitOf('7B'));
    expect(items.every((i) => !/(^|\s)[A-Z]\s*:/.test(i.audio ?? ''))).toBe(true);
  });
});

describe('③题库不足 / ④不在可达册', () => {
  it('DB 只有 2 题（< 3）→ 回退内联', async () => {
    queryResult = { data: [row(1, 'd1-a'), row(2, 'd2-a')], error: null };
    const items = await listeningItemsForUnit(unitOf('8B'));
    expect(items.every((i) => i.audio?.startsWith('内联-'))).toBe(true);
  });

  it('7A（不在 7B/8A/8B）→ 根本不查这张表', async () => {
    queryResult = { data: dbRows, error: null };
    const items = await listeningItemsForUnit(unitOf('7A'));
    expect(fromSpy).not.toHaveBeenCalled();
    expect(items.every((i) => i.audio?.startsWith('内联-'))).toBe(true);
  });
});
