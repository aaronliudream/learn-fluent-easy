/**
 * 音频巡检内核 + CSV 解析的单测。
 *
 * 这两处都曾/可能"静默返回没问题"：
 *   - CSV：按 '\n' 切行，CRLF 检出后最后一列（含表头名）带 \r → r.verdict 恒 undefined
 *     → export-c3-list 算出"0 条 C3"、退出码 0。**实际踩过。**
 *   - 巡检：探测函数若恒返回"存在"，缺失列表恒为空 → 永远全绿。金丝雀就是为此存在。
 * 所以这里不只测"正常能跑"，而是**构造失效场景，断言能被识破**。
 */
import { beforeAll, describe, expect, it } from 'vitest';

let csv: any;
let auditCore: any;
let extract: any;

beforeAll(async () => {
  csv = await import('../../../scripts/audio/csv.mjs');
  auditCore = await import('../../../scripts/audio/audit-core.mjs');
  extract = await import('../../../scripts/audio/extract.mjs');
});

describe('CSV 解析对 CRLF 免疫', () => {
  const COLS = 'source_type,record_id,raw_text,verdict';
  const ROWS = [
    'local_json:course,g3v1_u1#vocab[0],ruler,OK',
    'local_json:course,g3v1_u1#vocab[1],pencil,C3_MISSING',
  ];

  it('LF fixture：行数与最后一列都正确', () => {
    const rows = csv.parseCsv([COLS, ...ROWS].join('\n') + '\n');
    expect(rows).toHaveLength(2);
    expect(rows[0].verdict).toBe('OK');
    expect(rows[1].verdict).toBe('C3_MISSING');
  });

  it('CRLF fixture：行数与最后一列都正确（这正是当初静默失效的点）', () => {
    const rows = csv.parseCsv([COLS, ...ROWS].join('\r\n') + '\r\n');
    expect(rows).toHaveLength(2);
    expect(rows[0].verdict).toBe('OK');       // 若按 '\n' 切，这里会是 'OK\r'
    expect(rows[1].verdict).toBe('C3_MISSING');
    expect(Object.keys(rows[0])).toContain('verdict'); // 若表头带 \r，键名会是 'verdict\r'
  });

  it('带 BOM + CRLF + 引号内逗号，仍然解析正确', () => {
    const text = '﻿' + ['a,b,c',
      'x,"含, 逗号的文本",OK',
      'y,"带""引号""的",C3_MISSING'].join('\r\n');
    const rows = csv.parseCsv(text);
    expect(rows).toHaveLength(2);
    expect(rows[0].b).toBe('含, 逗号的文本');
    expect(rows[0].c).toBe('OK');
    expect(rows[1].b).toBe('带"引号"的');
    expect(rows[1].c).toBe('C3_MISSING');
  });

  it('toCsv → parseCsv 往返一致（含逗号/引号/CRLF 混排）', () => {
    const rows = [{ k: 'a,b', v: '说"话"', s: '0.85' }];
    const parsed = csv.parseCsv(csv.toCsv(['k', 'v', 's'], rows).replace(/\n/g, '\r\n'));
    expect(parsed[0]).toEqual({ k: 'a,b', v: '说"话"', s: '0.85' });
  });

  /**
   * 单元格里带换行（初中听力 transcript 就是整段原文，天然多行）。
   * 旧实现先按换行切行、再处理引号 → 一条记录被切成好几条垃圾记录：
   * **条数变多、cache_key 全是碎片**，而调用方只会觉得"解析成功"。
   * junior 盘点第一版就是这么算出 9974 条缺口（导出侧其实只有 9502 条）。
   */
  it('单元格内含换行：条数不膨胀、字段逐字还原（LF 与 CRLF 两种写法）', () => {
    const multi = 'A: Where are you going?\nB: To the library.';
    for (const eol of ['\n', '\r\n']) {
      const text = csv.toCsv(['cache_key', 'text'], [
        { cache_key: 'k1', text: multi },
        { cache_key: 'k2', text: 'plain' },
      ]).replace(/\n/g, eol);
      const rows = csv.parseCsv(text);
      expect(rows, `eol=${JSON.stringify(eol)}`).toHaveLength(2);
      expect(rows[0].cache_key).toBe('k1');
      expect(rows[0].text).toBe(eol === '\n' ? multi : multi.replace(/\n/g, '\r\n'));
      expect(rows[1]).toEqual({ cache_key: 'k2', text: 'plain' });
    }
  });

  it('末尾换行不会多出一条空记录，中间空行也不会', () => {
    expect(csv.parseCsv('a,b\n1,2\n')).toHaveLength(1);
    expect(csv.parseCsv('a,b\r\n1,2\r\n')).toHaveLength(1);
  });
});

