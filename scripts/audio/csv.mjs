/**
 * 全音频工具链共用的 CSV 解析/序列化（无副作用，可被单测直接 import）。
 *
 * 为什么要抽成一个模块：这个解析器曾经在**三个脚本里各写一份**，其中"按 '\n' 切行"
 * 在 git 检出（LF→CRLF）后会让**最后一列连表头名**都带上 \r，于是 `r.verdict` 恒为
 * undefined —— `export-c3-list` 一度算出"0 条 C3"，**静默失效、退出码 0**。
 * 一份实现 + 一份单测，才能保证这类失效不会在某个副本里复活。
 * 单测见 src/lib/primaryHub/audioAuditCore.test.ts（含 CRLF fixture）。
 */

/**
 * @returns {Array<Record<string,string>>}
 *
 * ⚠️ 必须**单趟扫描**，不能"先按换行切行、再按引号切列"。
 * 后者对带换行的单元格（初中听力 `transcript` 就有）会把一行切成好几条垃圾记录：
 * 表面上"解析成功、条数还变多了"，实际 cache_key 全是碎片。
 * 我们自己踩过：junior 盘点第一版按 CSV 统计出 9974 条缺口，而导出侧只有 9502 条。
 */
export function parseCsv(text) {
  const s = String(text).replace(/^﻿/, '');
  const rows = [];
  let row = [];
  let cur = '';
  let q = false;
  let started = false; // 本行是否已有内容（用来区分"空行"与"末尾换行"）
  const endCell = () => { row.push(cur); cur = ''; started = true; };
  const endRow = () => { endCell(); rows.push(row); row = []; started = false; };
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '"') {
        if (s[i + 1] === '"') { cur += '"'; i++; } else q = false;
      } else cur += c;
      continue;
    }
    if (c === '"') { q = true; started = true; continue; }
    if (c === ',') { endCell(); continue; }
    if (c === '\r') { if (s[i + 1] === '\n') i++; endRow(); continue; }
    if (c === '\n') { endRow(); continue; }
    cur += c;
    started = true;
  }
  if (started || cur.length) endRow();
  const nonEmpty = rows.filter((r) => r.length > 1 || r[0] !== '');
  if (!nonEmpty.length) return [];
  const cols = nonEmpty[0];
  return nonEmpty.slice(1).map((cells) => Object.fromEntries(cols.map((c, i) => [c, cells[i] ?? ''])));
}

export const escapeCell = (v) => {
  const s = String(v ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** 带 BOM（Excel 友好），行尾用 \n；解析侧对 CRLF 免疫，所以来回一致。 */
export function toCsv(cols, rows) {
  return '﻿' + [cols.join(',')]
    .concat(rows.map((r) => cols.map((c) => escapeCell(r[c])).join(',')))
    .join('\n') + '\n';
}
