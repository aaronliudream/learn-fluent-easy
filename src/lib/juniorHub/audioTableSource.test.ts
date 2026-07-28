/**
 * 表源（table:）取数的守门人 —— 解封 `extract.mjs` 表源分支时要求补的第三条。
 *
 * 表源是整条音频管线里**唯一"少取就少报缺口"**的地方：
 * 分页少一页 = 缺口少一批 = precheck 谎报绿灯。和假 200、CRLF 是同一类失败，
 * 区别只是它更难看见（没人会怀疑一个"成功返回 1000 行"的请求）。
 *
 * 所以这里盯四件事：
 *   ① 分页要真的把每一页都拼回来
 *   ② 触到分页上限必须**抛错**，不许"取到多少算多少"
 *   ③ 抽取数与独立 count=exact 不一致必须**抛错**
 *   ④ 表源必须显式卡 grade —— junior_* 是初中高中混表，只按 publisher 过滤会捞到高中行
 * 外加一条：junior.json 的档位必须与 speakSpeeds.ts 的常量一致（矩阵与映射表不许各说各话）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  PAGE_SIZE,
  TableSourceError,
  fetchTableRows,
  countRows,
} from '../../../scripts/audio/table-source.mjs';
import { pickers } from '../../../scripts/audio/pickers.mjs';
import { JUNIOR_SPEAK_SPEED } from './speakSpeeds';

const DB = { url: 'https://example.test', key: 'anon-key' };
const SOURCE = {
  table: 'junior_vocab',
  select: 'id,word,grade',
  filters: { grade: 'in.(7,8,9)' },
  orderBy: 'id',
};

/** 造一个假 PostgREST：count 走 Range 头那一发，其余按 offset 切页。 */
const mockRest = (total: number, { reportedCount = total }: { reportedCount?: number } = {}) => {
  const urls: string[] = [];
  const rows = Array.from({ length: total }, (_, i) => ({ id: `id-${i}`, word: `w${i}`, grade: 7 }));
  const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
    urls.push(url);
    const headers = (init.headers ?? {}) as Record<string, string>;
    if (headers.Prefer === 'count=exact') {
      return {
        ok: true,
        headers: { get: (h: string) => (h === 'content-range' ? `0-0/${reportedCount}` : null) },
        json: async () => [],
      } as unknown as Response;
    }
    const offset = Number(/offset=(\d+)/.exec(url)?.[1] ?? 0);
    const limit = Number(/limit=(\d+)/.exec(url)?.[1] ?? PAGE_SIZE);
    return { ok: true, headers: { get: () => null }, json: async () => rows.slice(offset, offset + limit) } as unknown as Response;
  });
  vi.stubGlobal('fetch', fetchMock);
  return { fetchMock, urls };
};

afterEach(() => vi.unstubAllGlobals());

describe('表源分页', () => {
  it('多页数据被完整拼回（2500 行 = 3 页）', async () => {
    const { urls } = mockRest(2500);
    const rows = await fetchTableRows(DB, SOURCE);
    expect(rows).toHaveLength(2500);
    expect(rows[0].id).toBe('id-0');
    expect(rows[2499].id).toBe('id-2499');
    // 三页 + 一次 count
    expect(urls.filter((u) => u.includes('offset='))).toHaveLength(3);
  });

  it('每一页都带上 select / 过滤 / order，不是只有第一页带', async () => {
    const { urls } = mockRest(2500);
    await fetchTableRows(DB, SOURCE);
    for (const u of urls.filter((x) => x.includes('offset='))) {
      expect(u).toContain('grade=in.(7,8,9)');
      expect(u).toContain('order=id');
      expect(u).toContain('select=id%2Cword%2Cgrade');
    }
  });

  it('恰好整页时不会多请求一页也不会少一页（1000 行）', async () => {
    const { urls } = mockRest(PAGE_SIZE);
    const rows = await fetchTableRows(DB, SOURCE);
    expect(rows).toHaveLength(PAGE_SIZE);
    expect(urls.filter((u) => u.includes('offset='))).toHaveLength(2); // 第二页返回空才知道到底了
  });

  it('触到分页上限 → 抛错，绝不静默截断', async () => {
    mockRest(2500);
    await expect(fetchTableRows(DB, SOURCE, { maxPages: 2 })).rejects.toThrow(TableSourceError);
    await expect(fetchTableRows(DB, SOURCE, { maxPages: 2 })).rejects.toThrow(/分页上限/);
  });

  it('抽取数与 count=exact 不一致 → 抛错（漏页/并发写入都在这里现形）', async () => {
    mockRest(1500, { reportedCount: 1600 });
    await expect(fetchTableRows(DB, SOURCE)).rejects.toThrow(/与 count 不一致/);
  });

  it('count 查询 HTTP 失败 → 抛错，不当作 0 行', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500, headers: { get: () => null }, json: async () => [] }) as unknown as Response));
    await expect(countRows(DB, SOURCE)).rejects.toThrow(/count 查询失败/);
  });
});

