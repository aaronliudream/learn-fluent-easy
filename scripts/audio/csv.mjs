/**
 * 全音频工具链共用的 CSV 解析/序列化（无副作用，可被单测直接 import）。
 *
 * 为什么要抽成一个模块：这个解析器曾经在**三个脚本里各写一份**，其中"按 '\n' 切行"
 * 在 git 检出（LF→CRLF）后会让**最后一列连表头名**都带上 \r，于是 `r.verdict` 恒为
 * undefined —— `export-c3-list` 一度算出"0 条 C3"，**静默失效、退出码 0**。
 * 一份实现 + 一份单测，才能保证这类失效不会在某个副本里复活。
 * 单测见 src/lib/primaryHub/audioAuditCore.test.ts（含 CRLF fixture）。
 */

/** @returns {Array<Record<string,string>>} */
export function parseCsv(text) {
  const lines = String(text).replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.length > 0);
  if (!lines.length) return [];
  const cols = splitLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = splitLine(line);
    return Object.fromEntries(cols.map((c, i) => [c, cells[i] ?? '']));
  });
}

function splitLine(line) {
  const out = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; } else q = false;
      } else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
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
