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

describe('绊线：多音色链路的三处必须齐备', () => {
  const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, '..', '..', rel), 'utf8');
  const junior = () => JSON.parse(read('scripts/audio/audio-sources/junior.json'));
  const itemsSource = () => (junior().sources as Array<{ files: string; filters: Record<string, string>; genderTiers?: string[]; tiers: string[] }>)
    .find((s) => s.files === 'table:junior_listening_items')!;

  /**
   * dialogue 已放开（244 条进池）。原来那三条绊线盯的是"放开但没做多音色"，
   * 现在多音色做完了，盯的东西换成**链路别缺角**：
   *   ① 取数不再按 kind 过滤，且映射表同样不过滤（两边一致）
   *   ② 播放点确实走 speakDialogue（不是又退回单次 hubSpeak(整段)）
   *   ③ 映射表声明了男女两档，且男声档有独立 voiceId
   * 少任何一环，结果都是"一个音色读到底"或"生成的对象没人播"。
   */
  it('① 取数与映射表都不再按 kind 过滤（两边一致）', () => {
    expect(read('src/lib/juniorFinalQuiz.ts')).not.toMatch(/\.eq\("kind",\s*"sentence"\)/);
    expect(itemsSource().filters.kind).toBeUndefined();
  });

  it('② 播放点走 speakDialogue，预热走 prefetchDialogue（不是单次 hubSpeak 整段）', () => {
    const stage = read('src/pages/juniorHub/JuniorHubStagePlay.tsx');
    expect(stage).toContain('speakDialogue(q.audio!, grade)');
    expect(stage).toContain('prefetchDialogue(audios, grade)');
    // 听力题按钮不该再出现"把整段交给 hubSpeak"的写法
    expect(stage).not.toMatch(/hubSpeak\(q\.audio!/);
  });

  it('③ 映射表声明男女两档，男声档有独立 voiceId 且与代码一致', async () => {
    const src = itemsSource();
    expect(src.genderTiers).toHaveLength(2);
    for (const t of src.genderTiers!) expect(src.tiers).toContain(t);
    const tiers = junior().tiers as Record<string, { speeds: number[]; voiceId?: string }>;
    const [femaleTier, maleTier] = src.genderTiers!;
    expect(tiers[maleTier].voiceId, '男声档必须有独立音色，否则男女同声').toBeTruthy();
    expect(tiers[maleTier].voiceId).not.toBe(tiers[femaleTier].voiceId);
    const { MALE_VOICE, DIALOGUE_SPEED } = await import('./juniorHub/speakDialogue');
    expect(tiers[maleTier].voiceId).toBe(MALE_VOICE);
    expect(tiers[maleTier].speeds).toEqual([DIALOGUE_SPEED]);
    expect(tiers[femaleTier].speeds).toEqual([DIALOGUE_SPEED]);
  });

  it('④ 性别不可判的那批仍被显式声明（status=unverified，巡检每轮提醒）', () => {
    const un = (junior().unreachableSources ?? []) as Array<{ ref: string; status: string; rows: number }>;
    const row = un.find((u) => u.ref.includes('junior_listening_items'));
    expect(row, '8 条不可判的对话必须留在 unreachableSources 里，别让"暂缓"变成"消失"').toBeTruthy();
    expect(row!.status).toBe('unverified');
    expect(row!.rows).toBe(8);
  });

  it('⑤ 不可判的对话不会进抽题池（取数侧用同一个 dialogueSplit 过滤）', async () => {
    queryResult = {
      data: [
        { ...row(1, 'ok-1'), audio_text: 'W: Hi. M: Hello.' },
        { ...row(2, 'ok-2'), audio_text: 'W: How are you? M: Fine.' },
        { ...row(3, 'ok-3'), audio_text: 'Hello everyone. I am Peter.' },
        { ...row(3, 'bad'), audio_text: 'Linda: I am not splittable.' },
      ],
      error: null,
    };
    const items = await listeningItemsForUnit(unitOf('8A'));
    expect(items.every((i) => !i.audio?.startsWith('Linda:'))).toBe(true);
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