describe('表源 scope：必须卡 grade（混表铁律）', () => {
  it('junior.json 的每个 table: 源都显式声明了 grade in (7,8,9)', () => {
    const cfg = readJunior();
    const tableSources = cfg.sources.filter((s: { files: string }) => s.files.startsWith('table:'));
    expect(tableSources.length).toBeGreaterThan(0);
    for (const s of tableSources) {
      expect(s.filters?.grade, `${s.id} 缺 grade 过滤`).toBe('in.(7,8,9)');
    }
  });

  it('extract.mjs 对缺 grade 过滤的表源硬失败（不是告警后继续）', async () => {
    const { extractItems, ConfigError } = await import('../../../scripts/audio/extract.mjs');
    const bad = {
      voiceId: 'el:lily',
      dataRoots: ['src/data/juniorHub'],
      tiers: { t: { speeds: [0.85] } },
      sources: [{ id: 'bad', files: 'table:junior_vocab', picker: 'juniorVocabWord', tiers: ['t'], filters: { publisher: 'eq.junior' } }],
    };
    await expect(extractItems(bad, { allFiles: [] })).rejects.toThrow(ConfigError);
    await expect(extractItems(bad, { allFiles: [] })).rejects.toThrow(/grade/);
  });
});

describe('junior picker 与运行时取法一致', () => {
  it('语块：例句优先，无例句才用短语（镜像 useUnitVocab 的 chunks 取法）', () => {
    const out = pickers.juniorVocabChunk([
      { id: '1', phrase_en: 'a new unit', example_en: 'This is a new unit.', grade: 7 },
      { id: '2', phrase_en: 'go to school', example_en: null, grade: 7 },
      { id: '3', phrase_en: null, example_en: null, grade: 7 },
    ]);
    expect(out.map((o) => o.text)).toEqual(['This is a new unit.', 'go to school']);
    expect(out[0].field).toBe('example_en');
    expect(out[1].field).toBe('phrase_en');
  });

  it('听力 transcript：有 audio_url 的行不进盘点（那些播固定 MP3，不经运行时 key）', () => {
    const out = pickers.juniorListeningTranscript([
      { id: 'a', transcript: 'Hello there.', audio_url: 'https://cdn/x.mp3', grade: 7 },
      { id: 'b', transcript: 'No file yet.', audio_url: null, grade: 8 },
      { id: 'c', transcript: null, audio_url: null, grade: 9 },
    ]);
    expect(out.map((o) => o.record_id)).toEqual(['junior_listening:b']);
  });
});

describe('映射表档位 === 代码常量（矩阵与 junior.json 不许各说各话）', () => {
  it('hubNormal/hubListen/hubSlow 三档与 JUNIOR_SPEAK_SPEED 逐个相等', () => {
    const t = readJunior().tiers;
    expect(t.hubNormal.speeds).toEqual([JUNIOR_SPEAK_SPEED.normal]);
    expect(t.hubListen.speeds).toEqual([JUNIOR_SPEAK_SPEED.listen]);
    expect(t.hubSlow.speeds).toEqual([JUNIOR_SPEAK_SPEED.slow]);
  });

  it('userDefault 档 = voice.ts 的 DEFAULT_SETTINGS（nova@0.85），且它是唯一带 voiceId 覆盖的档', async () => {
    const { DEFAULT_SETTINGS } = await import('../voice');
    const t = readJunior().tiers as Record<string, { speeds: number[]; voiceId?: string }>;
    expect(t.userDefault.voiceId).toBe(DEFAULT_SETTINGS.voiceId);
    expect(t.userDefault.speeds).toEqual([DEFAULT_SETTINGS.speed]);
    // 带 voiceId 覆盖的档现在有两个：userDefault(nova) 与 hubListenMale(echo，对话男声)。
    // 断言"具体是哪两个"而不是"只有一个"——多一个档就该在这里被看见。
    const overridden = Object.entries(t).filter(([, v]) => v.voiceId).map(([k]) => k).sort();
    expect(overridden).toEqual(['hubListenMale', 'userDefault']);
  });

  it('闯关档 = getKidSpeed(7/8/9) = 1.0（junior 年级钳不到 0.7/0.85 分支）', () => {
    expect(readJunior().tiers.fcKid.speeds).toEqual([1.0]);
  });
});

