/**
 * 表源取数（PostgREST）——**已解封**，解封依据见本文件末尾的三条。
 *
 * 为什么这层要单独成文件：它是唯一会"少取就少报缺口"的地方。
 * 分页少一页 = 缺口少一批 = precheck 谎报绿灯，和假 200 / CRLF 是同一类失败。
 * 所以这里有两道硬闸：
 *   ① 分页上限显式声明，**触顶即 exit 2**（绝不静默截断）
 *   ② 抽取总数必须与独立的 `count=exact` 查询**逐条相等**，不等即 exit 2
 *
 * ⚠️ scope 铁律（踩过）：`junior_vocab` 等表是**初中与高中混表**。
 *    初中的 publisher 取值是 `junior` / `junior_fltrp`；
 *    `pep` / `fltrp` / `sufe` 是**高中**的取值。
 *    只按 publisher 过滤会把高中行算进来 —— 必须同时卡 `grade=in.(7,8,9)`。
 *    （第一次探测按 publisher=pep 取到 1706 条，实际全是 grade 10-12。）
 */
import fs from 'node:fs';
import path from 'node:path';

/** PostgREST 单页硬顶：实测请求 limit=2000 只回 1000。 */
export const PAGE_SIZE = 1000;
/** 分页上限（页）。触顶 = 数据量超出预期 → 报错，不静默截断。 */
export const DEFAULT_MAX_PAGES = 30;

export class TableSourceError extends Error {}

/**
 * 读 Supabase 连接信息（表源必需；纯 JSON 源的 section 不需要）。
 * 优先级：**进程环境变量 → 仓库根 .env**。
 * 顺序这样定是为了 CI：GitHub Actions 里没有 .env，值从仓库变量注入到 env
 * （`vars.VITE_SUPABASE_URL` / `vars.VITE_SUPABASE_PUBLISHABLE_KEY`，本来就随前端 bundle 公开）。
 */
export function loadDbEnv(repoRoot) {
  if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    return {
      url: process.env.VITE_SUPABASE_URL.replace(/\/$/, ''),
      key: process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    };
  }
  const p = path.join(repoRoot, '.env');
  if (!fs.existsSync(p)) {
    throw new TableSourceError(
`✗ 表源需要 VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY，两条路都没拿到：
   ① 进程环境变量（CI 走这条：workflow 里从 vars.* 注入）
   ② 仓库根 .env（本地走这条）——当前找不到 ${p}

注意：只含 JSON 源的 section（如 primary）**不需要**任何凭据；
一旦 section 声明了 table 源，巡检就必须能连库。`);
  }
  const env = Object.fromEntries(
    fs.readFileSync(p, 'utf8').split(/\r?\n/).filter((l) => l.includes('='))
      .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
  );
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new TableSourceError('✗ .env 里缺 VITE_SUPABASE_URL 或 VITE_SUPABASE_PUBLISHABLE_KEY');
  return { url: url.replace(/\/$/, ''), key };
}

const buildQuery = (source) => {
  const params = [`select=${encodeURIComponent(source.select)}`];
  for (const [col, expr] of Object.entries(source.filters ?? {})) {
    params.push(`${encodeURIComponent(col)}=${expr}`); // expr 形如 in.(7,8,9) / eq.junior / is.null
  }
  params.push(`order=${encodeURIComponent(source.orderBy ?? 'id')}`);
  return params.join('&');
};

/** 独立的 count=exact 查询（不带 select 的列，只为拿总数）。 */
export async function countRows(db, source) {
  const q = buildQuery({ ...source, select: 'id' });
  const r = await fetch(`${db.url}/rest/v1/${source.table}?${q}`, {
    headers: { apikey: db.key, Authorization: `Bearer ${db.key}`, Prefer: 'count=exact', Range: '0-0' },
  });
  if (!r.ok) throw new TableSourceError(`✗ 表源 ${source.table} count 查询失败：HTTP ${r.status}`);
  const cr = r.headers.get('content-range') || '';
  const n = Number(cr.split('/')[1]);
  if (!Number.isFinite(n)) throw new TableSourceError(`✗ 表源 ${source.table} 拿不到 count（content-range=${cr}）`);
  return n;
}

/**
 * 分页取全量行。
 * @throws TableSourceError 触顶截断 / 与 count 不一致 / HTTP 失败
 */
export async function fetchTableRows(db, source, { maxPages = DEFAULT_MAX_PAGES } = {}) {
  const expected = await countRows(db, source);
  const q = buildQuery(source);
  const rows = [];
  let page = 0;
  for (; page < maxPages; page++) {
    const r = await fetch(`${db.url}/rest/v1/${source.table}?${q}&limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`, {
      headers: { apikey: db.key, Authorization: `Bearer ${db.key}` },
    });
    if (!r.ok) throw new TableSourceError(`✗ 表源 ${source.table} 第 ${page + 1} 页失败：HTTP ${r.status}`);
    const batch = await r.json();
    if (!Array.isArray(batch)) throw new TableSourceError(`✗ 表源 ${source.table} 返回的不是数组`);
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) { page++; break; }
  }
  if (page >= maxPages && rows.length < expected) {
    throw new TableSourceError(
`✗ 表源 ${source.table} 触到分页上限（maxPages=${maxPages}，已取 ${rows.length} / 共 ${expected}）。

这是硬失败而不是"取到多少算多少"：少取一页就少报一批缺口，precheck 会谎报绿灯。
请提高该内容源的 maxPages 后重跑。`);
  }
  if (rows.length !== expected) {
    throw new TableSourceError(
`✗ 表源 ${source.table} 抽取数与 count 不一致：分页取到 ${rows.length}，count=exact 说 ${expected}。

两者不等说明分页/过滤条件有问题（漏页、并发写入、过滤表达式不一致），
此时任何缺口统计都不可信 —— 宁可整轮失败。`);
  }
  return rows;
}

/*
 * ───────────────────────── 解封依据（封印要求的三条，逐条落实）─────────────────────────
 * ① 用真实数据验证抽取：对 junior_vocab（grade in (7,8,9) + publisher in (junior,junior_fltrp)）
 *    实测 count=exact = 3772；分页取数 3772，两者相等。单页硬顶实测为 1000
 *    （请求 limit=2000 实际只回 1000），故 PAGE_SIZE=1000。
 * ② 与档位矩阵核对：字段→档位的映射写在 scripts/audio/audio-sources/junior.json，
 *    依据 docs/audio/JUNIOR_1_speed_matrix.md 逐个播放点核过（word 三档 / chunk 一档 /
 *    C 路线默认档音色 nova）。
 * ③ 表源单测：src/lib/juniorHub/audioTableSource.test.ts（分页拼接、触顶硬失败、
 *    count 不一致硬失败、过滤表达式必须含 grade 卡位）。
 */