describe('金丝雀能识破空转的检查器', () => {
  const item = (t: string) => ({
    cache_key: `elevenlabs|el:lily|0.85||${t}`, text: t, voice_id: 'el:lily', speed: 0.85,
    cdn_url: `https://cdn.test/${t}.mp3`, storage_url: '', source_ref: 'x', record_id: t, field: 'f@fixed',
  });

  it('诚实的检查器：金丝雀被报成缺失 → 前置通过', async () => {
    const canary = auditCore.makeCanaryItem('el:lily', extract.cdnUrlOf, extract.cacheKeyOf);
    const items = [item('ruler'), item('pencil')];
    // 诚实探测：只有真实两条存在，金丝雀不存在
    const honest = async (urls: string[]) =>
      new Map(urls.map((u) => [u, { exists: u !== canary.cdn_url, status: u !== canary.cdn_url ? 200 : 400, bytes: 9999 }]));
    const { missing } = await auditCore.checkMissing([...items, canary], honest);
    expect(auditCore.assertCanary(missing, canary).passed).toBe(true);
  });

  it('**永远返回全绿**的假检查器：金丝雀必须识破它', async () => {
    const canary = auditCore.makeCanaryItem('el:lily', extract.cdnUrlOf, extract.cacheKeyOf);
    const items = [item('ruler'), item('pencil')];
    // 空转探测：无论问什么都说"存在"（这正是"检查器比没有更糟"的形态）
    const alwaysGreen = async (urls: string[]) =>
      new Map(urls.map((u) => [u, { exists: true, status: 200, bytes: 9999 }]));
    const { missing } = await auditCore.checkMissing([...items, canary], alwaysGreen);
    expect(missing).toHaveLength(0);                       // 假检查器"零缺失"
    const verdict = auditCore.assertCanary(missing, canary);
    expect(verdict.passed).toBe(false);                    // 但金丝雀不认
    expect(verdict.reason).toContain('空转');
  });

  it('金丝雀 key 每次都不同（不能被历史合成过）', () => {
    const a = auditCore.makeCanaryItem('el:lily', extract.cdnUrlOf, extract.cacheKeyOf);
    const b = auditCore.makeCanaryItem('el:lily', extract.cdnUrlOf, extract.cacheKeyOf);
    expect(a.cache_key).not.toBe(b.cache_key);
    expect(a.cache_key).toContain('elevenlabs|el:lily|0.85||audio-audit canary ');
  });
});

describe('假 200 探针判定', () => {
  it('全部 404 → 通过', () => {
    const r = auditCore.assertNoFake200([
      { url: 'a', status: 404, contentType: 'text/plain' },
      { url: 'b', status: 404, contentType: 'text/plain' },
    ]);
    expect(r.passed).toBe(true);
  });

  it('出现 200 text/html（SPA 兜底回归）→ 判失败并说明后果', () => {
    const r = auditCore.assertNoFake200([
      { url: 'a', status: 404, contentType: 'text/plain' },
      { url: 'b', status: 200, contentType: 'text/html; charset=utf-8' },
    ]);
    expect(r.passed).toBe(false);
    expect(r.reason).toContain('假绿');
  });
});

describe('声明复核（防 audioFree / outOfScope 声明过期）', () => {
  it('audioFree 的消费组件里出现播放调用 → 告警', () => {
    const cfg = {
      audioFree: [{ files: 'x/*.json', why: 'w', consumers: ['fake/Comp.tsx'] }],
      outOfScope: [],
    };
    const items = auditCore.reviewDeclarations(cfg, {
      readFile: () => 'function C(){ hubSpeak(word, 0.85, grade); }',
      grepRepo: () => [],
    });
    expect(items).toHaveLength(1);
    expect(items[0].detail).toContain('hubSpeak(');
  });

  it('audioFree 且组件确实无播放调用 → 不告警', () => {
    const cfg = { audioFree: [{ files: 'x/*.json', why: 'w', consumers: ['fake/Comp.tsx'] }], outOfScope: [] };
    const items = auditCore.reviewDeclarations(cfg, {
      readFile: () => 'function C(){ return <div/>; }',
      grepRepo: () => [],
    });
    expect(items).toHaveLength(0);
  });

  it('assertUnreferenced 的文件仍被引用 → 告警', () => {
    const cfg = { audioFree: [{ files: 'x/legacy.json', why: 'w', assertUnreferenced: true }], outOfScope: [] };
    const items = auditCore.reviewDeclarations(cfg, {
      readFile: () => '',
      grepRepo: () => ['src/pages/Some.tsx'],
    });
    expect(items).toHaveLength(1);
    expect(items[0].detail).toContain('仍被这些文件引用');
  });

  it('outOfScope status=unverified → 每轮告警一次；confirmed 不告警', () => {
    const cfg = {
      audioFree: [],
      outOfScope: [
        { paths: ['src/data/exams'], status: 'unverified', why: '尚未确认' },
        { paths: ['src/data/juniorHub'], status: 'confirmed', why: '跨 section' },
      ],
    };
    const items = auditCore.reviewDeclarations(cfg, { readFile: () => '', grepRepo: () => [] });
    expect(items).toHaveLength(1);
    expect(items[0].target).toBe('src/data/exams');
    expect(items[0].detail).toContain('unverified');
  });
});

describe('outOfScope 缺 status 必须拒绝加载', () => {
  it('真实 primary 配置：所有 outOfScope 条目都带合法 status', () => {
    const cfg = extract.loadConfig('primary');
    for (const o of cfg.outOfScope ?? []) {
      expect(['confirmed', 'unverified']).toContain(o.status);
      expect(o.why, `${o.paths} 缺 why`).toBeTruthy();
    }
  });
});