describe('CI 接入：凭据来源与 PR 闸的表源跳过', () => {
  it('loadDbEnv 优先读进程环境变量（CI 里没有 .env）', async () => {
    const { loadDbEnv } = await import('../../../scripts/audio/table-source.mjs');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://ci.example.co/');
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_ci');
    // 传一个不存在的目录：若还去读 .env 就会抛错，能读到就说明走的是 env
    expect(loadDbEnv('/no/such/repo/root')).toEqual({ url: 'https://ci.example.co', key: 'sb_publishable_ci' });
    vi.unstubAllEnvs();
  });

  /**
   * PR 闸只按文件 diff 触发，而 DB 内容不产生文件改动（用 SQL 加词，任何 PR 都看不见）。
   * 所以 precheck 必须能把表源整段跳过——否则改一个 junior JSON 就要探测整张表
   * （约 1.2 万对象），还会用无关的 DB 缺口把这个 PR 判红。
   * 跳过本身不许静默：调用方用 tableSourcesOf() 把跳过的源逐条打印。
   */
  it('extractItems skipTables=true 时不碰表源，且 tableSourcesOf 能列出被跳过的源', async () => {
    const { extractItems, tableSourcesOf } = await import('../../../scripts/audio/extract.mjs');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const cfg = readJunior();
    const rows = await extractItems(cfg, { allFiles: [], allowEmptySources: true, skipTables: true });
    expect(fetchMock, '跳过表源就不该发任何请求').not.toHaveBeenCalled();
    expect([...rows.values()].some((r) => r.source_ref.startsWith('table:'))).toBe(false);
    // 被跳过的东西必须能被列出来（否则调用方无法如实说明覆盖范围）
    const skipped = tableSourcesOf(cfg);
    expect(skipped.map((s) => s.table).sort())
      .toEqual(['junior_listening_exercises', 'junior_listening_items', 'junior_vocab', 'junior_vocab']);
    vi.unstubAllGlobals();
  });

  it('PR 闸 workflow 覆盖 junior，且把 extraFiles 的路径也列进 paths', () => {
    const wf = fs.readFileSync(path.resolve(__dirname, '../../../.github/workflows/audio-precheck.yml'), 'utf8');
    expect(wf).toContain('--section junior');
    for (const e of readJunior().extraFiles as Array<{ path: string }>) {
      expect(wf, `extraFiles 的 ${e.path} 不在 workflow 的 paths 里 → 改它可以绕过闸门`).toContain(e.path);
    }
  });

  it('周巡检覆盖 junior 且阈值为 0（DB 新增缺口只有它能发现）', () => {
    const wf = fs.readFileSync(path.resolve(__dirname, '../../../.github/workflows/audio-audit.yml'), 'utf8');
    expect(wf).toMatch(/--section junior --threshold 0/);
    // 表源要连库 → 必须注入这两个变量，否则那一步会直接报错
    expect(wf).toContain('VITE_SUPABASE_URL: ${{ vars.VITE_SUPABASE_URL }}');
    expect(wf).toContain('VITE_SUPABASE_PUBLISHABLE_KEY: ${{ vars.VITE_SUPABASE_PUBLISHABLE_KEY }}');
  });
});

describe('绊线：junior_listening_items 的取数与映射表必须同步', () => {
  const finalQuizSrc = () => fs.readFileSync(path.resolve(__dirname, '../juniorFinalQuiz.ts'), 'utf8');
  const selectCols = () => {
    const m = /from\("junior_listening_items"\)\s*\n?\s*\.select\("([^"]+)"\)/.exec(finalQuizSrc());
    expect(m, '取数写法变了，先重新核可达性再改这条测试').not.toBeNull();
    return m![1].split(',').map((c) => c.trim());
  };

  /**
   * 这批题曾经**一道都没被用过**：select 里多写了一个表里不存在的 `audio_url` 列 →
   * PostgREST 400 → data=null → `data ?? []` 吞掉错误当成"题库 0 行" → 每次静默回退内联题。
   * 没有任何报错，所以从灌库到发现隔了很久。这条测试就是钉住"别再退回去"。
   */
  it('select 不许再出现 audio_url（这张表没有这一列，带上就是 400 → 静默回退）', () => {
    expect(selectCols()).not.toContain('audio_url');
  });

  it('select 与 junior.json 表源的取数字段一致：audio_text 两边都要有', () => {
    expect(selectCols()).toContain('audio_text');
    const src = (readJunior().sources as Array<{ files: string; select: string }>)
      .find((s) => s.files === 'table:junior_listening_items');
    expect(src, 'junior_listening_items 已可达，映射表必须有对应表源，否则这批文本没人给它生成音频').toBeTruthy();
    expect(src!.select.split(',').map((c) => c.trim())).toContain('audio_text');
  });

  it('查询出错不许再被静默吞掉（回退路径必须留痕）', () => {
    const src = finalQuizSrc();
    expect(src).toMatch(/const \{ data, error \}[\s\S]{0,400}junior_listening_items/);
    expect(src).toMatch(/if \(error\)[\s\S]{0,300}console\.error/);
  });

  it('映射表的 volume 过滤与代码里的可达册一致（代码只对 7B/8A/8B 查这张表）', () => {
    const books = /\[("7B",\s*"8A",\s*"8B")\]\.includes\(unit\.book\)/.exec(finalQuizSrc());
    expect(books, 'listeningItemsForUnit 的可达册变了 → junior.json 的 volume 过滤要同步').not.toBeNull();
    const src = (readJunior().sources as Array<{ files: string; filters: Record<string, string> }>)
      .find((s) => s.files === 'table:junior_listening_items');
    expect(src!.filters.volume).toBe('in.(7B,8A,8B)');
  });

  it('不再挂在 unreachableSources 下（同一张表不能既"不可达"又是正式源）', () => {
    const cfg = readJunior();
    expect((cfg.unreachableSources ?? []).map((u: { ref: string }) => u.ref))
      .not.toContain('table:junior_listening_items');
  });
});

function readJunior() {
  const p = path.resolve(__dirname, '../../../scripts/audio/audio-sources/junior.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
