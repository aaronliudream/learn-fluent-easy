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
    const overridden = Object.entries(t).filter(([, v]) => v.voiceId).map(([k]) => k);
    expect(overridden).toEqual(['userDefault']);
  });

  it('闯关档 = getKidSpeed(7/8/9) = 1.0（junior 年级钳不到 0.7/0.85 分支）', () => {
    expect(readJunior().tiers.fcKid.speeds).toEqual([1.0]);
  });
});

describe('绊线：junior_listening_items 一旦变可达，映射表必须跟上', () => {
  /**
   * 现状（2026-07-26 实测）：`junior_listening_items` **没有** audio_url 这一列，
   * 而 juniorFinalQuiz.ts 的 select 带了它 → PostgREST 400 → data=null → `data ?? []`
   * 吞掉错误 → 单元通关听力题永远回退内联 JSON。那 384 条 audio_text 因此播不到，
   * 所以 junior.json 没给它建 source。
   *
   * 这条测试盯的是"修好那天"：select 一旦不再带 audio_url，384 条就变成可达的 0.8 档文本，
   * 必须同时给 junior.json 加表源，否则单元通关听力题会全程冷合成、而且没人会发现。
   */
  it('select 仍带不存在的 audio_url（=仍不可达）；若已改，则 junior.json 必须有该表源', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../juniorFinalQuiz.ts'), 'utf8');
    const sel = /from\("junior_listening_items"\)\s*\n?\s*\.select\("([^"]+)"\)/.exec(src);
    expect(sel, '取数写法变了，先重新核可达性再改这条测试').not.toBeNull();
    const stillBroken = sel![1].includes('audio_url');
    const cfg = readJunior();
    const declared = (cfg.sources as { files: string }[]).some((s) => s.files === 'table:junior_listening_items');
    if (stillBroken) {
      expect(declared, 'select 仍会 400 → 该表不可达 → 不该建 source').toBe(false);
      expect((cfg.unreachableSources ?? []).map((u: { ref: string }) => u.ref)).toContain('table:junior_listening_items');
    } else {
      expect(declared, 'select 已修好 → 384 条 audio_text 变可达 → junior.json 必须加 table:junior_listening_items（tier=hubListen）').toBe(true);
    }
  });
});

function readJunior() {
  const p = path.resolve(__dirname, '../../../scripts/audio/audio-sources/junior.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
